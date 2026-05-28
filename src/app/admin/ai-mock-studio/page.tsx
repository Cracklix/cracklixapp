"use client";

import { useState, useRef, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateAILogic, MockGeneratorOutput } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  History, 
  Zap, 
  ChevronRight, 
  Database, 
  Rocket,
  LayoutGrid,
  Settings,
  Mic,
  MicOff,
  Plus,
  Trash2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

type Message = {
  id: string;
  role: 'admin' | 'ai';
  text: string;
  payload?: MockGeneratorOutput;
  loading?: boolean;
};

export default function AiMockStudio() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Generation Settings
  const [exam, setExam] = useState("PSSSB Clerk");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("bilingual");

  const scrollRef = useRef<HTMLDivElement>(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  async function handleGenerate(promptText: string) {
    if (!promptText.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'admin', text: promptText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: "", loading: true }]);

    try {
      const data = await generateAILogic({
        prompt: promptText,
        exam,
        count,
        difficulty: difficulty as any,
        language: language as any
      });

      setMessages(prev => prev.map(m => m.id === aiMsgId ? {
        ...m,
        text: `Synthesis Complete: **${data.title}** for **${data.exam}** generated.`,
        payload: data,
        loading: false
      } : m));

      toast({ title: "Signal Stabilized", description: "Academic artifacts forged successfully." });
    } catch (error: any) {
      setMessages(prev => prev.map(m => m.id === aiMsgId ? {
        ...m,
        text: "Signal Breach: " + error.message,
        loading: false
      } : m));
    } finally {
      setLoading(false);
    }
  }

  async function injectIntoFactory(payload: MockGeneratorOutput) {
    try {
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: payload.title,
        exam: payload.exam,
        totalQuestions: payload.questions.length,
        duration: 60,
        negativeMarking: 0.25,
        accessType: 'pass_plus',
        status: 'draft',
        createdAt: Date.now(),
        aiGenerated: true
      });

      const batch = writeBatch(db);
      payload.questions.forEach((q, i) => {
        const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
        batch.set(qRef, { ...q, order: i, createdAt: Date.now() });
      });
      await batch.commit();

      toast({ title: "Factory Injection Complete", description: "Simulation drafted in Factory Node." });
    } catch (e: any) {
      toast({ title: "Injection Failed", variant: "destructive" });
    }
  }

  async function saveToBank(payload: MockGeneratorOutput) {
    try {
      const batch = writeBatch(db);
      payload.questions.forEach((q) => {
        const qRef = doc(collection(db, "questions"));
        batch.set(qRef, { ...q, status: 'published', usageCount: 0, createdAt: Date.now() });
      });
      await batch.commit();
      toast({ title: "Bank Sync Successful", description: `${payload.questions.length} artifacts stored in Atomic Bank.` });
    } catch (e: any) {
      toast({ title: "Bank Sync Failed", variant: "destructive" });
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        
        {/* Workspace: 3-Panel Architecture */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          
          <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center blue-glow">
                   <Sparkles className="text-primary w-5 h-5" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-[0.3em]">AI Mock Studio</h1>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Generative Academic Architect v5.0</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase px-4 py-1.5 animate-pulse">Neural Link Active</Badge>
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* Panel 1: History (Slim) */}
             <aside className="w-64 border-r border-white/5 bg-zinc-950/20 flex flex-col shrink-0 hidden lg:flex">
                <div className="p-6 border-b border-white/5">
                   <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Session History</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                   {messages.filter(m => m.role === 'admin').map((m, i) => (
                     <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer truncate">
                        {m.text}
                     </div>
                   ))}
                   {messages.length === 0 && <p className="text-[10px] text-center text-zinc-700 mt-10 italic">No artifacts synthesised yet.</p>}
                </div>
             </aside>

             {/* Panel 2: Conversation Center */}
             <div className="flex-1 flex flex-col bg-[#050816] relative">
                <ScrollArea className="flex-1 p-8" ref={scrollRef}>
                   <div className="max-w-4xl mx-auto space-y-12 pb-20">
                      {messages.length === 0 && (
                        <div className="py-24 text-center space-y-10">
                           <div className="w-24 h-24 rounded-[40px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative">
                              <Sparkles className="text-primary w-10 h-10 animate-float" />
                              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                           </div>
                           <div className="space-y-4">
                              <h2 className="text-4xl font-black uppercase tracking-tighter">Forge Academic Reality</h2>
                              <p className="text-zinc-500 font-medium text-sm max-w-sm mx-auto leading-relaxed">
                                Describe your simulation requirements. The National Architect will synthesize a professional bilingual mock in seconds.
                              </p>
                           </div>
                           <div className="flex flex-wrap justify-center gap-3">
                              {["Generate PSSSB GK Set", "Create SI Math Marathon", "Synthesize Patwari PYQs"].map(chip => (
                                <button key={chip} onClick={() => handleGenerate(chip)} className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                                   {chip}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}

                      {messages.map((m) => (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-6", m.role === 'admin' ? "flex-row-reverse" : "flex-row")}>
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xl", m.role === 'ai' ? "bg-primary blue-glow" : "bg-zinc-800")}>
                              {m.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                           </div>
                           <div className={cn("max-w-[85%] space-y-6", m.role === 'admin' ? "text-right" : "text-left")}>
                              <div className={cn("p-6 rounded-[32px] text-sm leading-relaxed shadow-2xl", m.role === 'admin' ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-900 border border-white/5 rounded-tl-none")}>
                                 {m.loading ? <Loader2 className="animate-spin text-primary" /> : m.text}
                              </div>

                              {m.payload && (
                                <Card className="rounded-[40px] bg-zinc-900/50 border-emerald-500/20 overflow-hidden shadow-2xl">
                                   <div className="p-8 border-b border-white/5 bg-emerald-500/5 flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="text-white w-5 h-5" /></div>
                                         <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-white">{m.payload.title}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{m.payload.questions.length} Bilingual Artifacts Forged</p>
                                         </div>
                                      </div>
                                      <div className="flex gap-2">
                                         <Button onClick={() => injectIntoFactory(m.payload!)} className="h-10 px-6 rounded-xl bg-primary font-black text-[9px] uppercase tracking-widest">Inject to Factory</Button>
                                         <Button onClick={() => saveToBank(m.payload!)} className="h-10 px-6 rounded-xl bg-zinc-800 font-black text-[9px] uppercase tracking-widest border border-white/10">Save to Bank</Button>
                                      </div>
                                   </div>
                                   <div className="p-8 space-y-6">
                                      <div className="flex flex-wrap gap-2">
                                         {m.payload.structure.map((s, idx) => (
                                           <Badge key={idx} variant="outline" className="bg-white/5 border-white/10 text-zinc-400 px-3 py-1 text-[10px] font-bold uppercase">{s.subject}: {s.count}</Badge>
                                         ))}
                                      </div>
                                      <div className="grid gap-3">
                                         {m.payload.questions.slice(0, 3).map((q, idx) => (
                                           <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 text-[11px] font-medium flex justify-between items-center group hover:border-primary transition-all">
                                              <span className="truncate flex-1 pr-4">{q.question_en}</span>
                                              <ChevronRight size={14} className="text-zinc-700 group-hover:text-primary transition-all" />
                                           </div>
                                         ))}
                                         {m.payload.questions.length > 3 && <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2">+ {m.payload.questions.length - 3} more artifacts in payload</p>}
                                      </div>
                                   </div>
                                </Card>
                              )}
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </ScrollArea>

                {/* Tactical Input Bar */}
                <div className="p-8 bg-zinc-950 border-t border-white/5 z-20">
                   <div className="max-w-4xl mx-auto flex items-center gap-4">
                      <div className="relative flex-1 group">
                         <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all" />
                         <Input 
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleGenerate(input)}
                           placeholder="Signal your requirements to the National Architect..."
                           className="h-16 bg-zinc-900 border-white/10 rounded-2xl px-8 text-sm font-medium relative z-10 focus:ring-primary/20"
                         />
                         <div className="absolute right-4 top-3 relative z-20 flex gap-2">
                            {browserSupportsSpeechRecognition && (
                              <Button 
                                onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} 
                                variant="ghost" 
                                size="icon" 
                                className={cn("h-10 w-10 rounded-xl", listening ? "bg-red-500 text-white" : "text-zinc-600 hover:text-white")}
                              >
                                 {listening ? <MicOff size={20} /> : <Mic size={20} />}
                              </Button>
                            )}
                            <Button onClick={() => handleGenerate(input)} disabled={!input.trim() || loading} className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 blue-glow">
                               {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={18} />}
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Panel 3: Calibration Settings (Fixed Right) */}
             <aside className="w-80 border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 hidden xl:flex">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Settings className="text-zinc-600 w-4 h-4" />
                      <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.2em]">Generation Config</span>
                   </div>
                </div>
                <div className="p-8 space-y-10 overflow-y-auto no-scrollbar">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Institutional Board</label>
                      <Select value={exam} onValueChange={setExam}>
                         <SelectTrigger className="h-12 bg-zinc-900/50 border-white/5 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            {["PSSSB Clerk", "PSSSB Excise", "Punjab Police SI", "PPSC PCS", "PSPCL JE", "Patwari"].map(e => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Artifact Count</label>
                      <Input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="h-12 bg-zinc-900/50 border-white/5 rounded-xl font-black text-xl text-primary" />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Neural Strategy</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['easy', 'medium', 'hard', 'balanced'].map(d => (
                          <button key={d} onClick={() => setDifficulty(d)} className={cn("h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", difficulty === d ? "bg-white text-black" : "bg-zinc-900 text-zinc-600 border border-white/5 hover:border-white/10")}>
                             {d}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Linguistic Mode</label>
                      <Select value={language} onValueChange={setLanguage}>
                         <SelectTrigger className="h-12 bg-zinc-900/50 border-white/5 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            <SelectItem value="bilingual">EN + PA (Raavi)</SelectItem>
                            <SelectItem value="en">English Only</SelectItem>
                            <SelectItem value="pa">Raavi Only</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Zap size={12} className="fill-current" /> Active Sub-routine</h5>
                      <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        "Auto-Syllabus detection is currently active. The Architect will weight subjects based on the latest recruitment notifications."
                      </p>
                   </div>
                </div>
                <div className="p-8 border-t border-white/5">
                   <Button onClick={() => setMessages([])} variant="ghost" className="w-full text-zinc-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Terminate Session</Button>
                </div>
             </aside>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
