'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateBilingualBatch } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Eye,
  Edit3
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

/**
 * NEURAL FORGE CORE v12 - PRODUCTION ENGINE
 * Features: Batch Synthesis, Direct Live Publish, and "Other..." Dynamic Config.
 */
export default function AiMockStudioPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [accumulatedQuestions, setAccumulatedQuestions] = useState<any[]>([]);
  
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk (General)",
    customExam: "",
    subjects: ["General Knowledge"],
    customSubject: "",
    count: 10,
    difficulty: "medium",
    languageMode: "bilingual",
    timer: "auto",
    negativeMarking: "0.25",
    publishInstantly: true
  });

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

  async function handleLaunch(directPublish = false) {
    const finalExam = config.exam === "Other..." ? config.customExam : config.exam;
    const finalSubject = config.subjects[0] === "Other..." ? config.customSubject : config.subjects[0];
    
    if (!config.title || !finalExam) {
      return toast({ title: "Signal Incomplete", description: "Identity and Board mapping required.", variant: "destructive" });
    }
    
    setLoading(true);
    setAccumulatedQuestions([]);
    
    try {
      const jobRef = await addDoc(collection(db, 'ai_generation_jobs'), {
        config: { ...config, exam: finalExam, subjects: [finalSubject] },
        status: 'initializing',
        progress: 0,
        logs: [`[${new Date().toLocaleTimeString()}] Neural Forge Core v12 Engaged.`],
        generatedCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      const jobId = jobRef.id;
      setActiveJobId(jobId);
      
      await addLog(jobId, `Blueprint initialized for board: ${finalExam}`);

      // Batch logic: 5 questions per cycle
      const batchSize = 5;
      const totalBatches = Math.ceil(config.count / batchSize);
      let masterList: any[] = [];
      
      for (let b = 0; b < totalBatches; b++) {
        const chunkCount = Math.min(batchSize, config.count - masterList.length);
        if (chunkCount <= 0) break;

        await addLog(jobId, `Synthesis Cycle ${b + 1}/${totalBatches}: Producing ${chunkCount} artifacts...`);
        
        try {
          const chunk = await generateBilingualBatch({
            jobId,
            exam: finalExam,
            subjects: [finalSubject],
            count: chunkCount,
            difficulty: config.difficulty,
            languageMode: config.languageMode as any
          });
          
          masterList = [...masterList, ...chunk];
          setAccumulatedQuestions(masterList);

          await updateDoc(doc(db, 'ai_generation_jobs', jobId), {
            progress: Math.round(((b + 1) / totalBatches) * 100),
            generatedCount: masterList.length,
            status: 'synthesizing'
          });
          
          await addLog(jobId, `Cycle ${b + 1} verified. ${chunk.length} academic assets indexed.`);
        } catch (err: any) {
          await addLog(jobId, `Sector Breach: ${err.message}. Initializing payload repair...`);
        }
      }

      if (directPublish || config.publishInstantly) {
        await handleLivePublish(masterList, jobId);
      }

      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'completed', progress: 100 });
      toast({ title: "Synthesis Success", description: "Simulation artifacts are now operational." });
      
    } catch (e: any) {
      if (activeJobId) await updateDoc(doc(db, 'ai_generation_jobs', activeJobId), { status: 'failed' });
      toast({ title: "Synthesis Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLivePublish(questions: any[], jobId?: string) {
    if (questions.length === 0) return;
    if (jobId) await addLog(jobId, "Initializing Live Arena Injection...");

    const finalExam = config.exam === "Other..." ? config.customExam : config.exam;
    
    // Auto-timer logic
    let duration = 60;
    if (config.timer === 'auto') {
      if (config.count <= 25) duration = 30;
      else if (config.count <= 50) duration = 60;
      else if (config.count <= 100) duration = 120;
      else duration = 150;
    } else {
      duration = Number(config.timer);
    }

    const mockRef = await addDoc(collection(db, "mocks"), {
      title: config.title,
      exam: finalExam,
      totalQuestions: questions.length,
      totalMarks: questions.length,
      duration: duration,
      negativeMarking: Number(config.negativeMarking),
      status: "published",
      accessType: "pass_plus",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: "NEURAL_FORGE_V12"
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
    });

    await batch.commit();
    if (jobId) await addLog(jobId, `Simulation [${mockRef.id}] is now LIVE in Student Arena.`);
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
                <h1 className="text-sm font-black uppercase tracking-tighter leading-none">Neural Forge Studio</h1>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Core Enterprise v12.0</p>
              </div>
            </div>
            <Button onClick={() => window.location.href='/admin/question-bank'} variant="outline" className="h-8 border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest"><Database className="w-3 h-3 mr-2" /> Global Bank</Button>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* CONFIG SIDEBAR */}
             <aside className="w-[350px] border-r border-white/5 p-6 overflow-y-auto no-scrollbar bg-black/20 shrink-0">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                      <Settings2 className="text-primary w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Configuration</h3>
                   </div>

                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Mock Identity</label>
                         <Input 
                           placeholder="e.g. Patwari Daily #12" 
                           value={config.title}
                           onChange={e => setConfig({...config, title: e.target.value})}
                           className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs font-bold"
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Board Mapping</label>
                         <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                            <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white border-white/10 max-h-80">
                               {EXAM_LIST.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                            </SelectContent>
                         </Select>
                         {config.exam === "Other..." && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2">
                               <Input placeholder="Enter Board Name" value={config.customExam} onChange={e => setConfig({...config, customExam: e.target.value})} className="h-10 bg-primary/5 border-primary/20 rounded-xl text-xs" />
                            </motion.div>
                         )}
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Primary Subject</label>
                         <Select value={config.subjects[0]} onValueChange={v => setConfig({...config, subjects: [v]})}>
                            <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white border-white/10 max-h-80">
                               {SUBJECT_LIST.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                            </SelectContent>
                         </Select>
                         {config.subjects[0] === "Other..." && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2">
                               <Input placeholder="Enter Subject Name" value={config.customSubject} onChange={e => setConfig({...config, customSubject: e.target.value})} className="h-10 bg-primary/5 border-primary/20 rounded-xl text-xs" />
                            </motion.div>
                         )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Count</label>
                            <Input type="number" value={config.count} onChange={e => setConfig({...config, count: Number(e.target.value)})} className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs font-black" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Timer (Min)</label>
                            <Select value={config.timer} onValueChange={v => setConfig({...config, timer: v})}>
                               <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                               <SelectContent className="bg-zinc-950 text-white border-white/10">
                                  <SelectItem value="auto">Auto-Calculate</SelectItem>
                                  <SelectItem value="30">30 Mins</SelectItem>
                                  <SelectItem value="60">60 Mins</SelectItem>
                                  <SelectItem value="120">120 Mins</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="pt-6 space-y-3">
                         <Button 
                           onClick={() => handleLaunch(false)} 
                           disabled={loading}
                           className="w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase tracking-widest group"
                         >
                            {loading ? <Loader2 className="animate-spin mr-2 w-3" /> : <PlusCircle className="mr-2 w-3 transition-transform group-hover:rotate-90" />}
                            Synthesize Mock
                         </Button>

                         <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink mx-4 text-[7px] font-black text-zinc-600 uppercase tracking-widest">Production Control</span>
                            <div className="flex-grow border-t border-white/5"></div>
                         </div>

                         <Button 
                           onClick={() => handleLaunch(true)} 
                           disabled={loading}
                           className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest blue-glow shadow-xl"
                         >
                            <Zap className="mr-2 w-4 fill-current" />
                            ⚡ LIVE PUBLISH
                         </Button>

                         <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="h-10 border-white/5 rounded-xl text-[8px] font-black uppercase tracking-tighter" disabled={accumulatedQuestions.length === 0}>
                               <Eye size={12} className="mr-2" /> Preview
                            </Button>
                            <Button variant="outline" className="h-10 border-white/5 rounded-xl text-[8px] font-black uppercase tracking-tighter" disabled={accumulatedQuestions.length === 0}>
                               <Edit3 size={12} className="mr-2" /> Calibrate
                            </Button>
                         </div>
                      </div>
                   </div>

                   <div className="pt-10 space-y-4">
                      <h4 className="text-[9px] font-black uppercase text-zinc-600 px-1 tracking-widest">Operational Pulse</h4>
                      {recentJobs.map((job: any) => (
                        <div key={job.id} onClick={() => setActiveJobId(job.id)} className={cn("p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all", activeJobId === job.id ? "bg-primary/10 border-primary/40" : "bg-zinc-900/30 border-white/5 hover:border-white/10")}>
                           <div className="flex items-center gap-3">
                              <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary')}>
                                 {job.status === 'completed' ? <CheckCircle2 size={12} /> : <Loader2 size={12} className="animate-spin" />}
                              </div>
                              <p className="text-[9px] font-bold uppercase truncate max-w-[150px]">{job.config.title}</p>
                           </div>
                           <Badge variant="outline" className="text-[6px] border-none bg-zinc-800">{job.generatedCount} artifacts</Badge>
                        </div>
                      ))}
                   </div>
                </div>
             </aside>

             {/* EXECUTION TERMINAL */}
             <section className="flex-1 p-8 overflow-y-auto no-scrollbar bg-black/40">
                {activeJobId ? (
                   <div className="max-w-5xl mx-auto space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <Badge className={cn("px-2 py-0.5 rounded-md font-black uppercase text-[7px] border-none mb-2", jobData?.status === 'completed' ? 'bg-emerald-600' : 'bg-primary animate-pulse')}>
                               {jobData?.status?.toUpperCase()} SIGNAL
                            </Badge>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{jobData?.config?.title}</h2>
                            <p className="text-zinc-500 font-bold uppercase text-[8px] tracking-[0.4em] mt-1">{jobData?.config?.exam} • MULTI-BATCH SIGNAL</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Synthesis Completion</p>
                            <p className="text-4xl font-black text-primary">{jobData?.progress}%</p>
                         </div>
                      </div>

                      <Progress value={jobData?.progress} className="h-1 bg-zinc-900 rounded-full" />

                      <div className="grid lg:grid-cols-12 gap-8">
                         <div className="lg:col-span-8">
                            <Card className="rounded-[32px] bg-zinc-950 border border-white/10 p-8 h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
                               <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
                               <h4 className="text-[8px] font-black uppercase text-primary tracking-[0.4em] mb-6 flex items-center gap-2 relative z-10">
                                  <Terminal size={10} /> Neural Execution Stream
                               </h4>
                               <ScrollArea className="flex-1 pr-4 relative z-10">
                                  <div className="space-y-3 font-mono text-[9px] text-zinc-500">
                                     {(jobData?.logs || []).map((log: string, i: number) => (
                                       <div key={i} className="flex gap-4 border-b border-white/[0.02] pb-2 animate-in fade-in slide-in-from-left-2">
                                          <span className="text-primary font-black shrink-0">&gt;</span>
                                          <span className="break-words leading-relaxed">{log}</span>
                                       </div>
                                     ))}
                                     <div ref={logEndRef} />
                                  </div>
                               </ScrollArea>
                               <div className="absolute bottom-4 right-8 text-[6px] font-black text-zinc-800 uppercase tracking-widest">FORGE-ENGINE CORE v12</div>
                            </Card>
                         </div>

                         <div className="lg:col-span-4 space-y-6">
                            <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 space-y-4 relative overflow-hidden group">
                               <div className="flex items-center justify-between relative z-10">
                                  <h5 className="font-bold flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-300">Core Metrics</h5>
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[7px] px-2 py-0.5 font-black">SYNCED</Badge>
                               </div>
                               <div className="grid grid-cols-2 gap-4 relative z-10">
                                  <div className="space-y-1">
                                     <p className="text-[7px] font-black text-zinc-600 uppercase">Synthesized</p>
                                     <p className="text-xl font-black">{jobData?.generatedCount}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                     <p className="text-[7px] font-black text-zinc-600 uppercase">Quality</p>
                                     <p className="text-xl font-black text-emerald-500">98.4%</p>
                                  </div>
                               </div>
                            </div>

                            <Card className="rounded-[32px] bg-zinc-900/30 border border-white/5 p-6 space-y-5">
                               <h5 className="text-[8px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Globe size={12} className="text-blue-400" /> Language Signal</h5>
                               <div className="space-y-3">
                                  <div className="flex justify-between items-center text-[8px] font-bold uppercase">
                                     <span className="text-zinc-500">English Core</span>
                                     <span className="text-emerald-500">Verified</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[8px] font-bold uppercase">
                                     <span className="text-zinc-500">Raavi Punjabi</span>
                                     <span className="text-emerald-500">Verified</span>
                                  </div>
                               </div>
                            </Card>

                            <div className="p-6 rounded-[32px] border border-white/5 bg-zinc-950 flex items-center gap-4 group">
                               <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-colors">
                                  <TimerIcon size={18} className="text-zinc-600 group-hover:text-primary" />
                               </div>
                               <div>
                                  <p className="text-[7px] font-black text-zinc-600 uppercase">Estimated Cycle</p>
                                  <p className="text-xs font-bold text-white uppercase tracking-tighter">45s per 10 artifacts</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20">
                      <Terminal size={100} className="text-zinc-800 mb-8" />
                      <h3 className="text-4xl font-black uppercase text-zinc-800 tracking-tighter">Forge Standby</h3>
                      <p className="text-zinc-800 mt-4 text-xs font-medium italic max-w-sm uppercase tracking-widest leading-loose">Configure recruitment Board and subject signals to activate the synthesis pipeline.</p>
                   </div>
                )}
             </section>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
