
'use client';

import React, { useEffect, useState } from "react";
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
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function MockPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const unwrappedParams = React.use(params);
  const mockId = unwrappedParams.id;

  const [phase, setPhase] = useState<'instructions' | 'test'>('instructions');
  const [mock, setMock] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [mockData, questionData] = await Promise.all([
          getMockDetails(mockId),
          getMockQuestions(mockId)
        ]);
        setMock(mockData);
        setQuestions(questionData);
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
        toast({ title: "Anti-Cheat Warning", description: "Switching tabs is prohibited during CBT sessions.", variant: "destructive" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mockId, phase]);

  const selectAnswer = (option: string) => {
    setAnswers({ ...answers, [current]: option });
  };

  const toggleReview = () => {
    const newReview = new Set(markedForReview);
    if (newReview.has(current)) newReview.delete(current);
    else newReview.add(current);
    setMarkedForReview(newReview);
  };

  const submitTest = async () => {
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
      
      toast({ title: "Test Submitted", description: "Analyzing performance data..." });
      router.push("/mocks/result");
    } catch (e: any) {
      toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading CBT Assets...</p>
    </div>
  );

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-black font-headline uppercase">{mock.title}</h1>
            <div className="flex gap-6 text-sm text-zinc-500 font-bold uppercase tracking-widest">
              <span>{mock.totalQuestions} Questions</span>
              <span>{mock.duration} Minutes</span>
              <span className="text-destructive">-{mock.negativeMarking} Negative</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-[48px] p-10 space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="text-primary" />
              Official Examination Instructions
            </h3>
            <ul className="space-y-4 text-zinc-400 text-sm leading-relaxed list-decimal pl-6">
              <li>This is a simulated Computer Based Test (CBT) exactly matching the Punjab recruitment board pattern.</li>
              <li>You can switch between English and Punjabi at any point using the top-right toggle.</li>
              <li>Questions can be marked for review to revisit them later using the Question Palette.</li>
              <li>Anti-Cheat: Switching tabs or closing the browser will log a violation against your profile.</li>
              <li>The test will auto-submit exactly when the timer reaches 00:00.</li>
            </ul>
            
            <div className="pt-6 border-t border-white/5 flex items-center gap-4">
               <input type="checkbox" id="confirm" className="h-5 w-5 rounded border-zinc-800 bg-zinc-900 text-primary" />
               <label htmlFor="confirm" className="text-xs font-bold text-zinc-500">I have read and understood all instructions provided above.</label>
            </div>

            <Button size="lg" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black blue-glow" onClick={() => setPhase('test')}>
              I am ready to begin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-16 px-6 bg-zinc-900 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <FileText className="text-primary w-5 h-5" />
           <span className="font-bold text-sm truncate max-w-[200px] md:max-w-md uppercase">{mock.title}</span>
        </div>
        <div className="flex items-center gap-6">
           <Timer duration={mock.duration} onFinish={submitTest} />
           <Button className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 h-10 px-6 rounded-xl font-black text-xs" onClick={submitTest}>
             SUBMIT TEST
           </Button>
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
                 <Menu className="w-5 h-5" />
               </Button>
             </SheetTrigger>
             <SheetContent side="right" className="bg-zinc-950 border-white/5 p-0">
               <div className="p-8 h-full flex flex-col">
                  <h3 className="font-bold mb-8">Question Palette</h3>
                  <QuestionPalette 
                    questions={questions} 
                    current={current} 
                    answers={answers} 
                    markedForReview={markedForReview} 
                    setCurrent={setCurrent} 
                  />
                  <div className="mt-auto pt-8">
                     <Button className="w-full bg-emerald-600 h-14 rounded-2xl font-black" onClick={submitTest}>SUBMIT TEST</Button>
                  </div>
               </div>
             </SheetContent>
           </Sheet>
        </div>
      </header>

      {/* Main CBT Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-10 pb-32">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
               <span>Question No. {current + 1}</span>
               <span>Marks: +{mock.marksPerQuestion || 1} | -{mock.negativeMarking}</span>
            </div>
            
            <QuestionCard 
              question={questions[current]} 
              selected={answers[current] || null} 
              onSelect={selectAnswer} 
            />
          </div>
        </main>

        {/* Desktop Sidebar Palette */}
        <aside className="hidden md:flex w-[400px] bg-zinc-950 border-l border-white/5 flex-col shrink-0">
          <div className="p-8 flex-1 overflow-y-auto">
             <h3 className="text-xs font-black uppercase text-zinc-500 mb-8 tracking-widest">Question Palette</h3>
             <QuestionPalette 
               questions={questions} 
               current={current} 
               answers={answers} 
               markedForReview={markedForReview} 
               setCurrent={setCurrent} 
             />
             
             <div className="grid grid-cols-2 gap-4 mt-12 pt-12 border-t border-white/5">
                {[
                  { label: "Answered", color: "bg-emerald-500" },
                  { label: "Not Answered", color: "bg-red-500" },
                  { label: "Marked Review", color: "bg-purple-500" },
                  { label: "Not Visited", color: "bg-zinc-800" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${item.color}`} />
                    <span className="text-[10px] font-bold text-zinc-500">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>
        </aside>
      </div>

      {/* Navigation Footer */}
      <footer className="h-20 px-8 bg-zinc-900 border-t border-white/10 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-xl border-white/10 h-12 px-6 font-bold" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
             PREVIOUS
           </Button>
           <Button variant="outline" className="rounded-xl border-purple-500/20 text-purple-400 hover:bg-purple-500/10 h-12 px-6 font-bold" onClick={toggleReview}>
             MARK FOR REVIEW
           </Button>
        </div>
        <div className="flex gap-4">
           <Button variant="ghost" className="rounded-xl text-zinc-500 h-12 px-6 font-bold" onClick={() => setAnswers({...answers, [current]: ""})}>
             CLEAR RESPONSE
           </Button>
           <Button className="rounded-xl bg-primary h-12 px-8 font-black blue-glow" onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}>
             SAVE & NEXT
           </Button>
        </div>
      </footer>
    </div>
  );
}
