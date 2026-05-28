"use client";

import { useState, useRef, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateAILogic, MockGeneratorOutput } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  History, 
  Zap, 
  ChevronRight, 
  Database, 
  Settings,
  Mic,
  MicOff,
  CheckCircle2,
  Languages,
  Target,
  FileText,
  BrainCircuit,
  Trophy,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

type GenerationSession = {
  id: string;
  prompt: string;
  output?: MockGeneratorOutput;
  loading: boolean;
  timestamp: number;
};

/**
 * AI MOCK STUDIO v5 (Enterprise Generation Workspace)
 * 3-Panel Layout: History | Workspace | Config
 */
export default function AiMockStudioV5() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<GenerationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  
  // Tactical Calibration State
  const [exam, setExam] = useState("PSSSB Clerk");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("bilingual");
  const [sourceMode, setSourceMode] = useState("ai");

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  async function handleLaunchSynthesis() {
    if (!input.trim()) return;

    const sessionId = Date.now().toString();
    const newSession: GenerationSession = {
      id: sessionId,
      prompt: input,
      loading: true,
      timestamp: Date.now()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(sessionId);
    setInput("");

    try {
      const data = await generateAILogic({
        prompt: input,
        exam,
        count,
        difficulty: difficulty as any,
        language: language as any,
        sourceMode: sourceMode as any
      });

      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, output: data, loading: false } : s));
      toast({ title: "Synthesis Protocol Verified", description: "Simulation blueprint forged successfully." });
    } catch (error: any) {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, loading: false } : s));
      toast({ title: "Neural Failure", description: error.message, variant: "destructive" });
    }
  }

  async function injectIntoFactory(data: MockGeneratorOutput) {
    try {
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: data.title,
        exam: data.exam,
        totalQuestions: data.questions.length,
        duration: data.duration || 60,
        negativeMarking: data.negativeMarking || 0.25,
        accessType: 'pass_plus',
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        aiGenerated: true,
        source: 'AI_STUDIO_V5'
      });

      const batch = writeBatch(db);
      data.questions.forEach((q, i) => {
        const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
        batch.set(qRef, { 
          ...q,
          order: i, 
          createdAt: Date.now() 
        });
      });
      await batch.commit();

      toast({ title: "Staging Injection Success", description: "Simulation is now ready in Simulation Factory." });
    } catch (e: any) {
      toast({ title: "Injection Error", variant: "destructive" });
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-row h-screen overflow-hidden">
          
          {/* Panel 1: Generation History (Left 280px) */}
          <aside className="w-72 border-r border-white/5 bg-zinc-950/50 flex flex-col shrink-0 hidden xl:flex">
             <header className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Saved Blueprints</span>
                <History size={14} className="text-zinc-700" />
             </header>
             <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                   {sessions.map((s) => (
                     <button 
                       key={s.id}
                       onClick={() => setActiveSessionId(s.id)}
                       className={cn(
                         "w-full p-4 rounded-2xl border transition-all text-left group",
                         activeSessionId === s.id 
                           ? "bg-primary/10 border-primary/20" 
                           : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                       )}
                     >
                        <p className={cn(
                          "text-[11px] font-bold truncate mb-1",
                          activeSessionId === s.id ? "text-primary" : "text-zinc-400 group-hover:text-zinc-200"
                        )}>{s.prompt}</p>
                        <div className="flex items-center justify-between">
                           <span className="text-[8px] font-black text-zinc-600 uppercase">{new Date(s.timestamp).toLocaleTimeString()}</span>
                           {s.loading ? <Loader2 size={10} className="animate-spin text-primary" /> : <CheckCircle2 size={10} className="text-emerald-500" />}
                        </div>
                     </button>
                   ))}
                   {sessions.length === 0 && (
                     <div className="py-20 text-center opacity-20">
                        <Database size={32} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No active sessions</p>
                     </div>
                   )}
                </div>
             </ScrollArea>
          </aside>

          {/* Panel 2: Large Workspace (Center) */}
          <div className="flex-1 flex flex-col relative bg-[#050816]">
             <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><Sparkles size={16} className="text-primary" /></div>
                   <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">Neural Mock Workspace</h1>
                </div>
                <div className="flex items-center gap-4">
                   <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black px-3 py-1 uppercase tracking-widest animate-pulse">Sync Active</Badge>
                </div>
             </header>

             <ScrollArea className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-12 pb-32">
                   {!activeSession && (
                     <div className="py-24 text-center space-y-12">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-[40px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative">
                           <BrainCircuit className="text-primary w-10 h-10 animate-float" />
                           <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full" />
                        </motion.div>
                        <div className="space-y-4">
                           <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">Command the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Simulated Reality</span></h2>
                           <p className="text-zinc-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                              Describe your simulation requirements in natural language. The Neural Architect handles subject split, difficulty balancing, and bilingual translation.
                           </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                           {[
                             "100Q Bilingual Patwari Full Mock",
                             "Punjab Police SI Reasoning Set",
                             "Excise Inspector Current Affairs Marathon",
                             "PPSC GS Practice Simulation"
                           ].map(chip => (
                             <button 
                               key={chip} 
                               onClick={() => setInput(chip)}
                               className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                             >
                                {chip}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeSession && (
                     <div className="space-y-10">
                        <div className="flex gap-6 items-start">
                           <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5 shadow-lg"><Target className="text-zinc-500 w-5 h-5" /></div>
                           <div className="flex-1 p-6 rounded-[32px] bg-zinc-900/50 border border-white/5">
                              <p className="text-lg font-bold text-zinc-100 leading-relaxed italic">"{activeSession.prompt}"</p>
                           </div>
                        </div>

                        {activeSession.loading && (
                          <div className="py-20 flex flex-col items-center justify-center gap-6">
                             <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-5 h-5 fill-current" />
                             </div>
                             <div className="text-center space-y-1">
                                <p className="text-sm font-black uppercase tracking-[0.3em] text-white">Forging Artifacts</p>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic animate-pulse">Scanning syllabus nodes for {exam}...</p>
                             </div>
                          </div>
                        )}

                        {activeSession.output && (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                             <Card className="rounded-[48px] bg-zinc-900/30 border-primary/20 overflow-hidden shadow-2xl relative">
                                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/[0.02]">
                                   <div className="flex items-center gap-6">
                                      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg"><Trophy className="text-white w-7 h-7" /></div>
                                      <div>
                                         <h3 className="text-xl font-black uppercase tracking-tighter text-white">{activeSession.output.title}</h3>
                                         <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-widest">{activeSession.output.questions.length} Bilingual Artifacts Generated</p>
                                      </div>
                                   </div>
                                   <div className="flex gap-3">
                                      <Button onClick={() => injectIntoFactory(activeSession.output!)} className="h-11 px-8 rounded-xl bg-primary font-black text-[10px] uppercase tracking-widest blue-glow">Inject to Factory</Button>
                                      <Button variant="outline" className="h-11 px-8 rounded-xl border-white/10 bg-zinc-800 font-black text-[10px] uppercase tracking-widest">Audit Structure</Button>
                                   </div>
                                </div>
                                <div className="p-10 space-y-8">
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      {activeSession.output.structure.map((s, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.subject}</p>
                                           <p className="text-lg font-black text-white">{s.count} Qs</p>
                                        </div>
                                      ))}
                                   </div>
                                   <div className="grid gap-4">
                                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2 px-2">Sample Artifact Matrix</p>
                                      {activeSession.output.questions.slice(0, 3).map((q, idx) => (
                                        <div key={idx} className="p-6 rounded-3xl bg-black/40 border border-white/5 flex justify-between items-center group hover:border-primary transition-all">
                                           <div className="flex items-center gap-6 overflow-hidden">
                                              <span className="text-[10px] font-black text-zinc-700">#{idx + 1}</span>
                                              <div className="truncate">
                                                 <p className="text-sm font-bold text-zinc-100 truncate">{q.en.question}</p>
                                                 <p className="text-xs text-zinc-500 truncate mt-1 italic">{q.pa.question}</p>
                                              </div>
                                           </div>
                                           <ChevronRight size={18} className="text-zinc-700 group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-1" />
                                        </div>
                                      ))}
                                   </div>
                                </div>
                             </Card>

                             <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><Bot className="text-primary w-6 h-6" /></div>
                                <div className="space-y-2">
                                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Neural Summary</p>
                                   <p className="text-sm text-zinc-400 leading-relaxed italic">"{activeSession.output.summary}"</p>
                                </div>
                             </div>
                          </motion.div>
                        )}
                     </div>
                   )}
                </div>
             </ScrollArea>

             {/* Sticky Tactical Input */}
             <footer className="p-8 bg-[#05070a] border-t border-white/5 z-50">
                <div className="max-w-4xl mx-auto">
                   <div className="relative group">
                      <div className="absolute inset-0 bg-primary/5 blur-[40px] group-focus-within:bg-primary/10 transition-all rounded-[32px]" />
                      <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLaunchSynthesis()}
                        placeholder="Signal your simulation requirements to the Architect..."
                        className="h-20 bg-zinc-900/80 border-white/10 rounded-[32px] px-10 text-lg font-bold relative z-10 focus:ring-primary/20 placeholder:text-zinc-700 shadow-2xl"
                      />
                      <div className="absolute right-6 top-4 z-20 flex gap-4">
                         {browserSupportsSpeechRecognition && (
                           <Button 
                             onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} 
                             variant="ghost" 
                             size="icon" 
                             className={cn("h-12 w-12 rounded-2xl", listening ? "bg-red-500 text-white animate-pulse" : "text-zinc-600 hover:text-white hover:bg-white/5")}
                           >
                              {listening ? <MicOff size={22} /> : <Mic size={22} />}
                           </Button>
                         )}
                         <Button onClick={handleLaunchSynthesis} disabled={!input.trim() || (activeSession?.loading)} className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 blue-glow font-black text-xs uppercase tracking-widest shadow-xl">
                            {activeSession?.loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={20} />}
                         </Button>
                      </div>
                   </div>
                </div>
             </footer>
          </div>

          {/* Panel 3: Calibration Panel (Right 350px) */}
          <aside className="w-[380px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 hidden lg:flex">
             <header className="p-8 border-b border-white/5 flex items-center gap-3 bg-zinc-950/50">
                <Settings className="text-zinc-600 w-4 h-4" />
                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">Simulation Config</span>
             </header>
             <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Primary Board</label>
                      <Select value={exam} onValueChange={setExam}>
                         <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-sm uppercase px-6"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            {[
                              "PSSSB Clerk", "Punjab Police SI", "Punjab Police Constable", "PPSC PCS", 
                              "Patwari 2024", "Excise Inspector", "Punjab Jail Warder", "CTET", "PSTET"
                            ].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Artifact Count</label>
                      <div className="grid grid-cols-2 gap-3">
                         {[10, 20, 50, 100].map(val => (
                           <button 
                             key={val} 
                             onClick={() => setCount(val)}
                             className={cn("h-14 rounded-2xl font-black text-xl border transition-all", count === val ? "bg-primary border-primary text-white blue-glow" : "bg-zinc-900 border-white/5 text-zinc-600 hover:border-white/10")}
                           >
                              {val}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Complexity Logic</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                         <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-sm uppercase px-6"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            <SelectItem value="balanced">Balanced Split</SelectItem>
                            <SelectItem value="easy">Level: Foundational</SelectItem>
                            <SelectItem value="medium">Level: Standard</SelectItem>
                            <SelectItem value="hard">Level: Elite</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Generation Source</label>
                      <div className="grid gap-2">
                        {[
                          { id: 'ai', label: 'Neural Synthetic', icon: Sparkles },
                          { id: 'bank', label: 'Atomic Bank Port', icon: Database },
                          { id: 'hybrid', label: 'Hybrid Neural', icon: Layers }
                        ].map(m => (
                          <button 
                            key={m.id} 
                            onClick={() => setSourceMode(m.id)}
                            className={cn("flex items-center gap-4 h-14 rounded-2xl px-6 transition-all border", sourceMode === m.id ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-600 border-white/5")}
                          >
                             <m.icon size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10 space-y-4 shadow-xl">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Auto-Syllabus Ready</span></div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        "The Architect is synced with the latest PSSSB/Punjab Police notifications. Subject weightage will be auto-calculated for the 2024 cycle."
                      </p>
                   </div>
                </div>
             </ScrollArea>
             <footer className="p-8 border-t border-white/5 bg-zinc-950">
                <Button onClick={() => setSessions([])} variant="ghost" className="w-full text-zinc-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Wipe Workspace</Button>
             </footer>
          </aside>

        </main>
      </div>
    </AdminProtect>
  );
}

