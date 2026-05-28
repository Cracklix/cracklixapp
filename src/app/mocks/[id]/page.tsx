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
  finalizeAttempt 
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
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AttemptAnswer, QuestionStatus } from "@/types";
import { increment } from "firebase/firestore";

export default function MockPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { id: mockId } = useParams() as { id: string };
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

  const testStartTime = useRef<number>(Date.now());

  // 1. Initial Load & Attempt Initialization
  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        const mockData = await getMockDetails(mockId);
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
          setPhase('test');
        }
      } catch (error: any) {
        toast({ title: "Portal Busy", description: error.message, variant: "destructive" });
        router.push('/exams');
      } finally {
        setLoading(false);
      }
    }
    init();

    const handleVisibility = () => {
      if (document.hidden && phase === 'test' && attemptId) {
        updateAttemptActivity(attemptId, { cheatFlags: increment(1) });
        toast({ title: "Protocol Alert", description: "Tab switching is monitored.", variant: "destructive" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [mockId, user, router, toast, phase, attemptId]);

  // 2. Interaction Logic
  const handleSaveAndNext = async (isMarkForReview = false) => {
    if (!attemptId) return;
    
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
      lastSavedAt: Date.now()
    };
    setAnswers({ ...answers, [current]: answerData });
    await saveQuestionState(attemptId, current, answerData);
  };

  const submitTest = useCallback(async () => {
    if (submitting || !user || !attemptId) return;
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
    <div className="h-screen bg-white flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Establishing Secure CBT Signal...</p>
    </div>
  );

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 overflow-y-auto font-body">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-800">{mock.title}</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{mock.exam} • Production Environment</p>
            </div>
          </header>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 space-y-8 shadow-sm">
             <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-slate-700">
                  <ShieldAlert className="text-primary" /> Candidates Briefing
                </h3>
                <div className="grid md:grid-cols-2 gap-10 text-sm text-slate-600 leading-relaxed">
                   <div className="space-y-4">
                      <p>1. Total duration: <strong>{mock.duration} minutes</strong>.</p>
                      <p>2. Negative marking of <strong>{mock.negativeMarking}</strong> per wrong answer.</p>
                      <p>3. Do not switch tabs or minimize the browser. Doing so will flag the attempt.</p>
                   </div>
                   <div className="space-y-4">
                      <p>4. Use the <strong>Save & Next</strong> button to persist your responses.</p>
                      <p>5. Review mode allows you to mark questions for later scrutiny.</p>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-slate-100 flex items-start gap-4">
                <Checkbox id="confirm" checked={hasConfirmed} onCheckedChange={(v) => setHasConfirmed(!!v)} className="mt-1" />
                <label htmlFor="confirm" className="text-sm font-medium text-slate-500 leading-relaxed cursor-pointer">
                  I have read and understood the instructions. I agree to abide by the official rules of the examination board.
                </label>
             </div>

             <Button 
               onClick={() => setPhase('test')} 
               disabled={!hasConfirmed} 
               className="w-full h-16 rounded-2xl bg-primary text-lg font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform"
             >
                I AM READY TO BEGIN
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F0F2F5] text-slate-900 flex flex-col overflow-hidden select-none font-body">
      <header className="h-14 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
             <FileText className="text-primary w-4 h-4" />
           </div>
           <span className="font-bold text-sm text-slate-700 truncate max-w-[300px]">{mock.title}</span>
        </div>

        <div className="flex items-center gap-6">
           <Timer duration={mock.duration} onFinish={submitTest} />
           
           <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
             {['en', 'pa'].map((l: any) => (
               <button 
                 key={l}
                 onClick={() => { setActiveLang(l); setSideBySide(false); }}
                 className={cn(
                   "px-3 py-1 rounded-lg text-[10px] font-black transition-all", 
                   activeLang === l && !sideBySide ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
                 )}
               >
                 {l === 'en' ? 'ENGLISH' : 'ਪੰਜਾਬੀ'}
               </button>
             ))}
             <button 
               onClick={() => setSideBySide(!sideBySide)}
               className={cn(
                 "px-3 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5", 
                 sideBySide ? "bg-white text-primary shadow-sm" : "text-slate-500"
               )}
             >
               <Columns size={10} /> BILINGUAL
             </button>
           </div>

           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6 rounded-lg font-black text-[11px] tracking-widest shadow-lg shadow-emerald-500/10" onClick={submitTest}>
             FINALIZE
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6 pb-32">
             <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question {current + 1} of {questions.length}</span>
                <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-500">PENALTY: -{mock.negativeMarking}</Badge>
             </div>
             
             <QuestionCard 
               question={questions[current]} 
               selected={answers[current]?.selectedOption || null} 
               onSelect={(opt) => setAnswers({...answers, [current]: { ...answers[current], selectedOption: opt }})} 
               sideBySide={sideBySide}
               activeLanguage={activeLang}
             />
          </div>
        </main>

        <aside className="hidden lg:flex w-[380px] bg-white border-l border-slate-200 flex-col shrink-0 shadow-2xl">
          <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Maximize2 className="text-slate-300 w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">CBT Palette</h3>
                   <p className="text-sm font-bold text-slate-700">Section: General Hub</p>
                </div>
             </div>
             
             <QuestionPalette 
               questions={questions} 
               current={current} 
               answers={answers} 
               setCurrent={(idx) => { setCurrent(idx); setVisited(new Set(visited).add(idx)); }} 
             />

             <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-emerald-500 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-red-500 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-purple-600 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Marked</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-slate-200 shadow-sm" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Not Visited</span>
                </div>
             </div>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-200">
             <div className="p-5 rounded-2xl bg-white border border-slate-200 flex justify-between items-center">
                <div className="text-center">
                   <p className="text-[10px] font-black text-slate-400">XP</p>
                   <p className="font-black text-primary text-xl">50</p>
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <div className="text-center">
                   <p className="text-[10px] font-black text-slate-400">ACC</p>
                   <p className="font-black text-emerald-500 text-xl">--</p>
                </div>
             </div>
          </div>
        </aside>
      </div>

      <footer className="h-20 px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             className="h-12 px-6 rounded-xl border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50" 
             onClick={() => setCurrent(Math.max(0, current - 1))} 
             disabled={current === 0}
           >
              BACK
           </Button>
           <Button 
             variant="outline" 
             className="h-12 px-6 rounded-xl border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50" 
             onClick={handleClear}
           >
              CLEAR
           </Button>
        </div>
        
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             className="h-12 px-8 rounded-xl border-purple-200 bg-purple-50 text-purple-700 font-black text-[11px] tracking-widest uppercase hover:bg-purple-100" 
             onClick={() => handleSaveAndNext(true)}
           >
              MARK FOR REVIEW
           </Button>
           <Button 
             className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] tracking-widest uppercase shadow-xl shadow-primary/20" 
             onClick={() => handleSaveAndNext(false)}
           >
              SAVE & NEXT
           </Button>
        </div>
      </footer>
    </div>
  );
}
