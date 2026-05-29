"use client";

import { useState, useRef, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Database, 
  Rocket, 
  Settings, 
  ShieldCheck,
  Cpu,
  History,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { synthesizeNeuralBatch } from '@/services/neural-forge-v3';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * CRACKLIX MASTER NEURAL CORE v4
 * Unified AI Synthesis Command Center.
 * Batching and Firestore logic moved to client to satisfy project rules.
 */
export default function NeuralCoreStudio() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState({
    exam: EXAM_LIST[0],
    subject: SUBJECT_LIST[0],
    totalCount: 10,
    title: "",
    duration: 60,
    negativeMarking: 0.25,
    accessType: 'pass_plus'
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

    const userMsg = { role: 'user', text: input, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const instruction = input;
    setInput("");
    setLoading(true);

    const aiMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { role: 'ai', text: "Initializing Neural Core v4...", status: 'thinking', id: aiMsgId }]);

    try {
      const totalCount = config.totalCount;
      const batchSize = 5;
      const totalBatches = Math.ceil(totalCount / batchSize);
      let allResults: any[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const currentBatchCount = Math.min(batchSize, totalCount - i * batchSize);
        
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: `Neural Core: Synthesizing segment ${i + 1}/${totalBatches}...` } : m
        ));

        const batchResults = await synthesizeNeuralBatch({
          exam: config.exam,
          instruction,
          subject: config.subject,
          count: currentBatchCount
        });

        allResults = [...allResults, ...batchResults];
        setArtifacts(prev => [...prev, ...batchResults]);

        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: `Segment ${i + 1} stabilized. Validated ${batchResults.length} artifacts.` } : m
        ));

        // Delay for API stability
        if (i < totalBatches - 1) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { 
        ...m, 
        text: `Synthesis Stabilized. Validated ${allResults.length} artifacts according to board patterns.`, 
        status: 'done' 
      } : m));

    } catch (error: any) {
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: `Neural Fracture: ${error.message}. Shifting to fallback node...`, status: 'error' } : m));
      toast({ title: "Core Disruption", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const publishToArena = async () => {
    if (artifacts.length === 0) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const mockRef = doc(collection(db, "mocks"));
      
      const mockData = {
        id: mockRef.id,
        title: config.title || `${config.exam} Simulation - ${new Date().toLocaleDateString()}`,
        exam: config.exam,
        totalQuestions: artifacts.length,
        duration: config.duration || Math.round(artifacts.length * 1.2),
        negativeMarking: config.negativeMarking || 0.25,
        totalMarks: artifacts.reduce((acc, q) => acc + (q.marks || 1), 0),
        accessType: config.accessType || 'pass_plus',
        status: 'published',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attemptCount: 0,
        languageMode: 'bilingual'
      };

      batch.set(mockRef, mockData);

      artifacts.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        batch.set(qRef, {
          ...q,
          id: qRef.id,
          order: idx,
          createdAt: Date.now()
        });

        // Mirror to Global Atomic Bank
        const bankRef = doc(collection(db, "questions"));
        batch.set(bankRef, {
          ...q,
          status: 'published',
          source: 'NEURAL_CORE_V4',
          createdAt: Date.now()
        });
      });

      await batch.commit();

      toast({ title: "Simulation Deployed", description: "Pushed to student Live Arena." });
      setArtifacts([]);
      setMessages(prev => [...prev, { role: 'ai', text: "Mock successfully stabilized. identity ID: " + mockRef.id, id: Date.now() }]);
    } catch (err: any) {
      toast({ title: "Publish Breach", description: err.message, variant: "destructive" });
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
                   <Cpu className="text-primary w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-tighter">Neural Core v4.0</h1>
                   <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Master Punjab Exam Engine</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                   <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-white/5 rounded-lg text-[9px] font-black uppercase">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10 max-h-[400px]">
                      {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                   </SelectContent>
                </Select>

                <Select value={config.subject} onValueChange={v => setConfig({...config, subject: v})}>
                   <SelectTrigger className="w-[150px] h-8 bg-zinc-900 border-white/5 rounded-lg text-[9px] font-black uppercase">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10 max-h-[400px]">
                      {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                   </SelectContent>
                </Select>

                <div className="flex items-center bg-zinc-900 border border-white/5 h-8 rounded-lg px-3 gap-2">
                   <span className="text-[8px] font-black text-zinc-600 uppercase">Batch:</span>
                   <input 
                     type="number" 
                     className="bg-transparent border-none text-[9px] font-black w-8 outline-none" 
                     value={config.totalCount}
                     onChange={e => setConfig({...config, totalCount: parseInt(e.target.value) || 1})}
                   />
                </div>
             </div>
          </header>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
             <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {messages.length === 0 && (
                  <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                     <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-[32px] bg-primary flex items-center justify-center blue-glow">
                        <Sparkles size={32} />
                     </motion.div>
                     <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Core Ready</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Input instructions to begin institutional artifact synthesis.</p>
                     </div>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {messages.map((m) => (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-5 max-w-5xl", m.role === 'user' ? "flex-row-reverse ml-auto" : "flex-row")}
                    >
                       <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", m.role === 'user' ? "bg-zinc-800" : "bg-primary blue-glow")}>
                          {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                       </div>
                       
                       <div className={cn("p-5 rounded-[28px] text-sm leading-relaxed border shadow-2xl", m.role === 'user' ? "bg-zinc-900/50 border-white/5 rounded-tr-none" : "bg-zinc-950 border-primary/20 rounded-tl-none")}>
                          {m.status === 'thinking' ? (
                            <div className="flex items-center gap-3 text-primary animate-pulse">
                               <Loader2 className="w-4 h-4 animate-spin" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{m.text}</span>
                            </div>
                          ) : (
                            <p className={cn(m.status === 'error' ? "text-red-400 font-mono text-xs" : "text-zinc-100")}>{m.text}</p>
                          )}
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </ScrollArea>

          {artifacts.length > 0 && (
            <div className="px-8 py-4 bg-zinc-950 border-t border-white/5 flex items-center justify-between animate-in slide-in-from-bottom-2">
               <div className="flex items-center gap-4">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase text-[10px]">{artifacts.length} ARTIFACTS STABILIZED</Badge>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Master Bank Sync: Ready</p>
               </div>
               <Button onClick={publishToArena} disabled={loading} className="h-10 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase blue-glow shadow-xl">
                  <Rocket size={14} className="mr-2" /> ⚡ DEPLOY LIVE
               </Button>
            </div>
          )}

          <footer className="p-6 bg-zinc-950/50 backdrop-blur-xl border-t border-white/5 shrink-0">
             <div className="max-w-4xl mx-auto">
                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl" />
                   <div className="relative flex flex-col bg-[#111218] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden">
                      <div className="flex gap-4 p-3 items-center bg-white/[0.02] border-b border-white/5">
                         <div className="flex-1">
                            <Input 
                              placeholder="Mock Title (e.g. Master Cadre Punjabi Sunday Marathon)" 
                              value={config.title}
                              onChange={e => setConfig({...config, title: e.target.value})}
                              className="h-8 bg-transparent border-none focus-visible:ring-0 text-[10px] font-black uppercase"
                            />
                         </div>
                         <div className="h-6 w-px bg-white/5" />
                         <div className="px-4">
                            <label className="text-[8px] font-black text-zinc-500 uppercase block">Timer (M)</label>
                            <input 
                               type="number" 
                               value={config.duration}
                               onChange={e => setConfig({...config, duration: parseInt(e.target.value) || 60})}
                               className="bg-transparent border-none text-[10px] font-black w-10 text-center outline-none"
                            />
                         </div>
                      </div>
                      <div className="flex gap-4 items-end p-4">
                        <Textarea 
                          placeholder="Command the Core... (e.g. Generate 20 tricky PSTET Child Pedagogy artifacts based on Kohlberg's theory)"
                          className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-2 no-scrollbar resize-none min-h-[50px] max-h-[120px]"
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
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
                <div className="mt-4 flex justify-center gap-6 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">
                   <span>Syllabus Aware AI</span>
                   <span>•</span>
                   <span>Raavi Normalization</span>
                   <span>•</span>
                   <span>Core v4.0</span>
                </div>
             </div>
          </footer>
        </main>
      </div>
    </AdminProtect>
  );
}
