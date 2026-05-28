"use client";

import { useState, useRef, useEffect } from 'react';
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
  Zap, 
  Database, 
  Settings,
  Mic,
  MicOff,
  CheckCircle2,
  Trophy,
  BrainCircuit,
  Target,
  Clock,
  ShieldCheck,
  ChevronRight,
  Layers,
  Search,
  BookOpen,
  LayoutGrid,
  FileText,
  AlertCircle,
  BarChart3,
  History,
  Rocket,
  Plus
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
import { Label } from '@/components/ui/label';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

type ExamAuthority = "PSSSB" | "Punjab Police" | "Teaching" | "PSTCL/PSPCL" | "State Center" | "National";

const EXAM_DATABASE: Record<ExamAuthority, { id: string; name: string; group?: string }[]> = {
  "PSSSB": [
    { id: "sa", name: "Senior Assistant", group: "Group A" },
    { id: "ei", name: "Excise Inspector", group: "Group A" },
    { id: "p", name: "Patwari", group: "Group A" },
    { id: "clerk", name: "Clerk", group: "Group B" },
    { id: "clerk_it", name: "Clerk IT", group: "Group B" },
    { id: "lab_att", name: "Lab Attendant", group: "Group C" },
  ],
  "Punjab Police": [
    { id: "psi", name: "Sub-Inspector", group: "Police" },
    { id: "pc", name: "Constable", group: "Police" },
    { id: "ia", name: "Intelligence Assistant", group: "Police" },
    { id: "jw", name: "Jail Warder", group: "Police" },
  ],
  "Teaching": [
    { id: "pstet1", name: "PSTET Paper 1", group: "TET" },
    { id: "pstet2", name: "PSTET Paper 2", group: "TET" },
    { id: "ctet1", name: "CTET Paper 1", group: "TET" },
    { id: "ctet2", name: "CTET Paper 2", group: "TET" },
  ],
  "PSTCL/PSPCL": [
    { id: "je_elec", name: "JE Electrical", group: "Technical" },
    { id: "je_civil", name: "JE Civil", group: "Technical" },
    { id: "je_mech", name: "JE Mechanical", group: "Technical" },
    { id: "lm", name: "Lineman", group: "Technical" },
  ],
  "State Center": [
    { id: "steno", name: "Steno Typist", group: "Clerical" },
    { id: "deo", name: "Data Entry Operator", group: "Clerical" },
    { id: "group_d", name: "Group D", group: "General" },
  ],
  "National": [
    { id: "ssc_cgl", name: "SSC CGL", group: "Central" },
    { id: "railway", name: "Railway NTPC", group: "Central" },
    { id: "banking", name: "IBPS PO", group: "Central" },
  ]
};

