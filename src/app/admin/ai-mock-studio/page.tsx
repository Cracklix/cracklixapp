
'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
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
  Sparkles,
  CheckCircle2,
  Trash2,
  Languages,
  ArrowRight,
  ShieldCheck,
  History,
  FileUp,
  Settings2,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { openai } from '@/lib/openai';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  questions?: any[];
  status?: 'thinking' | 'generating' | 'completed' | 'error';
};

export default function AIStudioV2() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB Clerk (General)",
    difficulty: "medium",
    count: 5,
    subject: "Punjab GK",
    mode: "bilingual"
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, loading]);

  const validateArtifact = (q: any) => {
    if (!q.questionEn || !q.questionPa) return false;
    if (!q.options || q.options.length !== 4) return false;
    if (q.correctAnswer === undefined || q.correctAnswer === null) return false;
    if (!q.solutionEn || !q.solutionPa) return false;
    return true;
  };

  const handleSend = async (instruction?: string) => {
    const promptText = instruction || input;
    if (!promptText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'ai',
      content: "Initializing Neural Forge Core v12...",
      status: 'thinking'
    };
    setMessages(prev => [...prev, aiMsg]);

    try {
      const systemPrompt = `
You are the CRACKLIX Neural Academic Architect. You generate institutional-grade competitive exam MCQs for Punjab Govt exams.

RULES:
1. Every question MUST be bilingual (English and Punjabi Raavi).
2. Every question MUST have 4 distinct options.
3. Every question MUST have a detailed bilingual solution (Rationalization).
4. Include "Elite Speed Tricks" in solutions where applicable.
5. Return ONLY a valid JSON object matching the requested schema.

SCHEMA:
{
  "questions": [
    {
      "questionEn": "string",
      "questionPa": "string",
      "options": [
        { "en": "string", "pa": "string" },
        { "en": "string", "pa": "string" },
        { "en": "string", "pa": "string" },
        { "en": "string", "pa": "string" }
      ],
      "correctAnswer": 0-3,
      "solutionEn": "string",
      "solutionPa": "string",
      "subject": "string",
      "topic": "string",
      "difficulty": "easy|medium|hard",
      "timeEstimate": number (seconds)
    }
  ]
}
`;

      const userPrompt = `
TASK: Generate ${config.count} high-yield MCQs.
EXAM: ${config.exam}
SUBJECT: ${config.subject}
DIFFICULTY: ${config.difficulty}
INSTRUCTIONS: ${promptText}
`;

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, status: 'generating', content: "Synthesizing artifacts..." } : m));

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || "{}");
      const questions = response.questions || [];

      // Validation Step
      const validQuestions = questions.filter(validateArtifact);

      if (validQuestions.length === 0) {
        throw new Error("AI failed to produce valid bilingual artifacts. Please try a more specific prompt.");
      }

      setMessages(prev => prev.map(m => m.id === aiMsgId ? {
        ...m,
        content: `Neural Forge has synthesized ${validQuestions.length} artifacts for ${config.exam}. Critical validation complete.`,
        questions: validQuestions,
        status: 'completed'
      } : m));

      toast({ title: "Synthesis Complete", description: `${validQuestions.length} artifacts ready for deployment.` });

    } catch (e: any) {
      console.error("OpenAI Forge Error:", e);
      setMessages(prev => prev.map(m => m.id === aiMsgId ? {
        ...m,
        content: `Forge Interruption: ${e.message}. Fallback engine requested.`,
        status: 'error'
      } : m));
      toast({ title: "Forge Interruption", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const publishMock = async (qs: any[]) => {
    setLoading(true);
    try {
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: config.title || `${config.exam} Neural Mock - ${new Date().toLocaleDateString()}`,
        exam: config.exam,
        totalQuestions: qs.length,
        duration: qs.length * 1.2, // 1.2 min per question
        status: "published",
        accessType: "pass_plus",
        negativeMarking: 0.25,
        totalMarks: qs.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        languageMode: "bilingual"
      });

      const batch = writeBatch(db);
      qs.forEach((q, i) => {
        const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
        batch.set(qRef, { ...q, order: i, id: qRef.id });
        
        // Also save to global bank
        const bankRef = doc(collection(db, "questions"));
        batch.set(bankRef, { 
          ...q, 
          status: "published", 
          createdAt: Date.now(),
          source: "NEURAL_FORGE_V2"
        });
      });
      await batch.commit();

      toast({ title: "Simulation Live!", description: "Artifacts pushed to student Live Arena." });
    } catch (e: any) {
      toast({ title: "Deployment Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveToBank = async (qs: any[]) => {
    try {
      const batch = writeBatch(db);
      qs.forEach(q => {
        const qRef = doc(collection(db, "questions"));
        batch.set(qRef, { 
          ...q, 
          status: "published", 
          createdAt: Date.now(),
          source: "NEURAL_FORGE_V2"
        });
      });
      await batch.commit();
      toast({ title: "Global Bank Synced", description: `${qs.length} artifacts indexed into Atomic Repository.` });
    } catch (e: any) {
      toast({ title: "Sync Error", variant: "destructive" });
    }
  };

  return (
    <AdminProtect>
      <div className="flex bg-[#05060f] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen relative">
          {/* Header Configuration */}
          <header className="h-16 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 z-50">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center blue-glow">
                   <BrainCircuit className="text-white w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-tighter">Neural Forge v2</h1>
                   <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Powered by GPT-4o-mini</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                    <SelectTrigger className="w-48 bg-transparent border-none h-8 text-[10px] uppercase font-black px-3 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 text-white border-white/10">
                        {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={config.subject} onValueChange={v => setConfig({...config, subject: v})}>
                    <SelectTrigger className="w-40 bg-transparent border-none h-8 text-[10px] uppercase font-black px-3 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 text-white border-white/10">
                        {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={config.difficulty} onValueChange={v => setConfig({...config, difficulty: v})}>
                    <SelectTrigger className="w-24 bg-transparent border-none h-8 text-[10px] uppercase font-black px-3 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 text-white border-white/10">
                        {['easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  type="number" 
                  value={config.count} 
                  onChange={e => setConfig({...config, count: Number(e.target.value)})}
                  className="w-16 h-10 bg-white/5 border-white/5 rounded-xl text-center text-xs font-black"
                  min={1}
                  max={20}
                />
             </div>
          </header>

          {/* Chat Interface */}
          <ScrollArea className="flex-1 px-8 py-10" ref={scrollRef}>
             <div className="max-w-5xl mx-auto space-y-12 pb-32">
                {messages.length === 0 && (
                   <div className="py-20 text-center space-y-10">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto"
                      >
                         <Bot size={48} className="text-primary" />
                      </motion.div>
                      <div className="space-y-4">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Neural Ingestion Protocol</h2>
                        <p className="text-zinc-500 text-sm italic max-w-lg mx-auto">Instruct the Forge to synthesize bilingual artifacts. Every generation is validated against institutional marking schemes.</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                         {[
                           "Hard PSSSB Clerk Punjab GK", 
                           "Police SI Reasoning Logic", 
                           "Excise Static GK Bilingual", 
                           "Patwari Math Formulas"
                         ].map(t => (
                            <button 
                              key={t} 
                              onClick={() => handleSend(t)} 
                              className="p-5 rounded-[24px] border border-white/5 bg-zinc-900/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-[9px] font-black uppercase text-zinc-500 tracking-widest text-center"
                            >
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
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className={cn("flex gap-6", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                     >
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xl", msg.role === 'user' ? "bg-zinc-800" : "bg-primary")}>
                           {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        
                        <div className={cn("max-w-[85%] space-y-4", msg.role === 'user' ? "text-right" : "text-left")}>
                           <div className={cn(
                             "p-6 rounded-[32px] text-sm leading-relaxed shadow-2xl",
                             msg.role === 'user' ? "bg-white/5 border border-white/10 rounded-tr-none" : "bg-zinc-900 border border-white/5 rounded-tl-none"
                           )}>
                              {msg.status === 'thinking' || msg.status === 'generating' ? (
                                 <div className="flex items-center gap-3 text-zinc-500 italic">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span>{msg.content}</span>
                                 </div>
                              ) : (
                                 <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                 </div>
                              )}
                           </div>

                           {msg.questions && (
                             <div className="grid gap-6 mt-8">
                                {msg.questions.map((q, i) => (
                                  <Card key={i} className="rounded-[40px] bg-zinc-950 border border-white/5 overflow-hidden group hover:border-primary/30 transition-all shadow-2xl">
                                     <div className="p-10 space-y-8">
                                        <div className="flex justify-between items-start">
                                           <div className="flex gap-3">
                                              <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-4 py-1.5">Artifact #{i+1}</Badge>
                                              <Badge variant="outline" className="border-white/10 text-zinc-600 text-[8px] font-black uppercase px-3">{q.subject}</Badge>
                                           </div>
                                           <Badge variant="outline" className={cn("text-[8px] font-black uppercase", q.difficulty === 'hard' ? "text-red-500 border-red-500/20" : "text-emerald-500 border-emerald-500/20")}>{q.difficulty}</Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                           <div className="space-y-6">
                                              <div className="space-y-2">
                                                 <p className="text-xl font-bold text-white leading-tight">{q.questionEn}</p>
                                                 <p className="text-xl font-medium text-zinc-500 italic font-body border-l-4 border-white/5 pl-4">{q.questionPa}</p>
                                              </div>
                                              <div className="grid gap-3">
                                                 {q.options.map((opt: any, idx: number) => (
                                                   <div key={idx} className={cn("p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex gap-4", idx === q.correctAnswer && "border-emerald-500/20 bg-emerald-500/5")}>
                                                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs", idx === q.correctAnswer ? "bg-emerald-500 text-white" : "bg-zinc-900 text-zinc-500")}>
                                                         {String.fromCharCode(65+idx)}
                                                      </div>
                                                      <div className="flex-1">
                                                         <p className="text-sm font-bold text-zinc-200">{opt.en}</p>
                                                         <p className="text-[11px] text-zinc-500 italic mt-1 font-body">{opt.pa}</p>
                                                      </div>
                                                   </div>
                                                 ))}
                                              </div>
                                           </div>

                                           <div className="space-y-6 border-l border-white/5 pl-12 flex flex-col justify-between">
                                              <div className="p-8 rounded-[32px] bg-blue-500/5 border border-blue-500/10 space-y-6 relative overflow-hidden">
                                                 <div className="absolute top-0 right-0 p-6 opacity-5"><History size={120} /></div>
                                                 <div className="flex items-center gap-3">
                                                   <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><CheckCircle2 className="text-blue-500 w-5 h-5" /></div>
                                                   <h4 className="text-xs font-black uppercase tracking-widest">Rationalization Model</h4>
                                                 </div>
                                                 <div className="space-y-4">
                                                   <p className="text-sm text-zinc-300 leading-relaxed font-medium">{q.solutionEn}</p>
                                                   <p className="text-sm text-zinc-500 leading-relaxed italic border-t border-white/5 pt-4">{q.solutionPa}</p>
                                                 </div>
                                              </div>
                                              <div className="flex gap-4">
                                                 <Button variant="ghost" className="flex-1 h-12 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/5">
                                                    <RefreshCw className="mr-2 w-3 h-3" /> Regenerate
                                                 </Button>
                                                 <Button variant="ghost" className="flex-1 h-12 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/5">
                                                    <Globe className="mr-2 w-3 h-3" /> Fix Raavi
                                                 </Button>
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                  </Card>
                                ))}

                                <div className="flex gap-4 pt-6">
                                   <Button onClick={() => publishMock(msg.questions!)} className="flex-1 h-16 rounded-[28px] bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-600/20 active:scale-95">
                                      <Rocket className="mr-3 w-5 h-5" /> Execute Live Publish
                                   </Button>
                                   <Button onClick={() => saveToBank(msg.questions!)} className="flex-1 h-16 rounded-[28px] bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95">
                                      <Database className="mr-3 w-5 h-5" /> Commit to Atomic Bank
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

          {/* Chat Footer Controls */}
          <footer className="p-8 bg-zinc-950/80 backdrop-blur-3xl border-t border-white/5 shrink-0 z-50">
             <div className="max-w-4xl mx-auto space-y-6">
                {/* Advanced Quick Config */}
                <div className="flex flex-wrap gap-4 items-center justify-center">
                   <Input 
                      placeholder="Simulation Name..."
                      className="w-64 h-10 bg-white/5 border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 focus:ring-primary/20"
                      value={config.title}
                      onChange={e => setConfig({...config, title: e.target.value})}
                   />
                   <div className="flex gap-2">
                      <Button variant="ghost" className="h-10 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest px-4 hover:bg-white/5">
                         <FileUp size={14} className="mr-2" /> OCR Content
                      </Button>
                      <Button variant="ghost" className="h-10 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest px-4 hover:bg-white/5">
                         <Zap size={14} className="mr-2" /> Turbo AI
                      </Button>
                   </div>
                </div>

                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl" />
                   <div className="relative flex gap-4 items-end bg-[#1a1b26] border border-white/10 p-4 rounded-[32px] shadow-2xl">
                      <Textarea 
                         placeholder="Command the Forge... (e.g. Generate 5 difficult PSSSB Clerk artifacts with explanations)"
                         className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-2 no-scrollbar resize-none min-h-[56px] max-h-[200px]"
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
                         className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shadow-xl shrink-0 transition-transform active:scale-95"
                      >
                         {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                      </Button>
                   </div>
                </div>
                
                <p className="text-[7px] text-center text-zinc-600 font-black uppercase tracking-[0.5em]">
                   Infrastructure engineered by Arsh Grewal • State-wide Merit sync active
                </p>
             </div>
          </footer>
        </main>
      </div>
    </AdminProtect>
  );
}
