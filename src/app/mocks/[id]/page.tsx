
'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockService } from "@/services/mockService";
import { 
  startAttempt, 
  getAttemptState, 
  saveQuestionState, 
  updateAttemptActivity,
  finalizeAttempt,
  checkMockAccess
} from "@/services/mocks";
import { updateUserRank } from "@/services/leaderboard";
import { trackProgress } from "@/services/daily-target";
import QuestionCard from "@/components/mock/question-card";
import QuestionPalette from "@/components/mock/question-palette";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, FileSearch, ArrowLeft, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { AttemptAnswer } from "@/types";
import { AppErrorBoundary } from "@/components/error-boundary";

type EnginePhase = 'loading' | 'instructions' | 'engine' | 'error';

export default function MockPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<EnginePhase>('loading');
  const [mock, setMock] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [initializing, setInitializing] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<number>(Date.now());

  // STABILIZED INITIALIZATION (Mount only)
  useEffect(() => {
    if (!user || !mockId || initializing) return;
    
    async function init() {
      setInitializing(true);
      console.count("Mock Engine Init");
      
      try {
        const mockData = await mockService.getMock(mockId);
        if (!mockData) {
          setErrorMsg("Test artifact not found.");
          setPhase('error');
          return;
        }
        setMock(mockData);

        const access = await checkMockAccess(user.uid, mockData);
        if (!access.allowed) {
          router.push('/pass');
          return;
        }

        const qData = await mockService.getQuestions(mockId);
        setQuestions(qData);
        
        const id = await startAttempt(user.uid, mockData);
        setAttemptId(id);

        const state = await getAttemptState(id);
        if (state) {
          if (state.status === 'completed') {
            router.push('/mocks/result');
            return;
          }
          if (state.answers) setAnswers(state.answers);
          setCurrent(state.currentQuestionIndex || 0);
          setPhase(state.status === 'ongoing' ? 'engine' : 'instructions');
        } else {
          setPhase('instructions');
        }
      } catch (err) {
        setErrorMsg("Session synchronization failed.");
        setPhase('error');
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, [mockId, user]); // Empty init dependency if possible, but params/user needed once.

  const handleAction = async (isReview = false) => {
    if (!attemptId || !questions[current]) return;
    
    const now = Date.now();
    const duration = now - timerRef.current;
    timerRef.current = now;

    const existing = answers[current];
    const newStatus = isReview 
      ? (existing?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW')
      : (existing?.selectedOption ? 'ANSWERED' : 'NOT_ANSWERED');

    const payload: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: existing?.selectedOption || null,
      status: newStatus as any,
      timeSpent: (existing?.timeSpent || 0) + duration,
      lastSavedAt: now
    };

    setAnswers(prev => ({ ...prev, [current]: payload }));
    saveQuestionState(attemptId, current, payload);

    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
      updateAttemptActivity(attemptId, { currentQuestionIndex: current + 1 });
    }
  };

  const submitTest = useCallback(async () => {
    if (!user || !attemptId || !mock) return;
    try {
      const analytics = generateAnalytics({ questions, answers, mock });
      await finalizeAttempt(user.uid, attemptId, analytics, 50);
      updateUserRank(user.uid, profile?.name || "Aspirant", 50, analytics.accuracy);
      trackProgress(user.uid, 'mocks', 1);
      router.push("/mocks/result");
    } catch (e) {
      toast({ title: "Submission Error", variant: "destructive" });
    }
  }, [user, questions, answers, mock, attemptId, profile, router, toast]);

  if (phase === 'loading') return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Securing Connection...</p>
    </div>
  );

  if (phase === 'error') return (
    <div className="h-screen bg-black flex items-center justify-center p-6 text-center">
       <div className="max-w-sm space-y-6 bg-zinc-900/50 p-10 rounded-[40px] border border-white/5">
          <FileSearch className="text-red-500 w-12 h-12 mx-auto" />
          <h2 className="text-xl font-bold uppercase">Signal Lost</h2>
          <p className="text-zinc-500 text-sm">{errorMsg}</p>
          <Button onClick={() => router.push('/exams')} className="w-full h-12 rounded-xl bg-primary">Back to Arena</Button>
       </div>
    </div>
  );

  if (phase === 'instructions') return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
         <header className="flex justify-between items-center border-b border-white/5 pb-6">
            <div>
              <h1 className="text-2xl font-black uppercase">{mock?.title}</h1>
              <p className="text-xs font-bold text-zinc-500 uppercase">{mock?.exam} Board</p>
            </div>
         </header>
         <div className="p-10 rounded-[40px] bg-zinc-900/40 border border-white/5 space-y-8">
            <div className="space-y-4">
               <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert className="text-primary w-5 h-5" /> Protocol</h3>
               <ul className="space-y-3 text-sm text-zinc-400">
                  <li>• Duration: <strong className="text-white">{mock?.duration} Mins</strong></li>
                  <li>• Penalty: <strong className="text-white">{mock?.negativeMarking}</strong> per error</li>
               </ul>
            </div>
            <div className="flex items-start gap-3 bg-black/20 p-6 rounded-2xl border border-white/5">
               <Checkbox id="c" checked={hasConfirmed} onCheckedChange={(v) => setHasConfirmed(!!v)} />
               <label htmlFor="c" className="text-xs text-zinc-500 cursor-pointer">I acknowledge the rules and agree to start.</label>
            </div>
            <Button onClick={() => { setPhase('engine'); updateAttemptActivity(attemptId!, { status: 'ongoing' }); }} disabled={!hasConfirmed} className="w-full h-16 rounded-[24px] bg-primary font-black">START SESSION</Button>
         </div>
      </div>
    </div>
  );

  return (
    <AppErrorBoundary>
      <div className="h-screen bg-[#050816] text-white flex flex-col overflow-hidden select-none">
        <header className="h-16 px-6 bg-zinc-950 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.push('/exams')}><ArrowLeft className="w-4 h-4" /></Button>
             <span className="font-black text-sm uppercase tracking-tight">{mock?.title}</span>
          </div>
          <div className="flex items-center gap-6">
             <Timer duration={mock?.duration || 60} onFinish={submitTest} />
             <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-black text-[10px]" onClick={submitTest}>SUBMIT</Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto">
               {questions[current] && (
                 <QuestionCard 
                   question={questions[current]} 
                   selected={answers[current]?.selectedOption || null} 
                   onSelect={(opt) => setAnswers(prev => ({...prev, [current]: { ...prev[current], selectedOption: opt }}))} 
                 />
               )}
            </div>
          </main>
          <aside className="hidden lg:flex w-80 bg-zinc-950 border-l border-white/5 flex-col">
             <div className="p-8">
                <QuestionPalette questions={questions} current={current} answers={answers} setCurrent={setCurrent} />
             </div>
          </aside>
        </div>

        <footer className="h-20 px-8 bg-zinc-950 border-t border-white/5 flex items-center justify-between shrink-0">
           <Button variant="outline" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>PREV</Button>
           <Button className="h-10 px-10 rounded-xl bg-primary text-[10px] font-black" onClick={() => handleAction(false)}>SAVE & NEXT</Button>
        </footer>
      </div>
    </AppErrorBoundary>
  );
}
