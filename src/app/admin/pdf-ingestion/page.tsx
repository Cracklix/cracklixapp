
"use client";

import { useState, useRef, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { parseQuestionsAi } from '@/ai/flows/ai-question-parser-flow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Loader2, 
  FileUp, 
  Sparkles, 
  Database, 
  Trash2, 
  CheckCircle2, 
  Layers,
  LayoutGrid,
  AlertTriangle,
  History,
  CheckCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Zap,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, doc, setDoc, updateDoc, increment, getDocs, deleteDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type IngestionStep = 'idle' | 'processing' | 'review';

export default function UniversalPdfIngestion() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<IngestionStep>('idle');
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 50)]);
  };

  async function convertPageToImage(pdf: any, pageNum: number): Promise<string> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.5 }); 
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context!, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  async function initializeJob(fileName: string, total: number) {
    const jobRef = await addDoc(collection(db, "ingestion_jobs"), {
      fileName,
      status: "processing",
      totalPages: total,
      processedPages: 0,
      totalQuestions: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setJobId(jobRef.id);
    return jobRef.id;
  }

  async function executeEnterprisePipeline() {
    if (!file) return;
    setLoading(true);
    setStep('processing');
    setDrafts([]);
    setProgress(0);
    const startTime = Date.now();
    addLog("Initializing v2 Parallel Ingestion Engine...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);
      
      const currentJobId = await initializeJob(file.name, numPages);
      addLog(`Job ID: ${currentJobId} created. Processing with concurrency level: 3.`);

      // Concurrency logic: Process 3 pages at a time
      const concurrencyLimit = 3;
      let processedCount = 0;
      const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

      for (let i = 0; i < pageNumbers.length; i += concurrencyLimit) {
        const batch = pageNumbers.slice(i, i + concurrencyLimit);
        
        await Promise.all(batch.map(async (pageNum) => {
          try {
            setCurrentPage(pageNum);
            const page = await pdf.getPage(pageNum);
            
            // Smart Routing: Try text layer extraction first
            const textContent = await page.getTextContent();
            const rawText = textContent.items.map((item: any) => item.str).join(' ');

            let result;
            if (rawText.trim().length > 150) {
               addLog(`Page ${pageNum}: Text layer detected. Executing Fast-Parse Mode.`);
               result = await parseQuestionsAi({ rawText });
            } else {
               addLog(`Page ${pageNum}: No text layer. Initializing Vision OCR Mode.`);
               const pageImage = await convertPageToImage(pdf, pageNum);
               result = await parseQuestionsAi({ photoDataUri: pageImage });
            }

            const chunkRef = doc(db, "ingestion_jobs", currentJobId, "chunks", pageNum.toString());
            await setDoc(chunkRef, {
              pageNumber: pageNum,
              questions: result.questions || [],
              confidence: result.confidenceScore || 1.0,
              createdAt: Date.now()
            });

            await updateDoc(doc(db, "ingestion_jobs", currentJobId), {
              processedPages: increment(1),
              totalQuestions: increment(result.questions?.length || 0),
              updatedAt: Date.now()
            });

            processedCount++;
            const currentProgress = Math.round((processedCount / numPages) * 100);
            setProgress(currentProgress);
            
            // ETA Calculation
            const elapsed = (Date.now() - startTime) / 1000;
            const avgTimePerPage = elapsed / processedCount;
            const remaining = Math.round(avgTimePerPage * (numPages - processedCount));
            setEstimatedTime(`${Math.floor(remaining / 60)}m ${remaining % 60}s`);

          } catch (pageErr: any) {
            addLog(`!! Warning Page ${pageNum}: ${pageErr.message}. Skipping chunk.`);
          }
        }));
      }

      await finalizeMerge(currentJobId);
      addLog(`Cycle Complete. Performance Score: ${((Date.now() - startTime)/1000).toFixed(1)}s for ${numPages} pages.`);
      
    } catch (error: any) {
      addLog(`CRITICAL FAILURE: ${error.message}`);
      toast({ title: "Pipeline Break", description: error.message, variant: "destructive" });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  async function finalizeMerge(currentJobId: string) {
    addLog("Merging chunks into Review Terminal...");
    const chunksSnap = await getDocs(query(collection(db, "ingestion_jobs", currentJobId, "chunks"), orderBy("pageNumber", "asc")));
    
    const mergedQs: any[] = [];
    chunksSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.questions) mergedQs.push(...data.questions);
    });

    setDrafts(mergedQs);
    setStep('review');
    setProgress(100);
    await updateDoc(doc(db, "ingestion_jobs", currentJobId), { status: "review" });
  }

  async function commitAllToBank() {
    setLoading(true);
    addLog("Injecting batch into Global Atomic Bank...");
    try {
      const batch = writeBatch(db);
      drafts.forEach(d => {
        const qRef = doc(collection(db, "questions"));
        batch.set(qRef, {
          ...d,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          source: "HIGH_SPEED_V2",
          sourceFile: file?.name
        });
      });

      await batch.commit();
      
      if (jobId) await updateDoc(doc(db, "ingestion_jobs", jobId), { status: "completed" });

      addLog("Bank Injection Successful.");
      toast({ title: "Repository Updated", description: `${drafts.length} assets deployed successfully.` });
      setDrafts([]);
      setStep('idle');
      setFile(null);
    } catch (e: any) {
      addLog(`COMMIT ERROR: ${e.message}`);
      toast({ title: "Injection Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-[28px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                       <Zap className="text-primary w-7 h-7" />
                    </div>
                    <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Power Ingestion v2</h1>
                  </div>
                  <p className="text-zinc-500 font-medium ml-1">Parallel processing engine for high-volume recruitment books and PYQs.</p>
               </div>
            </header>

            {step === 'idle' && (
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                  <Card className="rounded-[64px] bg-zinc-900/40 border-white/5 p-12 md:p-24 flex flex-col items-center justify-center text-center border-dashed border-2 relative group min-h-[600px] overflow-hidden">
                    <div className="w-32 h-32 rounded-[48px] bg-primary/10 flex items-center justify-center mb-10 transition-transform group-hover:scale-110">
                        <FileUp className="text-primary w-14 h-14" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Initialize Stream</h2>
                    <p className="text-zinc-500 max-w-lg mb-16 text-lg md:text-xl leading-relaxed">Fast-Parse Mode automatically extracts data from digital PDFs. Scanned artifacts use high-resolution Vision OCR.</p>
                    
                    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
                        <label className="w-full cursor-pointer p-6 md:p-8 rounded-[32px] bg-zinc-800/40 border border-white/5 flex items-center justify-center gap-6 font-bold hover:bg-zinc-800 transition-all text-base md:text-lg overflow-hidden">
                          <input type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                          <LayoutGrid className="text-zinc-500 w-6 h-6 shrink-0" />
                          <span className="truncate flex-1 text-left">{file ? file.name : "Select High-Volume PDF"}</span>
                        </label>
                        <Button 
                          disabled={!file || loading} 
                          onClick={executeEnterprisePipeline}
                          className="w-full min-h-[80px] h-auto p-6 md:p-8 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl md:text-3xl font-black shadow-2xl blue-glow whitespace-normal break-words leading-tight text-center flex items-center justify-center"
                        >
                          {loading ? <Loader2 className="animate-spin mr-4 shrink-0" /> : <Zap className="mr-4 shrink-0" />}
                          <span>Launch v2 Ingestion</span>
                        </Button>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 h-full flex flex-col">
                    <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-10 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Signal Logs
                    </h3>
                    <div className="space-y-4 font-mono text-[10px] text-zinc-500 flex-1 h-[400px] overflow-y-auto no-scrollbar break-words">
                       {log.map((entry, idx) => (
                         <div key={idx} className="pb-3 border-b border-white/[0.03] animate-in fade-in slide-in-from-left-2">{entry}</div>
                       ))}
                       {log.length === 0 && <p className="italic opacity-30 text-center py-20">Waiting for signal...</p>}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="py-24 max-w-4xl mx-auto space-y-20">
                 <div className="text-center space-y-10">
                    <div className="relative inline-block">
                        <div className="w-64 h-64 border-8 border-primary/5 border-t-primary rounded-full animate-spin mx-auto" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                           <p className="text-6xl font-black text-white">{progress}%</p>
                           <p className="text-xs font-black text-zinc-500 uppercase mt-1 tracking-widest">ETA: {estimatedTime}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Parallel Extraction Active</h3>
                       <p className="text-zinc-500 font-medium text-lg italic">Processing segments 1-3. Automatic subject mapping and classification engaged.</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4">
                       <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Signal Stream: Stabilized</span>
                       <span>Current Page: {currentPage} / {totalPages}</span>
                    </div>
                    <Progress value={progress} className="h-4 bg-zinc-900 rounded-full" />
                 </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-12 pb-32">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 md:p-12 rounded-[56px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                       <CheckCircle size={300} />
                    </div>
                    <div className="flex items-center gap-10 relative z-10">
                       <div className="w-16 h-16 md:w-24 md:h-24 rounded-[32px] bg-emerald-500 flex items-center justify-center shadow-2xl blue-glow shrink-0">
                          <CheckCircle2 className="text-white w-8 h-8 md:w-12 md:h-12" />
                       </div>
                       <div>
                          <h4 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Analysis Terminal</h4>
                          <p className="text-emerald-500/60 font-bold uppercase text-sm tracking-widest mt-2">
                             {drafts.length} Artifacts Extracted • Quality: High
                          </p>
                       </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
                       <Button variant="outline" className="h-16 md:h-20 px-10 rounded-[28px] border-white/10 font-bold hover:bg-destructive/10 text-lg" onClick={() => setStep('idle')}>Discard Job</Button>
                       <Button onClick={commitAllToBank} disabled={loading} className="h-16 md:h-20 px-16 rounded-[28px] bg-emerald-600 hover:bg-emerald-700 font-black text-xl md:text-2xl blue-glow whitespace-normal break-words leading-tight text-center flex items-center justify-center">
                          {loading ? <Loader2 className="animate-spin mr-3 shrink-0" /> : <Database className="mr-3 shrink-0" />}
                          <span>Commit to Production</span>
                       </Button>
                    </div>
                 </div>

                 <div className="grid gap-8">
                    {drafts.map((q, i) => (
                      <Card key={i} className="rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden group hover:border-primary/30 shadow-xl">
                         <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <div className="flex gap-4">
                               <Badge className="bg-primary text-white border-none font-black px-5 py-2 uppercase text-[10px] tracking-widest">{q.subject}</Badge>
                               <Badge variant="outline" className="text-zinc-500 border-white/10 font-black px-4 py-2 uppercase text-[10px] tracking-widest">{q.difficulty}</Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-destructive h-12 w-12" onClick={() => setDrafts(prev => prev.filter((_, idx) => idx !== i))}>
                               <Trash2 size={22} />
                            </Button>
                         </div>
                         <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div className="space-y-6">
                               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">English Payload</p>
                               <p className="text-2xl font-bold leading-relaxed break-words">{q.question_en}</p>
                               <div className="grid gap-3">
                                  {q.options_en?.map((o: string, idx: number) => (
                                    <div key={idx} className={`p-5 rounded-2xl text-sm border break-words ${o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                                       {String.fromCharCode(65 + idx)}. {o}
                                    </div>
                                  ))}
                               </div>
                            </div>
                            {q.question_pa && (
                                <div className="space-y-6 border-l border-white/5 pl-16">
                                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Punjabi Signal</p>
                                   <p className="text-2xl font-medium text-zinc-300 leading-relaxed break-words">{q.question_pa}</p>
                                   <div className="grid gap-3">
                                      {q.options_pa?.map((o: string, idx: number) => (
                                        <div key={idx} className="p-5 rounded-2xl text-sm bg-black/20 border border-white/5 text-zinc-400 break-words">{o}</div>
                                      ))}
                                   </div>
                                </div>
                              )}
                         </div>
                      </Card>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
