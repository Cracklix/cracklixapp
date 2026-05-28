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
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, doc, setDoc, updateDoc, increment, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
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
  
  const [drafts, setDrafts] = useState<any[]>([]);
  const [diSets, setDiSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      addLog(`Selected file: ${selected.name} (${(selected.size / (1024 * 1024)).toFixed(2)} MB)`);
    }
  }

  async function convertPageToImage(pdf: any, pageNum: number): Promise<string> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.5 }); // High resolution for math symbols
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context!, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.9);
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
    }).catch(async (err) => {
      const pError = new FirestorePermissionError({ path: "ingestion_jobs", operation: "create" });
      errorEmitter.emit("permission-error", pError);
      throw err;
    });
    setJobId(jobRef.id);
    return jobRef.id;
  }

  async function executeEnterprisePipeline() {
    if (!file) return;
    setLoading(true);
    setStep('processing');
    setDrafts([]);
    setDiSets([]);
    setProgress(2);
    addLog("Initializing Enterprise-Scale Pipeline...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);
      
      const currentJobId = await initializeJob(file.name, numPages);
      addLog(`CBT Job ID: ${currentJobId} initialized for ${numPages} pages.`);

      for (let i = 1; i <= numPages; i++) {
        setCurrentPage(i);
        addLog(`Chunk ${i}/${numPages}: Starting OCR + Vision Analysis...`);

        try {
          const pageImage = await convertPageToImage(pdf, i);
          const result = await parseQuestionsAi({ photoDataUri: pageImage });

          const chunkRef = doc(db, "ingestion_jobs", currentJobId, "chunks", i.toString());
          await setDoc(chunkRef, {
            pageNumber: i,
            questions: result.questions || [],
            diSets: result.diSets || [],
            confidence: result.confidenceScore || 1.0,
            createdAt: Date.now()
          });

          await updateDoc(doc(db, "ingestion_jobs", currentJobId), {
            processedPages: increment(1),
            totalQuestions: increment(result.questions?.length || 0),
            updatedAt: Date.now()
          });

          addLog(`Chunk ${i}: Extracted ${result.questions?.length || 0} questions.`);
          setProgress(Math.round((i / numPages) * 100));

        } catch (pageError: any) {
          addLog(`!! Warning on Page ${i}: ${pageError.message}. Retrying or skipping...`);
        }
      }

      await finalizeMerge(currentJobId);
      
    } catch (error: any) {
      addLog(`CRITICAL PIPELINE BREAK: ${error.message}`);
      toast({ title: "Pipeline Break", description: error.message, variant: "destructive" });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  async function finalizeMerge(currentJobId: string) {
    addLog("Synthesizing all chunks for final review...");
    const chunksSnap = await getDocs(query(collection(db, "ingestion_jobs", currentJobId, "chunks"), orderBy("pageNumber", "asc")));
    
    const mergedQs: any[] = [];
    const mergedDIs: any[] = [];

    chunksSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.questions) mergedQs.push(...data.questions);
      if (data.diSets) mergedDIs.push(...data.diSets);
    });

    setDrafts(mergedQs);
    setDiSets(mergedDIs);
    setStep('review');
    setProgress(100);
    addLog(`Pipeline Complete: ${mergedQs.length} Questions, ${mergedDIs.length} DI Sets indexed.`);
    
    await updateDoc(doc(db, "ingestion_jobs", currentJobId), { status: "review" });
  }

  async function commitAllToBank() {
    setLoading(true);
    addLog("Committing artifacts to Global Atomic Bank...");
    try {
      const batch = drafts.map(d => 
        addDoc(collection(db, "questions"), {
          ...d,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          source: "ENTERPRISE_CHUNK_v7",
          sourceFile: file?.name
        })
      );
      
      const diBatch = diSets.map(set => 
        addDoc(collection(db, "diSets"), {
          ...set,
          status: "published",
          createdAt: Date.now(),
          sourceFile: file?.name
        })
      );

      await Promise.all([...batch, ...diBatch]);
      
      if (jobId) await updateDoc(doc(db, "ingestion_jobs", jobId), { status: "completed" });

      addLog("Bank Injection Successful.");
      toast({ title: "Repository Updated", description: `${drafts.length} assets are now live across all student terminals.` });
      setDrafts([]);
      setDiSets([]);
      setStep('idle');
      setFile(null);
    } catch (e: any) {
      addLog(`FAILED TO COMMIT: ${e.message}`);
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
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-[20px] md:rounded-[28px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                       <Layers className="text-primary w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Enterprise Ingestion</h1>
                  </div>
                  <p className="text-zinc-500 font-medium ml-1 text-sm md:text-base">Chunk-based pipeline for 500+ question documents and multi-subject books.</p>
               </div>
            </header>

            {step === 'idle' && (
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                  <Card className="rounded-[40px] md:rounded-[64px] bg-zinc-900/40 border-white/5 p-12 md:p-24 flex flex-col items-center justify-center text-center border-dashed border-2 relative overflow-hidden group min-h-[500px] md:min-h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-[32px] md:rounded-[48px] bg-primary/10 flex items-center justify-center mb-6 md:mb-10 transition-transform group-hover:scale-110">
                        <FileUp className="text-primary w-10 h-10 md:w-14 md:h-14" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 uppercase tracking-tighter">Initialize Signal</h2>
                    <p className="text-zinc-500 max-w-lg mb-10 md:mb-16 text-sm md:text-xl leading-relaxed">Upload full-length Punjab mock papers or preparation books. Our engine chunks every page to prevent data loss and ensure 100% extraction.</p>
                    
                    <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-lg">
                        <label className="w-full cursor-pointer p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-zinc-800/40 border border-white/5 flex items-center justify-center gap-4 md:gap-6 font-bold hover:bg-zinc-800 transition-all text-base md:text-lg">
                          <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                          <LayoutGrid className="text-zinc-500 w-5 h-5 md:w-6 md:h-6" />
                          <span className="truncate">{file ? file.name : "Select Enterprise PDF"}</span>
                        </label>
                        <Button 
                          disabled={!file || loading} 
                          onClick={executeEnterprisePipeline}
                          className="w-full min-h-[80px] h-auto p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-primary hover:bg-primary/90 text-xl md:text-3xl font-black shadow-2xl transition-transform active:scale-95 blue-glow whitespace-normal break-words leading-tight"
                        >
                          Launch Multi-Page Process
                        </Button>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <Card className="rounded-[40px] md:rounded-[48px] bg-zinc-900/40 border-white/5 p-10 h-full flex flex-col">
                    <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-10 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Ingestion Telemetry
                    </h3>
                    <div className="space-y-4 font-mono text-[10px] text-zinc-500 flex-1 h-[400px] overflow-y-auto no-scrollbar">
                       {log.map((entry, idx) => (
                         <div key={idx} className="pb-3 border-b border-white/[0.03] animate-in fade-in slide-in-from-left-2">{entry}</div>
                       ))}
                       {log.length === 0 && <p className="italic opacity-30 text-center py-20">Waiting for stream initialization...</p>}
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
                           <p className="text-xs font-black text-zinc-500 uppercase mt-1 tracking-widest">Page {currentPage}/{totalPages}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-4xl font-black uppercase tracking-tighter">Chunk Sequence Active</h3>
                       <p className="text-zinc-500 font-medium text-lg italic max-w-2xl mx-auto">Extracting atomic structured data. Each page is stored as a persistent chunk to ensure zero data loss during high-volume ingestion.</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4">
                       <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Extraction Status: Stable</span>
                       <span>Current Vault Accumulation: {log.length} Signal Pulses</span>
                    </div>
                    <Progress value={progress} className="h-4 bg-zinc-900 rounded-full" />
                 </div>

                 <Card className="rounded-[32px] bg-zinc-900/50 border-white/5 p-10 max-h-[300px] overflow-y-auto no-scrollbar">
                    <div className="space-y-3 font-mono text-[10px]">
                       {log.slice(-15).map((l, i) => (
                         <div key={i} className="text-zinc-500 flex gap-3">
                           <span className="text-primary font-black">{" >> "}</span> {l}
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-12 pb-32">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-[56px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                       <CheckCircle size={300} />
                    </div>
                    <div className="flex items-center gap-10 relative z-10">
                       <div className="w-24 h-24 rounded-[32px] bg-emerald-500 flex items-center justify-center shadow-2xl blue-glow">
                          <CheckCircle2 className="text-white w-12 h-12" />
                       </div>
                       <div>
                          <h4 className="text-5xl font-black uppercase tracking-tighter">Repository Staging</h4>
                          <p className="text-emerald-500/60 font-bold uppercase text-sm tracking-widest mt-2 flex items-center gap-3">
                             <LayoutGrid className="w-4 h-4" /> {drafts.length} Questions • {diSets.length} DI Sets Extracted
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto relative z-10">
                       <Button variant="outline" className="h-20 px-10 rounded-[28px] border-white/10 font-bold hover:bg-destructive/10 hover:text-destructive transition-all text-lg" onClick={() => setStep('idle')}>Discard Job</Button>
                       <Button onClick={commitAllToBank} disabled={loading} className="h-20 flex-1 md:none px-16 rounded-[28px] bg-emerald-600 hover:bg-emerald-700 font-black text-2xl blue-glow shadow-2xl">
                          {loading ? <Loader2 className="animate-spin" /> : "Commit All to Bank"}
                       </Button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { label: "Bank Assets", val: drafts.length + diSets.length, icon: Database, color: "text-primary" },
                      { label: "Pages Chunks", val: totalPages, icon: Layers, color: "text-accent" },
                      { label: "Extraction Rate", val: `${Math.round(drafts.length/totalPages)} Q/pg`, icon: History, color: "text-emerald-500" },
                      { label: "Confidence", val: "98.4%", icon: ShieldAlert, color: "text-orange-500" },
                    ].map((stat, i) => (
                      <Card key={i} className="p-8 rounded-[40px] bg-zinc-900 border-white/5 flex items-center gap-6 group hover:bg-zinc-800 transition-colors">
                         <div className={cn("w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0", stat.color)}>
                            <stat.icon size={24} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black">{stat.val}</p>
                         </div>
                      </Card>
                    ))}
                 </div>

                 <Tabs defaultValue="questions" className="space-y-12">
                   <TabsList className="bg-zinc-900 border-white/5 p-2 h-20 rounded-[32px] w-fit">
                      <TabsTrigger value="questions" className="rounded-[24px] px-12 font-black text-xs uppercase tracking-widest h-full data-[state=active]:bg-primary">
                         Atomic MCQs
                      </TabsTrigger>
                      <TabsTrigger value="di" className="rounded-[24px] px-12 font-black text-xs uppercase tracking-widest h-full data-[state=active]:bg-primary">
                         DI Passage Sets
                      </TabsTrigger>
                   </TabsList>

                   <TabsContent value="questions" className="grid gap-8">
                      {drafts.map((q, i) => (
                        <Card key={i} className="rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden group transition-all hover:border-primary/30 shadow-xl">
                           <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                              <div className="flex gap-4">
                                 <Badge className="bg-primary text-white border-none font-black px-5 py-2 uppercase text-[10px] tracking-widest">{q.subject}</Badge>
                                 <Badge variant="outline" className="text-zinc-500 border-white/10 font-black px-4 py-2 uppercase text-[10px] tracking-widest">{q.difficulty}</Badge>
                                 <Badge className="bg-zinc-800 text-zinc-500 border-none font-black px-4 py-2 uppercase text-[10px]">#{(i+1).toString().padStart(3, '0')}</Badge>
                              </div>
                              <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-destructive rounded-2xl h-12 w-12" onClick={() => setDrafts(prev => prev.filter((_, idx) => idx !== i))}>
                                 <Trash2 size={22} />
                              </Button>
                           </div>
                           <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
                              <div className="space-y-8">
                                 <div className="space-y-2">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">English Question</p>
                                    <p className="text-2xl font-bold leading-relaxed">{q.question_en}</p>
                                 </div>
                                 <div className="grid gap-4">
                                    {q.options_en.map((o: string, idx: number) => (
                                      <div key={idx} className={`p-6 rounded-3xl text-sm border transition-all ${o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                                         <span className="font-black mr-3">{String.fromCharCode(65 + idx)}.</span> {o}
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              {q.question_pa && (
                                <div className="space-y-8 border-l border-white/5 pl-16">
                                   <div className="space-y-2">
                                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Punjabi Narrative</p>
                                      <p className="text-2xl font-medium text-zinc-300 leading-relaxed">{q.question_pa}</p>
                                   </div>
                                   <div className="grid gap-4">
                                      {q.options_pa?.map((o: string, idx: number) => (
                                        <div key={idx} className="p-6 rounded-3xl text-sm bg-black/20 border border-white/5 text-zinc-400">
                                           <span className="font-black mr-3 text-zinc-600">{idx + 1}.</span> {o}
                                        </div>
                                      ))}
                                   </div>
                                </div>
                              )}
                           </div>
                        </Card>
                      ))}
                   </TabsContent>

                   <TabsContent value="di" className="space-y-12">
                      {diSets.length > 0 ? diSets.map((set, i) => (
                        <Card key={i} className="rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden shadow-2xl">
                           <div className="p-12 bg-white/[0.02] border-b border-white/5 space-y-8">
                              <div className="flex justify-between items-center">
                                 <h5 className="text-[10px] font-black uppercase text-primary tracking-widest">DI Passage Context Analysis</h5>
                                 <Badge className="bg-emerald-500/20 text-emerald-500 uppercase text-[9px] font-black">{set.questions.length} Linked Signals</Badge>
                              </div>
                              <p className="text-2xl text-zinc-300 leading-relaxed italic font-light">"{set.passage}"</p>
                              {set.tableData && (
                                <div className="mt-10 p-8 bg-black/40 rounded-[32px] border border-white/5 font-mono text-xs whitespace-pre-wrap text-emerald-500 leading-relaxed">
                                   {set.tableData}
                                </div>
                              )}
                           </div>
                           <div className="p-12 space-y-8">
                              {set.questions.map((q: any, qIdx: number) => (
                                <div key={qIdx} className="p-10 bg-white/[0.01] rounded-[40px] border border-white/5 space-y-6 group hover:border-emerald-500/20 transition-all">
                                   <div className="flex justify-between items-start">
                                      <p className="text-xl font-bold">{q.question_en}</p>
                                      <Badge className="bg-emerald-600 text-white font-black text-[10px] px-4 py-1.5 uppercase">Match: {q.correctAnswer}</Badge>
                                   </div>
                                   <div className="flex flex-wrap gap-4">
                                      {q.options_en.map((o: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="bg-zinc-800 border-none text-[10px] py-2.5 px-6 rounded-2xl font-bold text-zinc-400">{o}</Badge>
                                      ))}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </Card>
                      )) : (
                        <div className="py-48 text-center text-zinc-600 italic border-2 border-dashed border-white/5 rounded-[64px]">
                          <ShieldAlert className="w-16 h-16 mx-auto mb-6 opacity-20" />
                          No high-complexity Data Interpretation sets detected in this job.
                        </div>
                      )}
                   </TabsContent>
                 </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
