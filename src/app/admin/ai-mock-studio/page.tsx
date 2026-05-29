
'use client';

import { useState, useRef, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap,
  Sparkles,
  CheckCircle2,
  Trash2,
  Languages,
  Database,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  Clock,
  LayoutGrid,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { forgeNeuralArtifacts } from '@/services/ai-mock-generator-flow';
import { addDoc, collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
  status?: 'thinking' | 'done' | 'error';
  artifacts?: any[];
}

export default function NeuralForgeV2() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Configuration State
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk (General)",
    customExam: "",
    subject: "Punjab GK",
    customSubject: "",
    difficulty: "medium",
    count: 10,
    timer: 60,
    accessType: "pass_plus",
  });

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, loading]);

  // Emergency Kill Switch
  const stopAI = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    window.location.reload(); // Atomic reset of all re-render states
  };

  const clearMemory = () => {
    setMessages([]);
    setInput("");
    toast({ title: "Signal Memory Purged" });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Initialize Abort Controller for safety
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ai',
      text: "",
      status: 'thinking',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, aiMsg]);

    try {
      const totalCount = config.count;
      const batchSize = 5; // Production standard batching
      const batches = Math.ceil(totalCount / batchSize);
      let allArtifacts: any[] = [];

      for (let i = 0; i < batches; i++) {
        if (signal.aborted) break;

        const currentBatch = Math.min(batchSize, totalCount - i * batchSize);
        
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: `Synthesizing Artifact Batch ${i + 1}/${batches}...` } : m
        ));

        const result = await forgeNeuralArtifacts({
          exam: config.exam === "Other..." ? config.customExam : config.exam,
          count: currentBatch,
          difficulty: config.difficulty,
          topic: config.subject === "Other..." ? config.customSubject : config.subject,
        }, signal);

        if (result.questions) {
          allArtifacts = [...allArtifacts, ...result.questions];
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, artifacts: [...allArtifacts] } : m
          ));
        }

        // Mandatory Cool-down between batches to prevent quota spam
        if (i < batches - 1) {
          await new Promise(resolve => {
            const timer = setTimeout(resolve, 3000);
            signal.addEventListener('abort', () => clearTimeout(timer));
          });
        }
      }

      if (!signal.aborted) {
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: "Synthesis complete. Bilingual artifacts are stabilized.", status: 'done' } : m
        ));
      }

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? { ...m, text: `Forge Breach: ${error.message}. Process halted to prevent loop.`, status: 'error' } : m
      ));
      toast({ title: "Synthesis Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  const publishBatch = async (artifacts: any[]) => {
    if (!artifacts || artifacts.length === 0) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const mockRef = doc(collection(db, "mocks"));
      
      batch.set(mockRef, {
        id: mockRef.id,
        title: config.title || `${config.exam} AI Session - ${new Date().toLocaleDateString()}`,
        exam: config.exam === "Other..." ? config.customExam : config.exam,
        subject: config.subject === "Other..." ? config.customSubject : config.subject,
        totalQuestions: artifacts.length,
        duration: config.timer,
        accessType: config.accessType,
        status: "published",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      artifacts.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        batch.set(qRef, {
          id: qRef.id,
          questionEn: q.questionEnglish,
          questionPa: q.questionPunjabi,
          options: q.optionsEnglish.map((en: string, i: number) => ({
            en,
            pa: q.optionsPunjabi[i] || en
          })),
          correctAnswer: q.optionsEnglish.indexOf(q.correctAnswer),
          solutionEn: q.explanationEnglish,
          solutionPa: q.explanationPunjabi,
          subject: q.subject || config.subject,
          difficulty: q.difficulty,
          order: idx,
          createdAt: Date.now()
        });
      });

      await batch.commit();
      toast({ title: "Simulation Deployed", description: "Mock pushed to Live Arena." });
    } catch (e: any) {
      toast({ title: "Publish Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtect>
      <div className="flex bg-[#05060f] h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col relative">
          <header className="h-16 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 z-50">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center blue-glow">
                   <BrainCircuit className="text-primary w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-tighter">Neural Forge v12.5</h1>
                   <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Safe Mode: ACTIVE</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                {loading && (
                   <Button variant="destructive" size="sm" onClick={stopAI} className="h-8 rounded-lg text-[9px] font-black uppercase blue-glow">
                      <XCircle size={14} className="mr-2" /> Stop AI
                   </Button>
                )}
                
                <Button variant="ghost" size="icon" onClick={clearMemory} className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white" title="Clear Buffer">
                   <RotateCcw size={16} />
                </Button>

                <div className="h-4 w-px bg-white/10 mx-2" />

                <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                   <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-white/5 rounded-lg text-[9px] font-black uppercase">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                   </SelectContent>
                </Select>

                <Select value={config.subject} onValueChange={v => setConfig({...config, subject: v})}>
                   <SelectTrigger className="w-[150px] h-8 bg-zinc-900 border-white/5 rounded-lg text-[9px] font-black uppercase">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                   </SelectContent>
                </Select>

                <div className="flex items-center bg-zinc-900 border border-white/5 h-8 rounded-lg px-3 gap-2">
                   <span className="text-[8px] font-black text-zinc-600 uppercase">Count:</span>
                   <input 
                     type="number" 
                     className="bg-transparent border-none text-[9px] font-black w-8 outline-none" 
                     value={config.count}
                     onChange={e => setConfig({...config, count: Math.min(10, parseInt(e.target.value) || 1)})}
                   />
                </div>
             </div>
          </header>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
             <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {messages.length === 0 && (
                  <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                     <div className="w-20 h-20 rounded-[32px] border-2 border-dashed border-zinc-700 flex items-center justify-center">
                        <MessageSquare size={32} className="text-zinc-600" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Forge Standby</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Safe Retry & Abort Logic Engaged</p>
                     </div>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {messages.map((m) => (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-5 max-w-5xl",
                        m.role === 'user' ? "flex-row-reverse ml-auto" : "flex-row"
                      )}
                    >
                       <div className={cn(
                         "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                         m.role === 'user' ? "bg-zinc-800" : "bg-primary blue-glow"
                       )}>
                          {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                       </div>
                       
                       <div className="space-y-4 flex-1">
                          <div className={cn(
                            "p-5 rounded-[28px] text-sm font-medium leading-relaxed border shadow-2xl",
                            m.role === 'user' ? "bg-zinc-900/50 border-white/5 rounded-tr-none" : "bg-zinc-950 border-primary/20 rounded-tl-none"
                          )}>
                             {m.status === 'thinking' && (
                               <div className="flex items-center gap-3 text-primary animate-pulse">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{m.text}</span>
                               </div>
                             )}
                             {!m.status || m.status === 'done' || m.status === 'error' ? (
                               <p className={cn(m.status === 'error' ? "text-red-400 font-mono text-xs" : "text-zinc-100")}>{m.text}</p>
                             ) : null}
                          </div>

                          {m.artifacts && m.artifacts.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                               <div className="flex items-center justify-between px-2">
                                  <div className="flex items-center gap-2">
                                     <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black">{m.artifacts.length} ARTIFACTS</Badge>
                                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Buffer</p>
                                  </div>
                                  <Button 
                                    onClick={() => publishBatch(m.artifacts || [])}
                                    disabled={loading}
                                    className="h-9 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase shadow-xl blue-glow"
                                  >
                                     <Zap size={14} className="mr-2" /> Push to Live Arena
                                  </Button>
                               </div>
                               <div className="grid gap-3">
                                  {m.artifacts.slice(0, 3).map((q, idx) => (
                                    <Card key={idx} className="p-4 bg-zinc-900/30 border-white/5 rounded-2xl flex items-center justify-between group">
                                       <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">{idx+1}</div>
                                          <p className="text-xs font-bold text-zinc-300 line-clamp-1">{q.questionEnglish}</p>
                                       </div>
                                       <Badge variant="outline" className="text-[7px] border-white/10 text-zinc-600 font-black uppercase">{q.subject}</Badge>
                                    </Card>
                                  ))}
                               </div>
                            </div>
                          )}
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </ScrollArea>

          <footer className="p-6 bg-zinc-950 border-t border-white/5 shrink-0">
             <div className="max-w-4xl mx-auto space-y-4">
                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl" />
                   <div className="relative flex flex-col bg-[#111218] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden">
                      <div className="flex gap-4 p-4 items-center bg-white/[0.02] border-b border-white/5">
                         <div className="flex-1 space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-500 px-1 tracking-widest">Mock Identity</label>
                            <Input 
                              placeholder="e.g. Excise Inspector #42" 
                              value={config.title}
                              onChange={e => setConfig({...config, title: e.target.value})}
                              className="h-10 bg-transparent border-none focus-visible:ring-0 text-sm font-black p-1"
                            />
                         </div>
                         <div className="h-10 w-px bg-white/5" />
                         <div className="px-4">
                            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block mb-1 text-center">Timer (M)</label>
                            <input 
                               type="number" 
                               value={config.timer}
                               onChange={e => setConfig({...config, timer: parseInt(e.target.value) || 60})}
                               className="bg-transparent border-none text-sm font-black w-10 text-center outline-none"
                            />
                         </div>
                      </div>
                      <div className="flex gap-4 items-end p-4">
                        <Textarea 
                          placeholder="Command the Forge... (e.g. Generate hardest Punjab GK questions)"
                          className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-2 no-scrollbar resize-none min-h-[50px] max-h-[120px]"
                          value={input}
                          onChange={e => setInput(e.target.value)}
                        />
                        <Button 
                          onClick={handleSend}
                          disabled={loading || !input.trim()}
                          className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 blue-glow shadow-xl shrink-0"
                        >
                           {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                        </Button>
                      </div>
                   </div>
                </div>
             </div>
          </footer>
        </main>
      </div>
    </AdminProtect>
  );
}
