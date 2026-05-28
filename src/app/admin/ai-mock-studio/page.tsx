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
  Send, 
  Plus, 
  FileUp, 
  MessageSquare, 
  Bot, 
  User, 
  Loader2, 
  Globe, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  Database,
  Rocket,
  Search,
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';

// Subject Database mapping
const EXAM_SUBJECT_MAP: Record<string, string[]> = {
  "PSSSB Clerk (General)": ["Punjab GK", "Punjabi Language", "English Language", "Reasoning", "Quant", "Computer"],
  "Punjab Police SI": ["Punjab GK", "Indian Constitution", "Reasoning", "Digital Literacy", "English"],
  "PPSC PCS": ["Punjab History", "World Geography", "Polity", "Economics", "Ethics"],
  "Banking": ["Banking Awareness", "English", "Data Interpretation", "Reasoning"],
  "SSC": ["Quant", "Reasoning", "English", "General Awareness"]
};

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  type: 'text' | 'questions' | 'system';
  questions?: any[];
  status?: 'thinking' | 'generating' | 'completed';
};

export default function NeuralForgeV2() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [config, setConfig] = useState({
    exam: "PSSSB Clerk (General)",
    subject: "General Knowledge",
    difficulty: "medium",
    count: 10,
    language: "bilingual"
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (instruction?: string) => {
    const promptText = instruction || input;
    if (!promptText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ai',
      content: "",
      type: 'questions',
      status: 'thinking'
    };
    setMessages(prev => [...prev, aiMsg]);

    try {
      // Simulate real-time progress steps for better UX
      updateMsgStatus(aiMsgId, 'thinking', "Analyzing syllabus patterns...");
      await new Promise(r => setTimeout(r, 800));
      
      updateMsgStatus(aiMsgId, 'generating', `Synthesizing ${config.count} bilingual artifacts for ${config.exam}...`);

      const questions = await generateBilingualArtifacts({
        jobId: `job_${aiMsgId}`,
        exam: config.exam,
        subjects: [config.subject],
        count: config.count,
        difficulty: config.difficulty,
        instruction: promptText
      });

      setMessages(prev => prev.map(m => m.id === aiMsgId ? {
        ...m,
        content: `I've generated ${questions.length} high-fidelity bilingual questions based on your requirements for ${config.exam}.`,
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

  const updateMsgStatus = (id: string, status: any, text: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status, content: text } : m));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `admin/uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      handleSend(`Extract questions from this uploaded document: ${file.name}. Ensure strict bilingual Punjabi formatting.`);
      toast({ title: "Document Uploaded", description: "AI is now parsing the artifacts." });
    } catch (err: any) {
      toast({ title: "Upload Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveToBank = async (qs: any[]) => {
    const batch = writeBatch(db);
    qs.forEach(q => {
      const ref = doc(collection(db, "questions"));
      batch.set(ref, {
        ...q,
        status: "published",
        source: "NEURAL_FORGE_V2",
        createdAt: Date.now()
      });
    });
    await batch.commit();
    toast({ title: "Bank Synced", description: `${qs.length} questions indexed successfully.` });
  };

  const handleLivePublish = async (qs: any[]) => {
    const mockRef = await addDoc(collection(db, "mocks"), {
      title: `${config.exam} AI Mock ${new Date().toLocaleDateString()}`,
      exam: config.exam,
      totalQuestions: qs.length,
      duration: qs.length * 1.5,
      status: "published",
      accessType: "pass_plus",
      createdAt: Date.now()
    });

    const batch = writeBatch(db);
    qs.forEach((q, i) => {
      const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
      batch.set(qRef, { ...q, order: i });
    });
    await batch.commit();
    toast({ title: "Live Published", description: "Mock is now live in the student arena." });
  };

  return (
    <AdminProtect>
      <div className="flex bg-[#0a0a0f] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen relative">
          {/* HEADER CONFIGURATION */}
          <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl z-30 px-8 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center blue-glow">
                   <BrainCircuit className="text-primary w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-lg font-black uppercase tracking-tighter">Neural Forge v2</h1>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Conversational Mock Studio</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                   <SelectTrigger className="w-48 bg-white/5 border-white/5 rounded-xl h-10 text-[10px] uppercase font-black">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                   </SelectContent>
                </Select>

                <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                   <SelectTrigger className="w-32 bg-white/5 border-white/5 rounded-xl h-10 text-[10px] uppercase font-black">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      {['easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
                   </SelectContent>
                </Select>

                <Input 
                   type="number" 
                   value={config.count} 
                   onChange={e => setConfig({...config, count: Number(e.target.value)})}
                   className="w-20 bg-white/5 border-white/5 rounded-xl h-10 text-center font-black"
                />
             </div>
          </header>

          {/* CHAT AREA */}
          <ScrollArea className="flex-1 px-8 py-10" ref={scrollRef}>
             <div className="max-w-4xl mx-auto space-y-12 pb-32">
                {messages.length === 0 && (
                   <div className="py-20 text-center space-y-8 opacity-40">
                      <Sparkles size={80} className="mx-auto text-primary" />
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Neural Interface Active</h2>
                        <p className="text-zinc-500 font-medium italic">Command the AI to synthesize institutional-grade artifacts.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                         {["Generate PSSSB Clerk Full Mock", "Difficult Reasoning for Police SI", "Punjab GK Raavi Artifacts", "Current Affairs 2024 Pack"].map(t => (
                            <button key={t} onClick={() => handleSend(t)} className="p-4 rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-[10px] font-bold uppercase text-zinc-400">
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
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", msg.role === 'user' ? "bg-accent" : "bg-primary")}>
                           {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        
                        <div className={cn("max-w-[85%] space-y-4", msg.role === 'user' ? "text-right" : "text-left")}>
                           <div className={cn(
                             "p-6 rounded-[32px] text-sm leading-relaxed shadow-2xl",
                             msg.role === 'user' ? "bg-white/5 border border-white/10 rounded-tr-none" : "bg-zinc-900 border border-white/5 rounded-tl-none"
                           )}>
                              {msg.status === 'thinking' && (
                                 <div className="flex items-center gap-3 text-zinc-500 italic">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{msg.content}</span>
                                 </div>
                              )}
                              {msg.status !== 'thinking' && (
                                 <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                           </div>

                           {msg.questions && (
                             <div className="grid gap-6">
                                {msg.questions.map((q, i) => (
                                  <Card key={i} className="rounded-[40px] bg-zinc-950 border border-white/5 overflow-hidden group hover:border-primary/30 transition-all">
                                     <div className="p-8 space-y-8">
                                        <div className="flex justify-between items-start">
                                           <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-3 py-1">Artifact #{i+1}</Badge>
                                           <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-bold uppercase">{q.subject}</Badge>
                                        </div>
                                        <div className="space-y-4">
                                           <p className="text-lg font-bold text-white leading-relaxed">{q.question_en}</p>
                                           <p className="text-lg font-medium text-zinc-400 italic border-l-4 border-primary/20 pl-6">{q.question_pa}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                           {q.options_en.map((opt: string, idx: number) => (
                                             <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <p className="text-xs font-bold text-zinc-300">{opt}</p>
                                                <p className="text-[10px] text-zinc-500 italic mt-1">{q.options_pa[idx]}</p>
                                             </div>
                                           ))}
                                        </div>
                                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Key: {q.correctAnswer}</span>
                                           <div className="flex gap-2">
                                              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5"><RotateCcw size={14} /></Button>
                                           </div>
                                        </div>
                                     </div>
                                  </Card>
                                ))}

                                <div className="flex gap-4 pt-4">
                                   <Button onClick={() => handleLivePublish(msg.questions!)} className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl">
                                      <Rocket className="mr-3 w-4 h-4" /> Live Publish Mock
                                   </Button>
                                   <Button onClick={() => handleSaveToBank(msg.questions!)} className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl">
                                      <Database className="mr-3 w-4 h-4" /> Sync to Bank
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

          {/* INPUT BAR */}
          <footer className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-40">
             <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Card className="rounded-[40px] bg-[#12121a] border border-white/10 p-4 shadow-2xl relative">
                   <div className="flex gap-4 items-end">
                      <div className="flex flex-col gap-2 mb-2">
                         <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept=".pdf,.png,.jpg" 
                         />
                         <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="rounded-2xl h-12 w-12 bg-white/5 hover:bg-white/10 text-zinc-500"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                         >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={24} />}
                         </Button>
                      </div>
                      
                      <Textarea 
                         placeholder="Command the Forge... (e.g. Generate 50 PSSSB Punjab GK artifacts)"
                         className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg font-medium p-4 no-scrollbar resize-none min-h-[60px] max-h-[200px]"
                         value={input}
                         onChange={e => setInput(e.target.value)}
                         onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handleSend();
                            }
                         }}
                      />

                      <div className="mb-2">
                         <Button 
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shadow-xl"
                         >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                         </Button>
                      </div>
                   </div>
                </Card>
             </div>
             <p className="text-center text-[8px] font-black uppercase text-zinc-700 tracking-[0.4em] mt-4">
                Neural Forge v2.5 — Infrastructure by Arsh Grewal
             </p>
          </footer>
        </main>
      </div>
    </AdminProtect>
  );
}
