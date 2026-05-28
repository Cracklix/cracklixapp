
'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Send, 
  Plus, 
  Bot, 
  User, 
  Loader2, 
  Rocket, 
  Database,
  Sparkles,
  CheckCircle2,
  Trash2,
  Languages,
  ArrowRight,
  ShieldCheck,
  History,
  FileUp,
  Zap,
  LayoutGrid,
  Clock,
  Filter,
  BarChart3,
  Flame,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { createForgeJob, executeForgePipeline, ForgeLog } from '@/services/ai-forge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NeuralForgeWorkstation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ForgeLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState("");
  
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk (General)",
    subject: "Punjab GK",
    difficulty: "medium",
    count: 20,
    duration: 0,
    negativeMarking: 0.25,
    accessType: "pass_plus",
    publishInstantly: true
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!config.title && !prompt) {
      toast({ title: "Signal Incomplete", description: "Identity or Prompt is mandatory.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setLogs([]);
    setProgress(0);

    try {
      const jobId = await createForgeJob(config);
      await executeForgePipeline(jobId, config, (p, l) => {
        setProgress(p);
        setLogs(l);
      });
      toast({ title: "Synthesis Complete", description: "Simulation pushed to production." });
    } catch (e: any) {
      toast({ title: "Forge Breach", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtect>
      <div className="flex bg-[#05060f] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen relative">
          <header className="h-16 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 z-50">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center blue-glow">
                   <BrainCircuit className="text-white w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-tighter">Neural Forge v3.0</h1>
                   <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Enterprise Generation Engine</p>
                </div>
             </div>

             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                   <div className="text-right">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Bank Status</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase">Synchronized</p>
                   </div>
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Database size={14} className="text-emerald-500" />
                   </div>
                </div>
                <Badge variant="outline" className="border-blue-500/20 text-blue-500 text-[10px] font-black uppercase px-4 py-1.5">Production Mode</Badge>
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* Configuration Panel */}
             <aside className="w-[400px] border-r border-white/5 bg-zinc-950/30 p-8 overflow-y-auto no-scrollbar space-y-10 shrink-0">
                <div className="space-y-6">
                   <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.3em] flex items-center gap-2">
                      <Zap size={14} className="text-primary" /> Global Parameters
                   </h3>
                   
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Mock Identity</label>
                         <Input 
                            placeholder="e.g. SI Marathon 2024" 
                            value={config.title}
                            onChange={e => setConfig({...config, title: e.target.value})}
                            className="bg-white/5 border-white/5 h-12 rounded-xl text-xs font-bold focus:ring-primary/20"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Recruitment Board</label>
                         <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                            <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-xs font-bold">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white border-white/10">
                               {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Subject Node</label>
                            <Select value={config.subject} onValueChange={v => setConfig({...config, subject: v})}>
                               <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-xs font-bold">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-zinc-950 text-white border-white/10">
                                  {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Difficulty</label>
                            <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                               <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-xs font-bold uppercase">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-zinc-950 text-white border-white/10">
                                  {['easy', 'medium', 'hard', 'mixed'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Artifact Count</label>
                            <Input 
                               type="number" 
                               value={config.count}
                               onChange={e => setConfig({...config, count: Number(e.target.value)})}
                               className="bg-white/5 border-white/5 h-12 rounded-xl text-xs font-black text-center"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Negative Marking</label>
                            <Input 
                               type="number" 
                               step="0.25"
                               value={config.negativeMarking}
                               onChange={e => setConfig({...config, negativeMarking: Number(e.target.value)})}
                               className="bg-white/5 border-white/5 h-12 rounded-xl text-xs font-black text-center text-red-500"
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-6">
                   <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.3em] flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" /> Pipeline Controls
                   </h3>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                         <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-tight">Direct Publish</p>
                            <p className="text-[8px] text-zinc-500 font-bold">Inject into student arena instantly</p>
                         </div>
                         <input 
                           type="checkbox" 
                           checked={config.publishInstantly}
                           onChange={e => setConfig({...config, publishInstantly: e.target.checked})}
                           className="w-5 h-5 accent-primary bg-zinc-800 border-none rounded-lg"
                         />
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                         <p className="text-[10px] font-black text-primary uppercase tracking-widest">Automatic Timer</p>
                         <p className="text-[9px] text-zinc-400 leading-relaxed italic">"System will calculate optimal duration (1.2m/Q) if set to zero."</p>
                      </div>
                   </div>
                </div>

                <Button 
                   onClick={handleGenerate}
                   disabled={loading}
                   className="w-full h-20 rounded-[28px] bg-primary hover:bg-primary/90 text-2xl font-black shadow-2xl blue-glow active:scale-95 transition-all mt-10"
                >
                   {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <Rocket className="w-8 h-8 mr-4" />}
                   {loading ? "FORGING..." : "LAUNCH FORGE"}
                </Button>
             </aside>

             {/* Execution Terminal */}
             <div className="flex-1 flex flex-col bg-black">
                <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
                   <div className="max-w-4xl mx-auto space-y-12">
                      {logs.length === 0 && !loading && (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                           <div className="w-24 h-24 rounded-[40px] border-2 border-dashed border-zinc-700 flex items-center justify-center">
                              <History size={40} className="text-zinc-600" />
                           </div>
                           <div>
                              <h2 className="text-3xl font-black uppercase tracking-tighter">Terminal Idle</h2>
                              <p className="text-sm font-bold uppercase tracking-widest mt-2">Initialize parameters to begin artifact synthesis</p>
                           </div>
                        </div>
                      )}

                      {loading && (
                        <div className="space-y-10">
                           <div className="text-center space-y-4">
                              <div className="relative inline-block">
                                 <div className="w-32 h-32 border-4 border-primary/5 border-t-primary rounded-full animate-spin mx-auto" />
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <p className="text-3xl font-black text-white">{progress}%</p>
                                 </div>
                              </div>
                              <h2 className="text-2xl font-black uppercase tracking-widest">Processing High-Yield Chunks</h2>
                           </div>
                           <Progress value={progress} className="h-2 bg-zinc-900" />
                        </div>
                      )}

                      <div className="space-y-4">
                         <AnimatePresence mode="popLayout">
                            {logs.map((log) => (
                              <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                  "p-5 rounded-3xl border flex items-start gap-4 transition-all",
                                  log.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                                  log.status === 'error' ? 'bg-red-500/10 border-red-500/20' : 
                                  'bg-zinc-900/50 border-white/5'
                                )}
                              >
                                 <div className={cn(
                                   "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                                   log.status === 'success' ? 'bg-emerald-500 text-white' : 
                                   log.status === 'error' ? 'bg-red-500 text-white' : 
                                   'bg-zinc-800 text-zinc-500'
                                 )}>
                                    {log.status === 'success' ? <CheckCircle2 size={16} /> : 
                                     log.status === 'error' ? <Trash2 size={16} /> : 
                                     <Zap size={16} />}
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-xs font-bold text-zinc-300 leading-relaxed">
                                       <span className="text-[10px] text-zinc-600 font-mono mr-3">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                       {log.message}
                                    </p>
                                 </div>
                              </motion.div>
                            ))}
                         </AnimatePresence>
                      </div>
                   </div>
                </div>

                {/* Bottom Prompt Control */}
                <footer className="p-8 bg-zinc-950 border-t border-white/5 relative z-50">
                   <div className="max-w-4xl mx-auto space-y-6">
                      <div className="relative group">
                         <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl" />
                         <div className="relative flex gap-4 items-end bg-[#1a1b26] border border-white/10 p-4 rounded-[32px] shadow-2xl">
                            <Textarea 
                               placeholder="Instructional Overlay... (e.g. Generate 50 difficult PSSSB Clerk questions focusing on the Sikh Empire pattern)"
                               className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-2 no-scrollbar resize-none min-h-[56px] max-h-[200px]"
                               value={prompt}
                               onChange={e => setPrompt(e.target.value)}
                            />
                            <Button 
                               onClick={handleGenerate}
                               disabled={loading || (!config.title && !prompt)}
                               className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shadow-xl shrink-0"
                            >
                               {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                            </Button>
                         </div>
                      </div>
                      <p className="text-[7px] text-center text-zinc-600 font-black uppercase tracking-[0.5em]">
                         CRACKLIX NEURAL ENGINE v3.0 • BATCH CHUNKING ACTIVE
                      </p>
                   </div>
                </footer>
             </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
