'use client';

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  getOngoingAttempt 
} from "@/services/mocks";
import QuestionCard from "@/components/mock/question-card";
import PaletteDrawer from "@/components/mock/palette-drawer";
import Timer from "@/components/mock/timer";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  ChevronRight,
  Pause,
  Play,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, ExamAttempt, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CBTPlayer({ params }: { params: Promise<{ id: string }> }) {
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

  useEffect(() => {
    async function boot() {
      if (!user || !mockId) return;
      try {
        const mockData = await getMockDetails(mockId);
        if (!mockData) throw new Error("Mock missing.");
        const qData = await getMockQuestions(mockId);
        
        setMock(mockData);
        setQuestions(qData);
        
        const existing = await getOngoingAttempt(user.uid, mockId);
        if (existing) {
          setAttempt(existing);
          setAnswers(existing.answers || {});
          setCurrent(existing.currentQuestionIndex || 0);
          setTimeRemaining(existing.remainingTime || mockData.duration * 60);
          setPhase('exam');
        } else {
          setTimeRemaining(mockData.duration * 60);
          setPhase('gateway');
        }
      } catch (e) {
        router.push('/exams');
      }
    }
    boot();
  }, [mockId, user, router]);

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

    return () => clearInterval(interval);
  }, [phase, isPaused, attempt?.id]);

  const handleStartExam = async () => {
    if (!user || !mock) return;
    setPhase('booting');
    try {
      const id = await startAttempt(user.uid, mock.id, mock.title, mock.duration);
      setAttempt({ id } as any);
      setPhase('exam');
    } catch (e) {
      setPhase('gateway');
    }
  };

  const handleOptionSelect = (option: number) => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const ans: AttemptAnswer = {
      questionId: qId,
      selectedOption: option,
      status: 'ANSWERED',
      timeSpent: 0,
      lastUpdated: Date.now()
    };
    setAnswers(prev => ({ ...prev, [qId]: ans }));
    saveAnswer(attempt.id, qId, ans);
  };

  const handleNext = () => current < questions.length - 1 && setCurrent(c => c + 1);
  const handlePrev = () => current > 0 && setCurrent(c => c - 1);

  const handleSubmitFinal = async () => {
    if (!attempt?.id) return;
    setPhase('submitting');
    // In production, we calculate metrics here. For end-to-end flow:
    setTimeout(() => {
      router.push(`/mocks/result/${attempt.id}`);
    }, 2000);
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
         <Loader2 className="w-12 h-12 animate-spin text-primary" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Syncing Simulation Data...</p>
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
               <div className="text-center space-y-4">
                  <Badge className="bg-primary/20 text-primary border-none px-4 py-1 font-black uppercase text-[10px]">Institutional Protocol</Badge>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Instructions & Scheme</h2>
               </div>
               <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2 text-center">
                     <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Duration</p>
                     <p className="text-xl font-bold">{mock?.duration} Mins</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2 text-center">
                     <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Negative Marking</p>
                     <p className="text-xl font-bold">-{mock?.negativeMarking} / Q</p>
                  </div>
               </div>
               <div className="pt-10 border-t border-white/5">
                  <Button onClick={handleStartExam} className="w-full h-16 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest blue-glow shadow-xl">
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
       <header className="h-[65px] px-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="rounded-xl h-9 w-9 bg-white/5 hover:bg-white/10">
                {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
             </Button>
             <div className="h-8 w-px bg-white/10 mx-2" />
             <h1 className="font-black text-xs uppercase tracking-tight truncate max-w-[300px]">{mock?.title}</h1>
          </div>
          
          <div className="flex items-center gap-6">
             <Select value={activeLang} onValueChange={setActiveLang}>
                <SelectTrigger className="h-8 w-32 bg-white/5 border-white/10 rounded-lg text-[10px] font-black uppercase px-3"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] text-white border-white/10">
                   <SelectItem value="english">English</SelectItem>
                   <SelectItem value="punjabi">Punjabi</SelectItem>
                </SelectContent>
             </Select>
             
             <div className="flex items-center gap-3 bg-white/5 px-4 h-9 rounded-lg border border-white/10">
                <Timer duration={timeRemaining / 60} onFinish={handleSubmitFinal} paused={isPaused} />
             </div>

             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest">SUBMIT</Button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 relative no-scrollbar">
             <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <QuestionCard 
                  question={questions[current]} 
                  selected={answers[questions[current]?.id]?.selectedOption ?? null} 
                  onSelect={handleOptionSelect}
                  activeLanguage={activeLang as any}
                  index={current}
                />
             </div>
          </main>

          <aside className="w-[340px] bg-white border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <PaletteDrawer 
               questions={questions} 
               current={current} 
               answers={answers} 
               setCurrent={setCurrent} 
               activeLanguage={activeLang as any}
             />
          </aside>
       </div>

       {/* INSTITUTIONAL BOTTOM ACTIONS */}
       <footer className="h-[75px] px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-xl h-11 px-8 border-slate-200 font-black text-[10px] uppercase text-blue-600">MARK FOR REVIEW</Button>
             <Button variant="ghost" className="rounded-xl h-11 px-6 font-bold text-[10px] uppercase text-slate-400">CLEAR</Button>
          </div>
          <div className="flex gap-4 items-center">
             <Button variant="ghost" disabled={current === 0} onClick={handlePrev} className="font-black text-[10px] uppercase text-slate-400">PREV</Button>
             <Button onClick={handleNext} className="h-12 px-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[40px] p-10 max-w-md">
            <DialogHeader className="text-center space-y-4">
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto"><CheckCircle2 className="text-emerald-600 w-8 h-8" /></div>
               <DialogTitle className="text-2xl font-black uppercase">Final Submit?</DialogTitle>
               <DialogDescription>Your progress will be audited and ranked across the Punjab state leaderboard.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 pt-6">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 font-black text-[10px] uppercase">CANCEL</Button>
               <Button onClick={handleSubmitFinal} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase shadow-xl">SUBMIT FINAL</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
