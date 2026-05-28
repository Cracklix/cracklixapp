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
  Settings,
  Mic,
  MicOff,
  ShieldCheck,
  Zap,
  BrainCircuit,
  History,
  Trash2,
  CheckCircle2,
  Clock,
  LayoutGrid,
  AlertTriangle,
  Terminal,
  Activity,
  Timer as TimerIcon,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useRouter } from 'next/navigation';

const EXAM_DATABASE = {
  "PSSSB": [
    { id: "clerk", name: "PSSSB Clerk / IT / Accounts" },
    { id: "sa", name: "Senior Assistant (Group B)" },
    { id: "ei", name: "Excise Inspector" },
  ],
  "Punjab Police": [
    { id: "psi", name: "Sub-Inspector (SI)" },
    { id: "pc", name: "Constable" },
  ]
};

export default function AiMockOS() {
  const { toast } = useToast();
  const router = useRouter();
  const [promptInput, setPromptInput] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Calibration State
  const [exam, setExam] = useState("clerk");
  const [count, setCount] = useState("10");
  const [language, setLanguage] = useState("en_pa");

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setPromptInput(transcript);
  }, [transcript]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);

  /**
   * Enterprise Retry Engine
   * Retries on 503 or Overload errors with exponential backoff.
   */
  async function robustBatchGenerate(batchInput: MockGeneratorInput, attempt = 1): Promise<any> {
    try {
      addLog(`Requesting Neural Chunk (Attempt ${attempt}/3)...`);
      return await generateQuestionBatch(batchInput);
    } catch (err: any) {
      if (attempt < 3) {
        const delay = attempt * 2000;
        addLog(`System Busy: ${err.message}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        return robustBatchGenerate(batchInput, attempt + 1);
      }
      throw err;
    }
  }

  async function handleLaunchSynthesis() {
    if (!promptInput.trim()) return;
    setLoading(true);
    setQuestions([]);
    setLogs([]);
    addLog("Initializing FORGE OS v12.0...");

    const totalCount = Number(count);
    const batchSize = 5; // Chunking to prevent 503 timeouts
    const totalBatches = Math.ceil(totalCount / batchSize);

    try {
      let accumulatedQs: any[] = [];

      for (let b = 0; b < totalBatches; b++) {
        const chunkCount = Math.min(batchSize, totalCount - accumulatedQs.length);
        addLog(`Forging Batch ${b + 1}/${totalBatches} (${chunkCount} questions)...`);
        
        const result = await robustBatchGenerate({
          prompt: promptInput,
          exam: exam,
          mode: "full",
          count: chunkCount,
          difficulty: "balanced",
          language,
        });

        if (result.questions) {
          accumulatedQs = [...accumulatedQs, ...result.questions];
          setQuestions([...accumulatedQs]);
          addLog(`Batch ${b + 1} synced. Buffer size: ${accumulatedQs.length}`);
        }
      }

      addLog("Neural Synthesis complete. Integrity verified.");
      toast({ title: "Synthesis Successful", description: "Payload ready for publish." });
    } catch (error: any) {
      addLog(`CRITICAL FAILURE: ${error.message}`);
      toast({ title: "Generation Failed", description: "AI overload. Try a smaller batch.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function executeWorkflow(directPublish: boolean = false) {
    if (questions.length === 0) return;
    setInjecting(true);
    addLog(directPublish ? "⚡ LIVE PUBLISH INITIATED..." : "📦 SAVING DRAFT...");
    
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
          subject: q.subject || "General",
          difficulty: q.difficulty || "medium",
          order: idx,
          createdAt: Date.now()
        });
      });

      await batch.commit();
      addLog(`SUCCESS: ${questions.length} artifacts deployed.`);
      toast({ title: directPublish ? "PUBLISHED LIVE" : "DRAFT SAVED" });
      if (directPublish) router.push('/admin/mocks');
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
                 <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">FORGE ENGINE v12.0</h1>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Pipeline: Active</Badge>
           </header>

           <ScrollArea className="flex-1 p-8">
              <div className="max-w-4xl mx-auto space-y-10 pb-40">
                 {!loading && questions.length === 0 && (
                   <div className="py-20 text-center space-y-8">
                      <Bot className="text-primary w-20 h-20 mx-auto animate-pulse" />
                      <div className="space-y-2">
                        <h2 className="text-5xl font-black uppercase tracking-tighter">Forge <span className="text-primary">MCQs</span></h2>
                        <p className="text-zinc-500 font-medium italic">High-fidelity bilingual artifact synthesis with real-time Firestore sync.</p>
                      </div>
                   </div>
                 )}

                 {loading && (
                   <div className="py-20 flex flex-col items-center justify-center gap-8">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
                      </div>
                      <div className="text-center space-y-3 font-mono text-[10px] text-zinc-600">
                        {logs.map((log, i) => <div key={i} className="flex gap-2"><span className="text-primary">></span> {log}</div>)}
                      </div>
                   </div>
                 )}

                 {questions.length > 0 && (
                   <div className="grid gap-6">
                      {questions.map((q, i) => (
                        <Card key={i} className="p-8 rounded-[32px] bg-zinc-950 border border-white/5 space-y-6">
                           <div className="flex justify-between items-start">
                              <Badge variant="outline" className="text-[8px] font-black uppercase border-blue-500/20 text-blue-500">Artifact #{i+1}</Badge>
                              <Badge className="bg-zinc-800 text-[8px] font-black uppercase">{q.subject}</Badge>
                           </div>
                           <div className="space-y-4">
                              <p className="text-xl font-bold leading-relaxed">{q.questionEnglish}</p>
                              {q.questionPunjabi && <p className="text-xl font-medium text-zinc-400 italic leading-relaxed">{q.questionPunjabi}</p>}
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              {q.optionsEnglish.map((opt: string, idx: number) => (
                                <div key={idx} className={cn("p-4 rounded-2xl text-xs border", opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
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
              <div className="max-w-4xl mx-auto space-y-6">
                 <AnimatePresence>
                    {questions.length > 0 && !loading && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-4 mb-4">
                          <Button onClick={() => executeWorkflow(true)} disabled={injecting} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-xl blue-glow">
                              {injecting ? <Loader2 className="animate-spin" /> : <Zap size={18} className="mr-2" />} ⚡ LIVE PUBLISH
                          </Button>
                          <Button onClick={() => executeWorkflow(false)} disabled={injecting} className="h-14 px-8 rounded-2xl bg-zinc-800 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700">
                              {injecting ? <Loader2 className="animate-spin" /> : <Database size={18} className="mr-2" />} 📦 SAVE DRAFT
                          </Button>
                      </motion.div>
                    )}
                 </AnimatePresence>

                 <div className="flex gap-4">
                    <Input 
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Instruct AI: 'Generate Maharaja Ranjit Singh MCQs'..."
                      className="h-16 bg-zinc-900 border-white/10 rounded-2xl px-6 text-lg font-bold"
                    />
                    <Button onClick={handleLaunchSynthesis} disabled={!promptInput.trim() || loading} className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl blue-glow">
                       {loading ? <Loader2 className="animate-spin" /> : <Send />}
                    </Button>
                 </div>
              </div>
           </footer>
        </main>
      </div>
    </AdminProtect>
  );
}
