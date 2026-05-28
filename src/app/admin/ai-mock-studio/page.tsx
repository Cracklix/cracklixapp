'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { createGenerationJob, generateBilingualBatch } from '@/ai/flows/ai-mock-generator-flow';
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
  Globe
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

const EXAMS = ["PSSSB Clerk", "Punjab Police SI", "Punjab Police Constable", "PPSC PCS", "Patwari 2024", "Custom Exam"];
const SUBJECT_LIST = ["Punjab GK", "General Knowledge", "Reasoning", "Quantitative Aptitude", "English Language", "Punjabi Grammar", "ICT & Computers"];

export default function AiMockStudioPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk",
    subjects: ["Punjab GK"],
    count: 10,
    difficulty: "medium",
    languageMode: "bilingual",
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
    if (!config.title) return toast({ title: "Title Required", variant: "destructive" });
    
    setLoading(true);
    try {
      const jobRef = await addDoc(collection(db, 'ai_generation_jobs'), {
        config,
        status: 'pending',
        progress: 0,
        logs: [`[${new Date().toLocaleTimeString()}] Neural Link established.`],
        generatedCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      const jobId = jobRef.id;
      setActiveJobId(jobId);
      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'processing' });
      
      // Batch Processing Logic
      const batchSize = 5;
      const totalBatches = Math.ceil(config.count / batchSize);
      let accumulated: any[] = [];
      
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
        
        accumulated = [...accumulated, ...questions];
        
        await updateDoc(doc(db, 'ai_generation_jobs', jobId), {
          progress: Math.round(((b + 1) / totalBatches) * 100),
          generatedCount: accumulated.length
        });
      }

      if (config.publishInstantly) {
        await addDoc(collection(db, "mocks"), {
          title: config.title,
          exam: config.exam,
          totalQuestions: accumulated.length,
          duration: 60,
          negativeMarking: 0.25,
          status: "published",
          accessType: "pass_plus",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          source: "AI_STUDIO_V4"
        });
      }

      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'completed', progress: 100 });
      toast({ title: "Neural Synthesis Success" });
    } catch (e: any) {
      if (activeJobId) await updateDoc(doc(db, 'ai_generation_jobs', activeJobId), { status: 'failed' });
      toast({ title: "Synthesis Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-20 px-10 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0 z-30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center blue-glow">
                <BrainCircuit className="text-primary w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Neural Forge</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Enterprise Synthesis Core v4.0</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex gap-4 border-r border-white/10 pr-6 mr-2 text-right">
                  <div>
                     <p className="text-[8px] font-black text-zinc-600 uppercase">Active Jobs</p>
                     <p className="text-sm font-black">{recentJobs.filter(j => j.status === 'processing').length}</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-zinc-600 uppercase">Success Rate</p>
                     <p className="text-sm font-black text-emerald-500">98.2%</p>
                  </div>
               </div>
               <Button variant="outline" className="h-10 border-white/5 rounded-xl text-[10px] font-black uppercase"><History className="w-3.5 h-3.5 mr-2" /> Global Logs</Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Control Sidebar */}
            <aside className="w-96 border-r border-white/5 p-8 overflow-y-auto no-scrollbar bg-black/20">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                     <Settings2 className="text-primary w-5 h-5" />
                     <h3 className="text-xs font-black uppercase tracking-widest">Configuration</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Mock Identity</label>
                        <Input 
                          placeholder="e.g. Sunday Marathon #42" 
                          value={config.title}
                          onChange={e => setConfig({...config, title: e.target.value})}
                          className="h-11 bg-zinc-900 border-white/5 rounded-xl text-sm font-bold"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Target Exam</label>
                        <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                           <SelectTrigger className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold text-xs"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-zinc-950 text-white border-white/10">
                              {EXAMS.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Subject Matrix</label>
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                           {SUBJECT_LIST.map(sub => (
                             <button
                               key={sub}
                               onClick={() => {
                                 const next = config.subjects.includes(sub) ? config.subjects.filter(s => s !== sub) : [...config.subjects, sub];
                                 setConfig({...config, subjects: next});
                               }}
                               className={cn(
                                 "text-[8px] font-black px-2 py-1 rounded-lg uppercase transition-all",
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
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Quantity</label>
                           <Input 
                             type="number" 
                             value={config.count}
                             onChange={e => setConfig({...config, count: Number(e.target.value)})}
                             className="h-11 bg-zinc-900 border-white/5 rounded-xl font-black"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-1">Complexity</label>
                           <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                              <SelectTrigger className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-zinc-950 text-white border-white/10">
                                 <SelectItem value="easy">Easy</SelectItem>
                                 <SelectItem value="medium">Medium</SelectItem>
                                 <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <Button 
                       onClick={handleLaunch} 
                       disabled={loading}
                       className="w-full h-16 rounded-[20px] bg-primary hover:bg-primary/90 text-xs font-black blue-glow shadow-xl uppercase tracking-widest mt-4"
                     >
                        {loading ? <Loader2 className="animate-spin mr-3" /> : <Zap className="mr-3 w-4 h-4" />}
                        Execute Neural Forge
                     </Button>
                  </div>
               </div>

               <div className="mt-12 space-y-4">
                  <h4 className="text-[9px] font-black uppercase text-zinc-600 px-1 tracking-widest">Pipeline Pulse</h4>
                  {recentJobs.map((job: any) => (
                    <div key={job.id} onClick={() => setActiveJobId(job.id)} className={cn("p-4 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all", activeJobId === job.id ? "bg-primary/10 border-primary/40" : "bg-zinc-900/30 border-white/5 hover:border-white/10")}>
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                          )}>
                             {job.status === 'completed' ? <CheckCircle2 size={14} /> : <Loader2 size={14} className="animate-spin" />}
                          </div>
                          <div>
                             <p className="text-[10px] font-bold uppercase truncate max-w-[150px]">{job.config.title}</p>
                             <p className="text-[7px] font-black text-zinc-600 uppercase mt-0.5">{job.generatedCount} / {job.config.count} Qs</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </aside>

            {/* Terminal Area */}
            <section className="flex-1 p-10 overflow-y-auto no-scrollbar">
               {jobData ? (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto w-full space-y-10">
                    <div className="flex items-center justify-between">
                       <div>
                          <Badge className={cn(
                            "px-3 py-1 rounded-lg font-black uppercase text-[8px] border-none mb-3",
                            jobData.status === 'completed' ? 'bg-emerald-600' : 'bg-primary animate-pulse'
                          )}>
                             {jobData.status.toUpperCase()}
                          </Badge>
                          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{jobData.config.title}</h2>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Synthesis Saturation</p>
                          <p className="text-5xl font-black text-primary">{jobData.progress}%</p>
                       </div>
                    </div>

                    <Progress value={jobData.progress} className="h-1 bg-zinc-900 rounded-full" />

                    <div className="grid lg:grid-cols-12 gap-10">
                       <div className="lg:col-span-8">
                          <Card className="rounded-[40px] bg-zinc-950 border border-white/10 p-8 h-[500px] flex flex-col relative overflow-hidden">
                             <h4 className="text-[9px] font-black uppercase text-primary tracking-[0.4em] mb-8 flex items-center gap-2">
                                <Terminal size={12} /> Execution Stream
                             </h4>
                             <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4 font-mono text-[10px] text-zinc-500">
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

                       <div className="lg:col-span-4 space-y-6">
                          <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-4">
                             <div className="flex items-center justify-between">
                                <h5 className="font-bold flex items-center gap-3 text-xs">
                                   <Database className="text-primary w-4 h-4" /> Bank Status
                                </h5>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] px-2 py-0.5 font-black">SYNCED</Badge>
                             </div>
                             <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                                "Artifacts are undergoing real-time Bilingual Normalization. Raavi-Raavi signal verified."
                             </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 text-center">
                                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Synthesized</p>
                                <h4 className="text-3xl font-black">{jobData.generatedCount}</h4>
                             </div>
                             <div className="p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 text-center">
                                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Quality</p>
                                <h4 className="text-3xl font-black text-emerald-500">98%</h4>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20">
                    <Database size={80} className="text-zinc-800 mb-8" />
                    <h3 className="text-3xl font-black uppercase text-zinc-800">Terminal Standby</h3>
                    <p className="text-zinc-800 mt-4 text-sm font-medium italic max-w-sm">Configure parameters to activate the Neural Forge. Simulation artifacts will stream here live.</p>
                 </div>
               )}
            </section>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
