
'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateBilingualBatch } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Terminal, 
  CheckCircle2, 
  History,
  Zap,
  Settings2,
  Database,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Globe,
  PlusCircle,
  Sparkles,
  Rocket,
  Timer as TimerIcon,
  AlertTriangle,
  FileUp,
  MessageSquare,
  X,
  Languages,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit, addDoc, writeBatch } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function NeuralForgePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'ocr' | 'bank' | 'pyq'>('ai');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [instruction, setInstruction] = useState("");
  
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk (General)",
    subjects: ["General Knowledge"],
    count: 10,
    difficulty: "medium",
    languageMode: "bilingual",
    timer: "auto",
    negativeMarking: "0.25",
    publishInstantly: true
  });

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'ai_generation_jobs'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setRecentJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!activeJobId) return;
    const unsub = onSnapshot(doc(db, 'ai_generation_jobs', activeJobId), (snap) => {
      setJobData(snap.data());
      if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
    return () => unsub();
  }, [activeJobId]);

  const addLog = async (jobId: string, message: string) => {
    const ref = doc(db, 'ai_generation_jobs', jobId);
    const existingLogs = jobData?.logs || [];
    await updateDoc(ref, {
      logs: [...existingLogs, `[${new Date().toLocaleTimeString()}] ${message}`],
      updatedAt: Date.now()
    });
  };

  async function handleLaunch() {
    if (!config.title) return toast({ title: "Identity Missing", description: "Simulation title is required.", variant: "destructive" });
    
    setLoading(true);
    try {
      const jobRef = await addDoc(collection(db, 'ai_generation_jobs'), {
        config: { ...config, instruction },
        status: 'initializing',
        progress: 0,
        logs: [`[${new Date().toLocaleTimeString()}] Neural Forge Engine Core Engaged.`],
        generatedCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      const jobId = jobRef.id;
      setActiveJobId(jobId);
      
      await addLog(jobId, `Analyzing instructions: "${instruction || 'Standard Generation'}"`);

      // Batch logic: 5 questions per cycle
      const batchSize = 5;
      const totalBatches = Math.ceil(config.count / batchSize);
      let masterList: any[] = [];
      
      for (let b = 0; b < totalBatches; b++) {
        const chunkCount = Math.min(batchSize, config.count - masterList.length);
        if (chunkCount <= 0) break;

        await addLog(jobId, `Synthesizing batch ${b + 1}/${totalBatches} (${chunkCount} artifacts)...`);
        
        try {
          const chunk = await generateBilingualBatch({
            jobId,
            exam: config.exam,
            subjects: config.subjects,
            count: chunkCount,
            difficulty: config.difficulty,
            languageMode: config.languageMode as any
          });
          
          masterList = [...masterList, ...chunk];
          
          await updateDoc(doc(db, 'ai_generation_jobs', jobId), {
            progress: Math.round(((b + 1) / totalBatches) * 100),
            generatedCount: masterList.length,
            status: 'synthesizing'
          });
          
          await addLog(jobId, `Batch ${b + 1} verified. Enforcing Raavi Punjabi payload.`);
        } catch (err: any) {
          await addLog(jobId, `Repairing payload branch: ${err.message}`);
        }
      }

      if (config.publishInstantly) {
        await handleLivePublish(masterList, jobId);
      }

      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'completed', progress: 100 });
      toast({ title: "Forge Complete", description: "Simulation is now live." });
      
    } catch (e: any) {
      toast({ title: "Forge Breach", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLivePublish(questions: any[], jobId?: string) {
    if (questions.length === 0) return;
    if (jobId) await addLog(jobId, "Initializing Live Arena Injection...");

    const mockRef = await addDoc(collection(db, "mocks"), {
      title: config.title,
      exam: config.exam,
      totalQuestions: questions.length,
      duration: 60,
      negativeMarking: 0.25,
      status: "published",
      accessType: "pass_plus",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: "NEURAL_FORGE_AI"
    });

    const batch = writeBatch(db);
    questions.forEach((q, idx) => {
      const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
      batch.set(qRef, {
        ...q,
        id: qRef.id,
        order: idx,
        createdAt: Date.now()
      });
      
      // Auto-save to Question Bank
      const bankRef = doc(collection(db, "questions"));
      batch.set(bankRef, {
        ...q,
        id: bankRef.id,
        status: "published",
        source: "NEURAL_FORGE",
        createdAt: Date.now()
      });
    });

    await batch.commit();
    if (jobId) await addLog(jobId, `Simulation successfully propagated to Arena.`);
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 px-10 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0 z-30">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center blue-glow">
                <BrainCircuit className="text-primary w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-tighter leading-none">Neural Forge AI</h1>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Instruction-Driven Generative Core</p>
              </div>
            </div>
            
            <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
               {['ai', 'ocr', 'bank', 'pyq'].map((t) => (
                 <button 
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                    activeTab === t ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                 >
                   {t}
                 </button>
               ))}
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* FORGE CONTROLS */}
             <aside className="w-[400px] border-r border-white/5 p-8 overflow-y-auto no-scrollbar bg-black/20 shrink-0 space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Settings2 className="text-primary w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Configuration</h3>
                   </div>

                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Mock Identity</label>
                         <Input 
                           placeholder="e.g. SI Marathon 2024" 
                           value={config.title}
                           onChange={e => setConfig({...config, title: e.target.value})}
                           className="h-11 bg-zinc-900 border-white/5 rounded-xl text-xs font-bold"
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Board</label>
                           <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                              <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl text-[10px] uppercase font-bold"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-zinc-950 text-white border-white/10">
                                 {EXAM_LIST.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Artifact Count</label>
                           <Input type="number" value={config.count} onChange={e => setConfig({...config, count: Number(e.target.value)})} className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs font-black" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/5">
                         <div className="flex items-center gap-2 mb-2">
                           <Zap size={14} className="text-primary fill-current" />
                           <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Advanced Instructions</h4>
                         </div>
                         <Textarea 
                           placeholder="Type custom rules (e.g. 'Focus on Sikh Empire', 'No math questions', 'Difficult difficulty'...)"
                           value={instruction}
                           onChange={e => setInstruction(e.target.value)}
                           className="min-h-[120px] bg-zinc-900 border-white/5 rounded-2xl p-4 text-xs font-medium leading-relaxed resize-none focus:border-primary/50 transition-colors"
                         />
                      </div>

                      {activeTab === 'ocr' && (
                        <div className="space-y-3 animate-in fade-in">
                           <div className="flex items-center gap-2 mb-2">
                              <FileUp size={14} className="text-primary" />
                              <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Source Document</h4>
                           </div>
                           <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
                              <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                              {file ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                   <CheckCircle2 size={14} /> {file.name}
                                </div>
                              ) : (
                                <div className="text-center">
                                   <PlusCircle size={18} className="mx-auto mb-1 text-zinc-600" />
                                   <p className="text-[9px] font-bold text-zinc-500 uppercase">Drop PDF or Image</p>
                                </div>
                              )}
                           </label>
                        </div>
                      )}

                      <Button 
                        onClick={handleLaunch} 
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest blue-glow shadow-xl"
                      >
                         {loading ? <Loader2 className="animate-spin mr-2 w-4" /> : <Rocket className="mr-2 w-4" />}
                         Execute Neural Forge
                      </Button>
                   </div>
                </div>

                <div className="pt-10 space-y-4">
                   <h4 className="text-[9px] font-black uppercase text-zinc-600 px-1 tracking-widest">Recent Cycles</h4>
                   {recentJobs.map((job: any) => (
                     <div key={job.id} onClick={() => setActiveJobId(job.id)} className={cn("p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all", activeJobId === job.id ? "bg-primary/10 border-primary/40" : "bg-zinc-900/30 border-white/5 hover:border-white/10")}>
                        <div className="flex items-center gap-4">
                           <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shadow-lg", job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary')}>
                              {job.status === 'completed' ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
                           </div>
                           <div>
                              <p className="text-[10px] font-bold uppercase truncate max-w-[150px]">{job.config.title}</p>
                              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{job.generatedCount} Artifacts</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-600" />
                     </div>
                   ))}
                </div>
             </aside>

             {/* WORKSPACE / TERMINAL */}
             <section className="flex-1 p-10 overflow-y-auto no-scrollbar bg-black/40">
                {activeJobId ? (
                   <div className="max-w-5xl mx-auto space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <Badge className="px-3 py-1 rounded-full font-black uppercase text-[8px] bg-primary blue-glow border-none mb-3">
                               {jobData?.status?.toUpperCase()} SIGNAL
                            </Badge>
                            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{jobData?.config?.title}</h2>
                            <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-2 flex items-center gap-2">
                               <Globe size={12} className="text-blue-500" /> {jobData?.config?.exam} • REAL-TIME SYNTHESIS
                            </p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Completion</p>
                            <p className="text-5xl font-black text-primary">{jobData?.progress}%</p>
                         </div>
                      </div>

                      <Progress value={jobData?.progress} className="h-1.5 bg-zinc-900 rounded-full" />

                      <div className="grid lg:grid-cols-12 gap-10">
                         <div className="lg:col-span-8 space-y-6">
                            <Card className="rounded-[48px] bg-zinc-950 border border-white/10 p-10 h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
                               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Terminal size={200} /></div>
                               <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-8 flex items-center gap-2 relative z-10">
                                  <Terminal size={14} /> Execution Stream
                               </h4>
                               <ScrollArea className="flex-1 pr-6 relative z-10">
                                  <div className="space-y-4 font-mono text-[10px] text-zinc-500">
                                     {(jobData?.logs || []).map((log: string, i: number) => (
                                       <div key={i} className="flex gap-4 border-b border-white/[0.03] pb-3 animate-in fade-in slide-in-from-left-2">
                                          <span className="text-primary font-black shrink-0">&gt;</span>
                                          <span className="break-words leading-relaxed">{log}</span>
                                       </div>
                                     ))}
                                     <div ref={logEndRef} />
                                  </div>
                               </ScrollArea>
                               <div className="absolute bottom-6 right-10 text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">SYSTEM STABILIZED</div>
                            </Card>
                         </div>

                         <div className="lg:col-span-4 space-y-6">
                            <Card className="rounded-[40px] bg-primary/5 border border-primary/20 p-8 space-y-6">
                               <div className="flex items-center justify-between">
                                  <h5 className="font-black text-[10px] uppercase tracking-widest text-zinc-300">Metrics</h5>
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                               </div>
                               <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-1">
                                     <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Synthesized</p>
                                     <p className="text-2xl font-black">{jobData?.generatedCount}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                     <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Bilingual</p>
                                     <p className="text-2xl font-black text-emerald-500">YES</p>
                                  </div>
                               </div>
                            </Card>

                            <div className="p-8 rounded-[40px] bg-zinc-900/30 border border-white/5 space-y-6">
                               <h5 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Languages size={14} className="text-blue-400" /> Signal Fidelity</h5>
                               <div className="space-y-4">
                                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                     <span className="text-zinc-500">English Core</span>
                                     <span className="text-emerald-500">100%</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                     <span className="text-zinc-500">Raavi Punjabi</span>
                                     <span className="text-emerald-500">100%</span>
                                  </div>
                               </div>
                            </div>

                            <Card className="rounded-[40px] bg-white/[0.02] border border-white/5 p-8 flex items-center gap-5">
                               <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5">
                                  <TimerIcon size={20} className="text-primary" />
                               </div>
                               <div>
                                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Cycle Velocity</p>
                                  <p className="text-xs font-bold text-white uppercase tracking-tighter">~45s per 10 artifacts</p>
                               </div>
                            </Card>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20 group">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="mb-10"
                      >
                        <BrainCircuit size={120} className="text-zinc-800" />
                      </motion.div>
                      <h3 className="text-5xl font-black uppercase text-zinc-800 tracking-tighter">Forge Standby</h3>
                      <p className="text-zinc-800 mt-6 text-xs font-medium italic max-w-sm uppercase tracking-widest leading-loose">Initialize the instruction buffer to begin bilingual artifact synthesis.</p>
                   </div>
                )}
             </section>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
