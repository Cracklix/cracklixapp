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
  BookOpen,
  Rocket,
  Zap,
  Globe,
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
  "PSSSB (Groups A-D)": [
    { id: "clerk", name: "PSSSB Clerk / IT / Accounts" },
    { id: "sa", name: "Senior Assistant (Group B)" },
    { id: "ei", name: "Excise Inspector" },
    { id: "patwari", name: "Revenue Patwari" },
    { id: "audit", name: "Audit Inspector" },
    { id: "warder", name: "Jail Warder" },
  ],
  "Technical Cadre": [
    { id: "je_civil", name: "JE Civil (PSSSB/PSPCL)" },
    { id: "je_elec", name: "JE Electrical (PSSSB/PSPCL)" },
    { id: "je_mech", name: "JE Mechanical (PSSSB/PSTCL)" },
    { id: "lab", name: "Lab Attendant" },
  ],
  "Punjab Police": [
    { id: "psi", name: "Sub-Inspector (SI)" },
    { id: "pc", name: "Constable" },
    { id: "intelligence", name: "Intelligence Assistant" },
  ],
  "Teaching & Center": [
    { id: "pstet_1", name: "PSTET Paper 1" },
    { id: "pstet_2", name: "PSTET Paper 2" },
    { id: "ctet", name: "CTET National" },
  ],
  "Other Authorities": [
    { id: "custom", name: "Other / Custom Board..." },
  ]
};

const SUBJECT_LIST = [
  "General Knowledge", "Current Affairs", "Punjab History", "Punjab Culture", "Punjabi", 
  "English", "Hindi", "Reasoning", "Quantitative Aptitude", "ICT & Computers", 
  "Science", "Environmental Studies", "Child Development & Pedagogy", 
  "Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Other"
];

const STAGES = [
  { id: 'parsing', label: 'Scanning Syllabus Pattern' },
  { id: 'batching', label: 'Initializing Neural Batch' },
  { id: 'synthesis', label: 'Parallel MCQ Synthesis' },
  { id: 'validation', label: 'Vector Alignment Check' },
  { id: 'finalizing', label: 'Finalizing Simulation' },
];

