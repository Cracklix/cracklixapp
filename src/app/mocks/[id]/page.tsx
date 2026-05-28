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
  Send, 
  Loader2, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Languages,
  RotateCcw,
  AlertTriangle,
  Columns,
  Maximize2,
  Lock,
  ArrowLeft,
  FileSearch
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // CBT Engine State
  const [phase, setPhase] = useState<'instructions' | 'test'>('instructions');
  const [mock, setMock] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [sideBySide, setSideBySide] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'pa' | 'hi'>('en');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const testStartTime = useRef<number>(Date.now());

  // 1. Initial Load & Access Validation
  useEffect(() => {
    async function init() {
      if (!user || !mockId) return;
      try {
        setLoading(true);
        setErrorState(null);

        const mockData = await getMockDetails(mockId);
        if (!mockData) {
          setErrorState("The requested simulation does not exist or has been retired.");
          setLoading(false);
          return;
        }
        
        // SECURITY PRE-FLIGHT: Check Access & Limits
        const access = await checkMockAccess(user.uid, mockData);
        if (!access.allowed) {
          toast({ 
            title: "Access Denied", 
            description: access.reason || "This simulation is restricted.", 
            variant: "destructive" 
          });
          router.push('/exams');
          return;
        }

        const questionData = await getMockQuestions(mockId);
        setMock(mockData);
        setQuestions(questionData);
        
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
          
          // Auto-resume if session is ongoing
          if (state.status === 'ongoing') {
            setPhase('test');
          }
        }
      } catch (error: any) {
        console.error("CBT Engine Startup Error:", error);
        toast({ title: "Portal Busy", description: "Could not synchronize with the exam server.", variant: "destructive" });
        setErrorState("A technical synchronization error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();

    const handleVisibility = () => {
      if (document.hidden && phase === 'test' && attemptId) {
        updateAttemptActivity(attemptId, { cheatFlags: increment(1) });
        toast({ title: "Protocol Alert", description: "Tab switching is monitored to ensure test integrity.", variant: "destructive" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [mockId, user, router, toast, phase, attemptId]);

  // 2. Interaction Logic
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

    const newAnswers = { ...answers, [current]: answerData };
    setAnswers(newAnswers);
    await saveQuestionState(attemptId, current, answerData);

    if (current < questions.length - 1) {
      const nextIdx = current + 1;
      setCurrent(nextIdx);
      setVisited(new Set(visited).add(nextIdx));
      updateAttemptActivity(attemptId, { currentQuestionIndex: nextIdx });
    }
  };

  const handleClear = async () => {
    if (!attemptId) return;
    const answerData: AttemptAnswer = {
      ...answers[current],
      selectedOption: null,
      status: 'NOT_ANSWERED',
      lastSavedAt: Date.now(),
      questionId: questions[current]?.id || ''
    };
    setAnswers({ ...answers, [current]: answerData });
    await saveQuestionState(attemptId, current, answerData);
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
      toast({ title: "Submission Error", variant: "destructive" });
      setSubmitting(false);
    }
  }, [submitting, user, questions, answers, mock, attemptId, profile?.name, router, toast]);

  if (loading) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
      <div className="relative">
         <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
         <Maximize2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 animate-pulse" />
      </div>
      <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em] animate-pulse">Synchronizing CBT Access...</p>
    </div>
  );

  if (errorState) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
       <div className="max-w-md space-y-8 bg-white p-12 rounded-[48px] shadow-sm border border-slate-200">
          <div className="w-20 h-20 rounded-[32px] bg-red-50 flex items-center justify-center mx-auto">
             <FileSearch className="text-red-500 w-10 h-10" />
          </div>
          <div className="space-y-3">
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Signal Interrupted</h2>
             <p className="text-slate-500 text-sm leading-relaxed">{errorState}</p>
          </div>
          <Button onClick={() => router.push('/exams')} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black">
             <ArrowLeft className="mr-2 w-5 h-5" /> Back to Arena
          </Button>
       </div>
    </div>
  );

  // Safety guard for rendering null data
  if (!mock || !questions) return null;

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 overflow-y-auto font-body">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase leading-none">{mock.title}</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{mock.exam} • Production Board</p>
            </div>
            <div className="flex gap-4">
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] px-3 py-1 uppercase">{mock.accessType}</Badge>
            </div>
          </header>

          <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 space-y-8 shadow-sm">
             <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-slate-700">
                  <ShieldAlert className="text-primary w-6 h-6" /> Candidate Instructions
                </h3>
                <div className="grid md:grid-cols-2 gap-12 text-sm text-slate-600 leading-relaxed">
                   <div className="space-y-4">
                      <p className="flex gap-3"><span className="font-black text-primary">01.</span> Total duration: <strong>{mock.duration} minutes</strong>. Exam will auto-submit on completion.</p>
                      <p className="flex gap-3"><span className="font-black text-primary">02.</span> Negative marking: <strong>{mock.negativeMarking}</strong> per incorrect response.</p>
                      <p className="flex gap-3"><span className="font-black text-primary">03.</span> Do not switch tabs. <strong>Anti-Cheat Shield</strong> is monitoring your device focal point.</p>
                   </div>
                   <div className="space-y-4">
                      <p className="flex gap-3"><span className="font-black text-primary">04.</span> Status colors: <span className="text-emerald-600 font-bold">Answered</span>, <span className="text-red-600 font-bold">Unanswered</span>, <span className="text-purple-600 font-bold">Marked</span>.</p>
                      <p className="flex gap-3"><span className="font-black text-primary">05.</span> Ensure a stable internet signal for real-time attempt persistence.</p>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-slate-100 flex items-start gap-4">
                <Checkbox id="confirm" checked={hasConfirmed} onCheckedChange={(v) => setHasConfirmed(!!v)} className="mt-1" />
                <label htmlFor="confirm" className="text-sm font-medium text-slate-500 leading-relaxed cursor-pointer select-none">
                  I have read and understood the official instructions. I confirm that I am using a single authorized device for this attempt and will adhere to the board's protocol.
                </label>
             </div>

             <Button 
               onClick={() => setPhase('test')} 
               disabled={!hasConfirmed} 
               className="w-full h-20 rounded-[28px] bg-primary text-xl font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-95 disabled:opacity-50"
             >
                AGREE & BEGIN SIMULATION
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F0F2F5] text-slate-900 flex flex-col overflow-hidden select-none font-body">
      <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
             <FileText className="text-primary w-5 h-5" />
           </div>
           <div>
              <span className="font-black text-sm text-slate-800 truncate max-w-[200px] md:max-w-[400px] block uppercase tracking-tight">{mock.title}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mock.exam}</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <Timer duration={mock.duration} onFinish={submitTest} />
           
           <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
             {['en', 'pa'].map((l: any) => (
               <button 
                 key={l}
                 onClick={() => { setActiveLang(l); setSideBySide(false); }}
                 className={cn(
                   "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", 
                   activeLang === l && !sideBySide ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
                 )}
               >
                 {l === 'en' ? 'ENGLISH' : 'ਪੰਜਾਬੀ'}
               </button>
             ))}
             <button 
               onClick={() => setSideBySide(!sideBySide)}
               className={cn(
                 "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2", 
                 sideBySide ? "bg-white text-primary shadow-sm" : "text-slate-500"
               )}
             >
               <Columns size={12} /> BILINGUAL
             </button>
           </div>

           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 rounded-xl font-black text-xs tracking-widest shadow-lg shadow-emerald-500/10" onClick={submitTest}>
             FINALIZE
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6 pb-32">
             <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Question {current + 1} of {questions.length}</span>
                <div className="flex items-center gap-4">
                   <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-500 px-3 py-1 uppercase">Positive: +1.0</Badge>
                   <Badge variant="outline" className="text-[9px] font-black border-red-100 text-red-500 px-3 py-1 uppercase bg-red-50/50">Penalty: -{mock.negativeMarking}</Badge>
                </div>
             </div>
             
             {questions[current] ? (
               <QuestionCard 
                 question={questions[current]} 
                 selected={answers[current]?.selectedOption || null} 
                 onSelect={(opt) => setAnswers({...answers, [current]: { ...answers[current], selectedOption: opt }})} 
                 sideBySide={sideBySide}
                 activeLanguage={activeLang}
               />
             ) : (
               <div className="h-[400px] flex items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 italic">Syncing artifact data...</p>
               </div>
             )}
          </div>
        </main>

        <aside className="hidden lg:flex w-[380px] bg-white border-l border-slate-200 flex-col shrink-0 shadow-2xl">
          <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Maximize2 className="text-primary w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">CBT Palette</h3>
                   <p className="text-sm font-bold text-slate-800">Master Board Signal</p>
                </div>
             </div>
             
             <QuestionPalette 
               questions={questions} 
               current={current} 
               answers={answers} 
               setCurrent={(idx) => { setCurrent(idx); setVisited(new Set(visited).add(idx)); }} 
             />

             <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-emerald-500 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-red-500 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-purple-600 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marked</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-slate-200 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Not Visited</span>
                </div>
             </div>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-200">
             <div className="p-6 rounded-3xl bg-white border border-slate-200 flex justify-between items-center shadow-sm">
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">XP LOAD</p>
                   <p className="font-black text-primary text-2xl">50</p>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SIGNAL</p>
                   <p className="font-black text-emerald-500 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SECURE
                   </p>
                </div>
             </div>
          </div>
        </aside>
      </div>

      <footer className="h-20 px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             className="h-12 px-8 rounded-2xl border-slate-200 font-black text-[11px] text-slate-600 hover:bg-slate-50 uppercase tracking-widest" 
             onClick={() => setCurrent(Math.max(0, current - 1))} 
             disabled={current === 0}
           >
              PREVIOUS
           </Button>
           <Button 
             variant="ghost" 
             className="h-12 px-8 rounded-2xl font-black text-[11px] text-red-500 hover:bg-red-50 uppercase tracking-widest" 
             onClick={handleClear}
           >
              CLEAR RESPONSE
           </Button>
        </div>
        
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             className="h-12 px-8 rounded-2xl border-purple-200 bg-purple-50/50 text-purple-700 font-black text-[11px] tracking-widest uppercase hover:bg-purple-100 transition-all" 
             onClick={() => handleSaveAndNext(true)}
           >
              MARK FOR REVIEW
           </Button>
           <Button 
             className="h-12 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] tracking-widest uppercase shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" 
             onClick={() => handleSaveAndNext(false)}
           >
              SAVE & NEXT
           </Button>
        </div>
      </footer>
    </div>
  );
}
