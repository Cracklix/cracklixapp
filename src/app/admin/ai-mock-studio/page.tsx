"use client";

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { generateAILogic, MockGeneratorOutput } from '@/ai/flows/ai-mock-generator-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
  ChevronRight,
  LayoutGrid,
  BookOpen,
  History,
  Rocket,
  Plus,
  Zap,
  Globe,
  Languages,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown
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

const EXAM_DATABASE = {
  "PSSSB": [
    { id: "sa", name: "Senior Assistant" },
    { id: "ei", name: "Excise Inspector" },
    { id: "p", name: "Patwari" },
    { id: "clerk", name: "Clerk" },
    { id: "lab_att", name: "Lab Attendant" },
  ],
  "Punjab Police": [
    { id: "psi", name: "Sub-Inspector" },
    { id: "pc", name: "Constable" },
    { id: "jw", name: "Jail Warder" },
  ],
  "Technical": [
    { id: "pspcl_je", name: "PSPCL JE" },
    { id: "pstcl_je", name: "PSTCL JE" },
  ],
  "Teaching": [
    { id: "pstet", name: "PSTET" },
    { id: "ctet", name: "CTET" },
  ],
  "State Exam Center": [
    { id: "steno", name: "Stenographer" },
    { id: "deo", name: "Data Entry Operator" },
    { id: "group_d", name: "Group D" },
  ]
};

const BLUEPRINTS = [
  { id: 'pss_clerk', label: "PSSSB Clerk Full Mock", exam: 'clerk', count: '100', prompt: "Create a 100Q PSSSB Clerk Full Mock with 30Q Punjabi Qualifying Part A." },
  { id: 'ctet_p1', label: "CTET Paper 1 Marathon", exam: 'ctet', count: '150', prompt: "Generate 150Q CTET Paper 1 Marathon with focus on CDP and EVS." },
  { id: 'pb_pol_si', label: "Punjab Police Rapid Test", exam: 'psi', count: '50', prompt: "50Q Punjab Police SI Rapid Revision focusing on Indian Constitution and Law." },
  { id: 'je_civil', label: "JE Civil Technical Drill", exam: 'pspcl_je', count: '80', prompt: "80Q Technical Subject Drill for JE Civil focusing on SOM and Surveying." }
];

