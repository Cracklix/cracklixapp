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
  FileText,
  Languages,
  Target
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

/**
 * AI MOCK COMMAND CENTER v4
 * specialized Spezialized for high-yield bilingual mock generation.
 */
export default function AiMockStudio() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Tactical Calibration
  const [exam, setExam] = useState("PSSSB Clerk");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("bilingual");
  const [category, setCategory] = useState("full");

  const scrollRef = useRef<HTMLDivElement>(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, loading]);

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
        text: `Synthesis Complete: **${data.title}** generated with ${data.questions.length} artifacts.`,
        payload: data,
        loading: false
      } : m));

      toast({ title: "Neural Link Synchronized", description: "Simulation blueprint forged." });
    } catch (error: any) {
      setMessages(prev => prev.map(m => m.id === aiMsgId ? {
        ...m,
        text: "Neural Failure: " + error.message,
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
        category: category,
        createdAt: Date.now(),
        aiGenerated: true
      });

      const batch = writeBatch(db);
      payload.questions.forEach((q, i) => {
        // Correct subcollection pattern v4
        const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
        batch.set(qRef, { 
          en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
          pa: { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa },
          correctAnswer: q.correctAnswer,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: 1,
          negativeMarks: 0.25,
          order: i, 
          createdAt: Date.now() 
        });
      });
      await batch.commit();

      toast({ title: "Factory Injection Complete", description: "Simulation drafted in Simulation Factory." });
    } catch (e: any) {
      toast({ title: "Injection Failed", variant: "destructive" });
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl shrink-0 z-50">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center blue-glow">
                   <Sparkles className="text-primary w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-[0.4em]">AI Mock Studio</h1>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Generative Academic Architect v4.2</p>
                </div>
             </div>
             <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-4">
                   <div className="text-right">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Neural Load</p>
                      <p className="text-xs font-black text-white uppercase tracking-tighter">Minimal</p>
                   </div>
                   <div className="h-8 w-px bg-white/10" />
                   <div className="text-right">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Protocol</p>
                      <p className="text-xs font-black text-emerald-500 uppercase tracking-tighter">Bilingual Safe</p>
                   </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase px-4 py-2 animate-pulse">Neural Link Active</Badge>
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* History Panel (240px) */}
             <aside className="w-64 border-r border-white/5 bg-zinc-950/20 flex flex-col shrink-0 hidden lg:flex">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Blueprints</span>
                   <History size={12} className="text-zinc-700" />
                </div>
                <ScrollArea className="flex-1 p-4">
                   <div className="space-y-2">
                      {messages.filter(m => m.role === 'admin').map((m, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer truncate">
                           {m.text}
                        </div>
                      ))}
                      {messages.length === 0 && <p className="text-[10px] text-center text-zinc-700 mt-10 italic">No artifacts synthesized.</p>}
                   </div>
                </ScrollArea>
             </aside>

             {/* Command Center (Main) */}
             <div className="flex-1 flex flex-col bg-[#050816] relative">
                <ScrollArea className="flex-1 p-8" ref={scrollRef}>
                   <div className="max-w-4xl mx-auto space-y-12 pb-24">
                      {messages.length === 0 && (
                        <div className="py-24 text-center space-y-12">
                           <div className="w-28 h-28 rounded-[48px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative group">
                              <Sparkles className="text-primary w-12 h-12 animate-float group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                           </div>
                           <div className="space-y-4">
                              <h2 className="text-5xl font-black uppercase tracking-tighter text-white">Forging Academic Reality</h2>
                              <p className="text-zinc-500 font-medium text-base max-w-md mx-auto leading-relaxed">
                                Describe your simulation requirements. The National Architect will synthesize a professional, PSSSB-grade bilingual mock in seconds.
                              </p>
                           </div>
                           <div className="flex flex-wrap justify-center gap-3">
                              {["Bilingual Patwari Mock", "SI Reasoning Marathon", "Excise Inspector GK"].map(chip => (
                                <button key={chip} onClick={() => handleGenerate(chip)} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-primary transition-all">
                                   {chip}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}

                      {messages.map((m) => (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-6", m.role === 'admin' ? "flex-row-reverse" : "flex-row")}>
                           <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border border-white/5", m.role === 'ai' ? "bg-primary blue-glow" : "bg-zinc-800")}>
                              {m.role === 'ai' ? <Bot size={24} className="text-white" /> : <User size={24} className="text-zinc-300" />}
                           </div>
                           <div className={cn("max-w-[85%] space-y-6", m.role === 'admin' ? "text-right" : "text-left")}>
                              <div className={cn("p-8 rounded-[40px] text-base leading-relaxed shadow-2xl", m.role === 'admin' ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-900 border border-white/5 rounded-tl-none")}>
                                 {m.loading ? (
                                   <div className="flex items-center gap-4 text-zinc-500 font-bold uppercase tracking-widest text-[11px]">
                                      <Loader2 className="animate-spin text-primary" size={16} />
                                      Synthesizing Artifacts...
                                   </div>
                                 ) : m.text}
                              </div>

                              {m.payload && (
                                <Card className="rounded-[48px] bg-zinc-900/50 border-emerald-500/20 overflow-hidden shadow-2xl">
                                   <div className="p-10 border-b border-white/5 bg-emerald-500/[0.03] flex items-center justify-between">
                                      <div className="flex items-center gap-6">
                                         <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg"><CheckCircle2 className="text-white w-7 h-7" /></div>
                                         <div>
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white">{m.payload.title}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1.5">{m.payload.questions.length} High-Yield Bilingual Artifacts Forged</p>
                                         </div>
                                      </div>
                                      <div className="flex gap-4">
                                         <Button onClick={() => injectIntoFactory(m.payload!)} className="h-12 px-8 rounded-2xl bg-primary font-black text-[10px] uppercase tracking-widest blue-glow">Inject to Factory</Button>
                                         <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/10 bg-zinc-800 font-black text-[10px] uppercase tracking-widest">Audit Blueprint</Button>
                                      </div>
                                   </div>
                                   <div className="p-10 space-y-8">
                                      <div className="flex flex-wrap gap-3">
                                         {m.payload.structure.map((s, idx) => (
                                           <Badge key={idx} variant="outline" className="bg-white/5 border-white/10 text-zinc-400 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">{s.subject}: {s.count}</Badge>
                                         ))}
                                      </div>
                                      <div className="grid gap-4">
                                         {m.payload.questions.slice(0, 3).map((q, idx) => (
                                           <div key={idx} className="p-6 rounded-3xl bg-black/40 border border-white/5 text-[13px] font-bold flex justify-between items-center group hover:border-primary transition-all cursor-pointer">
                                              <div className="flex items-center gap-4 truncate">
                                                <span className="text-zinc-700 text-[10px] font-black">#{idx + 1}</span>
                                                <span className="truncate text-zinc-100">{q.question_en}</span>
                                              </div>
                                              <ChevronRight size={18} className="text-zinc-700 group-hover:text-primary transition-all shrink-0" />
                                           </div>
                                         ))}
                                         {m.payload.questions.length > 3 && (
                                           <p className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-4">
                                              + {m.payload.questions.length - 3} more artifacts in payload matrix
                                           </p>
                                         )}
                                      </div>
                                   </div>
                                </Card>
                              )}
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </ScrollArea>

                {/* Tactical Input */}
                <div className="p-10 bg-zinc-950 border-t border-white/5 z-20">
                   <div className="max-w-4xl mx-auto flex items-center gap-6">
                      <div className="relative flex-1 group">
                         <div className="absolute inset-0 bg-primary/5 blur-2xl group-focus-within:bg-primary/10 transition-all rounded-3xl" />
                         <Input 
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleGenerate(input)}
                           placeholder="Signal your requirements to the National Architect..."
                           className="h-20 bg-zinc-900 border-white/10 rounded-3xl px-10 text-base font-bold relative z-10 focus:ring-primary/20 placeholder:text-zinc-700"
                         />
                         <div className="absolute right-6 top-4 relative z-20 flex gap-4">
                            {browserSupportsSpeechRecognition && (
                              <Button 
                                onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} 
                                variant="ghost" 
                                size="icon" 
                                className={cn("h-12 w-12 rounded-2xl", listening ? "bg-red-500 text-white" : "text-zinc-600 hover:text-white hover:bg-white/5")}
                              >
                                 {listening ? <MicOff size={22} /> : <Mic size={22} />}
                              </Button>
                            )}
                            <Button onClick={() => handleGenerate(input)} disabled={!input.trim() || loading} className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 blue-glow font-black text-xs uppercase tracking-widest">
                               {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={20} />}
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Calibration Panel (320px) */}
             <aside className="w-80 border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 hidden xl:flex">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Settings className="text-zinc-600 w-4 h-4" />
                      <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.2em]">Calibration</span>
                   </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-8 space-y-12">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Artifact Category</label>
                        <Select value={category} onValueChange={setCategory}>
                           <SelectTrigger className="h-12 bg-zinc-900/50 border-white/5 rounded-2xl font-black text-xs uppercase"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              <SelectItem value="full">Full Mock</SelectItem>
                              <SelectItem value="sectional">Sectional Test</SelectItem>
                              <SelectItem value="subject">Subject Test</SelectItem>
                              <SelectItem value="chapter">Chapter Quiz</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Institutional Board</label>
                        <Select value={exam} onValueChange={setExam}>
                           <SelectTrigger className="h-12 bg-zinc-900/50 border-white/5 rounded-2xl font-black text-xs uppercase"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              {["PSSSB Clerk", "Punjab Police SI", "PPSC PCS", "Patwari", "Excise Inspector"].map(e => (
                                <SelectItem key={e} value={e}>{e}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Artifact Count</label>
                        <Input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl font-black text-3xl text-primary text-center" />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Linguistic Mode</label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'bilingual', label: 'Bilingual (EN + ਪੰ)', icon: Languages },
                            { id: 'en', label: 'English Only', icon: Target }
                          ].map(m => (
                            <button key={m.id} onClick={() => setLanguage(m.id)} className={cn("flex items-center gap-4 h-14 rounded-2xl px-6 transition-all border", language === m.id ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-600 border-white/5 hover:border-white/10")}>
                               <m.icon size={16} />
                               <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-5">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Zap size={14} className="fill-current" /> Auto-Syllabus Active</h5>
                        <p className="text-[10px] text-zinc-500 leading-relaxed italic font-medium">
                          "The Architect is currently synchronized with the 2024 PSSSB recruitment patterns. Subject weightage will be auto-calculated."
                        </p>
                     </div>
                  </div>
                </ScrollArea>
                <div className="p-8 border-t border-white/5">
                   <Button onClick={() => setMessages([])} variant="ghost" className="w-full text-zinc-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Terminate Cycle</Button>
                </div>
             </aside>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
