'use client';

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt,
  getOngoingAttempt
} from "@/services/mocks";
import QuestionCard from "@/components/mock/question-card";
import PaletteDrawer from "@/components/mock/palette-drawer";
import Timer from "@/components/mock/timer";
import { calculateAttemptMetrics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  Menu,
  ShieldCheck,
  Globe,
  Monitor,
  ChevronRight,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, ExamAttempt, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CBTEngineV32({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const mockId = unwrappedParams.id;
  
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'booting' | 'gateway' | 'exam' | 'submitting'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageMode>('bilingual');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Artifact missing.");
      const qData = await getMockQuestions(mockId);
      
      setMock(mockData);
      setQuestions(qData);
      
      const existing = await getOngoingAttempt(user.uid, mockId);
      if (existing) {
        setAttempt(existing);
        setAnswers(existing.answers || {});
        setCurrent(existing.currentQuestionIndex || 0);
        setTimeRemaining(existing.remainingTime || mockData.duration * 60);
      } else {
        setTimeRemaining(mockData.duration * 60);
      }
      setPhase('gateway');
    } catch (e: any) {
      router.push('/exams');
    }
  }, [mockId, user, router]);

  useEffect(() => { bootSession(); }, [bootSession]);

  // Real-time Heartbeat (10s Cloud Sync)
  useEffect(() => {
    if (phase !== 'exam' || isPaused || !attempt?.id) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const syncInterval = setInterval(() => {
      saveAnswer(attempt.id, 'meta_sync', {
        remainingTime: timeRemaining,
        currentQuestionIndex: current,
        lastSynced: Date.now()
      } as any);
    }, 10000);

    return () => { clearInterval(interval); clearInterval(syncInterval); };
  }, [phase, isPaused, attempt?.id, timeRemaining, current]);

  const handleStartExam = async () => {
    if (!user || !mock) return;
    setPhase('booting');
    try {
      if (!attempt) {
        const id = await startAttempt(user.uid, mock);
        setAttempt({ id } as any);
      }
      setPhase('exam');
      if (mock.languageMode) setActiveLang(mock.languageMode);
    } catch (e) {
      setPhase('gateway');
    }
  };

  const handleOptionSelect = (option: string | null) => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const payload: AttemptAnswer = {
      questionId: qId,
      selectedOption: option,
      status: option ? 'ANSWERED' : 'VISITED',
      timeSpent: 0,
      lastUpdated: Date.now()
    };
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
  };

  const markForReview = () => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const currentAns = answers[qId];
    const newStatus = currentAns?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW';
    const payload = { ...currentAns, questionId: qId, status: newStatus, lastUpdated: Date.now() } as any;
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
    handleNext();
  };

  const handleNext = () => current < questions.length - 1 && setCurrent(c => c + 1);
  const handlePrev = () => current > 0 && setCurrent(c => c - 1);

  const handleSubmitFinal = async () => {
    if (!user || !attempt?.id || !mock) return;
    setPhase('submitting');
    try {
      const analytics = calculateAttemptMetrics(questions, answers, mock, timeRemaining);
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
         <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 rounded-[28px] bg-primary flex items-center justify-center blue-glow">
            <Monitor className="text-white w-8 h-8" />
         </motion.div>
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">{phase === 'booting' ? 'Initializing Neural Forge' : 'Syncing Final Audit'}</p>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
         <header className="h-16 bg-black border-b border-white/5 flex items-center px-8 justify-between shrink-0">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => router.push('/exams')} className="rounded-xl"><ArrowLeft size={16} /></Button>
               <h1 className="font-black text-sm uppercase tracking-tight truncate max-w-xs">{mock?.title}</h1>
            </div>
         </header>
         <main className="flex-1 p-8 no-scrollbar flex items-center justify-center">
            <Card className="max-w-3xl w-full rounded-[48px] bg-zinc-950 border border-white/5 p-12 space-y-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldCheck size={200} /></div>
               <div className="space-y-4 relative z-10 text-center">
                  <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest">Preparation Protocol</Badge>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Instructions & Scheme</h2>
               </div>
               <div className="space-y-6 relative z-10 text-zinc-400 font-medium leading-relaxed">
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                        <p className="text-[9px] font-black text-primary uppercase">Duration</p>
                        <p className="text-xl font-bold text-white">{mock?.duration} Minutes</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                        <p className="text-[9px] font-black text-red-500 uppercase">Penalty</p>
                        <p className="text-xl font-bold text-white">-{mock?.negativeMarking} Per Wrong</p>
                     </div>
                  </div>
                  <ul className="space-y-3 text-sm">
                     <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Total questions: {mock?.totalQuestions}. All carry 1 mark.</li>
                     <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Real-time cloud autosave enabled (Heartbeat v4).</li>
                  </ul>
               </div>
               <div className="pt-6 border-t border-white/5 grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-zinc-500 px-1">Language Buffer</p>
                    <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                       <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-[11px] uppercase px-6"><SelectValue /></SelectTrigger>
                       <SelectContent className="bg-zinc-950 text-white border-white/10">
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="punjabi">Punjabi</SelectItem>
                          <SelectItem value="bilingual">Bilingual</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleStartExam} className="h-14 mt-auto rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest blue-glow">
                     BEGIN ASSESSMENT <ChevronRight size={18} className="ml-1" />
                  </Button>
               </div>
            </Card>
         </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-slate-900 flex flex-col overflow-hidden relative">
       {/* Institutional Header v32.5 */}
       <header className="h-[65px] px-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="rounded-lg h-9 w-9 hover:bg-white/10"><Menu size={20} /></Button>
             <div className="flex flex-col">
                <span className="font-black text-xs uppercase tracking-tight truncate max-w-[120px] md:max-w-xs">{mock?.title}</span>
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> CLOUD SYNCED
                </span>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-6">
                <Globe size={14} className="text-blue-400" />
                <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                   <SelectTrigger className="h-9 w-32 bg-white/5 border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest px-3"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-[#1e293b] text-white border-white/10">
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="punjabi">Punjabi</SelectItem>
                      <SelectItem value="bilingual">EN+PA</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             
             <Timer duration={timeRemaining / 60} onFinish={handleSubmitFinal} paused={isPaused} />
             
             <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="h-9 w-9 rounded-xl hover:bg-white/10">
                   {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                </Button>
                <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">SUBMIT TEST</Button>
             </div>
          </div>
       </header>

       {/* Examination Stage (0-Scroll Grid) */}
       <div className="flex-1 flex overflow-hidden cbt-workspace">
          <main className="flex-1 overflow-y-auto no-scrollbar p-8 bg-slate-50 relative">
             <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <AnimatePresence mode="wait">
                   {isPaused ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-slate-50/95 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 rounded-[32px] bg-blue-600 flex items-center justify-center shadow-2xl"><Pause size={40} className="text-white" fill="currentColor" /></div>
                        <div className="text-center space-y-2">
                           <h3 className="text-3xl font-black uppercase tracking-tighter">Session Interrupted</h3>
                           <p className="text-slate-500 font-medium">Simulation clock is suspended. Resume whenever ready.</p>
                        </div>
                        <Button onClick={() => setIsPaused(false)} className="h-16 px-12 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest">RESUME ASSESSMENT</Button>
                     </motion.div>
                   ) : questions[current] && (
                     <motion.div key={questions[current].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption || null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang}
                          index={current}
                        />
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>
       </div>

       {/* Navigation Dock */}
       <footer className="h-[75px] px-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-3">
             <Button variant="outline" onClick={markForReview} className="rounded-2xl h-11 px-8 border-slate-200 font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50">MARK FOR REVIEW</Button>
             <Button variant="ghost" onClick={() => handleOptionSelect(null)} className="rounded-2xl h-11 px-6 font-bold text-[10px] uppercase text-zinc-400">Clear</Button>
          </div>
          <div className="flex gap-6 items-center">
             <button disabled={current === 0} onClick={handlePrev} className="font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all">Previous</button>
             <Button onClick={handleNext} disabled={current === questions.length - 1} className="h-12 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/30 active:scale-95">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[40px] p-12 max-w-md border-none shadow-2xl overflow-hidden">
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mx-auto"><CheckCircle2 className="text-emerald-600 w-10 h-10" /></div>
               <div className="space-y-2">
                 <DialogTitle className="text-3xl font-black uppercase tracking-tighter leading-none">Terminate Session?</DialogTitle>
                 <DialogDescription className="text-slate-500 font-medium">Your progress is cloud-synced. Submitting will generate your State Rank and Percentile.</DialogDescription>
               </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-8">
               <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400">Attempted</p>
                  <p className="text-2xl font-black text-slate-900">{Object.values(answers).filter(a => a.selectedOption).length}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400">Marked</p>
                  <p className="text-2xl font-black text-blue-600">{Object.values(answers).filter(a => a.status.includes('MARKED')).length}</p>
               </div>
            </div>
            <DialogFooter className="gap-3 flex flex-col sm:flex-row">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 font-black text-[11px] uppercase">RESUME</Button>
               <Button onClick={handleSubmitFinal} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20">SUBMIT FINAL</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>

       <PaletteDrawer 
         open={paletteOpen} 
         onClose={() => setPaletteOpen(false)} 
         questions={questions} 
         current={current} 
         answers={answers} 
         setCurrent={setCurrent} 
         mockTitle={mock?.title || "Assessment"}
         activeLanguage={activeLang}
       />
    </div>
  );
}