export default function AiMockStudioV7() {
  const { toast } = useToast();
  const [promptInput, setPromptInput] = useState("");
  const [output, setOutput] = useState<MockGeneratorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Tactical Configuration State
  const [exam, setExam] = useState("ei");
  const [mode, setMode] = useState("full");
  const [count, setCount] = useState("50");
  const [customCount, setCustomCount] = useState("");
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("en_pa");
  const [sourceMode, setSourceMode] = useState("ai");
  const [negativeMarking, setNegativeMarking] = useState("0.25");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState("60");

  // Flow Controls
  const [directPublish, setDirectPublish] = useState(false);
  const [saveToBank, setSaveToBank] = useState(true);

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setPromptInput(transcript);
  }, [transcript]);

  const finalCount = count === "custom" ? Number(customCount) : Number(count);

  async function handleLaunchSynthesis() {
    if (!promptInput.trim()) {
      toast({ title: "Signal Required", description: "Please enter a conversational prompt.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setOutput(null);

    const examName = Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || "Punjab Exam";

    try {
      const data = await generateAILogic({
        prompt: promptInput,
        exam: examName,
        mode: mode as any,
        count: finalCount,
        difficulty: difficulty as any,
        language: language as any,
        sourceMode: sourceMode as any,
        negativeMarking: Number(negativeMarking),
        customTime: useCustomTime ? Number(customTime) : undefined
      });

      setOutput(data);
      toast({ title: "Neural Synthesis Verified", description: "Simulation architecture forged." });
    } catch (error: any) {
      toast({ title: "Generation Breach", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function executeEnterpriseWorkflow() {
    if (!output) return;
    try {
      // 1. Create the Mock record in Factory
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: output.title,
        exam: output.exam,
        totalQuestions: output.sections.reduce((acc, s) => acc + s.questions.length, 0),
        duration: useCustomTime ? Number(customTime) : (output.duration || 60),
        negativeMarking: Number(negativeMarking),
        accessType: 'pass_plus',
        status: directPublish ? 'published' : 'draft',
        category: mode,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        aiGenerated: true,
        source: 'AI_STUDIO_V7',
        syllabusCoverage: output.syllabusCoverage || 100
      });

      // 2. Perform Batch Injection
      const batch = writeBatch(db);
      let globalIndex = 0;
      
      for (const section of output.sections) {
        for (const q of section.questions) {
          // A. Push to Mock Subcollection
          const mockQRef = doc(collection(db, "mocks", mockRef.id, "questions"));
          const artifactData = {
            ...q,
            sectionName: section.name,
            order: globalIndex++,
            status: 'published',
            createdAt: Date.now()
          };
          batch.set(mockQRef, artifactData);

          // B. Optionally push to Atomic Bank
          if (saveToBank) {
            const bankQRef = doc(collection(db, "questions"));
            batch.set(bankQRef, {
              ...q,
              status: 'published',
              source: 'AI_STUDIO_V7',
              usageCount: 1,
              qualityScore: 90,
              createdAt: Date.now(),
              serverStamp: serverTimestamp()
            });
          }
        }
      }
      
      await batch.commit();

      toast({ 
        title: directPublish ? "Simulation Live" : "Draft Staged", 
        description: `Handled ${globalIndex} artifacts across ${output.sections.length} sections.` 
      });
      
      if (directPublish) {
        setOutput(null);
        setPromptInput("");
      }
    } catch (e: any) {
      toast({ title: "Workflow Injection Error", description: e.message, variant: "destructive" });
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-row h-screen overflow-hidden">
          
          {/* Main AI OS Workspace */}
          <div className="flex-1 flex flex-col relative bg-[#020408]">
             <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><Sparkles size={16} className="text-primary" /></div>
                   <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">Exam AI Operating System v7</h1>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Neural Link Stable</span>
                   </div>
                   <div className="h-4 w-px bg-white/10" />
                   <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[8px] font-black px-3 py-1 uppercase">Production Layer</Badge>
                </div>
             </header>

             {/* Main Canvas */}
             <ScrollArea className="flex-1 p-8 md:p-12">
                <div className="max-w-5xl mx-auto space-y-16 pb-40">
                   {!output && !loading && (
                     <div className="py-24 text-center space-y-12">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-[40px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative">
                           <BrainCircuit className="text-primary w-10 h-10 animate-float" />
                           <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full" />
                        </motion.div>
                        <div className="space-y-4">
                           <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">Architect the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">Simulation Reality</span></h2>
                           <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                              Command the AI OS to forge production-grade CBT mocks. Our engine auto-syncs with latest official syllabi, marks distribution, and bilingual Raavi standards.
                           </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                           {[
                             "100Q PSSSB Excise Inspector Full Mock",
                             "Punjab Police SI Reasoning Marathon",
                             "JE Electrical Technical-Only 80Q",
                             "PSTET Paper 1 Child Development Set",
                             "Daily Current Affairs Revision 25Q"
                           ].map(chip => (
                             <button 
                               key={chip} 
                               onClick={() => setPromptInput(chip)}
                               className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                             >
                                {chip}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   {loading && (
                     <div className="py-40 flex flex-col items-center justify-center gap-10">
                        <div className="relative">
                           <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                           <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8" />
                        </div>
                        <div className="text-center space-y-4">
                           <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-white animate-pulse">Forging Artifacts</h3>
                           <div className="flex flex-col gap-2">
                             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Scanning Institutional Syllabus...</p>
                             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Translating to Raavi Gurmukhi...</p>
                             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Balancing Difficulty Ratios...</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {output && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        {/* Summary Header */}
                        <div className="flex gap-8 items-start">
                           <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg blue-glow"><Bot className="text-white w-7 h-7" /></div>
                           <div className="flex-1 space-y-10">
                              <div className="space-y-3">
                                 <h3 className="text-4xl font-black uppercase tracking-tighter text-white">{output.title}</h3>
                                 <p className="text-zinc-500 font-medium italic text-xl leading-relaxed">"{output.summary}"</p>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 {[
                                   { label: "Institutional Board", val: output.exam, icon: Target },
                                   { label: "Duration Limit", val: `${output.duration}m`, icon: Clock },
                                   { label: "Syllabus Coverage", val: `${output.syllabusCoverage}%`, icon: BarChart3 },
                                   { label: "Total Artifacts", val: output.sections.reduce((acc, s) => acc + s.questions.length, 0), icon: BookOpen },
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

                              {/* Action Bar */}
                              <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[28px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><ShieldCheck className="text-emerald-500 w-8 h-8" /></div>
                                    <div>
                                       <h4 className="text-xl font-bold">Neural Verification Complete</h4>
                                       <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mt-1">Ready for direct factory injection.</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-4 w-full md:w-auto">
                                    <Button onClick={executeEnterpriseWorkflow} className="h-16 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-widest blue-glow shadow-xl">
                                       {directPublish ? 'Publish Live Instantly' : 'Push to Staging Factory'}
                                    </Button>
                                    <Button variant="outline" className="h-16 px-10 rounded-3xl border-white/10 bg-zinc-800 text-sm font-black uppercase tracking-widest">
                                       Artifact Review
                                    </Button>
                                 </div>
                              </div>

                              {/* Matrix Visualizer */}
                              <div className="space-y-6">
                                 <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] px-4 flex items-center gap-2">
                                    <LayoutGrid size={12} className="text-primary" /> Exam Sectional Matrix
                                 </h4>
                                 <div className="grid gap-4">
                                    {output.sections.map((section, idx) => (
                                      <div key={idx} className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                                         <div className="flex items-center gap-8">
                                            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center font-black text-sm text-zinc-500 border border-white/5 shadow-inner">#{idx + 1}</div>
                                            <div>
                                               <div className="flex items-center gap-3">
                                                  <h5 className="font-bold text-xl">{section.name}</h5>
                                                  {section.isQualifying && <Badge className="bg-orange-500/10 text-orange-500 border-none text-[8px] font-black uppercase px-3 py-1">Qualifying Section</Badge>}
                                               </div>
                                               <p className="text-xs text-zinc-500 mt-1">{section.questions.length} Bilingual Artifacts Forged</p>
                                            </div>
                                         </div>
                                         <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 group-hover:bg-primary group-hover:text-white"><ChevronRight size={20} /></Button>
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

             {/* Advanced Prompt Composer (Gemini Style) */}
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
                           <button 
                             onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} 
                             className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all", listening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20" : "text-zinc-600 hover:text-white hover:bg-white/5")}
                           >
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
                        <button 
                          key={m.id} 
                          onClick={() => setMode(m.id)} 
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary pb-1 border-b-2",
                            mode === m.id ? "text-primary border-primary" : "text-zinc-600 border-transparent"
                          )}
                        >
                          {m.label}
                        </button>
                      ))}
                   </div>
                </div>
             </footer>
          </div>

          {/* Dynamic OS Configuration Sidebar (Right Panel) */}
          <aside className="w-[480px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 hidden lg:flex relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
             <header className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                   <Settings className="text-zinc-600 w-4 h-4" />
                   <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">Generation Calibration</span>
                </div>
                <Badge variant="outline" className="text-zinc-700 border-white/5 text-[9px] uppercase tracking-tighter">v7.2 STABLE</Badge>
             </header>

             <ScrollArea className="flex-1">
                <div className="p-10 space-y-12">
                   
                   {/* Exam OS Selector */}
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.3em] px-2 flex items-center gap-2"><Target size={12} className="text-primary" /> Institutional Board</label>
                      <Select value={exam} onValueChange={setExam}>
                         <SelectTrigger className="h-16 bg-zinc-900/50 border-white/5 rounded-2xl font-black text-sm uppercase px-6 hover:bg-zinc-900 transition-all">
                            <SelectValue placeholder="Select Board Authority" />
                         </SelectTrigger>
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

                   {/* Count & Time Calibration */}
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
                        <Input 
                          type="number" 
                          placeholder="Enter count (max 150)" 
                          value={customCount}
                          onChange={e => setCustomCount(e.target.value)}
                          className="h-14 bg-zinc-900 border-white/5 rounded-2xl px-6 font-bold"
                        />
                     </div>
                   )}

                   {/* Linguistic & Pattern Calibration */}
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

                      <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center justify-between group transition-all hover:bg-white/[0.04]">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center"><Clock size={18} className="text-zinc-600" /></div>
                            <div>
                               <p className="text-[10px] font-black uppercase text-zinc-500">Manual Time Control</p>
                               <p className="text-xs font-bold text-white mt-1">{useCustomTime ? `${customTime}m Limit` : 'Auto-Exam Timing'}</p>
                            </div>
                         </div>
                         <Switch checked={useCustomTime} onCheckedChange={setUseCustomTime} />
                      </div>
                      
                      {useCustomTime && (
                         <div className="px-4">
                           <Input 
                             type="number" 
                             placeholder="Minutes" 
                             value={customTime}
                             onChange={e => setCustomTime(e.target.value)}
                             className="h-12 bg-zinc-900 border-white/5 rounded-xl px-5 font-bold"
                           />
                         </div>
                      )}
                   </div>

                   {/* Enterprise Actions */}
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

                   {/* Intelligent Status Node */}
                   <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-4 shadow-xl">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> <span className="text-[10px] font-black text-primary uppercase tracking-widest">Syllabus Aware Engine Active</span></div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                        "OS v7.2 is now indexed with the latest PSSSB/Technical notifications. Generation logic will auto-calculate subject distribution for {Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || 'the selected board'}."
                      </p>
                   </div>
                </div>
             </ScrollArea>
             
             <footer className="p-8 border-t border-white/5 bg-zinc-950">
                <Button variant="ghost" onClick={() => { setOutput(null); setPromptInput(""); }} className="w-full text-zinc-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Flush AI Session Memory</Button>
             </footer>
          </aside>

        </main>
      </div>
    </AdminProtect>
  );
}
