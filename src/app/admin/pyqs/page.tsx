
"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import PYQForm from "@/components/admin/pyq-form";
import { 
  History, 
  Sparkles, 
  Plus, 
  Database, 
  FileUp, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ChevronRight,
  Trash2,
  Rocket,
  Search,
  LayoutGrid,
  Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, doc, setDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import * as pdfjsLib from 'pdfjs-dist';
import { parseQuestionsAi } from '@/ai/flows/ai-question-parser-flow';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function AdminPYQsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ai");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Ingestion State
  const [step, setStep] = useState<'idle' | 'processing' | 'review'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [logs, setLog] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);

  // Library State
  const [pyqs, setPyqs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPyqs();
  }, []);

  async function loadPyqs() {
    const q = query(collection(db, "pyqs"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    setPyqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

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

  async function executeIngestion() {
    if (!file) return;
    setLoading(true);
    setStep('processing');
    setProgress(0);
    setDrafts([]);
    addLog(`Initiating Enterprise Ingestion for ${file.name}`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      const jobId = `pyq_job_${Date.now()}`;
      await setDoc(doc(db, "ingestion_jobs", jobId), {
        fileName: file.name,
        type: 'pyq',
        status: 'processing',
        totalPages: numPages,
        createdAt: Date.now()
      });

      for (let i = 1; i <= numPages; i++) {
        setCurrentPage(i);
        addLog(`Processing Chunk ${i}/${numPages}...`);
        
        try {
          const pageImage = await convertPageToImage(pdf, i);
          const result = await parseQuestionsAi({ 
            photoDataUri: pageImage,
            preferredSubject: "PYQ Multi-Subject" 
          });

          if (result.questions && result.questions.length > 0) {
            const chunkRef = doc(db, "ingestion_jobs", jobId, "chunks", i.toString());
            await setDoc(chunkRef, {
              pageNumber: i,
              questions: result.questions,
              createdAt: Date.now()
            });
            
            setDrafts(prev => [...prev, ...result.questions.map(q => ({ ...q, sourcePage: i }))]);
            addLog(`Page ${i}: Extracted ${result.questions.length} questions successfully.`);
          } else {
            addLog(`Page ${i}: No questions detected. Sector quiet.`);
          }

          setProgress(Math.round((i / numPages) * 100));
        } catch (pageErr: any) {
          addLog(`!! Failure on Page ${i}: ${pageErr.message}`);
        }
      }

      await updateDoc(doc(db, "ingestion_jobs", jobId), { status: 'review' });
      setStep('review');
      toast({ title: "Signal Analysis Complete", description: "PYQs are ready for review." });

    } catch (error: any) {
      addLog(`CRITICAL SYSTEM BREAK: ${error.message}`);
      toast({ title: "Pipeline Break", description: error.message, variant: "destructive" });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  async function commitToPYQBank() {
    setLoading(true);
    try {
      addLog("Injecting verified artifacts to PYQ Bank...");
      const batch = drafts.map(d => 
        addDoc(collection(db, "pyqs"), {
          ...d,
          createdAt: Date.now(),
          status: "published",
          source: file?.name || "ENTERPRISE_PDF"
        })
      );
      await Promise.all(batch);
      toast({ title: "Bank Injected", description: `${drafts.length} PYQs added to students' access.` });
      setStep('idle');
      loadPyqs();
    } catch (e: any) {
      toast({ title: "Injection Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMock() {
    // Generate a mock from the top 50 PYQs in the bank for demo
    setLoading(true);
    try {
      const q = query(collection(db, "pyqs"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      const qIds = snap.docs.map(d => d.id);
      
      await addDoc(collection(db, "mocks"), {
        title: `Official PYQ Marathon: ${new Date().getFullYear()} Edition`,
        exam: "PYQ Special",
        questionIds: qIds,
        duration: 60,
        negativeMarking: 0.25,
        premium: true,
        status: "published",
        createdAt: Date.now()
      });
      
      toast({ title: "Mock Deployed", description: "PYQ-based simulation is now live." });
    } catch (e: any) {
      toast({ title: "Mock Generation Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-orange-500/20 flex items-center justify-center shadow-lg">
                      <History className="text-orange-500 w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">PYQ Command</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Official previous year archive management and AI ingestion pipeline.</p>
              </div>
              <div className="flex gap-4">
                 <Button 
                   onClick={handleCreateMock}
                   disabled={loading}
                   className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest blue-glow"
                 >
                    <Rocket className="w-4 h-4 mr-2" /> Generate PYQ Mock
                 </Button>
              </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
              <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-[24px] h-16 w-fit">
                <TabsTrigger value="ai" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-orange-600 text-xs uppercase tracking-[0.2em]">
                  <Sparkles className="w-4 h-4 mr-2" /> Power Ingest
                </TabsTrigger>
                <TabsTrigger value="manual" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-orange-600 text-xs uppercase tracking-[0.2em]">
                  <Plus className="w-4 h-4 mr-2" /> Manual Entry
                </TabsTrigger>
                <TabsTrigger value="library" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-orange-600 text-xs uppercase tracking-[0.2em]">
                  <Database className="w-4 h-4 mr-2" /> PYQ Library
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <PYQForm />
              </TabsContent>

              <TabsContent value="ai">
                 {step === 'idle' && (
                   <div className="grid lg:grid-cols-12 gap-10">
                      <Card className="lg:col-span-8 rounded-[48px] bg-zinc-900/40 border-white/5 p-12 md:p-24 flex flex-col items-center justify-center text-center border-dashed border-2 relative group min-h-[500px]">
                         <div className="w-24 h-24 rounded-[32px] bg-orange-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <FileUp className="text-orange-500 w-10 h-10" />
                         </div>
                         <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Initialize Artifact</h2>
                         <p className="text-zinc-500 max-w-md mb-12 text-lg">Upload official recruitment PDFs or scanned papers. Our engine chunks each page for 100% extraction accuracy.</p>
                         
                         <div className="flex flex-col items-center gap-6 w-full max-w-md">
                            <label className="w-full cursor-pointer p-6 rounded-[24px] bg-zinc-800/40 border border-white/5 flex items-center justify-center gap-4 font-bold hover:bg-zinc-800 transition-all">
                               <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                               <LayoutGrid className="text-zinc-500 w-5 h-5" />
                               <span className="truncate">{file ? file.name : "Select Document Artifact"}</span>
                            </label>
                            <Button 
                              disabled={!file || loading} 
                              onClick={executeIngestion}
                              className="w-full h-20 rounded-[28px] bg-orange-600 hover:bg-orange-700 text-xl font-black shadow-2xl transition-transform active:scale-95 shadow-orange-900/20"
                            >
                              Launch PYQ Ingestion
                            </Button>
                         </div>
                      </Card>

                      <div className="lg:col-span-4 space-y-6">
                         <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-8">
                            <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6 flex items-center gap-2">
                               <Layers className="w-4 h-4" /> System Capabilities
                            </h3>
                            <div className="space-y-4">
                               {[
                                 { label: "Bilingual Parsing", val: "EN + PA" },
                                 { label: "Scan Resilience", val: "High" },
                                 { label: "Subject Mapping", val: "Auto" },
                                 { label: "Year Detection", val: "Verified" },
                               ].map(stat => (
                                 <div key={stat.label} className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                                    <span className="text-xs text-zinc-500 font-bold">{stat.label}</span>
                                    <span className="text-xs text-emerald-500 font-black">{stat.val}</span>
                                 </div>
                               ))}
                            </div>
                         </Card>
                         
                         <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 space-y-4">
                            <h4 className="font-bold flex items-center gap-2 text-zinc-400">
                               <AlertTriangle className="text-orange-500 w-4 h-4" />
                               Admin Protocol
                            </h4>
                            <p className="text-xs text-zinc-600 leading-relaxed italic">
                               "Ensure artifact quality for better OCR performance. Hand-written scans must have clear contrast."
                            </p>
                         </div>
                      </div>
                   </div>
                 )}

                 {step === 'processing' && (
                   <div className="py-24 max-w-4xl mx-auto space-y-20">
                      <div className="text-center space-y-10">
                        <div className="relative inline-block">
                           <div className="w-64 h-64 border-8 border-orange-500/5 border-t-orange-500 rounded-full animate-spin mx-auto" />
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                              <p className="text-6xl font-black text-white">{progress}%</p>
                              <p className="text-xs font-black text-zinc-500 uppercase mt-1">Page {currentPage}/{totalPages}</p>
                           </div>
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter">Extracting Atomic Data</h3>
                      </div>

                      <div className="space-y-6">
                         <div className="flex justify-between items-center text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4">
                            <span>Extraction Stream: Active</span>
                            <span>Questions Extracted: {drafts.length}</span>
                         </div>
                         <Progress value={progress} className="h-4 bg-zinc-900 rounded-full" />
                      </div>

                      <Card className="rounded-[32px] bg-zinc-900/50 border-white/5 p-10 max-h-[300px] overflow-y-auto no-scrollbar">
                         <div className="space-y-3 font-mono text-[10px]">
                            {logs.map((l, i) => (
                              <div key={i} className="text-zinc-600 flex gap-3">
                                <span className="text-orange-500 font-black">{" >> "}</span> {l}
                              </div>
                            ))}
                         </div>
                      </Card>
                   </div>
                 )}

                 {step === 'review' && (
                   <div className="space-y-12 pb-32">
                      <div className="bg-orange-500/10 border border-orange-500/20 p-12 rounded-[56px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
                         <div className="flex items-center gap-10 relative z-10">
                            <div className="w-24 h-24 rounded-[32px] bg-orange-600 flex items-center justify-center shadow-2xl">
                               <CheckCircle2 className="text-white w-12 h-12" />
                            </div>
                            <div>
                               <h4 className="text-5xl font-black uppercase tracking-tighter">Review Dashboard</h4>
                               <p className="text-orange-500/60 font-bold uppercase text-sm tracking-widest mt-2">
                                  {drafts.length} PYQs Extracted • Verification Required
                               </p>
                            </div>
                         </div>
                         <div className="flex gap-4 w-full md:w-auto relative z-10">
                            <Button variant="outline" className="h-20 px-10 rounded-[28px] border-white/10 font-bold hover:bg-destructive/10 hover:text-destructive" onClick={() => setStep('idle')}>Discard All</Button>
                            <Button onClick={commitToPYQBank} disabled={loading} className="h-20 px-16 rounded-[28px] bg-orange-600 hover:bg-orange-700 font-black text-2xl shadow-2xl">
                               {loading ? <Loader2 className="animate-spin" /> : "Commit to Bank"}
                            </Button>
                         </div>
                      </div>

                      <div className="grid gap-8">
                         {drafts.map((q, i) => (
                           <Card key={i} className="rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden group hover:border-orange-500/30 transition-all">
                              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                 <div className="flex gap-4">
                                    <Badge className="bg-orange-600 text-white border-none font-black px-4 py-1.5 uppercase text-[10px]">{q.year} • {q.subject}</Badge>
                                    <Badge variant="outline" className="text-zinc-500 border-white/10 font-black px-4 py-1.5 uppercase text-[10px]">{q.difficulty}</Badge>
                                 </div>
                                 <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-destructive" onClick={() => setDrafts(prev => prev.filter((_, idx) => idx !== i))}>
                                    <Trash2 size={20} />
                                 </Button>
                              </div>
                              <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                 <div className="space-y-6">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">English Context</p>
                                    <p className="text-xl font-bold leading-relaxed">{q.question_en}</p>
                                    <div className="grid gap-3">
                                       {q.options_en?.map((o: any, idx: number) => (
                                         <div key={idx} className={cn("p-4 rounded-2xl border text-sm", o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
                                            {String.fromCharCode(65+idx)}. {o}
                                         </div>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="space-y-6 border-l border-white/5 pl-12">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Punjabi Raavi</p>
                                    <p className="text-xl font-medium text-zinc-300 leading-relaxed">{q.question_pa}</p>
                                    <div className="grid gap-3">
                                       {q.options_pa?.map((o: any, idx: number) => (
                                         <div key={idx} className="p-4 rounded-2xl bg-black/20 border border-white/5 text-zinc-400 text-sm">{o}</div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </Card>
                         ))}
                      </div>
                   </div>
                 )}
              </TabsContent>

              <TabsContent value="library" className="space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-900/50 p-8 rounded-[40px] border border-white/5">
                    <div className="relative w-full md:w-96">
                       <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600" />
                       <Input 
                         placeholder="Filter library artifacts..." 
                         className="h-12 bg-black/40 border-white/5 pl-12 rounded-xl"
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                       />
                    </div>
                    <div className="flex gap-4">
                       <Button variant="outline" className="rounded-xl border-white/5 h-12"><Filter className="w-4 h-4 mr-2" /> Subject</Button>
                       <Button variant="outline" className="rounded-xl border-white/5 h-12"><LayoutGrid className="w-4 h-4 mr-2" /> Year</Button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pyqs.filter(q => q.question_en.toLowerCase().includes(search.toLowerCase())).map((q) => (
                      <Card key={q.id} className="rounded-[32px] bg-zinc-900/40 border-white/5 p-8 space-y-6 hover:bg-zinc-900 transition-colors group">
                         <div className="flex justify-between items-start">
                            <Badge className="bg-orange-600/10 text-orange-500 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">{q.year}</Badge>
                            <Badge variant="outline" className="border-white/10 text-zinc-500 text-[9px] font-black uppercase">{q.subject}</Badge>
                         </div>
                         <h4 className="font-bold text-sm line-clamp-3 leading-relaxed text-zinc-300 group-hover:text-white transition-colors">{q.question_en}</h4>
                         <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-600 uppercase">Correct: {q.correctAnswer}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-600 hover:text-white"><ChevronRight className="w-4 h-4" /></Button>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
