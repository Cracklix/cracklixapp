'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateBilingualArtifacts } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Zap, 
  Terminal, 
  Rocket, 
  Database, 
  CheckCircle2, 
  Loader2, 
  Languages, 
  Plus, 
  Search,
  Settings2,
  Trash2,
  Edit3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, writeBatch, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';

export default function NeuralForgePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk (General)",
    subjects: ["General Knowledge"],
    count: 10,
    difficulty: "medium",
    languageMode: "bilingual",
    customExam: "",
    customSubject: ""
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeJobId) return;
    const unsub = onSnapshot(doc(db, 'ai_generation_jobs', activeJobId), (snap) => {
      setJobData(snap.data());
      if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsub();
  }, [activeJobId]);

  const addLog = async (msg: string) => {
    if (!activeJobId) return;
    const ref = doc(db, 'ai_generation_jobs', activeJobId);
    const existing = jobData?.logs || [];
    await updateDoc(ref, {
      logs: [...existing, `[${new Date().toLocaleTimeString()}] ${msg}`],
      updatedAt: Date.now()
    });
  };

  async function handleForge() {
    if (!config.title) return toast({ title: "Simulation Identity Required", variant: "destructive" });
    setLoading(true);
    setGeneratedQuestions([]);
    
    try {
      const jobRef = await addDoc(collection(db, 'ai_generation_jobs'), {
        config,
        status: 'initializing',
        progress: 0,
        logs: [`[${new Date().toLocaleTimeString()}] Neural Forge Engaged.`],
        generatedCount: 0,
        createdAt: Date.now()
      });
      
      setActiveJobId(jobRef.id);
      await addLog(`Synthesizing blueprint for ${config.exam}...`);

      const batchSize = 5;
      const totalBatches = Math.ceil(config.count / batchSize);
      let masterList: any[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const chunkCount = Math.min(batchSize, config.count - masterList.length);
        await addLog(`Processing Neural Chunk ${i+1}/${totalBatches}...`);
        
        const chunk = await generateBilingualArtifacts({
          jobId: jobRef.id,
          exam: config.exam === "Other..." ? config.customExam : config.exam,
          subjects: config.subjects,
          count: chunkCount,
          difficulty: config.difficulty,
          instruction: prompt
        });

        masterList = [...masterList, ...chunk];
        setGeneratedQuestions([...masterList]);
        
        await updateDoc(doc(db, 'ai_generation_jobs', jobRef.id), {
          progress: Math.round(((i + 1) / totalBatches) * 100),
          generatedCount: masterList.length,
          status: 'synthesizing'
        });
      }

      await updateDoc(doc(db, 'ai_generation_jobs', jobRef.id), { status: 'completed', progress: 100 });
      toast({ title: "Synthesis Complete", description: `${masterList.length} artifacts forged.` });
    } catch (e: any) {
      toast({ title: "Synthesis Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLivePublish() {
    if (generatedQuestions.length === 0) return;
    setLoading(true);
    try {
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: config.title,
        exam: config.exam === "Other..." ? config.customExam : config.exam,
        totalQuestions: generatedQuestions.length,
        duration: config.count * 1.2, // Auto-timer
        negativeMarking: 0.25,
        status: "published",
        accessType: "pass_plus",
        languageMode: "bilingual",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: "NEURAL_FORGE_V12"
      });

      const batch = writeBatch(db);
      generatedQuestions.forEach((q, idx) => {
        const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
        batch.set(qRef, { ...q, id: qRef.id, order: idx, createdAt: Date.now() });
        
        const bankRef = doc(collection(db, "questions"));
        batch.set(bankRef, { ...q, id: bankRef.id, status: "published", source: "NEURAL_FORGE", createdAt: Date.now() });
      });

      await batch.commit();
      toast({ title: "Live Published", description: "Simulation is now active in student arena." });
    } catch (e: any) {
      toast({ title: "Publish Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 flex flex-col h-screen">
          <header className="h-16 px-10 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0 z-30">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center blue-glow">
                <BrainCircuit className="text-primary w-5 h-5" />
              </div>
              <h1 className="text-sm font-black uppercase tracking-widest">Neural Forge AI v12</h1>
            </div>
            <div className="flex gap-3">
               <Button onClick={handleLivePublish} disabled={loading || generatedQuestions.length === 0} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                  <Rocket className="mr-2 w-3.5 h-3.5" /> LIVE PUBLISH
               </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* LEFT: CONFIGURATION */}
             <aside className="w-[360px] border-r border-white/5 p-8 overflow-y-auto no-scrollbar bg-black/20 shrink-0 space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Settings2 className="text-primary w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Configuration Matrix</h3>
                   </div>

                   <div className="space-y-5">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Mock Identity</label>
                         <Input placeholder="e.g. SI Elite Mock #01" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="h-11 bg-zinc-900 border-white/5 rounded-xl text-xs font-bold" />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Target Board</label>
                         <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                            <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl text-[10px] uppercase font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white border-white/10">
                               {EXAM_LIST.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                            </SelectContent>
                         </Select>
                         {config.exam === "Other..." && <Input placeholder="Enter custom board..." className="h-10 mt-2 bg-zinc-900/50 border-white/10 text-xs" value={config.customExam} onChange={e => setConfig({...config, customExam: e.target.value})} />}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Difficulty</label>
                           <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                              <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl text-[10px] uppercase font-bold"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-zinc-950 text-white border-white/10">
                                 {['easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Artifacts</label>
                           <Input type="number" value={config.count} onChange={e => setConfig({...config, count: Number(e.target.value)})} className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs font-black" />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-4">
                   <h4 className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Institutional Pulse</h4>
                   <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-2">
                      <p className="text-[10px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest"><Zap size={12} fill="currentColor" /> Active Signal</p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed italic">"Neural Forge v12 is currently processing bilingual signals with 99.8% Raavi fidelity."</p>
                   </div>
                </div>
             </aside>

             {/* CENTER: NEURAL TERMINAL */}
             <section className="flex-1 p-8 overflow-hidden bg-black/40 flex flex-col gap-6">
                <Card className="flex-1 rounded-[48px] bg-zinc-950 border border-white/5 p-10 flex flex-col relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Terminal size={300} /></div>
                   <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-8 flex items-center gap-2 z-10">
                      <Terminal size={14} /> Execution Stream
                   </h4>
                   <ScrollArea className="flex-1 pr-6 z-10">
                      <div className="space-y-4 font-mono text-[10px] text-zinc-500">
                         {jobData?.logs?.map((log: string, i: number) => (
                           <div key={i} className="flex gap-4 border-b border-white/[0.03] pb-3 animate-in fade-in slide-in-from-left-2">
                              <span className="text-primary font-black shrink-0">&gt;</span>
                              <span className="break-words leading-relaxed">{log}</span>
                           </div>
                         ))}
                         {loading && <div className="flex items-center gap-2 text-primary animate-pulse font-black uppercase tracking-widest"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing Neural Payload...</div>}
                         <div ref={logEndRef} />
                      </div>
                   </ScrollArea>
                </Card>

                <Card className="rounded-[40px] bg-zinc-900 border border-white/5 p-6 space-y-6 shrink-0 shadow-2xl">
                   <div className="flex items-center gap-3">
                      <BrainCircuit className="text-primary w-5 h-5" />
                      <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Instruction Buffer</h4>
                   </div>
                   <div className="flex gap-4">
                      <Textarea 
                        placeholder="Define custom syllabus constraints or patterns..." 
                        className="bg-black border-white/5 rounded-2xl min-h-[80px] p-4 text-xs resize-none font-medium focus:border-primary/50 transition-colors"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                      />
                      <Button 
                        onClick={handleForge} 
                        disabled={loading}
                        className="h-auto px-8 rounded-3xl bg-primary hover:bg-primary/90 shadow-xl blue-glow font-black text-xs uppercase tracking-widest transition-transform active:scale-95"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      </Button>
                   </div>
                </Card>
             </section>

             {/* RIGHT: PREVIEW PANEL */}
             <aside className="w-[480px] border-l border-white/5 p-8 overflow-y-auto no-scrollbar bg-black/20 shrink-0 space-y-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Database className="text-primary w-4 h-4" /> Artifact Log ({generatedQuestions.length})
                   </h3>
                </div>

                <div className="grid gap-6">
                   {generatedQuestions.map((q, i) => (
                     <Card key={i} className="rounded-3xl bg-zinc-950 border border-white/5 p-6 space-y-6 group hover:border-primary/30 transition-all shadow-xl overflow-hidden relative">
                        <div className="flex justify-between items-start">
                           <Badge className="bg-zinc-900 border-white/10 text-zinc-500 text-[8px] font-black uppercase px-3 py-1">ARTIFACT #{i+1}</Badge>
                           <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"><Edit3 size={14} /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></Button>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">English Core</p>
                              <p className="text-xs font-bold leading-relaxed">{q.en.question}</p>
                           </div>
                           <div className="space-y-1 border-t border-white/5 pt-4">
                              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Raavi Signal</p>
                              <p className="text-xs font-medium text-zinc-400 italic leading-relaxed">{q.pa.question}</p>
                           </div>
                           <div className="pt-2">
                              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">KEY: {q.correctAnswer}</p>
                           </div>
                        </div>
                     </Card>
                   ))}
                   {generatedQuestions.length === 0 && (
                     <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
                        <Database size={60} className="mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Neural Buffer Empty</p>
                     </div>
                   )}
                </div>
             </aside>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
