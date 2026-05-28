'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Globe,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, LanguageMode, ExamAttempt } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * PRODUCTION CBT ENGINE v20.0
 * Features: Real-time Autosave, Resilience Logic, Stacked Bilingual UI.
 */
export default function CBTEngine() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  // State
  const [phase, setPhase] = useState<'booting' | 'gateway' | 'exam' | 'paused' | 'submitting'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageMode>('bilingual');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Time tracking
  const [timeRemaining, setTimeRemaining] = useState(0);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation not found");

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
      toast({ title: "Sync Error", description: e.message, variant: "destructive" });
      router.push('/dashboard');
    }
  }, [mockId, user, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

  /**
   * Autosave Sync Engine
   * Syncs remaining time and current index to Firestore every 10 seconds.
   */
  useEffect(() => {
    if (phase !== 'exam' || !attempt?.id) return;

    const interval = setInterval(() => {
      saveAnswer(attempt.id, 'session_meta', {
        remainingTime: timeRemaining,
        currentQuestionIndex: current,
        lastSynced: Date.now()
      } as any);
    }, 10000);

    return () => clearInterval(interval);
  }, [phase, attempt?.id, timeRemaining, current]);

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

  const handleSubmitFinal = async () => {
    if (!user || !attempt?.id || !mock) return;
    setPhase('submitting');
    try {
      const analytics = generateAnalytics({ questions, answers, mock });
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      toast({ title: "Submission Error", variant: "destructive" });
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-[#05070a] flex flex-col items-center justify-center text-center space-y-6">
         <Loader2 className="w-12 h-12 animate-spin text-primary" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Synchronizing Neural Buffer</p>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900">
         <header className="h-[70px] bg-white border-b border-slate-200 flex items-center px-8 justify-between">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => router.push('/exams')} className="rounded-xl"><ArrowLeft size={20} /></Button>
               <h1 className="font-bold text-xl">{mock?.title}</h1>
            </div>
         </header>
         <main className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            <div className="grid grid-cols-3 gap-6">
               <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Artifacts</p>
                  <h4 className="text-2xl font-black">{mock?.totalQuestions}</h4>
               </div>
               <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Duration</p>
                  <h4 className="text-2xl font-black">{mock?.duration}m</h4>
               </div>
               <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Penalty</p>
                  <h4 className="text-2xl font-black text-red-500">-{mock?.negativeMarking}</h4>
               </div>
            </div>
            <section className="bg-white rounded-[40px] border border-slate-200 p-10 space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-3">
                  <Info className="text-blue-600" /> Exam Protocol
               </h3>
               <div className="text-sm leading-relaxed text-slate-600 space-y-4">
                  <p>• The clock will freeze automatically if you pause the session.</p>
                  <p>• Answers are saved in real-time. You can resume on any device.</p>
                  <p>• Strict anti-cheat measures are active during the simulation.</p>
               </div>
               <Button onClick={handleStartExam} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl mt-8">
                  AGREE & CONTINUE
               </Button>
            </section>
         </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f1f5f9] flex flex-col overflow-hidden">
       {/* CBT HEADER */}
       <header className="h-[60px] px-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50">
          <div className="flex flex-col">
             <span className="font-bold text-sm truncate max-w-[200px]">{mock?.title}</span>
             <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sync
             </span>
          </div>

          <div className="flex items-center gap-4">
             <Timer 
               duration={timeRemaining / 60} 
               onFinish={handleSubmitFinal} 
               paused={phase === 'paused'}
             />
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-black text-[10px] uppercase">
                SUBMIT
             </Button>
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="lg:hidden"><Menu size={20} /></Button>
          </div>
       </header>

       {/* SECTION TAB */}
       <div className="h-10 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
          <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-black uppercase">
             {questions[current]?.subject || 'CORE ASSESSMENT'}
          </Badge>
       </div>

       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-white relative no-scrollbar">
             <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                   {questions[current] && (
                     <motion.div key={questions[current].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption as any || null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang}
                          index={current}
                        />
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>

          {/* PALETTE */}
          <aside className="w-[300px] bg-slate-50 border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="p-6 border-b border-slate-200 flex items-center gap-4 bg-white">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                   <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} />
                   <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                   <p className="text-[11px] font-black uppercase text-slate-800">{profile?.name}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aspirant Signal</p>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                <div className="grid grid-cols-5 gap-2">
                   {questions.map((q, i) => (
                     <button
                       key={q.id}
                       onClick={() => setCurrent(i)}
                       className={cn(
                         "h-9 w-full rounded-xl font-bold text-[10px] border transition-all",
                         answers[q.id] ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-slate-400 border-slate-200",
                         current === i && "ring-2 ring-primary ring-offset-1"
                       )}
                     >
                        {i + 1}
                     </button>
                   ))}
                </div>
             </div>
          </aside>
       </div>

       {/* FOOTER ACTIONS */}
       <footer className="h-[70px] px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-xl text-[10px] font-black uppercase">Mark for Review</Button>
             <Button variant="ghost" className="text-slate-400 text-[10px] font-black uppercase">Clear Response</Button>
          </div>
          <div className="flex gap-4">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="px-4 text-[10px] font-bold text-slate-400 uppercase disabled:opacity-0">PREV</button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-12 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
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

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[32px] p-10 max-w-md border-none shadow-2xl">
            <DialogHeader className="text-center space-y-4">
               <ShieldCheck className="text-emerald-500 w-16 h-16 mx-auto" />
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter">End Simulation?</DialogTitle>
               <DialogDescription className="text-slate-500">You have answered {Object.keys(answers).length} out of {questions.length} artifacts.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-4 flex flex-col sm:flex-row mt-6">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 font-bold">RESUME</Button>
               <Button onClick={handleSubmitFinal} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl">SUBMIT TEST</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
