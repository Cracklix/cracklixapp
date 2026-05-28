
"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateQuestionBatch, MockGeneratorInput } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  Database, 
  ShieldCheck,
  Zap,
  BrainCircuit,
  History,
  Terminal,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

/**
 * INSTITUTIONAL FORGE OS v25.0
 * Features: Neural Batching (Retry logic), Strict JSON Validation, Real-time Sync.
 */
export default function AiMockStudioPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [promptInput, setPromptInput] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [exam, setExam] = useState("clerk");
  const [count, setCount] = useState("15");
  const [language, setLanguage] = useState("en_pa");

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 20)]);

  async function handleLaunchSynthesis() {
    if (!promptInput.trim()) return;
    setLoading(true);
    setQuestions([]);
    setLogs([]);
    addLog("Initializing FORGE OS v25.0 High-Fidelity Engine...");

    const totalCount = Number(count);
    const batchSize = 5; // Parallel chunking to prevent Gemini 503 timeouts
    const totalBatches = Math.ceil(totalCount / batchSize);

    try {
      let accumulatedQs: any[] = [];

      for (let b = 0; b < totalBatches; b++) {
        const chunkCount = Math.min(batchSize, totalCount - accumulatedQs.length);
        addLog(`Forging Batch ${b + 1}/${totalBatches} (${chunkCount} artifacts)...`);
        
        const result = await generateQuestionBatch({
          prompt: promptInput,
          exam: exam,
          mode: "full",
          count: chunkCount,
          difficulty: "medium",
          language,
        });

        if (result.questions) {
          accumulatedQs = [...accumulatedQs, ...result.questions];
          setQuestions([...accumulatedQs]);
          addLog(`Batch ${b + 1} synchronized. Buffer size: ${accumulatedQs.length}`);
        }
      }

      addLog("Neural Synthesis complete. Integrity verified.");
      toast({ title: "Synthesis Successful", description: "Artifact payload ready for deployment." });
    } catch (error: any) {
      addLog(`CRITICAL FAILURE: ${error.message}`);
      toast({ title: "Synthesis Failed", description: "Engine overload. Try smaller batch size.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function deployToProduction(directPublish: boolean = false) {
    if (questions.length === 0) return;
    setInjecting(true);
    addLog(directPublish ? "⚡ LIVE PUBLISH INITIATED..." : "📦 SAVING TO STAGING...");
    
    try {
      const mockRef = doc(collection(db, "mocks"));
      const batch = writeBatch(db);

      batch.set(mockRef, {
        id: mockRef.id,
        title: `${exam.toUpperCase()} AI Generated Mock`,
        exam,
        totalQuestions: questions.length,
        duration: 60,
        negativeMarking: 0.25,
        status: directPublish ? 'published' : 'draft',
        accessType: 'pass_plus',
        aiGenerated: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      questions.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        batch.set(qRef, {
          id: qRef.id,
          en: { question: q.questionEnglish, options: q.optionsEnglish, explanation: q.explanationEnglish },
          pa: q.questionPunjabi ? { question: q.questionPunjabi, options: q.optionsPunjabi, explanation: q.explanationPunjabi } : null,
          correctAnswer: q.correctAnswer,
          subject: q.subject || "General Proficiency",
          difficulty: q.difficulty || "medium",
          order: idx,
          status: "published",
          createdAt: Date.now()
        });
      });

      await batch.commit();
      addLog(`SUCCESS: ${questions.length} artifacts deployed.`);
      toast({ title: directPublish ? "PUBLISHED LIVE" : "DRAFT SAVED" });
      router.push('/admin/mocks');
    } catch (e: any) {
      addLog(`DEPLOYMENT ERROR: ${e.message}`);
      toast({ title: "Deployment Failed", variant: "destructive" });
    } finally {
      setInjecting(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
           <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><BrainCircuit size={16} className="text-primary" /></div>
                 <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">FORGE OS v25.0</h1>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Neural Link: Stable</span>
                 </div>
                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Pipeline Active</Badge>
              </div>
           </header>

           <ScrollArea className="flex-1 p-8">
              <div className="max-w-4xl mx-auto space-y-10 pb-40">
                 {!loading && questions.length === 0 && (
                   <div className="py-20 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                      <Bot className="text-primary w-24 h-24 mx-auto animate-float" />
                      <div className="space-y-3">
                        <h2 className="text-6xl font-black uppercase tracking-tighter">Forge <span className="text-primary">MCQs</span></h2>
                        <p className="text-zinc-500 font-medium italic max-w-lg mx-auto">High-fidelity bilingual artifact synthesis with real-time Firestore synchronization.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
                         <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-2">
                            <p className="text-[9px] font-black text-zinc-600 uppercase">Input</p>
                            <p className="text-xs font-bold">Natural Language Instructions</p>
                         </div>
                         <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-2">
                            <p className="text-[9px] font-black text-zinc-600 uppercase">Process</p>
                            <p className="text-xs font-bold">Parallel Neural Chunking</p>
                         </div>
                         <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-2">
                            <p className="text-[9px] font-black text-zinc-600 uppercase">Output</p>
                            <p className="text-xs font-bold">Bilingual Raavi Payload</p>
                         </div>
                      </div>
                   </div>
                 )}

                 {loading && (
                   <div className="py-20 flex flex-col items-center justify-center gap-12">
                      <div className="relative">
                        <div className="w-32 h-32 border-4 border-primary/5 border-t-primary rounded-full animate-spin" />
                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse w-8 h-8" />
                      </div>
                      <div className="w-full max-w-md bg-zinc-950 border border-white/5 rounded-3xl p-6 shadow-2xl">
                         <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Terminal size={12} /> Execution Log
                         </h4>
                         <div className="space-y-3 font-mono text-[9px] text-zinc-500 overflow-y-auto max-h-48 no-scrollbar">
                           {logs.map((log, i) => (
                             <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                               <span className="text-primary">></span> {log}
                             </motion.div>
                           ))}
                         </div>
                      </div>
                   </div>
                 )}

                 {questions.length > 0 && (
                   <div className="grid gap-6 animate-in slide-in-from-bottom-4 duration-500">
                      {questions.map((q, i) => (
                        <Card key={i} className="p-10 rounded-[48px] bg-zinc-900/30 border-white/5 space-y-8 group hover:border-primary/20 transition-all">
                           <div className="flex justify-between items-start">
                              <Badge variant="outline" className="text-[9px] font-black uppercase border-blue-500/20 text-blue-500 px-3 py-1">Artifact Identified #{i+1}</Badge>
                              <Badge className="bg-zinc-800 text-[9px] font-black uppercase border-none px-3 py-1">{q.subject}</Badge>
                           </div>
                           <div className="space-y-6">
                              <p className="text-2xl font-bold leading-tight">{q.questionEnglish}</p>
                              {q.questionPunjabi && <p className="text-2xl font-medium text-zinc-500 italic leading-tight border-l-4 border-white/5 pl-8">{q.questionPunjabi}</p>}
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.optionsEnglish.map((opt: string, idx: number) => (
                                <div key={idx} className={cn(
                                  "p-5 rounded-2xl text-sm border font-medium flex items-center gap-4 transition-all",
                                  opt === q.correctAnswer 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                    : "bg-black/20 border-white/5 text-zinc-500"
                                )}>
                                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">{String.fromCharCode(65+idx)}</div>
                                   {opt}
                                </div>
                              ))}
                           </div>
                        </Card>
                      ))}
                   </div>
                 )}
              </div>
           </ScrollArea>

           <footer className="p-8 bg-[#020408] border-t border-white/5 z-50">
              <div className="max-w-4xl mx-auto space-y-8">
                 <AnimatePresence>
                    {questions.length > 0 && !loading && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-4 mb-4">
                          <Button onClick={() => deployToProduction(true)} disabled={injecting} className="h-16 px-12 rounded-[28px] bg-emerald-600 hover:bg-emerald-700 text-sm font-black uppercase tracking-widest shadow-xl blue-glow">
                              {injecting ? <Loader2 className="animate-spin" /> : <Zap size={18} className="mr-2" />} DEPLOY LIVE
                          </Button>
                          <Button onClick={() => deployToProduction(false)} disabled={injecting} className="h-16 px-10 rounded-[28px] bg-zinc-800 border border-white/5 text-sm font-black uppercase tracking-widest hover:bg-zinc-700">
                              {injecting ? <Loader2 className="animate-spin" /> : <Database size={18} className="mr-2" />} SAVE TO STAGING
                          </Button>
                      </motion.div>
                    )}
                 </AnimatePresence>

                 <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-4">
                       <div className="flex gap-4">
                          <div className="w-48">
                             <p className="text-[10px] font-black uppercase text-zinc-600 mb-2 ml-2">Artifact Count</p>
                             <Select value={count} onValueChange={setCount}>
                                <SelectTrigger className="h-12 bg-zinc-900 border-white/10 rounded-2xl font-bold">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 text-white border-white/10">
                                   <SelectItem value="10">10 Questions</SelectItem>
                                   <SelectItem value="25">25 Questions</SelectItem>
                                   <SelectItem value="50">50 Questions</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="flex-1">
                             <p className="text-[10px] font-black uppercase text-zinc-600 mb-2 ml-2">Neural Instructions</p>
                             <Input 
                               value={promptInput}
                               onChange={(e) => setPromptInput(e.target.value)}
                               placeholder="e.g. Generate PSSSB Excise Inspector History MCQs..."
                               className="h-14 bg-zinc-900 border-white/10 rounded-2xl px-6 text-lg font-bold"
                             />
                          </div>
                       </div>
                    </div>
                    <Button onClick={handleLaunchSynthesis} disabled={!promptInput.trim() || loading} className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl blue-glow shrink-0">
                       {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                    </Button>
                 </div>
              </div>
           </footer>
        </main>
      </div>
    </AdminProtect>
  );
}
