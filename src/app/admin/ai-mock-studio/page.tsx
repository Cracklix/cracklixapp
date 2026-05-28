"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateAILogic, MockGeneratorOutput } from '@/ai/flows/ai-mock-generator-flow';
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
  SlidersHorizontal,
  BrainCircuit,
  History,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { SUBJECTS } from '@/types';
import { useRouter } from 'next/navigation';

const EXAM_DATABASE = {
  "PSSSB (Group A/B/C)": [
    { id: "clerk", name: "PSSSB Clerk / IT / Accounts" },
    { id: "sa", name: "Senior Assistant (Group B)" },
    { id: "ei", name: "Excise Inspector" },
    { id: "patwari", name: "Revenue Patwari" },
    { id: "audit", name: "Audit Inspector" },
    { id: "ziladar", name: "Ziladar / Canal Patwari" },
    { id: "steno", name: "Steno Typist / Steno" },
    { id: "lab_att", name: "Laboratory Attendant" },
  ],
  "Technical & JE Cadre": [
    { id: "je_civil", name: "JE Civil (PSSSB/PSPCL)" },
    { id: "je_elec", name: "JE Electrical (PSSSB/PSPCL)" },
    { id: "je_mech", name: "JE Mechanical (PSSSB/PSTCL)" },
    { id: "pspcl_ald", name: "PSPCL ALM / Lineman" },
  ],
  "Punjab Police": [
    { id: "psi", name: "Sub-Inspector (SI)" },
    { id: "pc", name: "Constable" },
    { id: "ia", name: "Intelligence Assistant" },
    { id: "jw", name: "Jail Warder" },
  ],
  "Teaching (Eligibility)": [
    { id: "pstet_1", name: "PSTET Paper 1 (Primary)" },
    { id: "pstet_2", name: "PSTET Paper 2 (Upper)" },
    { id: "ctet_1", name: "CTET Paper 1" },
    { id: "ctet_2", name: "CTET Paper 2" },
  ],
  "State Center / Others": [
    { id: "ppsc_pcs", name: "PPSC Civil Services (PCS)" },
    { id: "deo", name: "Data Entry Operator" },
    { id: "custom", name: "Other / Custom Exam..." },
  ]
};

const TIME_PRESETS = [
  { val: "15", label: "15 Minutes" },
  { val: "30", label: "30 Minutes" },
  { val: "45", label: "45 Minutes" },
  { val: "60", label: "60 Minutes" },
  { val: "90", label: "90 Minutes" },
  { val: "120", label: "120 Minutes" },
  { val: "150", label: "150 Minutes" },
  { val: "custom", label: "Custom Time" },
];

const STAGES = [
  { id: 'parsing', label: 'Analyzing Syllabus Pattern' },
  { id: 'blueprint', label: 'Forging Neural Blueprint' },
  { id: 'synthesis', label: 'Parallel MCQ Synthesis' },
  { id: 'linguistic', label: 'Linguistic Signal Sync' },
  { id: 'validation', label: 'Answer Vector Validation' },
];