export default function AiMockStudioV8() {
  const { toast } = useToast();
  const [promptInput, setPromptInput] = useState("");
  const [output, setOutput] = useState<MockGeneratorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Calibration State
  const [exam, setExam] = useState("ei");
  const [mode, setMode] = useState("full");
  const [count, setCount] = useState("50");
  const [customCount, setCustomCount] = useState("");
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("en_pa");
  const [negativeMarking, setNegativeMarking] = useState("0.25");
  const [directPublish, setDirectPublish] = useState(false);
  const [saveToBank, setSaveToBank] = useState(true);
  
  // Advanced Toggles
  const [pyqOnly, setPyqOnly] = useState(false);
  const [smartMix, setSmartMix] = useState(true);
  const [manualTime, setManualTime] = useState("");

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcript) setPromptInput(transcript);
  }, [transcript]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const applyBlueprint = (bp: typeof BLUEPRINTS[0]) => {
    setPromptInput(bp.prompt);
    setExam(bp.exam);
    setCount(bp.count);
    toast({ title: "Blueprint Applied", description: `Configured for ${bp.label}` });
  };

  async function handleLaunchSynthesis() {
    if (!promptInput.trim()) return;
    setLoading(true);
    setOutput(null);
    setLogs([]);
    addLog("Initializing Neural Synthesis Engine v8.5...");

    const examName = Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || "Punjab Exam";
    const finalCount = count === "custom" ? Number(customCount) : Number(count);

    try {
      addLog(`Scanning Institutional Syllabus for ${examName}...`);
      addLog(`Generation Mode: ${mode.toUpperCase()} • Linguistic Mode: ${language.toUpperCase()}`);
      
      const data = await generateAILogic({
        prompt: promptInput,
        exam: examName,
        mode: mode as any,
        count: finalCount,
        difficulty: difficulty as any,
        language: language as any,
        negativeMarking: Number(negativeMarking),
        customTime: manualTime ? Number(manualTime) : undefined,
        pyqOnly,
        smartMix
      });

      setOutput(data);
      addLog("Neural Synthesis complete. Validation successful.");
      toast({ title: "Synthesis Verified", description: "Simulation architecture forged." });
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      toast({ title: "Generation Breach", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function executeEnterpriseWorkflow() {
    if (!output) return;
    setLoading(true);
    addLog("Executing Enterprise Data Injection...");
    
    try {
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: output.title,
        exam: output.exam,
        totalQuestions: output.sections.reduce((acc, s) => acc + s.questions.length, 0),
        duration: manualTime ? Number(manualTime) : (output.duration || 60),
        negativeMarking: Number(negativeMarking),
        status: directPublish ? 'published' : 'draft',
        aiGenerated: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      const batch = writeBatch(db);
      let globalIndex = 0;
      
      for (const section of output.sections) {
        for (const q of section.questions) {
          // A. Push to Mock Subcollection
          const mockQRef = doc(collection(db, "mocks", mockRef.id, "questions"));
          const qData = {
            id: mockQRef.id,
            en: { question: q.questionEnglish, options: q.optionsEnglish, explanation: q.explanationEnglish },
            pa: q.questionPunjabi ? { question: q.questionPunjabi, options: q.optionsPunjabi || [], explanation: q.explanationPunjabi } : null,
            hi: q.questionHindi ? { question: q.questionHindi, options: q.optionsHindi || [], explanation: q.explanationHindi } : null,
            correctAnswer: q.correctAnswer,
            subject: q.subject || section.name,
            topic: q.topic,
            difficulty: q.difficulty,
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || 0.25,
            order: globalIndex++,
            createdAt: Date.now()
          };
          batch.set(mockQRef, qData);

          // B. Optional Atomic Bank Sync
          if (saveToBank) {
            const bankQRef = doc(collection(db, "questions"));
            batch.set(bankQRef, {
              ...qData,
              status: 'published',
              source: 'AI_STUDIO_V8.5',
              usageCount: 0,
              qualityScore: 90
            });
          }
        }
      }
      
      await batch.commit();
      addLog(`Injection complete. ${globalIndex} artifacts deployed.`);
      toast({ title: directPublish ? "Simulation Live" : "Draft Staged" });
      setOutput(null);
    } catch (e: any) {
      addLog(`CRITICAL INJECTION ERROR: ${e.message}`);
      toast({ title: "Injection Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-row h-screen overflow-hidden">
          {/* Main AI Workspace */}
          <div className="flex-1 flex flex-col relative bg-[#020408]">
             <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><Sparkles size={16} className="text-primary" /></div>
                   <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">Neural Mock Engine v8.5</h1>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Syllabus Link: Active</span>
                   </div>
                   <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[8px] font-black px-3 py-1 uppercase">Pro Control Layer</Badge>
                </div>
             </header>

             <ScrollArea className="flex-1 p-8 md:p-12" ref={scrollRef}>
                <div className="max-w-6xl mx-auto space-y-12 pb-40">
                   {!output && !loading && (
                     <div className="py-24 text-center space-y-12">
                        <div className="w-20 h-20 rounded-[32px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative group">
                           <Bot className="text-primary w-10 h-10 group-hover:scale-110 transition-transform" />
                           <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full" />
                        </div>
                        <div className="space-y-4">
                           <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">Synthesize<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">Mock Intelligence</span></h2>
                           <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed italic">
                              Architect professional trilingual simulations for Punjab state exams. Use AI Blueprints or custom calibration for surgical precision.
                           </p>
                        </div>
                        
                        <div className="space-y-6">
                           <p className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.3em]">AI Blueprint Templates</p>
                           <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                              {BLUEPRINTS.map(bp => (
                                <button key={bp.id} onClick={() => applyBlueprint(bp)} className="px-6 py-4 rounded-3xl bg-zinc-900/40 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:border-primary transition-all flex items-center gap-3 group">
                                   <Zap size={14} className="text-primary group-hover:text-white" />
                                   {bp.label}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {loading && !output && (
                     <div className="py-40 flex flex-col items-center justify-center gap-12">
                        <div className="relative">
                           <div className="w-32 h-32 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                           <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-10 h-10 animate-pulse" />
                        </div>
                        <div className="text-center space-y-4">
                           <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-white">Forging Artifacts</h3>
                           <div className="max-w-md mx-auto space-y-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                             {logs.slice(0, 4).map((log, i) => (
                               <div key={i} className="flex gap-2 justify-center opacity-60">
                                 <span className="text-primary font-black">{">>"}</span> {log}
                               </div>
                             ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {output && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        <div className="flex flex-col lg:flex-row gap-10 items-start">
                           <div className="flex-1 space-y-10">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg"><Rocket className="text-white" /></div>
                                   <h3 className="text-4xl font-black uppercase tracking-tighter text-white">{output.title}</h3>
                                 </div>
                                 <p className="text-zinc-500 font-medium italic text-xl leading-relaxed">"{output.summary}"</p>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 {[
                                   { label: "Board", val: output.exam, icon: Globe },
                                   { label: "Duration", val: `${manualTime || output.duration}m`, icon: History },
                                   { label: "Coverage", val: `${output.syllabusCoverage}%`, icon: LayoutGrid },
                                   { label: "Artifacts", val: output.sections.reduce((acc, s) => acc + s.questions.length, 0), icon: Database },
                                 ].map((stat, i) => (
                                   <div key={i} className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-3">
                                      <stat.icon className="text-primary w-5 h-5" />
                                      <div>
                                         <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                                         <p className="text-base font-bold text-white truncate">{stat.val}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>

                              <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[28px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><ShieldCheck className="text-emerald-500 w-8 h-8" /></div>
                                    <div>
                                       <h4 className="text-xl font-bold">Neural Verification Complete</h4>
                                       <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mt-1">Ready for production injection.</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-4 w-full md:w-auto">
                                    <Button onClick={executeEnterpriseWorkflow} disabled={loading} className="h-16 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-widest blue-glow">
                                       {loading ? <Loader2 className="animate-spin" /> : (directPublish ? 'Publish Live' : 'Push to Staging')}
                                    </Button>
                                    <Button variant="outline" onClick={() => setOutput(null)} className="h-16 px-10 rounded-3xl border-white/10 bg-zinc-800 text-sm font-black uppercase tracking-widest">Discard Session</Button>
                                 </div>
                              </div>

                              <div className="space-y-8">
                                 <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] px-4 flex items-center gap-2">
                                    <BookOpen size={12} className="text-primary" /> Artifact Analysis Preview
                                 </h4>
                                 <div className="grid gap-6">
                                    {output.sections.map((section, sIdx) => (
                                      <div key={sIdx} className="space-y-6">
                                        <div className="flex items-center gap-4 px-4">
                                          <Badge className="bg-primary/10 text-primary border-none text-[8px] px-3 font-black uppercase">{section.name}</Badge>
                                          <div className="h-px flex-1 bg-white/5" />
                                        </div>
                                        <div className="grid gap-4">
                                          {section.questions.map((q, qIdx) => (
                                            <div key={qIdx} className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 hover:border-primary/20 transition-all group">
                                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                   <div className="flex items-center gap-3">
                                                     <Badge variant="outline" className="border-blue-500/20 text-blue-500 text-[8px] font-black uppercase">EN Signal</Badge>
                                                     <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Artifact #{qIdx+1}</span>
                                                   </div>
                                                   <p className="text-lg font-bold leading-relaxed">{q.questionEnglish}</p>
                                                   <div className="grid grid-cols-1 gap-2 pt-4">
                                                      {q.optionsEnglish.map((opt, i) => (
                                                        <div key={i} className={cn("p-3 rounded-xl text-xs border", opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-black/20 border-white/5 text-zinc-500")}>
                                                          {String.fromCharCode(65+i)}. {opt}
                                                        </div>
                                                      ))}
                                                   </div>
                                                </div>
                                                <div className="space-y-4 border-l border-white/5 pl-10">
                                                   <Badge variant="outline" className="border-orange-500/20 text-orange-500 text-[8px] font-black uppercase">Native Signal</Badge>
                                                   <p className="text-lg font-medium text-zinc-300 leading-relaxed italic">{q.questionPunjabi || q.questionHindi}</p>
                                                   <div className="grid grid-cols-1 gap-2 pt-4">
                                                      {(q.optionsPunjabi || q.optionsHindi || []).map((opt, i) => (
                                                        <div key={i} className="p-3 rounded-xl text-xs bg-black/20 border border-white/5 text-zinc-500">{opt}</div>
                                                      ))}
                                                   </div>
                                                </div>
                                              </div>
                                              <div className="mt-8 p-6 rounded-3xl bg-white/[0.01] border border-white/5">
                                                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">Rationalization Engine</p>
                                                 <p className="text-xs text-zinc-400 leading-relaxed">{q.explanationEnglish}</p>
                                                 <p className="text-[10px] italic text-zinc-500 mt-2">{q.explanationPunjabi || q.explanationHindi}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}
                </div>
             </ScrollArea>

             <footer className="p-8 bg-[#020408] border-t border-white/5 z-50">
                <div className="max-w-4xl mx-auto">
                   <div className="relative group">
                      <div className="absolute inset-0 bg-primary/5 blur-[40px] group-focus-within:bg-primary/10 transition-all rounded-[40px]" />
                      <Input 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLaunchSynthesis()}
                        placeholder="Instruct the AI OS to forge your simulation..."
                        className="h-24 bg-zinc-900/80 border-white/10 rounded-[40px] px-12 text-xl font-bold relative z-10 focus:ring-primary/20 placeholder:text-zinc-700 shadow-2xl"
                      />
                      <div className="absolute right-8 top-5 z-20 flex gap-4">
                         {browserSupportsSpeechRecognition && (
                           <button onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all", listening ? "bg-red-500 text-white animate-pulse" : "text-zinc-600 hover:text-white hover:bg-white/5")}>
                              {listening ? <MicOff size={24} /> : <Mic size={24} />}
                           </button>
                         )}
                         <Button onClick={handleLaunchSynthesis} disabled={!promptInput.trim() || loading} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 blue-glow font-black text-sm uppercase tracking-widest shadow-xl">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={24} />}
                         </Button>
                      </div>
                   </div>
                   <div className="mt-6 flex justify-center gap-10">
                      {[
                        { id: 'full', label: "Full Mock" },
                        { id: 'sectional', label: "Sectional Test" },
                        { id: 'subject', label: "Subject Quiz" },
                        { id: 'pyq', label: "PYQ Mode" }
                      ].map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)} className={cn("text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary pb-1 border-b-2", mode === m.id ? "text-primary border-primary" : "text-zinc-600 border-transparent")}>
                          {m.label}
                        </button>
                      ))}
                   </div>
                </div>
             </footer>
          </div>

          {/* Config Calibration Panel */}
          <aside className="w-[450px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
             <header className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                   <Settings className="text-zinc-600 w-4 h-4" />
                   <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">Generation Calibration</span>
                </div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-all">
                   <SlidersHorizontal size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Advanced</span>
                </button>
             </header>

             <ScrollArea className="flex-1">
                <div className="p-10 space-y-12">
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.3em] px-2 flex items-center gap-2"><Globe size={12} className="text-primary" /> Institutional Board</label>
                      <Select value={exam} onValueChange={setExam}>
                         <SelectTrigger className="h-16 bg-zinc-900/50 border-white/5 rounded-2xl font-black text-sm uppercase px-6 hover:bg-zinc-900 transition-all"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-zinc-950 border-white/10 text-white max-h-[600px]">
                            {Object.entries(EXAM_DATABASE).map(([board, exams]) => (
                              <SelectGroup key={board}>
                                 <SelectLabel className="text-primary text-[10px] font-black uppercase tracking-widest bg-white/5 py-3 px-6">{board}</SelectLabel>
                                 {exams.map(ex => (
                                   <SelectItem key={ex.id} value={ex.id} className="font-bold py-4 px-6 focus:bg-primary/10">{ex.name}</SelectItem>
                                 ))}
                              </SelectGroup>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Questions Count</label>
                         <Select value={count} onValueChange={setCount}>
                            <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs uppercase px-5"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white">
                               {[10, 20, 50, 75, 100, 120, 150].map(c => <SelectItem key={c} value={c.toString()}>{c} Artifacts</SelectItem>)}
                               <SelectItem value="custom">Custom Value</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Negative Coefficient</label>
                         <Select value={negativeMarking} onValueChange={setNegativeMarking}>
                            <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs uppercase px-5 text-red-500"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white">
                               {["0", "0.25", "0.50", "1.0"].map(m => <SelectItem key={m} value={m}>-{m} Penalty</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   {count === "custom" && (
                     <div className="animate-in slide-in-from-top-2">
                        <Input type="number" placeholder="Enter count (max 200)" value={customCount} onChange={e => setCustomCount(e.target.value)} className="h-14 bg-zinc-900 border-white/5 rounded-2xl px-6 font-bold" />
                     </div>
                   )}

                   <div className="space-y-6">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Linguistic Fidelity</label>
                         <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs uppercase px-5"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white">
                               <SelectItem value="en">English Only</SelectItem>
                               <SelectItem value="pa">Punjabi Only</SelectItem>
                               <SelectItem value="hi">Hindi Only</SelectItem>
                               <SelectItem value="en_pa">Bilingual (EN + PA)</SelectItem>
                               <SelectItem value="en_hi">Bilingual (EN + HI)</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <AnimatePresence>
                     {showAdvanced && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }} 
                         animate={{ height: 'auto', opacity: 1 }} 
                         exit={{ height: 0, opacity: 0 }} 
                         className="space-y-8 overflow-hidden pt-4 border-t border-white/5"
                       >
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Pro Parameters</label>
                             <div className="grid gap-3">
                                <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <History size={16} className="text-orange-500" />
                                      <span className="text-[11px] font-bold">Strict PYQ Only</span>
                                   </div>
                                   <Switch checked={pyqOnly} onCheckedChange={setPyqOnly} />
                                </div>
                                <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <BrainCircuit size={16} className="text-purple-500" />
                                      <span className="text-[11px] font-bold">AI Smart Mix</span>
                                   </div>
                                   <Switch checked={smartMix} onCheckedChange={setSmartMix} />
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Custom Duration (Min)</label>
                             <Input 
                               type="number" 
                               placeholder="Auto (e.g. 60, 120)" 
                               value={manualTime} 
                               onChange={e => setManualTime(e.target.value)} 
                               className="h-14 bg-zinc-900 border-white/5 rounded-2xl px-6 font-bold"
                             />
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Difficulty Ratio</label>
                             <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                   <SelectTrigger className="h-10 bg-zinc-800 border-none text-[10px] font-bold"><SelectValue /></SelectTrigger>
                                   <SelectContent className="bg-zinc-950 text-white">
                                      <SelectItem value="easy">100% Easy</SelectItem>
                                      <SelectItem value="balanced">20/50/30 (Balanced)</SelectItem>
                                      <SelectItem value="hard">100% Hard</SelectItem>
                                      <SelectItem value="adaptive">AI Adaptive</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Workflow Controls</p>
                      <div className="grid gap-3">
                         <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <Rocket size={16} className="text-emerald-500" />
                               <span className="text-[11px] font-bold">Direct Publish</span>
                            </div>
                            <Switch checked={directPublish} onCheckedChange={setDirectPublish} />
                         </div>
                         <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <Database size={16} className="text-primary" />
                               <span className="text-[11px] font-bold">Sync to Atomic Bank</span>
                            </div>
                            <Switch checked={saveToBank} onCheckedChange={setSaveToBank} />
                         </div>
                      </div>
                   </div>

                   <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-4 shadow-xl">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> <span className="text-[10px] font-black text-primary uppercase tracking-widest">Syllabus Engine Active</span></div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                        "OS v8.5 is now indexed with latest PSSSB Patterns. AI will auto-calculate Part A (Qualifying) vs Part B (Scoring) distribution."
                      </p>
                   </div>
                </div>
             </ScrollArea>
             
             <footer className="p-8 border-t border-white/5 bg-zinc-950">
                <Button variant="ghost" onClick={() => setOutput(null)} className="w-full text-zinc-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Flush Synthesis Memory</Button>
             </footer>
          </aside>
        </main>
      </div>
    </AdminProtect>
  );
}
