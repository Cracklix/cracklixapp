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

export default function MockPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { id: mockId } = useParams() as { id: string };
  const { toast } = useToast();
  
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
  const [activeLang, setActiveLang] = useState<'en' | 'hi' | 'pa'>('en');

  useEffect(() => {
    async function load() {
      try {
        const [mockData, questionData] = await Promise.all([
          getMockDetails(mockId),
          getMockQuestions(mockId)
        ]);
        setMock(mockData);
        setQuestions(questionData);
        
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
        toast({ title: "Violation Detected", description: "Window activity tracked.", variant: "destructive" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mockId, phase, router, toast]);

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
      router.push("/mocks/result");
    } catch (e: any) {
      toast({ title: "Submission Error", variant: "destructive" });
      setSubmitting(false);
    }
  }, [submitting, user, questions, answers, mock, tabSwitchCount, profile?.name, mockId, router, toast]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">Loading CBT Modules...</p>
    </div>
  );

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-background text-white p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase">{mock.title}</h1>
              <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <Badge variant="outline" className="border-white/10 px-4 py-1.5">{mock.exam}</Badge>
                <Badge variant="outline" className="border-white/10 px-4 py-1.5">{mock.duration} MINS</Badge>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 px-4 py-1.5">MULTI-LANG ENABLED</Badge>
              </div>
            </div>
          </header>

          <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] p-10 space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-3"><ShieldAlert className="text-primary" /> Exam Protocol</h3>
            <div className="grid md:grid-cols-2 gap-10 text-sm text-zinc-400 leading-relaxed">
               <div className="space-y-4">
                  <p>1. This test supports **English, Hindi, and Punjabi**. Use the top-bar toggle to switch during the exam.</p>
                  <p>2. Side-by-Side mode is available for better context between languages.</p>
                  <p>3. Anti-cheat layer is active. System logs all window deviations.</p>
               </div>
               <div className="space-y-4">
                  <p>4. Negative marking of **{mock.negativeMarking}** applies for every incorrect attempt.</p>
                  <p>5. Review questions appear in purple on the navigation palette.</p>
               </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex items-center gap-4">
              <Checkbox id="confirm" checked={hasConfirmedInstructions} onCheckedChange={(v) => setHasConfirmedInstructions(!!v)} />
              <label htmlFor="confirm" className="text-xs font-bold text-zinc-500 cursor-pointer">I am ready to begin the simulation under official rules.</label>
            </div>
            <Button onClick={() => setPhase('test')} disabled={!hasConfirmedInstructions} className="w-full h-16 rounded-2xl bg-primary text-xl font-black shadow-xl">LAUNCH ARENA</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-svh bg-background text-white flex flex-col overflow-hidden select-none">
      <header className="h-16 px-6 bg-zinc-950 border-b border-white/5 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
           <FileText className="text-primary w-5 h-5" />
           <span className="font-black text-sm uppercase tracking-tight truncate max-w-[200px]">{mock.title}</span>
        </div>

        <div className="flex items-center gap-4">
           <Timer duration={mock.duration} onFinish={submitTest} />
           
           <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-xl">
             {['en', 'pa', 'hi'].map((l: any) => (
               <button 
                 key={l}
                 onClick={() => { setActiveLang(l); setSideBySide(false); }}
                 className={cn("px-3 py-1 rounded-lg text-[9px] font-black transition-all", activeLang === l && !sideBySide ? "bg-primary text-white" : "text-zinc-600")}
               >
                 {l.toUpperCase()}
               </button>
             ))}
             <button 
               onClick={() => setSideBySide(!sideBySide)}
               className={cn("px-3 py-1 rounded-lg text-[9px] font-black transition-all flex items-center gap-1", sideBySide ? "bg-primary text-white" : "text-zinc-600")}
             >
               <Columns size={10} /> SIDE
             </button>
           </div>

           <Button className="hidden md:flex bg-emerald-600 h-9 px-6 rounded-lg font-black text-[10px] tracking-widest" onClick={submitTest}>SUBMIT</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-12 bg-[#0a0a0c]">
          <div className="max-w-6xl mx-auto space-y-8 pb-32">
             <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-600">
               <span>Artifact {current + 1} of {questions.length}</span>
               <span>Penalty: -{mock.negativeMarking}</span>
             </div>
             <AnimatePresence mode="wait">
               <motion.div key={current} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                 <QuestionCard 
                   question={questions[current]} 
                   selected={answers[current] || null} 
                   onSelect={(opt) => setAnswers({...answers, [current]: opt})} 
                   sideBySide={sideBySide}
                   activeLanguage={activeLang}
                 />
               </motion.div>
             </AnimatePresence>
          </div>
        </main>

        <aside className="hidden lg:flex w-[350px] bg-zinc-950 border-l border-white/5 flex-col shrink-0">
          <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
             <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-8 tracking-widest">Navigation Palette</h3>
             <QuestionPalette 
               questions={questions} 
               current={current} 
               answers={answers} 
               markedForReview={markedForReview} 
               visited={visited}
               setCurrent={(idx) => { setCurrent(idx); setVisited(new Set(visited).add(idx)); }} 
             />
          </div>
          <div className="p-8 border-t border-white/5">
             <Button className="w-full bg-emerald-600 h-14 rounded-2xl font-black text-xs uppercase tracking-widest" onClick={submitTest}>SUBMIT TEST</Button>
          </div>
        </aside>
      </div>

      <footer className="h-20 px-8 bg-zinc-950 border-t border-white/5 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-xl border-white/5 h-12 px-8 font-black text-[10px] tracking-widest uppercase" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>PREVIOUS</Button>
           <Button variant="outline" className="rounded-xl border-purple-500/20 text-purple-400 h-12 px-8 font-black text-[10px] tracking-widest uppercase" onClick={() => {
              const next = new Set(markedForReview);
              if (next.has(current)) next.delete(current); else next.add(current);
              setMarkedForReview(next);
           }}>MARK REVIEW</Button>
        </div>
        <Button className="rounded-xl bg-primary h-12 px-10 font-black text-[10px] tracking-widest uppercase shadow-xl" onClick={() => {
           setCurrent(Math.min(questions.length - 1, current + 1));
           setVisited(new Set(visited).add(current + 1));
        }}>SAVE & NEXT <ChevronRight className="ml-1 w-4 h-4" /></Button>
      </footer>
    </div>
  );
}