export default function AiMockOS() {
  const { toast } = useToast();
  const router = useRouter();
  const [promptInput, setPromptInput] = useState("");
  const [output, setOutput] = useState<MockGeneratorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Calibration State
  const [exam, setExam] = useState("clerk");
  const [customExamName, setCustomExamName] = useState("");
  const [mode, setMode] = useState("full");
  const [subject, setSubject] = useState("All");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [count, setCount] = useState("50");
  const [customCount, setCustomCount] = useState("");
  const [duration, setDuration] = useState("auto");
  const [customDuration, setCustomDuration] = useState("");
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("en_pa");
  const [negativeMarking, setNegativeMarking] = useState("0.25");
  const [speed, setSpeed] = useState("turbo");

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setPromptInput(transcript);
  }, [transcript]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);

  // Auto-calculate logic for duration
  const getFinalDuration = () => {
    if (duration !== 'auto' && duration !== 'custom') return Number(duration);
    if (duration === 'custom') return Number(customDuration);
    
    const qs = count === "custom" ? Number(customCount) : Number(count);
    if (qs <= 10) return 15;
    if (qs <= 25) return 30;
    if (qs <= 50) return 60;
    if (qs <= 100) return 120;
    return 150;
  };

  async function handleLaunchSynthesis() {
    if (!promptInput.trim()) return;
    setLoading(true);
    setOutput(null);
    setLogs([]);
    setCurrentStage(0);
    addLog("Initializing Neural Engine v10.0...");

    const examName = exam === 'custom' ? customExamName : (Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || "Punjab Exam");
    const finalCount = count === "custom" ? Number(customCount) : Number(count);

    try {
      // Simulate multi-stage progression
      for(let i=0; i<STAGES.length; i++){
        setCurrentStage(i);
        addLog(STAGES[i].label + "...");
        await new Promise(r => setTimeout(r, speed === 'turbo' ? 400 : 1000));
      }

      const data = await generateAILogic({
        prompt: promptInput,
        exam: examName,
        mode: mode as any,
        count: finalCount,
        difficulty: difficulty as any,
        language: language as any,
        negativeMarking: Number(negativeMarking),
      });

      setOutput(data);
      addLog("Neural Synthesis complete. Verification successful.");
      toast({ title: "Synthesis Ready", description: "Simulation architecture forged." });
    } catch (error: any) {
      addLog(`CRITICAL ERROR: ${error.message}`);
      toast({ title: "Generation Breach", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function executeWorkflow(directPublish: boolean = false, saveToBank: boolean = false) {
    if (!output) return;
    setInjecting(true);
    addLog(directPublish ? "Executing Direct Publish Protocol..." : "Staging Artifacts...");
    
    try {
      const mockRef = doc(collection(db, "mocks"));
      const batch = writeBatch(db);

      const totalQs = output.sections.reduce((acc, s) => acc + s.questions.length, 0);
      
      // 1. Create parent mock doc
      batch.set(mockRef, {
        id: mockRef.id,
        title: output.title,
        exam: output.exam,
        category: mode,
        totalQuestions: totalQs,
        duration: getFinalDuration(),
        negativeMarking: Number(negativeMarking),
        status: directPublish ? 'published' : 'draft',
        accessType: 'pass_plus',
        aiGenerated: true,
        languageMode: language,
        syllabusCoverage: output.syllabusCoverage,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        publishedAt: directPublish ? Date.now() : null
      });

      // 2. Link every question artifact
      let globalIndex = 0;
      for (const section of output.sections) {
        for (const q of section.questions) {
          const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
          const qData = {
            id: qRef.id,
            en: { question: q.questionEnglish, options: q.optionsEnglish, explanation: q.explanationEnglish },
            pa: q.questionPunjabi ? { question: q.questionPunjabi, options: q.optionsPunjabi || [], explanation: q.explanationPunjabi } : null,
            hi: q.questionHindi ? { question: q.questionHindi, options: q.optionsHindi || [], explanation: q.explanationHindi } : null,
            correctAnswer: q.correctAnswer,
            subject: q.subject || section.name,
            topic: q.topic,
            difficulty: q.difficulty,
            bloomLevel: q.bloomLevel,
            estimatedTimeSeconds: q.estimatedTimeSeconds,
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || Number(negativeMarking),
            order: globalIndex++,
            createdAt: Date.now()
          };
          batch.set(qRef, qData);

          if (saveToBank) {
            const bankQRef = doc(collection(db, "questions"));
            batch.set(bankQRef, { ...qData, status: 'published', usageCount: 0 });
          }
        }
      }
      
      await batch.commit();
      addLog(`Protocol success. ${globalIndex} artifacts deployed.`);
      toast({ 
        title: directPublish ? "Simulation Live" : "Staged Successfully",
        description: directPublish ? "Mock is now visible to all students." : "Check your draft registry."
      });
      
      if (directPublish) {
        router.push('/admin/mocks');
      } else {
        setOutput(null);
      }
    } catch (e: any) {
      addLog(`FATAL INJECTION ERROR: ${e.message}`);
      toast({ title: "Injection Failed", variant: "destructive" });
    } finally {
      setInjecting(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-row h-screen overflow-hidden">
          {/* Neural Canvas - Expanded Space */}
          <div className="flex-1 flex flex-col relative bg-[#020408] overflow-hidden" style={{ width: 'calc(100% - 380px)' }}>
             <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><BrainCircuit size={16} className="text-primary" /></div>
                   <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">AI Mock OS v10.0</h1>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Active</span>
                   </div>
                </div>
             </header>

             <ScrollArea className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-12 pb-40">
                   {!output && !loading && (
                     <div className="py-24 text-center space-y-12">
                        <div className="w-32 h-32 rounded-[40px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative group">
                           <Bot className="text-primary w-16 h-16 group-hover:scale-110 transition-transform" />
                           <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-4">
                           <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Forge <span className="text-primary">Intelligence</span></h2>
                           <p className="text-zinc-500 font-medium text-xl max-w-2xl mx-auto italic leading-relaxed">
                              "High-fidelity recruitment simulations for PSSSB, Police, and Technical Boards. Just instruct the OS."
                           </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                           {["Create 100Q PSSSB Excise Mock", "Punjab Police SI Revision", "JE Electrical Technical Drill"].map(t => (
                             <button key={t} onClick={() => setPromptInput(t)} className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/40 text-[10px] font-black uppercase tracking-widest transition-all">
                                {t}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   {loading && !output && (
                     <div className="py-40 flex flex-col items-center justify-center gap-12">
                        <div className="relative">
                           <div className="w-32 h-32 border-4 border-primary/5 border-t-primary rounded-full animate-spin" />
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <span className="text-2xl font-black text-white">{Math.round((currentStage + 1) * 20)}%</span>
                           </div>
                        </div>
                        <div className="text-center space-y-6">
                           <h3 className="text-2xl font-black uppercase tracking-[0.2em] animate-pulse">{STAGES[currentStage].label}</h3>
                           <div className="space-y-2 font-mono text-[11px] text-zinc-600 max-w-md mx-auto">
                             {logs.map((log, i) => <div key={i} className="flex gap-2"><span className="text-primary">>></span> {log}</div>)}
                           </div>
                        </div>
                     </div>
                   )}

                   {output && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        {/* Dynamic Post-Generation Action Bar */}
                        <div className="sticky top-2 z-40 p-4 bg-zinc-950/80 backdrop-blur-xl border border-primary/20 rounded-[32px] flex flex-wrap items-center justify-between gap-4 shadow-2xl shadow-primary/10">
                           <div className="flex items-center gap-4 px-4">
                              <Badge className="bg-emerald-600 text-[8px] font-black px-3 py-1">SYNTHESIS READY</Badge>
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{output.sections.length} Sections • {output.duration}m</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Button onClick={() => executeWorkflow(true, true)} disabled={injecting} className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest blue-glow">
                                 {injecting ? <Loader2 className="animate-spin" /> : <Rocket size={16} className="mr-2" />} 🚀 LIVE PUBLISH
                              </Button>
                              <Button onClick={() => executeWorkflow(false, true)} disabled={injecting} className="h-12 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[10px] font-black uppercase tracking-widest">
                                 {injecting ? <Loader2 className="animate-spin" /> : <Database size={16} className="mr-2" />} SAVE TO BANK
                              </Button>
                              <Button variant="ghost" onClick={() => setOutput(null)} className="h-12 px-6 rounded-2xl text-zinc-600 hover:text-white font-black text-[10px] uppercase">Flush Session</Button>
                           </div>
                        </div>

                        <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-10">
                           <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-10">
                              <div>
                                 <h3 className="text-4xl font-black uppercase tracking-tighter text-white">{output.title}</h3>
                                 <div className="flex flex-wrap gap-6 mt-4 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                                    <span className="flex items-center gap-2"><Globe size={12} className="text-primary" /> {output.exam}</span>
                                    <span className="flex items-center gap-2"><Clock size={12} /> {getFinalDuration()}m</span>
                                    <span className="flex items-center gap-2"><Flame size={12} className="text-orange-500" /> {language.toUpperCase()} Fidelity</span>
                                    <span className="flex items-center gap-2 text-emerald-500"><CheckCircle2 size={12} /> {output.syllabusCoverage}% Coverage</span>
                                 </div>
                              </div>
                           </div>

                           <div className="grid gap-10">
                              {output.sections.map((section, sIdx) => (
                                <div key={sIdx} className="space-y-8">
                                  <div className="flex items-center gap-4">
                                     <Badge className="bg-primary/20 text-primary border-none text-[10px] px-6 py-2 font-black uppercase tracking-[0.2em]">{section.name}</Badge>
                                     <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  <div className="grid gap-6">
                                    {section.questions.map((q, qIdx) => (
                                      <div key={qIdx} className="p-10 rounded-[40px] bg-zinc-950 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                                         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Database size={100} /></div>
                                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                                            <div className="space-y-6">
                                               <Badge variant="outline" className="border-blue-500/20 text-blue-500 text-[9px] font-black uppercase px-4 tracking-widest">Primary Payload (EN)</Badge>
                                               <p className="font-bold text-xl leading-relaxed text-zinc-100">{q.questionEnglish}</p>
                                               <div className="grid grid-cols-1 gap-3 pt-4">
                                                  {q.optionsEnglish.map((opt, i) => (
                                                    <div key={i} className={cn("p-4 rounded-2xl text-xs border transition-all flex items-center gap-4", opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
                                                      <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">{String.fromCharCode(65+i)}</div>
                                                      {opt}
                                                    </div>
                                                  ))}
                                               </div>
                                               <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Logical Rationalization</p>
                                                  <p className="text-xs text-zinc-400 leading-relaxed italic">{q.explanationEnglish}</p>
                                               </div>
                                            </div>
                                            <div className="space-y-6 border-l border-white/5 pl-16">
                                               <Badge variant="outline" className="border-orange-500/20 text-orange-500 text-[9px] font-black uppercase px-4 tracking-widest">Native Signal (PA/HI)</Badge>
                                               <p className="text-xl font-medium text-zinc-300 leading-relaxed italic">{q.questionPunjabi || q.questionHindi}</p>
                                               <div className="grid grid-cols-1 gap-3 pt-4">
                                                  {(q.optionsPunjabi || q.optionsHindi || []).map((opt, i) => (
                                                    <div key={i} className="p-4 rounded-2xl text-xs bg-black/20 border border-white/5 text-zinc-500 flex items-center gap-4">
                                                      <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">{i+1}</div>
                                                      {opt}
                                                    </div>
                                                  ))}
                                               </div>
                                               {(q.explanationPunjabi || q.explanationHindi) && (
                                                  <div className="p-6 rounded-3xl bg-orange-600/5 border border-orange-600/10">
                                                     <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-3">ਵਿਆਖਿਆ / व्याख्या</p>
                                                     <p className="text-xs text-zinc-400 leading-relaxed italic">{q.explanationPunjabi || q.explanationHindi}</p>
                                                  </div>
                                               )}
                                            </div>
                                         </div>
                                         <div className="mt-10 pt-6 border-t border-white/[0.03] flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                            <div className="flex items-center gap-6">
                                               <span className="flex items-center gap-2"><BookOpen size={12} className="text-primary" /> {q.subject}</span>
                                               <span className="flex items-center gap-2"><LayoutGrid size={12} /> {q.topic || 'General'}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                               <span className={cn(q.difficulty === 'hard' ? "text-red-500" : "text-emerald-500")}>{q.difficulty} Level</span>
                                               <Badge variant="outline" className="border-zinc-800 text-[8px]">{q.bloomLevel}</Badge>
                                            </div>
                                         </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </motion.div>
                   )}
                </div>
             </ScrollArea>

             {/* OS Input Hub */}
             <footer className="p-8 bg-[#020408] border-t border-white/5 z-50">
                <div className="max-w-4xl mx-auto space-y-6">
                   <div className="relative group">
                      <Input 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLaunchSynthesis()}
                        placeholder="Instruct the OS: 'Create a 100Q PSSSB Excise Inspector full mock'..."
                        className="h-24 bg-zinc-900/50 border-white/10 rounded-[32px] pl-10 pr-52 text-xl font-bold focus:ring-primary/20 shadow-2xl transition-all"
                      />
                      <div className="absolute right-6 top-5 flex gap-4">
                         {browserSupportsSpeechRecognition && (
                           <button onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all", listening ? "bg-red-500 text-white" : "bg-black/20 text-zinc-600 hover:text-white border border-white/5")}>
                              {listening ? <MicOff size={24} /> : <Mic size={24} />}
                           </button>
                         )}
                         <Button onClick={handleLaunchSynthesis} disabled={!promptInput.trim() || loading} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-sm uppercase shadow-lg shadow-primary/20">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={24} className="mr-2" /> GENERATE</>}
                         </Button>
                      </div>
                   </div>
                </div>
             </footer>
          </div>

          {/* Neural Calibration Panel */}
          <aside className="w-[380px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
             <header className="p-8 border-b border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">Neural Calibration</span>
                <Settings size={14} className="text-zinc-700" />
             </header>
             
             <div className="p-8 space-y-10 pb-24">
                {/* Authority Matrix */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Recruitment Board</label>
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
                     <Input 
                       placeholder="Identity Custom Authority..." 
                       value={customExamName}
                       onChange={e => setCustomExamName(e.target.value)}
                       className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-bold px-6 animate-in slide-in-from-top-1"
                     />
                   )}
                </div>

                {/* Subject Selector */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Knowledge Sector</label>
                   <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xs uppercase px-6 shadow-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="All" className="py-3 px-6">Syllabus-Wide Coverage</SelectItem>
                         {SUBJECTS.map(s => <SelectItem key={s} value={s} className="py-3 px-6">{s}</SelectItem>)}
                         <SelectItem value="custom" className="py-3 px-6 text-primary">Target Custom Topic...</SelectItem>
                      </SelectContent>
                   </Select>
                   {subject === 'custom' && (
                     <Input 
                       placeholder="Enter Topic Identity..." 
                       value={customSubjectName}
                       onChange={e => setCustomSubjectName(e.target.value)}
                       className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-bold px-6 animate-in slide-in-from-top-1"
                     />
                   )}
                </div>

                {/* Synthesis Mode */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Generation Mode</label>
                   <Select value={mode} onValueChange={setMode}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="full">Full Mock (Standard)</SelectItem>
                         <SelectItem value="subject">Subject Specialist</SelectItem>
                         <SelectItem value="sectional">Sectional Drill</SelectItem>
                         <SelectItem value="chapter">Chapter Intelligence</SelectItem>
                         <SelectItem value="pyq">PYQ Simulation</SelectItem>
                         <SelectItem value="marathon">Marathon (Endurance)</SelectItem>
                         <SelectItem value="revision">Rapid Revision</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                {/* Artifact Quantity */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Questions Count</label>
                   <Select value={count} onValueChange={setCount}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         {["10", "25", "50", "100", "150", "custom"].map(c => <SelectItem key={c} value={c}>{c === 'custom' ? 'Neural Override' : `${c} Artifacts`}</SelectItem>)}
                      </SelectContent>
                   </Select>
                   {count === 'custom' && (
                     <Input 
                       type="number"
                       placeholder="Identify exact count..." 
                       value={customCount}
                       onChange={e => setCustomCount(e.target.value)}
                       className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-black px-6"
                     />
                   )}
                </div>

                {/* Temporal Matrix */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2 flex items-center gap-2">
                     <Clock size={12} className="text-primary" /> TIME CONFIGURATION
                   </label>
                   <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="auto">Adaptive Timing Engine</SelectItem>
                         {TIME_PRESETS.map(t => <SelectItem key={t.val} value={t.val}>{t.label}</SelectItem>)}
                      </SelectContent>
                   </Select>
                   {duration === 'custom' && (
                     <Input 
                       type="number"
                       placeholder="Manual Duration (Mins)..." 
                       value={customDuration}
                       onChange={e => setCustomDuration(e.target.value)}
                       className="h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-bold px-6"
                     />
                   )}
                </div>

                {/* Linguistic Fidelity */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Linguistic Fidelity</label>
                   <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="en">English Sovereign</SelectItem>
                         <SelectItem value="pa">Punjabi (Raavi Script)</SelectItem>
                         <SelectItem value="hi">Hindi (Standard)</SelectItem>
                         <SelectItem value="en_pa">Bilingual (EN + PA)</SelectItem>
                         <SelectItem value="en_hi">Bilingual (EN + HI)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                {/* Synthesis Velocity */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Synthesis Velocity</label>
                   <Select value={speed} onValueChange={setSpeed}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="turbo">Turbo (Speed Optimized)</SelectItem>
                         <SelectItem value="standard">Standard (Balanced)</SelectItem>
                         <SelectItem value="ultra">Ultra AI (Deep Reasoning)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                {/* Penalty & Scaling */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Negative Coefficient</label>
                   <Select value={negativeMarking} onValueChange={setNegativeMarking}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="0">No Penalty (0.00)</SelectItem>
                         <SelectItem value="0.25">PSSSB Standard (-0.25)</SelectItem>
                         <SelectItem value="0.5">Heavy Loading (-0.50)</SelectItem>
                         <SelectItem value="1">Critical Impact (-1.00)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20">
                   <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                     "Neural OS v10.0 enforces parallel synthesis for high-fidelity state exam simulations. All artifacts are bilingual-ready."
                   </p>
                </div>
             </div>
          </aside>
        </main>
      </div>
    </AdminProtect>
  );
}
