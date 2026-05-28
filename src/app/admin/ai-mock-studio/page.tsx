'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateStrictBilingualArtifacts } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Search,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Languages
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, writeBatch } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  questions?: any[];
  status?: 'thinking' | 'generating' | 'completed';
};

export default function AIStudioV2() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [config, setConfig] = useState({
    exam: "PSSSB Clerk (General)",
    difficulty: "medium",
    count: 5,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (instruction?: string) => {
    const promptText = instruction || input;
    if (!promptText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ai',
      content: "Thinking...",
      status: 'thinking'
    };
    setMessages(prev => [...prev, aiMsg]);

    try {
      const questions = await generateStrictBilingualArtifacts({
        instruction: promptText,
        exam: config.exam,
        subjects: SUBJECT_LIST,
        count: config.count,
        difficulty: config.difficulty,
      });

      setMessages(prev => prev.map(m => m.id === aiMsgId ? {
        ...m,
        content: `Synthesized ${questions.length} institutional artifacts for ${config.exam}. Analysis complete.`,
        questions,
        status: 'completed'
      } : m));

    } catch (e: any) {
      toast({ title: "Synthesis Failed", description: e.message, variant: "destructive" });
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
    } finally {
      setLoading(false);
    }
  };

  const publishMock = async (qs: any[]) => {
    setLoading(true);
    try {
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: `${config.exam} AI Mock ${new Date().toLocaleDateString()}`,
        exam: config.exam,
        totalQuestions: qs.length,
        duration: qs.length * 1.5,
        status: "published",
        accessType: "pass_plus",
        negativeMarking: 0.25,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      const batch = writeBatch(db);
      qs.forEach((q, i) => {
        const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
        batch.set(qRef, { ...q, order: i });
      });
      await batch.commit();

      toast({ title: "Mock Live!", description: "Simulation pushed to student arena." });
    } catch (e: any) {
      toast({ title: "Publish Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveToBank = async (qs: any[]) => {
    try {
      const batch = writeBatch(db);
      qs.forEach(q => {
        const qRef = doc(collection(db, "questions"));
        batch.set(qRef, { ...q, status: "published", createdAt: Date.now() });
      });
      await batch.commit();
      toast({ title: "Bank Synced", description: "Artifacts added to Global Bank." });
    } catch (e: any) {
      toast({ title: "Sync Error", variant: "destructive" });
    }
  };

  return (
    <AdminProtect>
      <div className="flex bg-[#050508] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen relative">
          <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 z-50">
             <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center blue-glow">
                   <BrainCircuit className="text-white w-5 h-5" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-tighter">Neural Forge AI</h1>
                   <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Bilingual Ingestion Core</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                   <SelectTrigger className="w-48 bg-white/5 border-white/5 rounded-xl h-9 text-[10px] uppercase font-black px-4">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                   </SelectContent>
                </Select>

                <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                   <SelectTrigger className="w-32 bg-white/5 border-white/5 rounded-xl h-9 text-[10px] uppercase font-black px-4">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      {['easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
          </header>

          <ScrollArea className="flex-1 px-8 py-10" ref={scrollRef}>
             <div className="max-w-4xl mx-auto space-y-12 pb-32">
                {messages.length === 0 && (
                   <div className="py-20 text-center space-y-8 opacity-40">
                      <Sparkles size={60} className="mx-auto text-primary" />
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Command System Active</h2>
                        <p className="text-zinc-500 text-xs italic">Request specific bilingual patterns or syllabus modules.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                         {["PSSSB Clerk Punjab GK 10 Qs", "Sub-Inspector Reasoning Hard", "Excise Inspector Static GK", "Patwari Math Shortcut Mocks"].map(t => (
                            <button key={t} onClick={() => handleSend(t)} className="p-4 rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-[9px] font-black uppercase text-zinc-500 tracking-widest text-center">
                               {t}
                            </button>
                         ))}
                      </div>
                   </div>
                )}

                <AnimatePresence mode="popLayout">
                   {messages.map((msg) => (
                     <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className={cn("flex gap-6", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                     >
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg", msg.role === 'user' ? "bg-accent" : "bg-primary")}>
                           {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                        </div>
                        
                        <div className={cn("max-w-[85%] space-y-4", msg.role === 'user' ? "text-right" : "text-left")}>
                           <div className={cn(
                             "p-6 rounded-[28px] text-sm leading-relaxed shadow-2xl",
                             msg.role === 'user' ? "bg-white/5 border border-white/10 rounded-tr-none" : "bg-zinc-900 border border-white/5 rounded-tl-none"
                           )}>
                              {msg.status === 'thinking' ? (
                                 <div className="flex items-center gap-3 text-zinc-500 italic">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Synthesizing bilingual signal...</span>
                                 </div>
                              ) : (
                                 <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                           </div>

                           {msg.questions && (
                             <div className="grid gap-6">
                                {msg.questions.map((q, i) => (
                                  <Card key={i} className="rounded-[32px] bg-zinc-950 border border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
                                     <div className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                           <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-3 py-1">Artifact #{i+1}</Badge>
                                           <Badge variant="outline" className="border-white/10 text-zinc-600 text-[8px] font-black uppercase">{q.subject}</Badge>
                                        </div>
                                        <div className="space-y-4">
                                           <div className="space-y-2">
                                              <p className="text-lg font-bold text-white">{q.questionEn}</p>
                                              <p className="text-lg font-medium text-zinc-400 italic font-body">{q.questionPa}</p>
                                           </div>
                                           <div className="grid grid-cols-2 gap-4">
                                              {q.options.map((opt: any, idx: number) => (
                                                <div key={idx} className={cn("p-4 rounded-2xl bg-white/[0.02] border border-white/5", idx === q.correctAnswer && "border-emerald-500/20 bg-emerald-500/5")}>
                                                   <p className="text-xs font-bold text-zinc-200">{opt.en}</p>
                                                   <p className="text-[10px] text-zinc-500 italic mt-1">{opt.pa}</p>
                                                </div>
                                              ))}
                                           </div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                                           <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Rationalization Model</p>
                                           <p className="text-xs text-zinc-400 leading-relaxed">{q.solutionEn}</p>
                                           <p className="text-xs text-zinc-500 leading-relaxed italic border-t border-white/5 pt-3">{q.solutionPa}</p>
                                        </div>
                                     </div>
                                  </Card>
                                ))}

                                <div className="flex gap-4 pt-4">
                                   <Button onClick={() => publishMock(msg.questions!)} className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest shadow-xl">
                                      <Rocket className="mr-2 w-4 h-4" /> Live Publish
                                   </Button>
                                   <Button onClick={() => saveToBank(msg.questions!)} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest shadow-xl">
                                      <Database className="mr-2 w-4 h-4" /> Sync to Bank
                                   </Button>
                                </div>
                             </div>
                           )}
                        </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </ScrollArea>

          <footer className="p-8 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 shrink-0 z-50">
             <div className="max-w-4xl mx-auto flex gap-4 items-end">
                <Textarea 
                   placeholder="Command the Forge... (e.g. Generate PSSSB Patwari bilingual mock)"
                   className="flex-1 bg-white/5 border-white/10 focus-visible:ring-primary/20 text-sm font-medium p-4 no-scrollbar resize-none min-h-[56px] max-h-[150px] rounded-2xl"
                   value={input}
                   onChange={e => setInput(e.target.value)}
                   onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSend();
                      }
                   }}
                />
                <Button 
                   onClick={() => handleSend()}
                   disabled={loading || !input.trim()}
                   className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shadow-xl"
                >
                   {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                </Button>
             </div>
          </footer>
        </main>
      </div>
    </AdminProtect>
  );
}
