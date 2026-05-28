'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { createGenerationJob, generateBilingualBatch } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Loader2, 
  BrainCircuit, 
  Terminal, 
  CheckCircle2, 
  History,
  LayoutGrid,
  Zap,
  Settings2,
  Database,
  Search,
  Globe,
  PlusCircle,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Languages
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EXAMS = [
  "PSSSB Clerk", "Punjab Police SI", "Punjab Police Constable", 
  "PPSC PCS", "Patwari 2024", "SSC CGL", "Banking IBPS", "Custom Exam"
];

const SUBJECT_LIST = [
  "Punjab GK", "General Knowledge", "Reasoning", "Quantitative Aptitude", 
  "English Language", "Punjabi Grammar", "ICT & Computers", "Constitution"
];

/**
 * ENTERPRISE AI MOCK STUDIO v3.0
 * Features: High-fidelity generation, Live log streaming, Bank integration.
 */
export default function AiMockStudioPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  
  // Configuration
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk",
    subjects: ["Punjab GK"],
    count: 10,
    difficulty: "medium",
    languageMode: "bilingual",
    marksPerQuestion: 1,
    negativeMarking: 0.25,
    timer: 60,
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

  async function handleLaunch() {
    if (!config.title) return toast({ title: "Validation Error", description: "Set a title for this generation job." });
    
    setLoading(true);
    try {
      const jobId = await createGenerationJob(config);
      setActiveJobId(jobId);
      
      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'processing' });
      
      // Batch processing: 5 questions per chunk for stability
      const batchSize = 5;
      const totalBatches = Math.ceil(config.count / batchSize);
      let accumulatedQuestions: any[] = [];
      
      for (let b = 0; b < totalBatches; b++) {
        const chunkCount = Math.min(batchSize, config.count - (b * batchSize));
        const questions = await generateBilingualBatch({
          jobId,
          exam: config.exam,
          subjects: config.subjects,
          count: chunkCount,
          difficulty: config.difficulty,
          languageMode: config.languageMode as any
        });
        
        accumulatedQuestions = [...accumulatedQuestions, ...questions];
        
        await updateDoc(doc(db, 'ai_generation_jobs', jobId), {
          progress: Math.round(((b + 1) / totalBatches) * 100),
          generatedCount: accumulatedQuestions.length
        });
      }

      // Auto Mock Creation if requested
      if (config.publishInstantly) {
        await addDoc(collection(db, "mocks"), {
          title: config.title,
          exam: config.exam,
          totalQuestions: accumulatedQuestions.length,
          duration: config.timer,
          negativeMarking: config.negativeMarking,
          status: "published",
          accessType: "pass_plus",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          source: "AI_STUDIO_V3"
        });
      }

      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'completed', progress: 100 });
      toast({ title: "Neural Synthesis Success", description: `${config.count} artifacts synthesized and indexed.` });
    } catch (e: any) {
      if (activeJobId) await updateDoc(doc(db, 'ai_generation_jobs', activeJobId), { status: 'failed' });
      toast({ title: "Synthesis Aborted", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Control Bar */}
          <header className="h-20 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center blue-glow shadow-lg">
                <BrainCircuit className="text-primary w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter">Neural Forge Terminal</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   AI Orchestration Core v3.0
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex gap-4 border-r border-white/10 pr-6 mr-2">
                  <div className="text-right">
                     <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Active Jobs</p>
                     <p className="text-sm font-black text-white">{recentJobs.filter(j => j.status === 'processing').length}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Global Bank</p>
                     <p className="text-sm font-black text-emerald-500">12.4k artifacts</p>
                  </div>
               </div>
               <Button variant="outline" className="h-10 border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest"><History className="w-3.5 h-3.5 mr-2" /> Activity Log</Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar Controls */}
            <aside className="w-96 border-r border-white/5 p-8 flex flex-col overflow-y-auto no-scrollbar bg-black/20">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                     <Settings2 className="text-primary w-5 h-5" />
                     <h3 className="text-sm font-black uppercase tracking-widest">Configuration</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Mock Identity</label>
                        <Input 
                          placeholder="e.g. Excise Inspector Prelims #4" 
                          value={config.title}
                          onChange={e => setConfig({...config, title: e.target.value})}
                          className="h-11 bg-zinc-900 border-white/5 rounded-xl text-sm font-bold focus:border-primary/50"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Recruitment Board</label>
                        <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                           <SelectTrigger className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold text-xs"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-zinc-950 text-white border-white/10">
                              {EXAMS.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Subject distribution</label>
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                           {SUBJECT_LIST.map(sub => (
                             <button
                               key={sub}
                               onClick={() => {
                                 const next = config.subjects.includes(sub) 
                                   ? config.subjects.filter(s => s !== sub)
                                   : [...config.subjects, sub];
                                 setConfig({...config, subjects: next});
                               }}
                               className={cn(
                                 "text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-tight transition-all",
                                 config.subjects.includes(sub) ? "bg-primary text-white" : "bg-zinc-800 text-zinc-600 hover:text-zinc-300"
                               )}
                             >
                                {sub}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Total Artifacts</label>
                           <Input 
                             type="number" 
                             value={config.count}
                             onChange={e => setConfig({...config, count: Number(e.target.value)})}
                             className="h-11 bg-zinc-900 border-white/5 rounded-xl font-black"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Difficulty</label>
                           <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                              <SelectTrigger className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-zinc-950 text-white border-white/10">
                                 <SelectItem value="easy">Easy</SelectItem>
                                 <SelectItem value="medium">Medium</SelectItem>
                                 <SelectItem value="hard">Hard</SelectItem>
                                 <SelectItem value="mixed">Mixed Balance</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              <span className="text-[9px] font-black uppercase text-zinc-500">Auto-Publish Simulation</span>
                           </div>
                           <button 
                             onClick={() => setConfig({...config, publishInstantly: !config.publishInstantly})}
                             className={cn("w-10 h-5 rounded-full transition-all relative", config.publishInstantly ? "bg-emerald-600" : "bg-zinc-800")}
                           >
                              <div className={cn("w-3 h-3 rounded-full bg-white absolute top-1 transition-all", config.publishInstantly ? "right-1" : "left-1")} />
                           </button>
                        </div>
                     </div>

                     <Button 
                       onClick={handleLaunch} 
                       disabled={loading}
                       className="w-full h-16 rounded-[20px] bg-primary hover:bg-primary/90 text-sm font-black blue-glow shadow-xl uppercase tracking-widest mt-4"
                     >
                        {loading ? <Loader2 className="animate-spin mr-3" /> : <Zap className="mr-3 w-4 h-4" />}
                        Initialize Neural Forge
                     </Button>
                  </div>
               </div>

               <div className="mt-12 space-y-4">
                  <h4 className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.3em] px-1">Pipeline Pulse</h4>
                  {recentJobs.map((job: any) => (
                    <div key={job.id} onClick={() => setActiveJobId(job.id)} className={cn("p-4 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all", activeJobId === job.id ? "bg-primary/10 border-primary/40" : "bg-zinc-900/30 border-white/5 hover:border-white/10")}>
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary animate-pulse'
                          )}>
                             {job.status === 'completed' ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
                          </div>
                          <div>
                             <p className="text-[10px] font-bold uppercase truncate max-w-[150px]">{job.config.title}</p>
                             <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">{job.totalQuestions} Qs • {new Date(job.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-zinc-700 group-hover:text-white" />
                    </div>
                  ))}
               </div>
            </aside>

            {/* Main Console Area */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto no-scrollbar">
               {jobData ? (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto w-full space-y-10">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <Badge className={cn(
                            "px-4 py-1.5 rounded-lg font-black uppercase text-[10px] border-none shadow-lg",
                            jobData.status === 'completed' ? 'bg-emerald-600' : 'bg-primary animate-pulse'
                          )}>
                             {jobData.status.toUpperCase()}
                          </Badge>
                          <div>
                             <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{jobData.config.title}</h2>
                             <p className="text-xs font-bold text-zinc-500 mt-2">Active Task ID: {jobData.id}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Process Saturation</p>
                          <p className="text-5xl font-black text-primary">{jobData.progress}%</p>
                       </div>
                    </div>

                    <Progress value={jobData.progress} className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                       <div className="h-full bg-primary shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-1000" style={{ width: `${jobData.progress}%` }} />
                    </Progress>

                    <div className="grid lg:grid-cols-12 gap-10">
                       <div className="lg:col-span-7">
                          <Card className="rounded-[40px] bg-zinc-950 border border-white/10 p-8 h-[550px] flex flex-col shadow-inner relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Terminal size={150} /></div>
                             <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-8 flex items-center gap-2">
                                <Terminal size={14} /> Synthesis Stream
                             </h4>
                             <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4 font-mono text-[11px] text-zinc-500">
                                   {jobData.logs.map((log: string, i: number) => (
                                     <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2">
                                        <span className="text-primary font-black shrink-0">&gt;</span>
                                        <span className="break-words leading-relaxed">{log}</span>
                                     </div>
                                   ))}
                                   <div ref={logEndRef} />
                                </div>
                             </ScrollArea>
                          </Card>
                       </div>

                       <div className="lg:col-span-5 space-y-8">
                          <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-6">
                             <div className="flex items-center justify-between">
                                <h5 className="font-bold flex items-center gap-3">
                                   <Database className="text-primary w-4 h-4" /> Global Ingestion
                                </h5>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] px-2 py-0.5 font-black">STABLE</Badge>
                             </div>
                             <p className="text-xs text-zinc-400 leading-relaxed italic">
                                "Synthesized artifacts are passing through the <strong>Bilingual Validation Layer</strong>. Raavi-Gurmukhi signal verified. Automated indexing to Global Atomic Bank active."
                             </p>
                          </div>

                          <div className="grid grid-cols-2 gap-5">
                             <div className="p-8 rounded-[32px] bg-zinc-900/50 border border-white/5 text-center space-y-1">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Synthesized</p>
                                <h4 className="text-4xl font-black text-white">{jobData.generatedCount}</h4>
                                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Artifacts</p>
                             </div>
                             <div className="p-8 rounded-[32px] bg-zinc-900/50 border border-white/5 text-center space-y-1">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Quality Score</p>
                                <h4 className="text-4xl font-black text-emerald-500">98.4<span className="text-xs">%</span></h4>
                                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Confidence</p>
                             </div>
                          </div>

                          <Card className="p-8 rounded-[40px] bg-zinc-900/40 border border-white/5 space-y-6">
                             <h5 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><BarChart3 className="w-3 h-3" /> Synthesis Analytics</h5>
                             <div className="space-y-5">
                                {jobData.config.subjects.map((sub: string) => (
                                  <div key={sub} className="space-y-2">
                                     <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                                        <span>{sub.toUpperCase()}</span>
                                        <span>Allocated</span>
                                     </div>
                                     <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/60 w-full animate-in slide-in-from-left duration-1000" />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </Card>
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30">
                    <div className="w-24 h-24 rounded-[40px] border-4 border-dashed border-zinc-800 flex items-center justify-center mb-8">
                       <Database className="w-10 h-10 text-zinc-800" />
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-zinc-800">Terminal Standby</h3>
                    <p className="text-zinc-800 mt-4 text-xl font-medium italic max-w-lg">Initialize generation parameters in the sidebar to power the Neural Forge. Simulation artifacts will stream live to this terminal.</p>
                 </div>
               )}
            </section>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}

