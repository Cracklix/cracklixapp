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
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

type ExamNode = {
  id: string;
  name: string;
  group?: string;
};

const EXAM_DATABASE: Record<string, ExamNode[]> = {
  "PSSSB": [
    { id: "sa", name: "Senior Assistant", group: "Group A" },
    { id: "ei", name: "Excise Inspector", group: "Group A" },
    { id: "ai", name: "Audit Inspector", group: "Group A" },
    { id: "p", name: "Patwari", group: "Group A" },
    { id: "c", name: "Clerk", group: "Group B" },
    { id: "cit", name: "Clerk IT", group: "Group B" },
    { id: "je", name: "Junior Engineer", group: "Group C" },
  ],
  "Punjab Police": [
    { id: "psi", name: "Sub-Inspector", group: "Police" },
    { id: "pc", name: "Constable", group: "Police" },
    { id: "jw", name: "Jail Warder", group: "Police" },
  ],
  "Teaching": [
    { id: "pstet1", name: "PSTET Paper 1", group: "TET" },
    { id: "pstet2", name: "PSTET Paper 2", group: "TET" },
    { id: "ctet1", name: "CTET Paper 1", group: "TET" },
    { id: "ctet2", name: "CTET Paper 2", group: "TET" },
  ],
  "National": [
    { id: "pcs", name: "PPSC PCS", group: "Civil" },
    { id: "ssc", name: "SSC CGL", group: "General" },
    { id: "rail", name: "Railway NTPC", group: "General" },
  ]
};

const SUBJECTS = [
  "General Knowledge", "Current Affairs", "Punjab History", "Punjab Culture", 
  "Punjabi Grammar", "English Grammar", "Logical Reasoning", "Mental Ability", 
  "Quantitative Aptitude", "Data Interpretation", "Computer Fundamentals", "Science", "EVS"
];

/**
 * AI MOCK STUDIO v6 (Gemini Style Exam OS)
 * Full-width workspace with deep exam hierarchy and pattern-aware generation.
 */
