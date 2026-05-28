'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt,
  checkMockAccess
} from "@/services/mocks";
import QuestionCard from "@/components/mock/question-card";
import QuestionPalette from "@/components/mock/question-palette";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * PRODUCTION CBT ENGINE (Testbook Grade)
 * Phase-based state machine for zero-loop stability.
 */
export default function CBTPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'loading' | 'ready' | 'engine' | 'result'>('loading');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'pa'>('en');

  // Initialization: ONCE on mount
  useEffect(() => {
    if (!user || !mockId) return;

    async function initialize() {
      try {
        const mockData = await getMockDetails(mockId);
        if (!mockData) throw new Error("Simulation artifact missing.");

        const access = await checkMockAccess(user!.uid, mockData);
        if (!access.allowed) {
          toast({ title: "Access Denied", description: access.reason, variant: "destructive" });
          router.push('/pass');
          return;
        }

        const qData = await getMockQuestions(mockId);
        if (qData.length === 0) throw new Error("This mock has no questions linked.");

        const id = await startAttempt(user!.uid, mockData);
        setAttemptId(id);
        setMock(mockData);
        setQuestions(qData);
        setPhase('ready');
      } catch (err: any) {
        toast({ title: "Signal Error", description: err.message, variant: "destructive" });
        router.push('/exams');
      }
    }

    initialize();
  }, [mockId, user, router, toast]);

  const handleSelect = (option: string) => {
    if (!attemptId) return;
    const payload: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: option,
      status: 'ANSWERED',
      timeSpent: 0, // Simplified for rebuild
      lastSavedAt: Date.now()
    };
    setAnswers(prev => ({ ...prev, [current]: payload }));
    saveAnswer(attemptId, current, payload);
  };

  const submitTest = useCallback(async () => {
    if (!user || !attemptId || !mock) return;
    try {
      setPhase('loading');
      const analytics = generateAnalytics({ questions, answers, mock });
      await finalizeAttempt(user.uid, attemptId, analytics);
      router.push("/mocks/result");
    } catch (e) {
      toast({ title: "Submission Failed", variant: "destructive" });
      setPhase('engine');
    }
  }, [user, questions, answers, mock, attemptId, router, toast]);

  if (phase === 'loading') return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Synchronizing CBT Arena</p>
    </div>
  );

  if (phase === 'ready') return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 text-center">
         <div className="w-20 h-20 rounded-[28px] bg-primary/20 flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-2xl">
            <Info className="text-primary w-10 h-10" />
         </div>
         <h1 className="text-4xl font-black uppercase tracking-tighter">{mock?.title}</h1>
         <div className="flex justify-center gap-6 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
            <span>{mock?.totalQuestions} Questions</span>
            <span>{mock?.duration} Minutes</span>
            <span className="text-red-500">Negative: -{mock?.negativeMarking}</span>
         </div>
         <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-white/5 text-left space-y-4">
            <p className="text-sm font-bold flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Auto-save is active for every response.</p>
            <p className="text-sm font-bold flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Switching tabs will trigger a security signal.</p>
         </div>
         <Button onClick={() => setPhase('engine')} className="w-full h-20 rounded-3xl bg-primary hover:bg-primary/90 text-2xl font-black shadow-2xl blue-glow">
           START SIMULATION
         </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden select-none">
      <header className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-6">
           <span className="font-black text-xs uppercase tracking-widest">{mock?.title}</span>
           <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SYNC: ON
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
             <button onClick={() => setActiveLang('en')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'en' ? "bg-white text-black" : "text-white/40")}>EN</button>
             <button onClick={() => setActiveLang('pa')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'pa' ? "bg-white text-black" : "text-white/40")}>ਪੰ</button>
           </div>
           <Timer duration={mock?.duration || 60} onFinish={submitTest} />
           <Button onClick={submitTest} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-xs uppercase">SUBMIT</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-12 no-scrollbar bg-slate-50">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Section: General Knowledge</span>
              <span>Artifact {current + 1} of {questions.length}</span>
            </div>
            <QuestionCard 
              question={questions[current]} 
              selected={answers[current]?.selectedOption || null} 
              activeLanguage={activeLang}
              onSelect={handleSelect} 
            />
          </div>
        </main>

        <aside className="w-[350px] bg-white border-l border-slate-200 flex flex-col">
           <div className="p-8 space-y-10 flex-1 overflow-y-auto no-scrollbar">
              <QuestionPalette questions={questions} current={current} answers={answers} setCurrent={setCurrent} />
           </div>
           <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase text-slate-500">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Answered</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-slate-200" /> Not Visited</div>
              </div>
           </div>
        </aside>
      </div>

      <footer className="h-20 px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
         <div className="flex gap-4">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 text-purple-600 font-black text-[10px] uppercase">Mark for Review</Button>
            <Button onClick={() => { setAnswers(prev => { const n = {...prev}; delete n[current]; return n; }); }} variant="ghost" className="h-12 px-8 rounded-xl text-slate-400 font-black text-[10px] uppercase">Clear Response</Button>
         </div>
         <div className="flex gap-4">
            <Button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} variant="outline" className="h-12 px-10 rounded-xl border-slate-200 font-black text-[10px] uppercase">PREVIOUS</Button>
            <Button onClick={() => { if(current < questions.length-1) setCurrent(c => c + 1); }} className="h-12 px-16 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase shadow-xl">SAVE & NEXT</Button>
         </div>
      </footer>
    </div>
  );
}