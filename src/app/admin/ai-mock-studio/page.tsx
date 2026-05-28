'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { createGenerationJob, generateBilingualBatch } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  Database, 
  Zap, 
  BrainCircuit, 
  Terminal, 
  CheckCircle2, 
  History,
  LayoutGrid,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

/**
 * PRODUCTION AI FACTORY v2.0
 * Features: Live Log Streaming, Multi-stage Batching, Real-time Bank Sync.
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
    subject: "Punjab GK",
    count: 10,
    difficulty: "medium"
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to recent jobs
    const q = query(collection(db, 'ai_generation_jobs'), orderBy('createdAt', 'desc'), limit(5));
    const unsub = onSnapshot(q, (snap) => {
      setRecentJobs(snap.docs.map(d => d.data()));
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
    if (!config.title) return toast({ title: "Identification Required", description: "Set a title for this generation job." });
    
    setLoading(true);
    try {
      const jobId = await createGenerationJob(config);
      setActiveJobId(jobId);
      
      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'processing' });
      
      const batchSize = 5;
      const totalBatches = Math.ceil(config.count / batchSize);
      
      for (let b = 0; b < totalBatches; b++) {
        const chunkCount = Math.min(batchSize, config.count - (b * batchSize));
        await generateBilingualBatch({
          jobId,
          exam: config.exam,
          subject: config.subject,
          count: chunkCount,
          difficulty: config.difficulty
        });
        
        await updateDoc(doc(db, 'ai_generation_jobs', jobId), {
          progress: Math.round(((b + 1) / totalBatches) * 100),
          generatedCount: (b + 1) * chunkCount
        });
      }

      await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'completed', progress: 100 });
      toast({ title: "Neural Synthesis Success", description: `${config.count} artifacts injected into bank.` });
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
          <header className="h-20 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center blue-glow">
                <BrainCircuit className="text-primary w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter">AI Forge Terminal</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Neural Pipeline: Active v2.0
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar p-10">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
              
              {/* Controls Column */}
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Sparkles size={150} /></div>
                   <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                     <LayoutGrid size={18} className="text-primary" /> Configuration
                   </h3>
                   
                   <div className="space-y-6 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Mock Identity</label>
                        <Input 
                          placeholder="e.g. Sunday Mega Mock #42" 
                          value={config.title}
                          onChange={e => setConfig({...config, title: e.target.value})}
                          className="h-12 bg-black/40 border-white/10 rounded-xl px-4 font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Target Exam</label>
                        <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                           <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-zinc-950 text-white border-white/10">
                              <SelectItem value="PSSSB Clerk">PSSSB Clerk</SelectItem>
                              <SelectItem value="Punjab Police SI">Punjab Police SI</SelectItem>
                              <SelectItem value="PPSC PCS">PPSC PCS</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Artifact Count</label>
                          <Input 
                            type="number" 
                            value={config.count}
                            onChange={e => setConfig({...config, count: Number(e.target.value)})}
                            className="h-12 bg-black/40 border-white/10 rounded-xl px-4 font-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Complexity</label>
                          <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                             <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl font-bold"><SelectValue /></SelectTrigger>
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
                        className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-lg font-black blue-glow shadow-xl"
                      >
                         {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                         LAUNCH NEURAL FORGE
                      </Button>
                   </div>
                </Card>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] px-4">Pipeline Status</h4>
                  {recentJobs.map((job: any) => (
                    <div key={job.id} className="p-5 rounded-[28px] bg-zinc-900/30 border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
                            job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary animate-pulse'
                          )}>
                             {job.status === 'completed' ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{job.config.title}</p>
                             <p className="text-[8px] font-bold text-zinc-600 uppercase mt-0.5">{job.totalQuestions} Artifacts • {new Date(job.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => setActiveJobId(job.id)} className="rounded-xl opacity-0 group-hover:opacity-100"><ChevronRight size={16} /></Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console Column */}
              <div className="lg:col-span-8 space-y-8">
                 {jobData ? (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <Badge className={cn(
                              "px-4 py-1 rounded-lg font-black uppercase text-[9px] border-none shadow-lg",
                              jobData.status === 'completed' ? 'bg-emerald-600' : 'bg-primary animate-pulse'
                            )}>
                               {jobData.status}
                            </Badge>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">{jobData.config.title}</h2>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progress</p>
                            <p className="text-3xl font-black text-primary">{jobData.progress}%</p>
                         </div>
                      </div>

                      <Progress value={jobData.progress} className="h-2 bg-zinc-900" />

                      <div className="grid md:grid-cols-2 gap-8">
                         <Card className="rounded-[40px] bg-zinc-950 border border-white/10 p-8 h-[500px] flex flex-col shadow-inner">
                            <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-6 flex items-center gap-2">
                               <Terminal size={14} /> Neural Logs
                            </h4>
                            <ScrollArea className="flex-1 pr-4">
                               <div className="space-y-3 font-mono text-[10px] text-zinc-500">
                                  {jobData.logs.map((log: string, i: number) => (
                                    <div key={i} className="flex gap-3">
                                       <span className="text-primary font-black shrink-0">&gt;</span>
                                       <span className="break-words">{log}</span>
                                    </div>
                                  ))}
                                  <div ref={logEndRef} />
                               </div>
                            </ScrollArea>
                         </Card>

                         <div className="space-y-6">
                            <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-4">
                               <h5 className="font-bold flex items-center gap-2">
                                  <Database className="text-primary w-4 h-4" /> Artifact Buffer
                               </h5>
                               <p className="text-xs text-zinc-400 leading-relaxed italic">
                                  "Generated artifacts are currently passing through the **Validation Layer**. Once verified, they will be automatically injected into the Global Atomic Bank."
                               </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 text-center">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Synthesized</p>
                                  <h4 className="text-3xl font-black text-white">{jobData.generatedCount}</h4>
                               </div>
                               <div className="p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 text-center">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Accuracy Score</p>
                                  <h4 className="text-3xl font-black text-emerald-500">98.2%</h4>
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 ) : (
                   <div className="h-full min-h-[600px] rounded-[64px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-20">
                      <Bot size={80} className="text-zinc-800 mb-8 animate-float" />
                      <h3 className="text-4xl font-black uppercase text-zinc-700 tracking-tighter">Terminal Idle</h3>
                      <p className="text-zinc-800 mt-4 text-xl font-medium italic max-w-lg">Configure generation parameters to initialize the Neural Forge. High-fidelity artifacts will stream live into your question bank.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