export default function AiMockStudioV6() {
  const { toast } = useToast();
  const [promptInput, setPromptInput] = useState("");
  const [output, setOutput] = useState<MockGeneratorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Tactical Configuration State
  const [exam, setExam] = useState("ei"); // Excise Inspector default
  const [mode, setMode] = useState("full");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("bilingual");
  const [sourceMode, setSourceMode] = useState("ai");

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setPromptInput(transcript);
  }, [transcript]);

  async function handleLaunchSynthesis() {
    if (!promptInput.trim()) return;
    setLoading(true);
    setOutput(null);

    const examName = Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || "Punjab Exam";

    try {
      const data = await generateAILogic({
        prompt: promptInput,
        exam: examName,
        mode: mode as any,
        count,
        difficulty: difficulty as any,
        language: language as any,
        sourceMode: sourceMode as any
      });

      setOutput(data);
      toast({ title: "Synthesis Protocol Verified", description: "Simulation blueprint forged successfully." });
    } catch (error: any) {
      toast({ title: "Neural Failure", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function injectIntoFactory() {
    if (!output) return;
    try {
      // 1. Create the Mock Metadata record
      const mockRef = await addDoc(collection(db, "mocks"), {
        title: output.title,
        exam: output.exam,
        totalQuestions: output.sections.reduce((acc, s) => acc + s.questions.length, 0),
        duration: output.duration || 60,
        negativeMarking: output.negativeMarking || 0.25,
        accessType: 'pass_plus',
        status: 'draft',
        category: mode,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        aiGenerated: true,
        source: 'AI_STUDIO_V6'
      });

      // 2. Perform Batch Injection of artifacts
      const batch = writeBatch(db);
      let globalIndex = 0;
      output.sections.forEach((section) => {
        section.questions.forEach((q) => {
          const qRef = doc(collection(db, "mocks", mockRef.id, "questions"));
          batch.set(qRef, { 
            ...q,
            sectionName: section.name,
            order: globalIndex++, 
            status: 'published',
            createdAt: Date.now() 
          });
        });
      });
      await batch.commit();

      toast({ title: "Staging Injection Success", description: "Simulation is now live in Simulation Manager." });
    } catch (e: any) {
      toast({ title: "Injection Error", description: e.message, variant: "destructive" });
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-row h-screen overflow-hidden">
          
          {/* Main AI Workspace (Gemini/ChatGPT Style) */}
          <div className="flex-1 flex flex-col relative bg-[#020408]">
             <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><Sparkles size={16} className="text-primary" /></div>
                   <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">AI Exam Operating System</h1>
                </div>
                <div className="flex items-center gap-4">
                   <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[8px] font-black px-3 py-1 uppercase tracking-widest">v6.0 PRODUCTION</Badge>
                   <div className="h-4 w-px bg-white/10" />
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase">System Nominal</span>
                   </div>
                </div>
             </header>

             {/* Workspace / Chat History Area */}
             <ScrollArea className="flex-1 p-8 md:p-12">
                <div className="max-w-4xl mx-auto space-y-16 pb-40">
                   {!output && !loading && (
                     <div className="py-24 text-center space-y-12">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-[40px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative">
                           <BrainCircuit className="text-primary w-10 h-10 animate-float" />
                           <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full" />
                        </motion.div>
                        <div className="space-y-4">
                           <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">Command the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Mock Reality</span></h2>
                           <p className="text-zinc-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                              Synthesize production-grade CBT simulations using natural language. The OS handles board-specific patterns, syllabus split, and bilingual Raavi fidelity.
                           </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                           {[
                             "100Q Bilingual Patwari Full Mock",
                             "Punjab Police SI Reasoning Marathon",
                             "Excise Inspector Part A Qualifying",
                             "PPSC GS Paper 1 Strategy Set"
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
                           <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                           <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 fill-current" />
                        </div>
                        <div className="text-center space-y-3">
                           <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white animate-pulse">Neural Synthesis Active</h3>
                           <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest italic max-w-sm mx-auto">
                              Mapping syllabus nodes for {Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name}...
                           </p>
                        </div>
                     </div>
                   )}

                   {output && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        {/* Simulation Result Header */}
                        <div className="flex gap-8 items-start">
                           <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg"><Bot className="text-white w-6 h-6" /></div>
                           <div className="flex-1 space-y-10">
                              <div className="space-y-2">
                                 <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{output.title}</h3>
                                 <p className="text-zinc-500 font-medium italic text-lg leading-relaxed">"{output.summary}"</p>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 {[
                                   { label: "Board", val: output.exam, icon: Target },
                                   { label: "Duration", val: `${output.duration}m`, icon: Clock },
                                   { label: "Sections", val: output.sections.length, icon: Layers },
                                   { label: "Questions", val: output.sections.reduce((acc, s) => acc + s.questions.length, 0), icon: BookOpen },
                                 ].map((stat, i) => (
                                   <div key={i} className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                                      <stat.icon className="text-primary w-4 h-4" />
                                      <div>
                                         <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                                         <p className="text-sm font-bold text-white truncate">{stat.val}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>

                              {/* Section Breakdown */}
                              <div className="space-y-6">
                                 <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] px-4 flex items-center gap-2">
                                    <LayoutGrid size={12} className="text-primary" /> Exam Sectional Matrix
                                 </h4>
                                 <div className="grid gap-4">
                                    {output.sections.map((section, idx) => (
                                      <div key={idx} className="p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                                         <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-black text-xs text-zinc-500">#{idx + 1}</div>
                                            <div>
                                               <div className="flex items-center gap-2">
                                                  <h5 className="font-bold text-lg">{section.name}</h5>
                                                  {section.isQualifying && <Badge className="bg-orange-500/10 text-orange-500 border-none text-[8px] font-black uppercase">Qualifying</Badge>}
                                               </div>
                                               <p className="text-xs text-zinc-500">{section.questions.length} Bilingual Artifacts Generated</p>
                                            </div>
                                         </div>
                                         <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary group-hover:text-white"><ChevronRight size={18} /></Button>
                                      </div>
                                    ))}
                                 </div>
                              </div>

                              {/* Footer Actions */}
                              <div className="flex gap-4 pt-6">
                                 <Button onClick={injectIntoFactory} className="h-16 px-10 rounded-3xl bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-widest shadow-2xl blue-glow">
                                    Inject to Simulation Factory
                                 </Button>
                                 <Button variant="outline" className="h-16 px-10 rounded-3xl border-white/10 bg-zinc-800 text-sm font-black uppercase tracking-widest">
                                    Review Question Deep-Link
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}
                </div>
             </ScrollArea>

             {/* Prompt Composer (Gemini Style) */}
             <footer className="p-8 bg-[#020408] border-t border-white/5 z-50">
                <div className="max-w-4xl mx-auto">
                   <div className="relative group">
                      <div className="absolute inset-0 bg-primary/5 blur-[40px] group-focus-within:bg-primary/10 transition-all rounded-[32px]" />
                      <Input 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLaunchSynthesis()}
                        placeholder="Instruct the OS to forge your simulation..."
                        className="h-20 bg-zinc-900/80 border-white/10 rounded-[32px] px-10 text-lg font-bold relative z-10 focus:ring-primary/20 placeholder:text-zinc-700 shadow-2xl"
                      />
                      <div className="absolute right-6 top-4 z-20 flex gap-4">
                         {browserSupportsSpeechRecognition && (
                           <button 
                             onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} 
                             className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all", listening ? "bg-red-500 text-white animate-pulse" : "text-zinc-600 hover:text-white hover:bg-white/5")}
                           >
                              {listening ? <MicOff size={22} /> : <Mic size={22} />}
                           </button>
                         )}
                         <Button onClick={handleLaunchSynthesis} disabled={!promptInput.trim() || loading} className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 blue-glow font-black text-xs uppercase tracking-widest shadow-xl">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={20} />}
                         </Button>
                      </div>
                   </div>
                   <div className="mt-4 flex justify-center gap-6">
                      {["Full Mock", "Sectional", "Chapter Quiz", "PYQ Archive"].map(m => (
                        <button key={m} onClick={() => setMode(m.toLowerCase().split(' ')[0])} className="text-[9px] font-black uppercase text-zinc-600 tracking-widest hover:text-primary transition-colors">{m}</button>
                      ))}
                   </div>
                </div>
             </footer>
          </div>

          {/* Dynamic Configuration Panel (Right Side) */}
          <aside className="w-[420px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 hidden lg:flex relative">
             <header className="p-8 border-b border-white/5 flex items-center gap-3 bg-zinc-950/50">
                <Settings className="text-zinc-600 w-4 h-4" />
                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">Generation Config</span>
             </header>
             <ScrollArea className="flex-1">
                <div className="p-8 space-y-12">
                   {/* Exam Database Selector */}
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Institutional Board</label>
                      <Select value={exam} onValueChange={setExam}>
                         <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xs uppercase px-6">
                            <SelectValue placeholder="Select Exam Board" />
                         </SelectTrigger>
                         <SelectContent className="bg-zinc-950 border-white/10 text-white max-h-[500px]">
                            {Object.entries(EXAM_DATABASE).map(([board, exams]) => (
                              <SelectGroup key={board}>
                                 <SelectLabel className="text-primary text-[9px] font-black uppercase tracking-widest bg-white/5 py-2">{board}</SelectLabel>
                                 {exams.map(ex => (
                                   <SelectItem key={ex.id} value={ex.id} className="font-bold py-3">{ex.name}</SelectItem>
                                 ))}
                              </SelectGroup>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>

                   {/* Mode & Volume */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Engine Mode</label>
                         <Select value={mode} onValueChange={setMode}>
                            <SelectTrigger className="h-12 bg-zinc-900 border-white/5 rounded-xl font-bold text-[10px] uppercase px-4"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white">
                               <SelectItem value="full">Full Mock</SelectItem>
                               <SelectItem value="sectional">Sectional</SelectItem>
                               <SelectItem value="subject">Subject Test</SelectItem>
                               <SelectItem value="chapter">Chapter Quiz</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Volume (Qs)</label>
                         <Select value={count.toString()} onValueChange={v => setCount(Number(v))}>
                            <SelectTrigger className="h-12 bg-zinc-900 border-white/5 rounded-xl font-bold text-[10px] uppercase px-4"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white">
                               {[10, 20, 50, 100, 150].map(c => <SelectItem key={c} value={c.toString()}>{c} Artifacts</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   {/* Calibrated Toggles */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                         <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500">Linguistic Fidelity</p>
                            <p className="text-xs font-bold text-white mt-1">Bilingual (EN + PA)</p>
                         </div>
                         <Languages className="text-primary w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                         <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500">Subject Splitting</p>
                            <p className="text-xs font-bold text-emerald-500 mt-1">Auto-Pattern Sync</p>
                         </div>
                         <ShieldCheck className="text-emerald-500 w-5 h-5" />
                      </div>
                   </div>

                   {/* Intelligence Context Card */}
                   <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-4 shadow-xl">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <span className="text-[10px] font-black text-primary uppercase tracking-widest">Syllabus Aware Engine</span></div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                        "The OS is currently indexed with the latest PSSSB/Punjab Police official notifications. Mock structure will auto-align with the 2024 recruitment cycle marks distribution."
                      </p>
                   </div>
                </div>
             </ScrollArea>
             <footer className="p-8 border-t border-white/5 bg-zinc-950">
                <Button variant="ghost" className="w-full text-zinc-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Wipe AI Context</Button>
             </footer>
          </aside>

        </main>
      </div>
    </AdminProtect>
  );
}

function Languages(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  )
}
