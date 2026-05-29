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
  Globe,
  Monitor,
  ChevronRight,
  Pause,
  Play,
  CheckCircle2,
  Bookmark,
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, ExamAttempt, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CBTEngineV50({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const mockId = unwrappedParams.id;
  
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'booting' | 'gateway' | 'exam' | 'submitting'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [activeLang, setActiveLang] = useState<string>('english');
  const [isPaused, setIsPaused] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Mock missing.");
      const qData = await getMockQuestions(mockId);
      
      setMock(mockData);
      setQuestions(qData);
      setActiveLang(mockData.languageMode === 'trilingual' ? 'trilingual' : (mockData.languageMode.startsWith('en_') ? 'english' : mockData.languageMode));
      
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
      } as any);
    }, 15000);

    return () => { clearInterval(interval); clearInterval(syncInterval); };
  }, [phase, isPaused, attempt?.id, timeRemaining, current]);

  const handleStartExam = async () => {
    if (!user || !mock) return;
    setPhase('booting');
    try {
      const id = await startAttempt(user.uid, mock);
      setAttempt({ id } as any);
      setPhase('exam');
    } catch (e) {
      setPhase('gateway');
    }
  };

  const handleAction = (type: 'save_next' | 'mark_review' | 'clear') => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const currentAns = answers[qId];

    let payload: AttemptAnswer;

    switch(type) {
      case 'save_next':
        if (currentAns?.selectedOption === null || currentAns?.selectedOption === undefined) {
           toast({ title: "Signal Missing", description: "Select an option to proceed.", variant: "destructive" });
           return;
        }
        payload = { ...currentAns, status: 'ANSWERED', lastUpdated: Date.now() };
        setAnswers(prev => ({ ...prev, [qId]: payload }));
        saveAnswer(attempt.id, qId, payload);
        handleNext();
        break;
      case 'mark_review':
        const nextStatus = currentAns?.selectedOption !== null && currentAns?.selectedOption !== undefined 
          ? 'ANSWERED_AND_MARKED' 
          : 'MARKED_FOR_REVIEW';
        payload = { 
          questionId: qId, 
          selectedOption: currentAns?.selectedOption ?? null, 
          status: nextStatus, 
          lastUpdated: Date.now(), 
          timeSpent: 0 
        };
        setAnswers(prev => ({ ...prev, [qId]: payload }));
        saveAnswer(attempt.id, qId, payload);
        handleNext();
        break;
      case 'clear':
        payload = { questionId: qId, selectedOption: null, status: 'VISITED', timeSpent: 0, lastUpdated: Date.now() };
        setAnswers(prev => ({ ...prev, [qId]: payload }));
        saveAnswer(attempt.id, qId, payload);
        break;
    }
  };

  const handleOptionSelect = (option: number) => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    setAnswers(prev => ({ 
      ...prev, 
      [qId]: { 
        questionId: qId, 
        selectedOption: option, 
        status: 'VISITED', 
        timeSpent: 0, 
        lastUpdated: Date.now() 
      } 
    }));
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
         <Loader2 className="w-12 h-12 animate-spin text-primary" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Initializing Exam Environment...</p>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
         <header className="h-16 bg-zinc-950 border-b border-white/5 flex items-center px-8 justify-between">
            <Button variant="ghost" onClick={() => router.push('/exams')} className="text-zinc-500 hover:text-white font-bold text-xs uppercase">
               <ArrowLeft size={16} className="mr-2" /> Exit Arena
            </Button>
            <h1 className="font-black text-sm uppercase tracking-widest truncate max-w-lg">{mock?.title}</h1>
         </header>
         <main className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-3xl w-full rounded-[48px] bg-zinc-950 border border-white/5 p-12 space-y-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5"><Monitor size={200} /></div>
               <div className="text-center space-y-4 relative z-10">
                  <Badge className="bg-primary/20 text-primary border-none px-4 py-1 font-black uppercase text-[10px]">Simulation Protocol</Badge>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Instructions & Scheme</h2>
               </div>
               <div className="space-y-6 relative z-10 text-sm">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                       <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Duration</p>
                       <p className="text-xl font-bold">{mock?.duration} Minutes</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                       <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Negative Marking</p>
                       <p className="text-xl font-bold">-{mock?.negativeMarking} Per Violation</p>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                     <p className="text-[10px] font-bold text-zinc-500 uppercase mb-4 tracking-widest">General Rules:</p>
                     <ul className="space-y-3 text-zinc-400 font-medium">
                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" /> Use 'Mark for Review' for doubtful artifacts.</li>
                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" /> Session state is synced every 15 seconds.</li>
                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" /> Tab switching is strictly monitored.</li>
                     </ul>
                  </div>
               </div>
               <div className="pt-10 border-t border-white/5">
                  <Button onClick={handleStartExam} className="w-full h-16 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest blue-glow">
                     BEGIN ASSESSMENT <ChevronRight size={18} className="ml-2" />
                  </Button>
               </div>
            </Card>
         </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-slate-900 flex flex-col overflow-hidden">
       {/* INSTITUTIONAL TOP BAR */}
       <header className="h-[65px] px-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50 shadow-xl">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="rounded-xl h-9 w-9 bg-white/5 hover:bg-white/10">
                {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
             </Button>
             <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
             <h1 className="font-black text-xs uppercase tracking-tight truncate max-w-[300px]">{mock?.title}</h1>
          </div>
          
          <div className="flex items-center gap-6">
             <Select value={activeLang} onValueChange={setActiveLang}>
                <SelectTrigger className="h-8 w-32 bg-white/5 border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest px-3"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] text-white border-white/10">
                   <SelectItem value="english">English</SelectItem>
                   <SelectItem value="punjabi">Punjabi</SelectItem>
                   <SelectItem value="hindi">Hindi</SelectItem>
                   <SelectItem value="trilingual">Trilingual</SelectItem>
                </SelectContent>
             </Select>
             
             <div className="flex items-center gap-3 bg-white/5 px-4 h-9 rounded-lg border border-white/10">
                <Timer duration={timeRemaining / 60} onFinish={handleSubmitFinal} paused={isPaused} />
             </div>

             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg">SUBMIT</Button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 relative no-scrollbar">
             <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <AnimatePresence mode="wait">
                   {isPaused ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-6 text-center">
                         <div className="w-20 h-20 rounded-[32px] bg-blue-600 flex items-center justify-center shadow-2xl"><Pause size={40} className="text-white" fill="currentColor" /></div>
                         <h3 className="text-3xl font-black uppercase tracking-tighter">Session Suspended</h3>
                         <p className="text-slate-500 font-medium max-w-xs">Progress is preserved. Resuming will activate the countdown.</p>
                         <Button onClick={() => setIsPaused(false)} className="h-16 px-12 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest shadow-xl">RESUME ASSESSMENT</Button>
                      </motion.div>
                   ) : (
                     <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption ?? null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang as any}
                          index={current}
                        />
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>

          <aside className="w-[340px] bg-white border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <PaletteDrawer 
               questions={questions} 
               current={current} 
               answers={answers} 
               setCurrent={setCurrent} 
               activeLanguage={activeLang as any}
               mockTitle={mock?.title || ""}
             />
          </aside>
       </div>

       {/* INSTITUTIONAL BOTTOM ACTIONS */}
       <footer className="h-[75px] px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => handleAction('mark_review')} className="rounded-xl h-11 px-8 border-slate-200 font-black text-[10px] uppercase text-blue-600 hover:bg-blue-50">MARK FOR REVIEW</Button>
             <Button variant="ghost" onClick={() => handleAction('clear')} className="rounded-xl h-11 px-6 font-bold text-[10px] uppercase text-slate-400">CLEAR</Button>
          </div>
          <div className="flex gap-4 items-center">
             <Button variant="ghost" disabled={current === 0} onClick={handlePrev} className="font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all">PREV</Button>
             <Button onClick={() => handleAction('save_next')} className="h-12 px-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/30">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[40px] p-10 max-w-md border-none shadow-2xl">
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mx-auto"><CheckCircle2 className="text-emerald-600 w-10 h-10" /></div>
               <div className="space-y-2">
                 <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Simulation Exit?</DialogTitle>
                 <DialogDescription className="text-slate-500">Submitting will calculate your merit ranking across all state participants.</DialogDescription>
               </div>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:flex-row pt-6">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 font-black text-[10px] uppercase">CANCEL</Button>
               <Button onClick={handleSubmitFinal} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">SUBMIT FINAL</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
