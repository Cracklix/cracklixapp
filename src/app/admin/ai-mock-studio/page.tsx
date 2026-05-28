
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
  Lock,
  MessageSquare,
  ChevronRight,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { forgeNeuralArtifacts } from '@/services/ai-mock-generator-flow';
import { addDoc, collection, doc, writeBatch, updateDoc, increment } from 'firebase/firestore';
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

  // Configuration State
  const [config, setConfig] = useState({
    exam: "PSSSB Clerk (General)",
    subject: "Punjab GK",
    difficulty: "medium",
    count: 20,
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const prompt = input;
    setInput("");
    setLoading(true);

    // AI Response Placeholder
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
      const batchSize = 5;
      const batches = Math.ceil(totalCount / batchSize);
      let allArtifacts: any[] = [];

      for (let i = 0; i < batches; i++) {
        const currentBatch = Math.min(batchSize, totalCount - i * batchSize);
        
        // Update Thinking Status
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: `Synthesizing Artifact Batch ${i + 1}/${batches}...` } : m
        ));

        const result = await forgeNeuralArtifacts({
          exam: config.exam,
          count: currentBatch,
          difficulty: config.difficulty,
          topic: config.subject,
        });

        if (result.questions) {
          allArtifacts = [...allArtifacts, ...result.questions];
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, artifacts: allArtifacts } : m
          ));
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? { ...m, text: "Synthesis complete. Verified bilingual artifacts are ready for deployment.", status: 'done' } : m
      ));

    } catch (error: any) {
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? { ...m, text: `Forge Breach: ${error.message}. Please retry with a shorter sequence.`, status: 'error' } : m
      ));
      toast({ title: "Synthesis Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const publishBatch = async (artifacts: any[]) => {
    if (!artifacts || artifacts.length === 0) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Create Mock Container
      const mockRef = doc(collection(db, "mocks"));
      batch.set(mockRef, {
        id: mockRef.id,
        title: `${config.exam} AI Session - ${new Date().toLocaleDateString()}`,
        exam: config.exam,
        subject: config.subject,
        totalQuestions: artifacts.length,
        duration: config.timer,
        accessType: config.accessType,
        status: "published",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // 2. Inject Questions
      artifacts.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        const correctAnswerIndex = q.optionsEnglish.indexOf(q.correctAnswer);
        
        batch.set(qRef, {
          id: qRef.id,
          questionEn: q.questionEnglish,
          questionPa: q.questionPunjabi,
          options: q.optionsEnglish.map((en: string, i: number) => ({
            en,
            pa: q.optionsPunjabi[i] || en
          })),
          correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
          solutionEn: q.explanationEnglish,
          solutionPa: q.explanationPunjabi,
          subject: q.subject || config.subject,
          difficulty: q.difficulty,
          order: idx,
          createdAt: Date.now()
        });

        // 3. Mirror to Atomic Bank
        const bankRef = doc(collection(db, "questions"));
        batch.set(bankRef, {
          questionEn: q.questionEnglish,
          questionPa: q.questionPunjabi,
          subject: q.subject || config.subject,
          difficulty: q.difficulty,
          status: "published",
          createdAt: Date.now()
        });
      });

      await batch.commit();
      toast({ title: "Live Arena Synchronized", description: "Mock published and questions indexed." });
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
          {/* Top Bar Config */}
          <header className="h-16 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 z-50">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center blue-glow">
                   <BrainCircuit className="text-primary w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-tighter">Neural Forge v2.5</h1>
                   <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Conversational Mock Studio</p>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                   <SelectTrigger className="w-[200px] h-9 bg-zinc-900 border-white/5 rounded-xl text-[10px] font-black uppercase">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                   </SelectContent>
                </Select>

                <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                   <SelectTrigger className="w-[100px] h-9 bg-zinc-900 border-white/5 rounded-xl text-[10px] font-black uppercase">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                   </SelectContent>
                </Select>

                <div className="flex items-center bg-zinc-900 border border-white/5 h-9 rounded-xl px-4 gap-2">
                   <span className="text-[10px] font-black text-zinc-500 uppercase">Count:</span>
                   <input 
                     type="number" 
                     className="bg-transparent border-none text-[10px] font-black w-8 outline-none" 
                     value={config.count}
                     onChange={e => setConfig({...config, count: parseInt(e.target.value) || 1})}
                   />
                </div>
             </div>
          </header>

          {/* Chat Workspace */}
          <ScrollArea className="flex-1 p-8" ref={scrollRef}>
             <div className="max-w-4xl mx-auto space-y-10 pb-20">
                {messages.length === 0 && (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                     <div className="w-24 h-24 rounded-[40px] border-2 border-dashed border-zinc-700 flex items-center justify-center">
                        <MessageSquare size={40} className="text-zinc-600" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Forge Standby</h2>
                        <p className="text-sm font-bold uppercase tracking-widest mt-2">Instruction-driven synthesis active</p>
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
                        "flex gap-6 max-w-5xl",
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
                            "p-6 rounded-[32px] text-sm font-medium leading-relaxed border shadow-2xl",
                            m.role === 'user' ? "bg-zinc-900/50 border-white/5 rounded-tr-none" : "bg-zinc-950 border-primary/20 rounded-tl-none"
                          )}>
                             {m.status === 'thinking' && (
                               <div className="flex items-center gap-3 text-primary animate-pulse">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{m.text}</span>
                               </div>
                             )}
                             {!m.status || m.status === 'done' || m.status === 'error' ? (
                               <p className={cn(m.status === 'error' ? "text-red-400" : "text-zinc-100")}>{m.text}</p>
                             ) : null}
                          </div>

                          {m.artifacts && m.artifacts.length > 0 && (
                            <div className="space-y-4">
                               <div className="flex items-center justify-between px-2">
                                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Synthesized Result ({m.artifacts.length} Artifacts)</p>
                                  <Button 
                                    onClick={() => publishBatch(m.artifacts || [])}
                                    disabled={loading}
                                    className="h-8 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[9px] font-black uppercase shadow-lg"
                                  >
                                     <Zap size={12} className="mr-2" /> Push to Live Arena
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
                                  {m.artifacts.length > 3 && (
                                    <p className="text-[9px] text-center font-bold text-zinc-700 uppercase">+{m.artifacts.length - 3} more artifacts generated</p>
                                  )}
                               </div>
                            </div>
                          )}
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </ScrollArea>

          {/* Prompt Bar */}
          <footer className="p-8 bg-zinc-950 border-t border-white/5 shrink-0">
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl" />
                   <div className="relative flex gap-4 items-end bg-[#1a1b26] border border-white/10 p-4 rounded-[32px] shadow-2xl">
                      <Textarea 
                        placeholder="Command the Forge... (e.g. Generate 50 PSSSB Punjab GK artifacts for Excise Inspector)"
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-2 no-scrollbar resize-none min-h-[56px] max-h-[200px]"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      />
                      <Button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shadow-xl shrink-0"
                      >
                         {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                      </Button>
                   </div>
                </div>
                <div className="flex justify-center gap-6 text-[7px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                   <span>Bilingual Engine v12</span>
                   <span>•</span>
                   <span>Fault Tolerant Ingestion</span>
                   <span>•</span>
                   <span>Auto-Bank Sync</span>
                </div>
             </div>
          </footer>
        </main>
      </div>
    </AdminProtect>
  );
}