export default function AiMockOS() {
  const { toast } = useToast();
  const router = useRouter();
  const [promptInput, setPromptInput] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Calibration State
  const [exam, setExam] = useState("clerk");
  const [customExamName, setCustomExamName] = useState("");
  const [mode, setMode] = useState("full");
  const [subject, setSubject] = useState("General Knowledge");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [count, setCount] = useState("20");
  const [customCount, setCustomCount] = useState("");
  const [language, setLanguage] = useState("en_pa");
  const [negativeMarking, setNegativeMarking] = useState("0.25");
  const [timeMode, setTimeMode] = useState("auto");
  const [customDuration, setCustomDuration] = useState("60");

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setPromptInput(transcript);
  }, [transcript]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);

  async function robustBatchGenerate(batchInput: MockGeneratorInput, attempt = 1): Promise<any> {
    try {
      addLog(`Requesting Neural Chunk (Attempt ${attempt}/3)...`);
      return await generateQuestionBatch(batchInput);
    } catch (err: any) {
      if (attempt < 3) {
        const delay = attempt * 2000;
        addLog(`Retrying Signal: ${err.message}. Fallback engine in ${delay}ms...`);
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
    setCurrentStage(0);
    addLog("Initializing NEURAL FORGE CORE v12...");

    const examName = exam === 'custom' ? customExamName : (Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || "Punjab Exam");
    const totalCount = count === "custom" ? Number(customCount) : Number(count);
    
    const batchSize = 5; // Fixed small size for maximum stability
    const totalBatches = Math.ceil(totalCount / batchSize);

    try {
      setCurrentStage(0);
      addLog(`Payload Identified: ${totalCount} Questions across ${totalBatches} chunks.`);

      let accumulatedQs: any[] = [];

      for (let b = 0; b < totalBatches; b++) {
        setCurrentStage(2); 
        const chunkCount = Math.min(batchSize, totalCount - accumulatedQs.length);
        
        addLog(`Forging Batch ${b + 1}/${totalBatches} (${chunkCount} questions)...`);
        
        const result = await robustBatchGenerate({
          prompt: `${promptInput} | Subject Area: ${subject === 'Other' ? customSubjectName : subject}`,
          exam: examName,
          mode,
          count: chunkCount,
          difficulty: "balanced",
          language,
        });

        if (result.questions) {
          const validQs = result.questions.filter((q: any) => q.questionEnglish && q.optionsEnglish?.length === 4);
          accumulatedQs = [...accumulatedQs, ...validQs];
          setQuestions([...accumulatedQs]);
          addLog(`Batch ${b + 1} validated and linked. Pool size: ${accumulatedQs.length}`);
        }
      }

      setCurrentStage(4);
      addLog("Neural Synthesis complete. Payload integrity verified.");
      toast({ title: "Synthesis Successful", description: "Simulation architecture ready for publish." });
    } catch (error: any) {
      addLog(`SYSTEM BREACH: ${error.message}`);
      toast({ title: "Generation Breach", description: "Pipeline timeout. Please retry with smaller batch.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function executeWorkflow(directPublish: boolean = false) {
    if (questions.length === 0) return;
    setInjecting(true);
    addLog(directPublish ? "⚡ EXECUTING LIVE PUBLISH..." : "📦 SAVING DRAFT...");
    
    try {
      const mockRef = doc(collection(db, "mocks"));
      const batch = writeBatch(db);

      const examName = exam === 'custom' ? customExamName : (Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || "Punjab Exam");
      const totalCount = questions.length;

      // Auto-Timer Intelligence
      let duration = Number(customDuration);
      if (timeMode === 'auto') {
        if (totalCount <= 10) duration = 15;
        else if (totalCount <= 25) duration = 20;
        else if (totalCount <= 50) duration = 45;
        else if (totalCount <= 100) duration = 90;
        else duration = 120;
      }

      batch.set(mockRef, {
        id: mockRef.id,
        title: `${examName} ${mode.toUpperCase()} Simulation`,
        exam: examName,
        category: mode,
        totalQuestions: totalCount,
        duration: duration,
        negativeMarking: Number(negativeMarking),
        status: directPublish ? 'published' : 'draft',
        accessType: 'pass_plus',
        aiGenerated: true,
        languageMode: language,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        publishedAt: directPublish ? Date.now() : null
      });

      questions.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        batch.set(qRef, {
          id: qRef.id,
          en: { question: q.questionEnglish, options: q.optionsEnglish, explanation: q.explanationEnglish },
          pa: q.questionPunjabi ? { question: q.questionPunjabi, options: q.optionsPunjabi, explanation: q.explanationPunjabi } : null,
          hi: q.questionHindi ? { question: q.questionHindi, options: q.optionsHindi, explanation: q.explanationHindi } : null,
          correctAnswer: q.correctAnswer,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          order: idx,
          createdAt: Date.now()
        });
      });

      await batch.commit();
      addLog(`SUCCESS: ${questions.length} artifacts deployed to Live Arena.`);
      toast({ title: directPublish ? "LIVE PUBLISH SUCCESSFUL" : "DRAFT SAVED" });
      
      if (directPublish) router.push('/admin/mocks');
      else setQuestions([]);

    } catch (e: any) {
      addLog(`FATAL INJECTION ERROR: ${e.message}`);
      toast({ title: "Deployment Failed", variant: "destructive" });
    } finally {
      setInjecting(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-row h-screen overflow-hidden">
          <div className="flex-1 flex flex-col relative bg-[#020408] overflow-hidden" style={{ width: 'calc(100% - 380px)' }}>
             <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><BrainCircuit size={16} className="text-primary" /></div>
                   <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">NEURAL FORGE v12.0</h1>
                </div>
                <div className="flex items-center gap-4">
                   <Badge className="bg-emerald-500/10 text-emerald-500 border-none animate-pulse text-[8px] font-black uppercase">Core Status: Nominal</Badge>
                </div>
             </header>

             <ScrollArea className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-12 pb-40">
                   {!loading && questions.length === 0 && (
                     <div className="py-24 text-center space-y-12">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-32 h-32 rounded-[40px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative group">
                           <Bot className="text-primary w-16 h-16 group-hover:scale-110 transition-transform" />
                           <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full animate-pulse" />
                        </motion.div>
                        <div className="space-y-4">
                           <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Forge <span className="text-primary">Intelligence</span></h2>
                           <p className="text-zinc-500 font-medium text-xl max-w-2xl mx-auto italic leading-relaxed">
                              "Instant high-fidelity recruitment simulations for PSSSB, Police, and Technical Boards. Direct live publish enabled."
                           </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 pt-10">
                           <button onClick={() => setPromptInput("Create 100Q PSSSB Excise Mock")} className="px-6 py-3 rounded-2xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">Create 100Q PSSSB Excise Mock</button>
                           <button onClick={() => setPromptInput("Punjab Police SI Revision Set")} className="px-6 py-3 rounded-2xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">Punjab Police SI Revision</button>
                           <button onClick={() => setPromptInput("JE Electrical Full Paper")} className="px-6 py-3 rounded-2xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">JE Electrical Full Paper</button>
                        </div>
                     </div>
                   )}

                   {loading && (
                     <div className="py-40 flex flex-col items-center justify-center gap-12">
                        <div className="relative">
                           <div className="w-32 h-32 border-4 border-primary/5 border-t-primary rounded-full animate-spin" />
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <Zap className="text-primary animate-pulse" />
                           </div>
                        </div>
                        <div className="text-center space-y-4">
                           <h3 className="text-2xl font-black uppercase tracking-[0.2em] animate-pulse">{STAGES[currentStage].label}</h3>
                           <div className="space-y-2 font-mono text-[11px] text-zinc-600 max-w-md mx-auto">
                             {logs.map((log, i) => <div key={i} className="flex gap-2"><span className="text-primary">&gt;&gt;</span> {log}</div>)}
                           </div>
                        </div>
                     </div>
                   )}

                   {questions.length > 0 && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        <div className="grid gap-10">
                          {questions.map((q, idx) => (
                            <div key={idx} className="p-8 rounded-[40px] bg-zinc-950 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                  <div className="space-y-4">
                                     <Badge variant="outline" className="border-blue-500/20 text-blue-500 text-[9px] font-black uppercase">Payload (EN)</Badge>
                                     <p className="font-bold text-lg leading-relaxed text-zinc-100">{q.questionEnglish}</p>
                                     <div className="space-y-2 pt-4">
                                        {q.optionsEnglish.map((opt: string, i: number) => (
                                          <div key={i} className={cn("p-3 rounded-xl text-xs border flex items-center gap-3", opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
                                            <span className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center text-[10px]">{String.fromCharCode(65+i)}</span>
                                            {opt}
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                                  <div className="space-y-4 border-l border-white/5 pl-12">
                                     <Badge variant="outline" className="border-orange-500/20 text-orange-500 text-[9px] font-black uppercase">Native Signal</Badge>
                                     <p className="text-lg font-medium text-zinc-300 leading-relaxed italic">{q.questionPunjabi || q.questionHindi}</p>
                                     <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mt-6">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase mb-2">Rationalization</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed italic">{q.explanationEnglish}</p>
                                     </div>
                                  </div>
                               </div>
                               <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                  <span>{q.subject}</span> • <span>{q.difficulty}</span> • <span>Artifact ID: {idx + 1}</span>
                               </div>
                            </div>
                          ))}
                        </div>
                     </motion.div>
                   )}
                </div>
             </ScrollArea>

             <footer className="p-8 bg-[#020408] border-t border-white/5 z-50">
                <div className="max-w-4xl mx-auto space-y-6">
                   <AnimatePresence>
                      {questions.length > 0 && !loading && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-4 p-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] shadow-2xl mb-4">
                            <Button onClick={() => executeWorkflow(true)} disabled={injecting} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-xl blue-glow">
                                {injecting ? <Loader2 className="animate-spin" /> : <Zap size={18} className="mr-2" />} ⚡ LIVE PUBLISH
                            </Button>
                            <Button onClick={() => executeWorkflow(false)} disabled={injecting} className="h-14 px-8 rounded-2xl bg-zinc-800 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700">
                                {injecting ? <Loader2 className="animate-spin" /> : <Database size={18} className="mr-2" />} 📦 SAVE DRAFT
                            </Button>
                            <Button variant="ghost" onClick={() => setQuestions([])} className="h-14 px-6 rounded-2xl text-zinc-600 hover:text-white font-black text-[10px] uppercase">Flush Session</Button>
                        </motion.div>
                      )}
                   </AnimatePresence>

                   <div className="relative group">
                      <Input 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLaunchSynthesis()}
                        placeholder="Instruct Forge OS: 'Create a 100Q PSSSB Excise Inspector mock'..."
                        className="h-20 bg-zinc-900 border-white/10 rounded-[28px] pl-8 pr-[280px] text-lg font-bold transition-all focus:ring-primary/20 shadow-2xl"
                      />
                      <div className="absolute right-4 top-3 flex gap-3">
                         {browserSupportsSpeechRecognition && (
                           <button onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all", listening ? "bg-red-500 text-white shadow-lg" : "bg-black/40 text-zinc-600 hover:text-white border border-white/5")}>
                              {listening ? <MicOff size={24} /> : <Mic size={24} />}
                           </button>
                         )}
                         <Button onClick={handleLaunchSynthesis} disabled={!promptInput.trim() || loading} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs uppercase shadow-xl blue-glow">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Send size={22} className="mr-2" />}
                            GENERATE
                         </Button>
                      </div>
                   </div>
                </div>
             </footer>
          </div>

          <aside className="w-[380px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
             <header className="p-8 border-b border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">Institutional Calibration</span>
                <Settings size={14} className="text-zinc-700" />
             </header>
             
             <div className="p-8 space-y-10 pb-24">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Authority Board</label>
                   <Select value={exam} onValueChange={setExam}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xs uppercase px-6 shadow-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         {Object.entries(EXAM_DATABASE).map(([board, exams]) => (
                           <SelectGroup key={board}>
                              <SelectLabel className="text-primary text-[9px] font-black uppercase py-3 px-6 bg-white/[0.02]">{board}</SelectLabel>
                              {exams.map(ex => <SelectItem key={ex.id} value={ex.id} className="py-3 px-6">{ex.name}</SelectItem>)}
                           </SelectGroup>
                         ))}
                      </SelectContent>
                   </Select>
                   {exam === 'custom' && (
                     <Input placeholder="Manual Exam Name..." value={customExamName} onChange={e => setCustomExamName(e.target.value)} className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-black px-6" />
                   )}
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Simulation Mode</label>
                   <Select value={mode} onValueChange={setMode}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="full">Full Mock (Standard)</SelectItem>
                         <SelectItem value="sectional">Sectional Drill</SelectItem>
                         <SelectItem value="pyq">PYQ Neural Clone</SelectItem>
                         <SelectItem value="revision">Rapid Revision</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Subject Index</label>
                   <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                   </Select>
                   {subject === 'Other' && (
                     <Input placeholder="Manual Subject Name..." value={customSubjectName} onChange={e => setCustomSubjectName(e.target.value)} className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-black px-6" />
                   )}
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Questions Count</label>
                   <Select value={count} onValueChange={setCount}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         {["10", "20", "50", "100", "150", "custom"].map(c => <SelectItem key={c} value={c}>{c === 'custom' ? 'Manual Override' : `${c} Artifacts`}</SelectItem>)}
                      </SelectContent>
                   </Select>
                   {count === 'custom' && (
                     <Input type="number" placeholder="Enter count..." value={customCount} onChange={e => setCustomCount(e.target.value)} className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-black px-6" />
                   )}
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Time Configuration</label>
                   <Select value={timeMode} onValueChange={setTimeMode}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="auto">Auto Logic (Testbook Mode)</SelectItem>
                         <SelectItem value="manual">Manual Override (Mins)</SelectItem>
                      </SelectContent>
                   </Select>
                   {timeMode === 'manual' && (
                     <Input type="number" placeholder="Duration..." value={customDuration} onChange={e => setCustomDuration(e.target.value)} className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-black px-6" />
                   )}
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Negative Coefficient</label>
                   <Select value={negativeMarking} onValueChange={setNegativeMarking}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="0">Zero Penalty</SelectItem>
                         <SelectItem value="0.25">0.25 Marks</SelectItem>
                         <SelectItem value="0.50">0.50 Marks</SelectItem>
                         <SelectItem value="1.0">1.00 Marks</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Linguistic Mode</label>
                   <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="en">English Only</SelectItem>
                         <SelectItem value="pa">Punjabi Only</SelectItem>
                         <SelectItem value="hi">Hindi Only</SelectItem>
                         <SelectItem value="en_pa">Bilingual (EN + PA)</SelectItem>
                         <SelectItem value="en_hi">Bilingual (EN + HI)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 space-y-4">
                   <div className="flex items-center gap-3">
                      <Terminal size={14} className="text-primary" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Forge Pulse</h4>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black uppercase text-zinc-600">
                         <span>Pipeline Status</span>
                         <span className="text-emerald-500">Ready</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-full animate-pulse opacity-50" />
                      </div>
                   </div>
                </div>
             </div>
          </aside>
        </main>
      </div>
    </AdminProtect>
  );
}
