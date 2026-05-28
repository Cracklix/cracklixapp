
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt,
  pauseAttempt,
  getOngoingAttempt
} from "@/services/mocks";
import { checkMockEntitlement } from "@/services/payment";
import QuestionCard from "@/components/mock/question-card";
import PaletteDrawer from "@/components/mock/palette-drawer";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  Menu,
  Pause,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Info,
  CheckCircle2,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, LanguageMode, ExamAttempt } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * PRODUCTION CBT ENGINE v20.0 (TESTBOOK STYLE REBUILD)
 * - Professional Start Gateway (Instructions)
 * - Realtime Firestore Sync
 * - Stacked Bilingual Optimized (Raavi Font)
 * - Sectional Jump Navigation
 */
export default function CBTEngine() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  // States
  const [phase, setPhase] = useState<'booting' | 'gateway' | 'exam' | 'paused' | 'submitting'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageMode>('bilingual');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation artifact not found");

      const entitlement = await checkMockEntitlement(user.uid, mockData);
      if (!entitlement.allowed) {
        toast({ title: "Access Restricted", description: entitlement.reason, variant: "destructive" });
        router.push('/pass');
        return;
      }

      const qData = await getMockQuestions(mockId);
      setMock(mockData);
      setQuestions(qData);
      
      const existingSession = await getOngoingAttempt(user.uid, mockId);
      if (existingSession) {
        setAttempt(existingSession);
        setAnswers(existingSession.answers || {});
        setCurrent(existingSession.currentQuestionIndex || 0);
        setPhase('gateway'); // Show instructions even on resume
      } else {
        setPhase('gateway');
      }
      
      if (profile?.languageMode) setActiveLang(profile.languageMode as any);
      
    } catch (e: any) {
      toast({ title: "Signal Error", description: e.message, variant: "destructive" });
      router.push('/dashboard');
    }
  }, [mockId, user, profile, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

  const handleStartExam = async () => {
    if (!user || !mock) return;
    setPhase('booting');
    try {
      if (!attempt) {
        const id = await startAttempt(user.uid, mock);
        setAttempt({ id, ...mock, userId: user.uid, answers: {}, currentQuestionIndex: 0, status: 'ongoing', startedAt: Date.now(), remainingTime: mock.duration * 60 } as any);
      }
      setPhase('exam');
    } catch (e) {
      toast({ title: "Initialization Failed", variant: "destructive" });
      setPhase('gateway');
    }
  };

  const handleOptionSelect = (option: string) => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const payload: AttemptAnswer = {
      questionId: qId,
      selectedOption: option,
      status: 'ANSWERED',
      timeSpent: 0,
      lastUpdated: Date.now()
    };
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
  };

  const handleClear = () => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    setAnswers(prev => {
      const n = {...prev};
      delete n[qId];
      return n;
    });
    saveAnswer(attempt.id, qId, { questionId: qId, selectedOption: null, status: 'NOT_ANSWERED', timeSpent: 0, lastUpdated: Date.now() });
  };

  const handleMarkReview = () => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const currentAns = answers[qId];
    const payload: AttemptAnswer = {
      questionId: qId,
      selectedOption: currentAns?.selectedOption || null,
      status: currentAns?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW',
      timeSpent: 0,
      lastUpdated: Date.now()
    };
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  const handleSubmitFinal = async () => {
    if (!user || !attempt?.id || !mock) return;
    setPhase('submitting');
    try {
      const answersMap: Record<number, any> = {};
      questions.forEach((q, idx) => {
        if (answers[q.id]) answersMap[idx] = answers[q.id];
      });

      const analytics = generateAnalytics({ questions, answers: answersMap, mock });
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      toast({ title: "Transmission Failed", variant: "destructive" });
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-[#05070a] flex flex-col items-center justify-center text-center space-y-6">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-16 h-16 rounded-[24px] border-4 border-primary/20 border-t-primary" />
         <div className="space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
               {phase === 'booting' ? 'Syncing Simulation Nodes' : 'Analyzing Performance Vectors'}
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em]">Infrastructure by Arsh Grewal</p>
         </div>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-body">
         <header className="h-[70px] bg-white border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => router.push('/exams')} className="rounded-xl"><ArrowLeft size={20} /></Button>
               <h1 className="font-bold text-xl tracking-tight">{mock?.title}</h1>
            </div>
         </header>

         <main className="max-w-4xl mx-auto py-12 px-6 space-y-10 pb-40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Questions</p>
                  <h4 className="text-2xl font-black text-slate-800">{mock?.totalQuestions} Artifacts</h4>
               </div>
               <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Duration</p>
                  <h4 className="text-2xl font-black text-slate-800">{mock?.duration} Minutes</h4>
               </div>
               <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Marks</p>
                  <h4 className="text-2xl font-black text-slate-800">{mock?.totalQuestions} Marks</h4>
               </div>
            </div>

            <section className="bg-white rounded-[40px] border border-slate-200 p-10 space-y-8 shadow-sm">
               <h3 className="text-xl font-bold flex items-center gap-3">
                  <Info className="text-blue-600" /> General Instructions
               </h3>
               <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                  <p>1. The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available.</p>
                  <p>2. Every correct signal grants <strong className="text-emerald-600">+1.0</strong> mark.</p>
                  <p>3. Incorrect signals will attract a penalty of <strong className="text-red-500">-{mock?.negativeMarking}</strong> marks.</p>
                  <p>4. You can switch between English and Punjabi languages during the exam.</p>
                  <p>5. Tab switching or minimizing the browser will be logged as suspicious activity.</p>
               </div>
            </section>
         </main>

         <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-6 z-50">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <ShieldCheck className="text-emerald-500" />
                  <p className="text-xs font-medium text-slate-500">I have read and understood all instructions.</p>
               </div>
               <Button onClick={handleStartExam} className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl blue-glow">
                  AGREE & CONTINUE
               </Button>
            </div>
         </footer>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f1f5f9] flex flex-col overflow-hidden select-none">
       {/* CBT TOP HEADER */}
       <header className="h-[60px] px-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50 shadow-xl">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{mock?.title}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cloud Sync: Active
                </span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                <Globe size={14} className="text-blue-400" />
                <select 
                  value={activeLang} 
                  onChange={(e) => setActiveLang(e.target.value as any)}
                  className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer"
                >
                   <option value="en" className="bg-slate-900">English</option>
                   <option value="pa" className="bg-slate-900">Punjabi</option>
                   <option value="bilingual" className="bg-slate-900">Bilingual</option>
                </select>
             </div>

             <Timer 
               duration={attempt?.remainingTime ? attempt.remainingTime / 60 : (mock?.duration || 60)} 
               onFinish={handleSubmitFinal} 
               paused={phase === 'paused'}
             />

             <Button 
               onClick={() => setPhase(p => p === 'exam' ? 'paused' : 'exam')} 
               variant="ghost" size="icon" className="bg-white/5 hover:bg-white/10"
             >
                {phase === 'paused' ? <Play size={16} /> : <Pause size={16} />}
             </Button>

             <Button 
              onClick={() => setSubmitConfirmOpen(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-bold text-[10px] uppercase shadow-lg"
             >
                SUBMIT TEST
             </Button>

             <Button 
              variant="ghost" size="icon" 
              onClick={() => setPaletteOpen(true)} 
              className="bg-white/5 lg:hidden"
             >
                <Menu size={20} />
             </Button>
          </div>
       </header>

       {/* SUBJECT SECTION BAR */}
       <div className="h-12 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 gap-8 overflow-x-auto no-scrollbar">
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 px-4 py-1 font-black text-[10px] uppercase tracking-widest shrink-0">
             {questions[current]?.subject || 'CORE SECTION'}
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex gap-2 shrink-0">
             {['SECTION A', 'SECTION B'].map(s => (
               <button key={s} className="px-4 h-8 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:bg-slate-50">
                  {s}
               </button>
             ))}
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          {/* MAIN EXAM STAGE */}
          <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-white relative">
             <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                   {questions[current] && phase === 'exam' ? (
                     <motion.div
                       key={questions[current].id}
                       initial={{ opacity: 0, x: 10 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -10 }}
                       className="space-y-8"
                     >
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption as any || null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang}
                          index={current}
                        />
                     </motion.div>
                   ) : phase === 'paused' ? (
                     <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center animate-pulse shadow-inner">
                           <Pause className="text-blue-600 w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Exam Session Paused</h3>
                        <p className="text-slate-500 max-w-xs text-sm">Your answers are secure. The clock is frozen.</p>
                        <Button onClick={() => setPhase('exam')} size="lg" className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-2xl">RESUME SESSION</Button>
                     </div>
                   ) : null}
                </AnimatePresence>
             </div>
          </main>

          {/* DESKTOP QUESTION PALETTE */}
          <aside className="w-[320px] bg-slate-50 border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="p-8 border-b border-slate-200 bg-white flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-xl">
                   <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} />
                   <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                   <p className="text-[11px] font-black uppercase text-slate-800 leading-none">{profile?.name}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">ID: {user?.uid.substring(0,8)}</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col justify-between h-20">
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Answered</p>
                      <h4 className="text-2xl font-black text-emerald-700">{Object.values(answers).filter(a => a.status === 'ANSWERED' || a.status === 'ANSWERED_AND_MARKED').length}</h4>
                   </div>
                   <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between h-20">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Marked</p>
                      <h4 className="text-2xl font-black text-blue-700">{Object.values(answers).filter(a => a.status === 'MARKED_FOR_REVIEW' || a.status === 'ANSWERED_AND_MARKED').length}</h4>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Select Artifact</span>
                      <LayoutGrid size={14} className="text-slate-300" />
                   </div>
                   <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, i) => {
                        const ans = answers[q.id];
                        const status = ans?.status || 'NOT_VISITED';
                        const isCurrent = current === i;

                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrent(i)}
                            className={cn(
                              "h-10 w-full rounded-xl font-bold text-[10px] transition-all border flex items-center justify-center relative",
                              status === 'ANSWERED' ? "bg-emerald-500 text-white border-emerald-600" :
                              status === 'MARKED_FOR_REVIEW' ? "bg-blue-600 text-white border-blue-700" :
                              status === 'ANSWERED_AND_MARKED' ? "bg-purple-600 text-white border-purple-700" :
                              "bg-white text-slate-400 border-slate-200 hover:border-slate-300",
                              isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
                            )}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>

             <div className="p-6 bg-white border-t border-slate-200">
                <Button onClick={() => setSubmitConfirmOpen(true)} className="w-full h-14 rounded-2xl bg-[#1e293b] hover:bg-black text-white font-bold text-xs uppercase tracking-widest shadow-xl">
                   SUBMIT SIMULATION
                </Button>
             </div>
          </aside>
       </div>

       {/* STICKY BOTTOM ACTION BAR */}
       <footer className="h-[75px] px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-3">
             <Button variant="outline" onClick={handleMarkReview} className="h-12 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-tight border-slate-200 text-slate-600">MARK FOR REVIEW</Button>
             <Button variant="ghost" onClick={handleClear} className="h-12 px-6 rounded-2xl text-slate-400 font-bold text-[10px] uppercase hidden sm:flex">CLEAR RESPONSE</Button>
          </div>
          
          <div className="flex gap-4">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-1 px-4 h-12 rounded-2xl text-slate-500 font-bold text-[10px] uppercase hover:bg-slate-50 disabled:opacity-30">
                <ChevronLeft size={16} /> PREV
             </button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-12 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       <PaletteDrawer 
         open={paletteOpen} 
         onClose={() => setPaletteOpen(false)} 
         questions={questions} 
         current={current} 
         answers={answers} 
         setCurrent={setCurrent} 
         mockTitle={mock?.title || "Simulation"}
       />

       {/* SUBMIT CONFIRMATION */}
       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white text-slate-900 rounded-[32px] p-10 shadow-2xl max-w-md border-none">
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500 flex items-center justify-center mx-auto shadow-xl">
                  <ShieldCheck className="text-white w-10 h-10" />
               </div>
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Confirm Submit</DialogTitle>
               <DialogDescription className="text-slate-500 text-sm font-medium">Finalizing your attempt will generate your AIR rank and cognitive analysis report.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 my-8">
               <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Answered</p>
                  <p className="text-3xl font-black text-blue-600">{Object.keys(answers).length}</p>
               </div>
               <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Unvisited</p>
                  <p className="text-3xl font-black text-slate-300">{questions.length - Object.keys(answers).length}</p>
               </div>
            </div>

            <DialogFooter className="gap-4 flex flex-col sm:flex-row">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 font-bold text-xs uppercase">RESUME</Button>
               <Button onClick={handleSubmitFinal} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase shadow-xl">SUBMIT NOW</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
