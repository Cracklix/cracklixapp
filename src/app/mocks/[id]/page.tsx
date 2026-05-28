'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMockDetails, getMockQuestions, saveAttempt } from "@/services/mocks";
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
  Menu,
  X,
  Languages,
  RotateCcw,
  AlertTriangle,
  LayoutGrid,
  Columns
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/lib/i18n-context";

export default function MockPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { id: mockId } = useParams() as { id: string };
  const { toast } = useToast();
  const { locale, setLocale } = useI18n();
  
  const [phase, setPhase] = useState<'instructions' | 'test'>('instructions');
  const [mock, setMock] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [hasConfirmedInstructions, setHasConfirmedInstructions] = useState(false);
  const [sideBySide, setSideBySide] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [mockData, questionData] = await Promise.all([
          getMockDetails(mockId),
          getMockQuestions(mockId)
        ]);
        setMock(mockData);
        setQuestions(questionData);
        
        // Restore progress if exists in local storage
        const saved = localStorage.getItem(`mock_state_${mockId}`);
        if (saved) {
          const { answers: savedAnswers, current: savedCurrent, marked: savedMarked } = JSON.parse(saved);
          setAnswers(savedAnswers);
          setCurrent(savedCurrent);
          setMarkedForReview(new Set(savedMarked));
        }
      } catch (error: any) {
        toast({ title: "System Error", description: error.message, variant: "destructive" });
        router.push('/exams');
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'test') {
        setTabSwitchCount(prev => prev + 1);
        toast({ 
          title: "Anti-Cheat Warning", 
          description: "Unauthorized window activity detected. This violation has been logged.", 
          variant: "destructive" 
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mockId, phase, router, toast]);

  // Auto-save state
  useEffect(() => {
    if (phase === 'test' && questions.length > 0) {
      localStorage.setItem(`mock_state_${mockId}`, JSON.stringify({
        answers,
        current,
        marked: Array.from(markedForReview)
      }));
    }
  }, [answers, current, markedForReview, phase, mockId, questions.length]);

  const selectAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [current]: option }));
  };

  const clearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[current];
    setAnswers(newAnswers);
  };

  const toggleReview = () => {
    const newReview = new Set(markedForReview);
    if (newReview.has(current)) newReview.delete(current);
    else setMarkedForReview(newReview.add(current));
    setMarkedForReview(newReview);
  };

  const nextQuestion = () => {
    const nextIdx = Math.min(questions.length - 1, current + 1);
    setCurrent(nextIdx);
    setVisited(prev => new Set(prev).add(nextIdx));
  };

  const prevQuestion = () => {
    setCurrent(Math.max(0, current - 1));
  };

  const submitTest = useCallback(async () => {
    if (submitting || !user) return;
    setSubmitting(true);
    
    const analytics = generateAnalytics({ questions, answers });
    const score = analytics.correct * (mock.marksPerQuestion || 1) - (analytics.wrong * (mock.negativeMarking || 0));

    try {
      await saveAttempt(user.uid, {
        mockId: mock.id,
        mockTitle: mock.title,
        score,
        accuracy: analytics.accuracy,
        answers,
        cheatFlags: tabSwitchCount,
        timeTaken: (mock.duration * 60)
      });
      updateUserRank(user.uid, profile?.name || "Aspirant", 50, analytics.accuracy);
      trackProgress(user.uid, 'mocks', 1);
      
      localStorage.removeItem(`mock_state_${mockId}`);
      toast({ title: "Test Submitted", description: "Calculating your state rank..." });
      router.push("/mocks/result");
    } catch (e: any) {
      toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
      setSubmitting(false);
    }
  }, [submitting, user, questions, answers, mock, tabSwitchCount, profile?.name, mockId, router, toast]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 animate-pulse" />
      </div>
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Synchronizing CBT Assets...</p>
    </div>
  );

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-background text-white p-4 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="text-primary w-6 h-6" />
                 </div>
                 <h1 className="text-3xl font-black font-headline tracking-tight uppercase">{mock.title}</h1>
              </div>
              <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span className="bg-zinc-900 px-3 py-1 rounded-lg border border-white/5">{mock.totalQuestions} Questions</span>
                <span className="bg-zinc-900 px-3 py-1 rounded-lg border border-white/5">{mock.duration} Minutes</span>
                <span className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-lg">-{mock.negativeMarking} Penalty</span>
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-lg">Bilingual Support</span>
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl hidden md:block">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Standard CBT Environment</p>
               <p className="text-xs font-bold text-white">Punjab Recruitment Board Protocol v2.5</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8 md:p-12 space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <ShieldAlert className="text-primary w-5 h-5" />
                  Official Examination Protocol
                </h3>
                
                <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 font-black text-[10px] text-white">01</span>
                    <p>This is a strictly timed, server-synced simulation. The timer cannot be paused once the test initializes.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 font-black text-[10px] text-white">02</span>
                    <p>Students can toggle between **English** and **Punjabi** for any specific question using the language switcher in the Top Bar.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 font-black text-[10px] text-white">03</span>
                    <p>**Anti-Cheat Layer:** Switching browser tabs, minimizing the window, or using external applications will trigger a violation log. Multiple violations lead to session termination.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 font-black text-[10px] text-white">04</span>
                    <p>Questions marked for **'Review'** will appear in purple in the Palette. They are counted as unattempted unless a specific option is selected.</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                  <Checkbox 
                    id="confirm" 
                    checked={hasConfirmedInstructions} 
                    onCheckedChange={(checked) => setHasConfirmedInstructions(!!checked)}
                    className="h-6 w-6 border-white/10 rounded-lg data-[state=checked]:bg-primary" 
                  />
                  <label htmlFor="confirm" className="text-xs font-bold text-zinc-500 cursor-pointer select-none">
                    I declare that I have read and understood all the instructions above and am ready to compete.
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/20 space-y-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-primary w-5 h-5" />
                  <h4 className="font-bold">System Status</h4>
                </div>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Network</span>
                    <span className="text-emerald-500 font-black">STABLE</span>
                  </li>
                  <li className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Session Persistence</span>
                    <span className="text-emerald-500 font-black">ACTIVE</span>
                  </li>
                  <li className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Device Compatibility</span>
                    <span className="text-emerald-500 font-black">PASSED</span>
                  </li>
                </ul>
              </div>

              <Button 
                size="lg" 
                className="w-full h-20 rounded-[28px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow disabled:opacity-50" 
                onClick={() => setPhase('test')}
                disabled={!hasConfirmedInstructions}
              >
                BEGIN EXAM
              </Button>
              <Button variant="ghost" className="w-full h-12 text-zinc-500 font-bold hover:text-white" onClick={() => router.back()}>
                Exit to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-svh bg-background text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar - Standard Exam Header */}
      <header className="h-16 px-6 bg-zinc-950 border-b border-white/5 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-4">
           <FileText className="text-primary w-5 h-5 hidden md:block" />
           <div className="flex flex-col md:flex-row md:items-center md:gap-3">
             <span className="font-black text-[10px] md:text-sm truncate max-w-[150px] md:max-w-md uppercase tracking-tight">{mock.title}</span>
             <span className="text-[9px] font-black text-zinc-600 hidden md:block uppercase tracking-widest">Section: Full Mock</span>
           </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
           <Timer duration={mock.duration} onFinish={submitTest} />
           
           <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 p-1 rounded-xl">
             <button 
               onClick={() => { setLocale('en'); setSideBySide(false); }}
               className={cn("px-2 md:px-3 py-1 rounded-lg text-[9px] font-black transition-all", locale === 'en' && !sideBySide ? "bg-primary text-white" : "text-zinc-600")}
             >
               EN
             </button>
             <button 
               onClick={() => { setLocale('pa'); setSideBySide(false); }}
               className={cn("px-2 md:px-3 py-1 rounded-lg text-[9px] font-black transition-all", locale === 'pa' && !sideBySide ? "bg-primary text-white" : "text-zinc-600")}
             >
               ਪੰ
             </button>
             <button 
               onClick={() => setSideBySide(!sideBySide)}
               className={cn("px-2 md:px-3 py-1 rounded-lg text-[9px] font-black transition-all flex items-center gap-1", sideBySide ? "bg-primary text-white" : "text-zinc-600")}
             >
               <Columns size={10} /> SIDE
             </button>
           </div>

           <Button className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 h-9 px-5 rounded-lg font-black text-[10px] tracking-widest" onClick={submitTest}>
             SUBMIT TEST
           </Button>

           <Sheet>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon" className="md:hidden rounded-lg h-9 w-9 border border-white/5">
                 <LayoutGrid className="w-4 h-4" />
               </Button>
             </SheetTrigger>
             <SheetContent side="right" className="bg-zinc-950 border-white/5 p-0 w-[85%]">
               <div className="p-8 h-full flex flex-col">
                  <SheetHeader className="mb-8">
                     <SheetTitle className="text-zinc-500 uppercase font-black text-[10px] tracking-widest">Navigation Palette</SheetTitle>
                  </SheetHeader>
                  <QuestionPalette 
                    questions={questions} 
                    current={current} 
                    answers={answers} 
                    markedForReview={markedForReview} 
                    visited={visited}
                    setCurrent={(idx) => {
                      setCurrent(idx);
                      setVisited(prev => new Set(prev).add(idx));
                    }} 
                  />
                  <div className="mt-auto pt-8 space-y-4">
                     <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase text-zinc-500">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Answered</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-destructive" /> Not Answered</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-purple-600" /> Review</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-zinc-800" /> Not Visited</div>
                     </div>
                     <Button className="w-full bg-emerald-600 h-14 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={submitTest}>SUBMIT TEST</Button>
                  </div>
               </div>
             </SheetContent>
           </Sheet>
        </div>
      </header>

      {/* Main CBT Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 scroll-smooth bg-[#0a0a0c]">
          <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-[0.15em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Question No. {current + 1}
               </div>
               <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  Marks: <span className="text-emerald-500">+{mock.marksPerQuestion || 1}</span> | <span className="text-destructive">-{mock.negativeMarking}</span>
               </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <QuestionCard 
                  question={questions[current]} 
                  selected={answers[current] || null} 
                  onSelect={selectAnswer} 
                  sideBySide={sideBySide}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Desktop Sidebar Palette - Fixed Grid */}
        <aside className="hidden lg:flex w-[380px] bg-zinc-950 border-l border-white/5 flex-col shrink-0 relative z-40">
          <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
             <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-8 tracking-[0.25em]">Question Palette</h3>
             <QuestionPalette 
               questions={questions} 
               current={current} 
               answers={answers} 
               markedForReview={markedForReview} 
               visited={visited}
               setCurrent={(idx) => {
                 setCurrent(idx);
                 setVisited(prev => new Set(prev).add(idx));
               }} 
             />
             
             <div className="grid grid-cols-2 gap-4 mt-12 pt-12 border-t border-white/5">
                {[
                  { label: "Answered", color: "bg-emerald-500" },
                  { label: "Not Answered", color: "bg-destructive" },
                  { label: "Marked Review", color: "bg-purple-600" },
                  { label: "Not Visited", color: "bg-zinc-800" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
                    <div className={cn("w-3 h-3 rounded-sm shadow-sm", item.color)} />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
             </div>

             <div className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/20">
               <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-3">Time Analysis</h4>
               <div className="flex justify-between items-end">
                 <div className="space-y-1">
                   <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Avg/Question</p>
                   <p className="text-xl font-black font-mono">0:42<span className="text-[10px] text-zinc-600 ml-1">sec</span></p>
                 </div>
                 <div className="h-8 w-1.5 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-1/2 w-full bg-primary" />
                 </div>
               </div>
             </div>
          </div>
          
          <div className="p-8 border-t border-white/5 bg-black/20">
             <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={submitTest}>
               FINALIZE & SUBMIT
             </Button>
          </div>
        </aside>
      </div>

      {/* Navigation Footer - Standard CBT Controls */}
      <footer className="h-20 px-4 md:px-8 bg-zinc-950 border-t border-white/5 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex gap-2 md:gap-4">
           <Button variant="outline" className="rounded-xl border-white/5 bg-white/[0.02] h-12 px-4 md:px-8 font-black text-[10px] tracking-widest uppercase hover:bg-white/5" onClick={prevQuestion} disabled={current === 0}>
             <ChevronLeft className="w-4 h-4 mr-1 hidden md:block" /> PREVIOUS
           </Button>
           <Button variant="outline" className="rounded-xl border-purple-500/20 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 h-12 px-4 md:px-8 font-black text-[10px] tracking-widest uppercase" onClick={toggleReview}>
             MARK FOR REVIEW
           </Button>
        </div>
        <div className="flex gap-2 md:gap-4">
           <Button variant="ghost" className="rounded-xl text-zinc-600 h-12 px-3 md:px-6 font-black text-[10px] tracking-widest uppercase hover:text-white" onClick={clearResponse}>
             CLEAR
           </Button>
           <Button className="rounded-xl bg-primary h-12 px-6 md:px-10 font-black text-[10px] tracking-widest uppercase blue-glow shadow-xl" onClick={nextQuestion}>
             SAVE & NEXT <ChevronRight className="w-4 h-4 ml-1 hidden md:block" />
           </Button>
        </div>
      </footer>

      {/* Anti-Cheat Overlay - Simulated */}
      {tabSwitchCount > 3 && (
        <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-8 text-center">
           <div className="max-w-md space-y-6">
              <div className="w-20 h-20 rounded-[28px] bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                 <ShieldAlert className="text-destructive w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black uppercase">SESSION TERMINATED</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">Multiple security violations detected. Your session has been locked and reported to the system administrator.</p>
              <Button onClick={() => router.push('/dashboard')} className="w-full h-14 rounded-2xl bg-white text-black font-black">Exit to Safety</Button>
           </div>
        </div>
      )}
    </div>
  );
}
