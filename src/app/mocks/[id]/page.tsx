'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
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
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  ShieldAlert, 
  FileText, 
  Languages,
  ArrowLeft,
  FileSearch,
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AttemptAnswer, QuestionStatus } from "@/types";
import { increment } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export default function MockPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  // Phase management
  const [phase, setPhase] = useState<'loading' | 'instructions' | 'test'>('loading');
  const [mock, setMock] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [sideBySide, setSideBySide] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'pa' | 'hi'>('en');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const testStartTime = useRef<number>(Date.now());

  useEffect(() => {
    async function init() {
      if (!user || !mockId) return;
      try {
        setLoading(true);
        const mockData = await getMockDetails(mockId);
        if (!mockData) {
          setErrorState("The requested simulation does not exist.");
          setLoading(false);
          return;
        }
        
        const access = await checkMockAccess(user.uid, mockData);
        if (!access.allowed) {
          toast({ title: "Access Denied", description: access.reason, variant: "destructive" });
          router.push('/exams');
          return;
        }

        const qData = await getMockQuestions(mockId);
        setMock(mockData);
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
          setPhase(state.status === 'ongoing' ? 'test' : 'instructions');
        } else {
          setPhase('instructions');
        }
      } catch (err: any) {
        setErrorState("A network synchronization error occurred. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    init();

    const handleVisibility = () => {
      if (document.hidden && phase === 'test' && attemptId) {
        updateAttemptActivity(attemptId, { cheatFlags: increment(1) });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [mockId, user, router, toast, phase, attemptId]);

  const handleSaveAndNext = async (isMarkForReview = false) => {
    if (!attemptId || !questions[current]) return;
    
    const timeSpent = Date.now() - testStartTime.current;
    testStartTime.current = Date.now();

    const currentAnswer = answers[current];
    const hasSelected = !!currentAnswer?.selectedOption;
    
    let status: QuestionStatus = 'NOT_ANSWERED';
    if (isMarkForReview) {
      status = hasSelected ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW';
    } else if (hasSelected) {
      status = 'ANSWERED';
    }

    const answerData: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: currentAnswer?.selectedOption || null,
      status,
      timeSpent: (currentAnswer?.timeSpent || 0) + timeSpent,
      lastSavedAt: Date.now()
    };

    setAnswers(prev => ({ ...prev, [current]: answerData }));
    saveQuestionState(attemptId, current, answerData);

    if (current < questions.length - 1) {
      const nextIdx = current + 1;
      setCurrent(nextIdx);
      updateAttemptActivity(attemptId, { currentQuestionIndex: nextIdx });
    }
  };

  const handleClear = () => {
    if (!attemptId) return;
    const answerData: AttemptAnswer = {
      ...answers[current],
      selectedOption: null,
      status: 'NOT_ANSWERED',
      lastSavedAt: Date.now(),
      questionId: questions[current]?.id || ''
    };
    setAnswers(prev => ({ ...prev, [current]: answerData }));
    saveQuestionState(attemptId, current, answerData);
  };

  const submitTest = useCallback(async () => {
    if (submitting || !user || !attemptId || !mock) return;
    setSubmitting(true);
    
    const analytics = generateAnalytics({ questions, answers, mock });
    
    try {
      await finalizeAttempt(user.uid, attemptId, analytics, 50);
      updateUserRank(user.uid, profile?.name || "Aspirant", 50, analytics.accuracy);
      trackProgress(user.uid, 'mocks', 1);
      router.push("/mocks/result");
    } catch (e: any) {
      toast({ title: "Submission Failure", variant: "destructive" });
      setSubmitting(false);
    }
  }, [submitting, user, questions, answers, mock, attemptId, profile?.name, router, toast]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Initializing CBT Stream...</p>
    </div>
  );

  if (errorState) return (
    <div className="h-screen bg-black flex items-center justify-center p-6 text-center">
       <div className="max-w-md space-y-8 bg-zinc-900/50 p-12 rounded-[48px] border border-white/5 shadow-2xl">
          <FileSearch className="text-red-500 w-16 h-16 mx-auto" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Portal Offline</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">{errorState}</p>
          <Button onClick={() => router.push('/exams')} className="w-full h-12 rounded-xl bg-primary font-black">
             Return to Arena
          </Button>
       </div>
    </div>
  );

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none">{mock.title}</h1>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{mock.exam} • Production Port</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] px-3 py-1 uppercase">{mock.accessType}</Badge>
          </header>

          <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 md:p-12 space-y-8 shadow-2xl">
             <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-zinc-200">
                  <ShieldAlert className="text-primary w-6 h-6" /> Portal Instructions
                </h3>
                <div className="grid md:grid-cols-2 gap-12 text-sm text-zinc-400 leading-relaxed">
                   <div className="space-y-4">
                      <p><span className="text-primary font-black">1.</span> Total Time: <strong>{mock.duration} minutes</strong>. Auto-submit enabled.</p>
                      <p><span className="text-primary font-black">2.</span> Penalty: <strong>{mock.negativeMarking}</strong> per incorrect match.</p>
                   </div>
                   <div className="space-y-4">
                      <p><span className="text-primary font-black">3.</span> Anti-Cheat: Tab switching is monitored and flagged.</p>
                      <p><span className="text-primary font-black">4.</span> Persistence: Answers are synced in background.</p>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-white/5 flex items-start gap-4">
                <Checkbox id="confirm" checked={hasConfirmed} onCheckedChange={(v) => setHasConfirmed(!!v)} className="mt-1 border-primary" />
                <label htmlFor="confirm" className="text-xs font-medium text-zinc-500 leading-relaxed cursor-pointer">
                  I confirm that I am using a stable connection and agree to the PSSSB/PPSC compliant examination protocols.
                </label>
             </div>

             <Button 
               onClick={() => { setPhase('test'); updateAttemptActivity(attemptId!, { status: 'ongoing' }); }} 
               disabled={!hasConfirmed} 
               className="w-full h-20 rounded-[28px] bg-primary text-xl font-black text-white shadow-xl hover:scale-[1.01] transition-all"
             >
                AGREE & INITIALIZE SESSION
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050816] text-white flex flex-col overflow-hidden select-none">
      <header className="h-16 px-6 bg-zinc-950 border-b border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
             <FileText className="text-primary w-4 h-4" />
           </div>
           <div className="hidden sm:block">
              <span className="font-black text-sm text-white uppercase tracking-tight truncate max-w-[300px] block">{mock.title}</span>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{mock.exam}</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <Timer duration={mock.duration} onFinish={submitTest} />
           
           <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
             {['en', 'pa'].map((l: any) => (
               <button 
                 key={l}
                 onClick={() => { setActiveLang(l); setSideBySide(false); }}
                 className={cn(
                   "px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", 
                   activeLang === l && !sideBySide ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300"
                 )}
               >
                 {l === 'en' ? 'EN' : 'ਪੰ'}
               </button>
             ))}
             <button 
               onClick={() => setSideBySide(!sideBySide)}
               className={cn(
                 "px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", 
                 sideBySide ? "bg-primary text-white" : "text-zinc-500"
               )}
             >
               BILINGUAL
             </button>
           </div>

           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6 rounded-xl font-black text-[10px] tracking-widest" onClick={submitTest}>
             SUBMIT
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6 pb-24">
             {questions[current] && (
               <QuestionCard 
                 question={questions[current]} 
                 selected={answers[current]?.selectedOption || null} 
                 onSelect={(opt) => setAnswers(prev => ({...prev, [current]: { ...prev[current], selectedOption: opt }}))} 
                 sideBySide={sideBySide}
                 activeLanguage={activeLang}
               />
             )}
          </div>
        </main>

        <aside className="hidden lg:flex w-[350px] bg-zinc-950 border-l border-white/5 flex-col shrink-0">
          <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Maximize2 className="text-primary w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Question Navigator</h3>
             </div>
             
             <QuestionPalette 
               questions={questions} 
               current={current} 
               answers={answers} 
               setCurrent={(idx) => { setCurrent(idx); updateAttemptActivity(attemptId!, { currentQuestionIndex: idx }); }} 
             />

             <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase">
                   <div className="w-3 h-3 rounded bg-emerald-500" /> Answered
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase">
                   <div className="w-3 h-3 rounded bg-red-500" /> Unanswered
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase">
                   <div className="w-3 h-3 rounded bg-purple-600" /> Marked
                </div>
             </div>
          </div>
        </aside>
      </div>

      <footer className="h-20 px-8 bg-zinc-950 border-t border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex gap-3">
           <Button 
             variant="outline" 
             className="h-11 px-6 rounded-xl border-white/10 font-bold text-[10px] uppercase tracking-widest" 
             onClick={() => setCurrent(Math.max(0, current - 1))} 
             disabled={current === 0}
           >
              PREVIOUS
           </Button>
           <Button 
             variant="ghost" 
             className="h-11 px-6 rounded-xl font-bold text-[10px] text-red-500 uppercase tracking-widest hover:bg-red-500/10" 
             onClick={handleClear}
           >
              CLEAR
           </Button>
        </div>
        
        <div className="flex gap-3">
           <Button 
             variant="outline" 
             className="h-11 px-6 rounded-xl border-purple-500/20 bg-purple-500/5 text-purple-500 font-bold text-[10px] tracking-widest uppercase hover:bg-purple-500/10" 
             onClick={() => handleSaveAndNext(true)}
           >
              MARK REVIEW
           </Button>
           <Button 
             className="h-11 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] tracking-widest uppercase blue-glow" 
             onClick={() => handleSaveAndNext(false)}
           >
              SAVE & NEXT
           </Button>
        </div>
      </footer>
    </div>
  );
}
