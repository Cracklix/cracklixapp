"use client";

import { useState, useEffect, useRef } from 'react';
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
  History
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

const EXAM_DATABASE = {
  "PSSSB Authorities": [
    { id: "clerk", name: "Clerk / Clerk IT / Accounts" },
    { id: "sa", name: "Senior Assistant" },
    { id: "ei", name: "Excise Inspector" },
    { id: "p", name: "Patwari" },
    { id: "lab_att", name: "Lab Attendant" },
  ],
  "Punjab Police": [
    { id: "psi", name: "Sub-Inspector" },
    { id: "pc", name: "Constable" },
  ],
  "Technical & Others": [
    { id: "technical", name: "Technical Cadre (JE)" },
    { id: "other", name: "Other / Custom Exam..." },
  ]
};

export default function AiMockStudioV9() {
  const { toast } = useToast();
  const [promptInput, setPromptInput] = useState("");
  const [output, setOutput] = useState<MockGeneratorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Calibration State
  const [exam, setExam] = useState("clerk");
  const [customExam, setCustomExam] = useState("");
  const [mode, setMode] = useState("full");
  const [count, setCount] = useState("50");
  const [customCount, setCustomCount] = useState("");
  const [difficulty, setDifficulty] = useState("balanced");
  const [language, setLanguage] = useState("en_pa");
  const [directPublish, setDirectPublish] = useState(false);
  const [saveToBank, setSaveToBank] = useState(true);

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setPromptInput(transcript);
  }, [transcript]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 10)]);

  async function handleLaunchSynthesis() {
    if (!promptInput.trim()) return;
    setLoading(true);
    setOutput(null);
    setLogs([]);
    addLog("Initializing Neural Synthesis Engine v9.0...");

    const examName = exam === 'other' ? customExam : (Object.values(EXAM_DATABASE).flat().find(e => e.id === exam)?.name || "Punjab Exam");
    const finalCount = count === "custom" ? Number(customCount) : Number(count);

    try {
      addLog(`Architecting simulation blueprint for ${examName}...`);
      const data = await generateAILogic({
        prompt: promptInput,
        exam: examName,
        mode: mode as any,
        count: finalCount,
        difficulty: difficulty as any,
        language: language as any,
        negativeMarking: 0.25,
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

  async function executeEnterpriseWorkflow() {
    if (!output) return;
    setLoading(true);
    addLog("Executing Batch Atomic Write Protocol...");
    
    try {
      const mockRef = doc(collection(db, "mocks"));
      const batch = writeBatch(db);

      const totalQs = output.sections.reduce((acc, s) => acc + s.questions.length, 0);
      
      // 1. Create parent mock doc
      batch.set(mockRef, {
        id: mockRef.id,
        title: output.title,
        exam: output.exam,
        totalQuestions: totalQs,
        duration: output.duration || 60,
        negativeMarking: 0.25,
        status: directPublish ? 'published' : 'draft',
        accessType: 'pass_plus',
        aiGenerated: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
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
            correctAnswer: q.correctAnswer,
            subject: q.subject || section.name,
            topic: q.topic,
            difficulty: q.difficulty,
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || 0.25,
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
      addLog(`Injection successful. ${globalIndex} artifacts deployed.`);
      toast({ title: directPublish ? "Simulation Live" : "Draft Staged Successfully" });
      setOutput(null);
    } catch (e: any) {
      addLog(`FATAL INJECTION ERROR: ${e.message}`);
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
          <div className="flex-1 flex flex-col relative bg-[#020408] overflow-hidden">
             <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center blue-glow"><Sparkles size={16} className="text-primary" /></div>
                   <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">AI Mock Studio OS v9.0</h1>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase">Secure Link: Active</span>
                   </div>
                </div>
             </header>

             <ScrollArea className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-12 pb-40">
                   {!output && !loading && (
                     <div className="py-24 text-center space-y-12">
                        <div className="w-24 h-24 rounded-[32px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative">
                           <Bot className="text-primary w-12 h-12" />
                           <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Forge <span className="text-primary">Intelligence</span></h2>
                        <p className="text-zinc-500 font-medium text-lg max-w-xl mx-auto italic">
                           "Architect high-fidelity recruitment simulations for Punjab boards with side-by-side bilingual narratives."
                        </p>
                     </div>
                   )}

                   {loading && !output && (
                     <div className="py-40 flex flex-col items-center justify-center gap-8">
                        <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <div className="text-center space-y-4">
                           <h3 className="text-xl font-black uppercase tracking-widest">Neural Pulse Log</h3>
                           <div className="space-y-2 font-mono text-[10px] text-zinc-600">
                             {logs.map((log, i) => <div key={i}>{log}</div>)}
                           </div>
                        </div>
                     </div>
                   )}

                   {output && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-10">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h3 className="text-3xl font-black uppercase tracking-tighter">{output.title}</h3>
                                 <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">{output.exam} • {output.duration}m • {language.toUpperCase()}</p>
                              </div>
                              <div className="flex gap-4">
                                 <Button onClick={executeEnterpriseWorkflow} disabled={loading} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-xs font-black uppercase tracking-widest blue-glow">
                                    {loading ? <Loader2 className="animate-spin" /> : "Deploy Simulation"}
                                 </Button>
                                 <Button variant="outline" onClick={() => setOutput(null)} className="h-14 px-8 rounded-2xl border-white/10 font-black text-xs uppercase">Discard</Button>
                              </div>
                           </div>

                           <div className="grid gap-6">
                              {output.sections.map((section, sIdx) => (
                                <div key={sIdx} className="space-y-6">
                                  <Badge className="bg-primary/10 text-primary border-none text-[8px] px-4 font-black uppercase">{section.name}</Badge>
                                  <div className="grid gap-4">
                                    {section.questions.map((q, qIdx) => (
                                      <div key={qIdx} className="p-8 rounded-[32px] bg-zinc-950 border border-white/5 hover:border-primary/20 transition-all">
                                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                               <Badge variant="outline" className="border-blue-500/20 text-blue-500 text-[8px] font-black uppercase">English Core</Badge>
                                               <p className="font-bold text-lg leading-relaxed">{q.questionEnglish}</p>
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

             <footer className="p-8 bg-[#020408] border-t border-white/5 z-50">
                <div className="max-w-4xl mx-auto">
                   <div className="relative group">
                      <Input 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLaunchSynthesis()}
                        placeholder="Instruct the OS: 'Create a 100Q PSSSB Excise Inspector full mock'..."
                        className="h-20 bg-zinc-900 border-white/10 rounded-[32px] px-10 text-lg font-bold focus:ring-primary/20 shadow-2xl"
                      />
                      <div className="absolute right-6 top-4 flex gap-4">
                         {browserSupportsSpeechRecognition && (
                           <button onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()} className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-all", listening ? "bg-red-500 text-white" : "text-zinc-600 hover:text-white")}>
                              {listening ? <MicOff size={20} /> : <Mic size={20} />}
                           </button>
                         )}
                         <Button onClick={handleLaunchSynthesis} disabled={!promptInput.trim() || loading} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black text-xs uppercase">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={20} />}
                         </Button>
                      </div>
                   </div>
                </div>
             </footer>
          </div>

          {/* Config Calibration Panel */}
          <aside className="w-[380px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
             <header className="p-8 border-b border-white/5">
                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">Generation Calibration</span>
             </header>
             <div className="p-8 space-y-10 pb-20">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Institutional Board</label>
                   <Select value={exam} onValueChange={setExam}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         {Object.entries(EXAM_DATABASE).map(([board, exams]) => (
                           <SelectGroup key={board}>
                              <SelectLabel className="text-primary text-[9px] font-black uppercase py-2 px-6">{board}</SelectLabel>
                              {exams.map(ex => <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>)}
                           </SelectGroup>
                         ))}
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Questions Count</label>
                   <Select value={count} onValueChange={setCount}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         {["10", "25", "50", "100", "150"].map(c => <SelectItem key={c} value={c}>{c} Artifacts</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-zinc-700 tracking-widest px-2">Linguistic Fidelity</label>
                   <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-white border-white/10">
                         <SelectItem value="en">English Only</SelectItem>
                         <SelectItem value="pa">Punjabi Only</SelectItem>
                         <SelectItem value="en_pa">Bilingual (EN + PA)</SelectItem>
                         <SelectItem value="en_hi">Bilingual (EN + HI)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                   <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Direct Publish</span>
                      <Switch checked={directPublish} onCheckedChange={setDirectPublish} />
                   </div>
                   <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sync to Bank</span>
                      <Switch checked={saveToBank} onCheckedChange={setSaveToBank} />
                   </div>
                </div>

                <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20">
                   <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                     "OS v9.0 utilizes trilingual neural synthesis to ensure 100%Raavi Gurmukhi fidelity for state exams."
                   </p>
                </div>
             </div>
          </aside>
        </main>
      </div>
    </AdminProtect>
  );
}
