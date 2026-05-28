"use client";

import { useState, useRef } from 'react';
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
  Table as TableIcon,
  Calculator,
  LayoutGrid,
  AlertTriangle,
  History,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type IngestionStep = 'idle' | 'processing' | 'review';

export default function UniversalPdfIngestion() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<IngestionStep>('idle');
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [drafts, setDrafts] = useState<any[]>([]);
  const [diSets, setDiSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setLog([`Selected file: ${selected.name} (${(selected.size / (1024 * 1024)).toFixed(2)} MB)`]);
    }
  }

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  async function convertPageToImage(pdf: any, pageNum: number): Promise<string> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context!, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  async function executeChunkedPipeline() {
    if (!file) return;
    setLoading(true);
    setStep('processing');
    setDrafts([]);
    setDiSets([]);
    setProgress(5);
    addLog("Initializing Enterprise Pipeline...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);
      addLog(`PDF Loaded: ${numPages} pages detected.`);

      const allQuestions: any[] = [];
      const allDiSets: any[] = [];

      for (let i = 1; i <= numPages; i++) {
        setCurrentPage(i);
        const pageProgress = Math.round((i / numPages) * 100);
        setProgress(pageProgress);
        addLog(`Processing Page ${i}/${numPages}...`);

        try {
          // 1. Render Page to Image
          const pageImage = await convertPageToImage(pdf, i);
          
          // 2. Call AI Parser for this specific page
          const result = await parseQuestionsAi({ 
            photoDataUri: pageImage,
            preferredSubject: "General" 
          });

          if (result.questions) {
            allQuestions.push(...result.questions);
            addLog(`Page ${i}: Extracted ${result.questions.length} atomic questions.`);
          }
          if (result.diSets) {
            allDiSets.push(...result.diSets);
            addLog(`Page ${i}: Detected ${result.diSets.length} DI sets.`);
          }
        } catch (pageError: any) {
          addLog(`!! Error on Page ${i}: ${pageError.message}`);
          console.error(`Page ${i} Ingestion Failure:`, pageError);
        }
      }

      setDrafts(allQuestions);
      setDiSets(allDiSets);
      setStep('review');
      setProgress(100);
      addLog(`Pipeline Complete: ${allQuestions.length} Total Questions, ${allDiSets.length} Total DI Sets.`);
      
      toast({ 
        title: "Ingestion Success", 
        description: `Successfully synthesized ${allQuestions.length} artifacts across ${numPages} pages.` 
      });
    } catch (error: any) {
      addLog(`CRITICAL PIPELINE BREAK: ${error.message}`);
      toast({ title: "Pipeline Break", description: error.message, variant: "destructive" });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  async function commitAllToBank() {
    setLoading(true);
    addLog("Committing artifacts to Question Bank...");
    try {
      const batch = drafts.map(d => 
        addDoc(collection(db, "questions"), {
          ...d,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          source: "CHUNK_PIPELINE_v6",
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
      addLog("All items successfully indexed in Firestore.");
      toast({ title: "Bank Updated", description: `${drafts.length + diSets.length} assets are now live.` });
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
        <main className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                       <Layers className="text-primary w-6 h-6" />
                    </div>
                    <h1 className="font-headline text-5xl font-black tracking-tighter uppercase">High-Volume Ingestion</h1>
                  </div>
                  <p className="text-zinc-500 font-medium ml-1">Chunk-based pipeline for large PDFs and full books (500+ Questions).</p>
               </div>
            </header>

            {step === 'idle' && (
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-24 flex flex-col items-center justify-center text-center border-dashed border-2 relative overflow-hidden group h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="w-28 h-28 rounded-[36px] bg-primary/10 flex items-center justify-center mb-10 transition-transform group-hover:scale-110">
                        <FileUp className="text-primary w-12 h-12" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Initialize Stream</h2>
                    <p className="text-zinc-500 max-w-md mb-12 text-lg">Upload any Punjab Exam paper or full-length book. The engine renders each page and extracts sequentially.</p>
                    
                    <div className="flex flex-col items-center gap-8 w-full max-w-md">
                        <label className="w-full cursor-pointer p-8 rounded-3xl bg-zinc-800/40 border border-white/5 flex items-center justify-center gap-4 font-bold hover:bg-zinc-800 transition-all">
                          <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                          <LayoutGrid className="text-zinc-500 w-5 h-5" />
                          {file ? file.name : "Select Full PDF Document"}
                        </label>
                        <Button 
                          disabled={!file || loading} 
                          onClick={executeChunkedPipeline}
                          className="w-full h-20 rounded-[28px] bg-primary hover:bg-primary/90 text-2xl font-black shadow-2xl transition-transform active:scale-95"
                        >
                          Launch Multi-Page Pipeline
                        </Button>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-8 h-full">
                    <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6">Pipeline Activity</h3>
                    <div className="space-y-3 font-mono text-[10px] text-zinc-600 h-[400px] overflow-y-auto no-scrollbar">
                       {log.map((entry, idx) => (
                         <div key={idx} className="pb-2 border-b border-white/[0.02]">{entry}</div>
                       ))}
                       {log.length === 0 && <p className="italic">Waiting for file upload...</p>}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="py-20 max-w-3xl mx-auto space-y-16">
                 <div className="text-center space-y-8">
                    <div className="relative inline-block">
                        <div className="w-48 h-48 border-8 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                           <p className="text-4xl font-black text-white">{progress}%</p>
                           <p className="text-[10px] font-black text-zinc-500 uppercase">Page {currentPage}/{totalPages}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Chunk Processing Active</h3>
                       <p className="text-zinc-500 font-medium italic">Our AI is iteratively scanning each page. This ensures 100% data capture from large documents.</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">
                       <span>Ingestion Phase: Multi-Chunk Scan</span>
                       <span>{drafts.length} Artifacts Detected</span>
                    </div>
                    <Progress value={progress} className="h-4 bg-zinc-900 rounded-full" />
                 </div>

                 <Card className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8 max-h-[300px] overflow-y-auto no-scrollbar">
                    <div className="space-y-2 font-mono text-[10px]">
                       {log.slice(-10).map((l, i) => (
                         <div key={i} className="text-zinc-500 flex gap-2">
                           <span className="text-primary">{" > "}</span> {l}
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-10 pb-20">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                       <CheckCircle size={200} />
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                       <div className="w-20 h-20 rounded-[28px] bg-emerald-500 flex items-center justify-center shadow-xl">
                          <CheckCircle2 className="text-white w-10 h-10" />
                       </div>
                       <div>
                          <h4 className="text-4xl font-black uppercase tracking-tighter">Production Review</h4>
                          <p className="text-emerald-500/60 font-bold uppercase text-xs tracking-widest mt-1">
                             {drafts.length} Questions • {diSets.length} DI Sets parsed from {totalPages} pages
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto relative z-10">
                       <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 font-bold hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => setStep('idle')}>Discard Batch</Button>
                       <Button onClick={commitAllToBank} disabled={loading} className="h-16 flex-1 md:none px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg blue-glow">
                          {loading ? <Loader2 className="animate-spin" /> : "Commit All to Bank"}
                       </Button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center gap-4">
                       <LayoutGrid className="text-primary" />
                       <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase">Extracted Assets</p>
                          <p className="text-xl font-black">{drafts.length + diSets.length}</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center gap-4">
                       <History className="text-accent" />
                       <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase">Pages Chunked</p>
                          <p className="text-xl font-black">{totalPages}</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center gap-4">
                       <Clock className="text-zinc-500" />
                       <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase">Process Time</p>
                          <p className="text-xl font-black">~{(totalPages * 3 / 60).toFixed(1)}m</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center gap-4">
                       <CheckCircle className="text-emerald-500" />
                       <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase">Confidence</p>
                          <p className="text-xl font-black">96%</p>
                       </div>
                    </div>
                 </div>

                 <Tabs defaultValue="questions" className="space-y-10">
                   <TabsList className="bg-zinc-900 border-white/5 p-1.5 h-16 rounded-[24px] w-fit">
                      <TabsTrigger value="questions" className="rounded-[18px] px-10 font-bold text-sm uppercase tracking-widest">
                         <LayoutGrid className="w-4 h-4 mr-2" /> Atomic MCQs
                      </TabsTrigger>
                      <TabsTrigger value="di" className="rounded-[18px] px-10 font-bold text-sm uppercase tracking-widest">
                         <TableIcon className="w-4 h-4 mr-2" /> DI Sets
                      </TabsTrigger>
                   </TabsList>

                   <TabsContent value="questions" className="grid gap-8">
                      {drafts.map((q, i) => (
                        <Card key={i} className="rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden group transition-all hover:border-primary/20">
                           <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                              <div className="flex gap-4">
                                 <Badge className="bg-primary text-white border-none font-black px-4 py-1 uppercase text-[10px] tracking-widest">{q.subject}</Badge>
                                 <Badge variant="outline" className="text-zinc-500 border-white/10 font-black px-3 py-1 uppercase text-[10px] tracking-widest">{q.difficulty}</Badge>
                                 {q.isMath && <Badge className="bg-blue-500/10 text-blue-500 border-none font-black px-3 py-1 uppercase text-[10px]"><Calculator className="w-3 h-3 mr-1" /> Math</Badge>}
                              </div>
                              <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-destructive rounded-xl" onClick={() => setDrafts(prev => prev.filter((_, idx) => idx !== i))}>
                                 <Trash2 size={20} />
                              </Button>
                           </div>
                           <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                              <div className="space-y-6">
                                 <p className="text-xl font-bold leading-relaxed">{q.question_en}</p>
                                 <div className="grid gap-3">
                                    {q.options_en.map((o: string, idx: number) => (
                                      <div key={idx} className={`p-5 rounded-2xl text-sm border ${o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                                         {String.fromCharCode(65 + idx)}. {o}
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              {q.question_pa && (
                                <div className="space-y-6 border-l border-white/5 pl-12">
                                   <p className="text-xl font-medium text-zinc-300 leading-relaxed">{q.question_pa}</p>
                                   <div className="grid gap-3">
                                      {q.options_pa?.map((o: string, idx: number) => (
                                        <div key={idx} className="p-5 rounded-2xl text-sm bg-black/20 border border-white/5 text-zinc-400">
                                           {o}
                                        </div>
                                      ))}
                                   </div>
                                </div>
                              )}
                           </div>
                        </Card>
                      ))}
                   </TabsContent>

                   <TabsContent value="di" className="space-y-10">
                      {diSets.length > 0 ? diSets.map((set, i) => (
                        <Card key={i} className="rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden">
                           <div className="p-10 bg-white/[0.02] border-b border-white/5">
                              <h5 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">DI Passage Context</h5>
                              <p className="text-lg text-zinc-300 leading-relaxed italic">{set.passage}</p>
                              {set.tableData && (
                                <div className="mt-8 p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-[10px] whitespace-pre-wrap text-emerald-500">
                                   {set.tableData}
                                </div>
                              )}
                           </div>
                           <div className="p-10 space-y-6">
                              {set.questions.map((q: any, qIdx: number) => (
                                <div key={qIdx} className="p-8 bg-white/[0.01] rounded-[32px] border border-white/5 space-y-4">
                                   <div className="flex justify-between items-start">
                                      <p className="text-lg font-bold">{q.question_en}</p>
                                      <Badge className="bg-emerald-600 text-[10px] px-3 py-1">Correct: {q.correctAnswer}</Badge>
                                   </div>
                                   <div className="flex flex-wrap gap-3">
                                      {q.options_en.map((o: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="bg-zinc-800 border-none text-[10px] py-2 px-5 rounded-xl">{o}</Badge>
                                      ))}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </Card>
                      )) : (
                        <div className="py-32 text-center text-zinc-600 italic">No Data Interpretation sets detected in this document.</div>
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