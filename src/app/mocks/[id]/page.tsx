
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
import { ChevronLeft, ChevronRight, Send, Loader2, WifiOff, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { saveActiveMockState, getActiveMockState, clearActiveMockState } from "@/services/offline-sync";
import { motion, AnimatePresence } from "framer-motion";

export default function MockPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const unwrappedParams = React.use(params);
  const mockId = unwrappedParams.id;

  const [mock, setMock] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cheatAlert, setCheatAlert] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setCheatAlert(true);
        setTimeout(() => setCheatAlert(false), 5000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    async function load() {
      try {
        const [mockData, questionData] = await Promise.all([
          getMockDetails(mockId),
          getMockQuestions(mockId)
        ]);
        
        // Randomize Options for production integrity
        const randomizedQuestions = questionData.map(q => ({
          ...q,
          options_en: q.options_en ? [...q.options_en].sort(() => Math.random() - 0.5) : q.options_en,
          options_pa: q.options_pa ? [...q.options_pa].sort(() => Math.random() - 0.5) : q.options_pa,
        }));

        setMock(mockData);
        setQuestions(randomizedQuestions);

        const saved = getActiveMockState(mockId);
        if (saved) {
          setAnswers(saved.answers || {});
          setCurrent(saved.current || 0);
          toast({ title: "Session Restored", description: "Progress loaded from local CBT cache." });
        }
      } catch (error: any) {
        toast({ title: "System Error", description: error.message, variant: "destructive" });
        router.push('/exams');
      } finally {
        setLoading(false);
      }
    }
    load();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mockId, toast, router]);

  useEffect(() => {
    if (mock && Object.keys(answers).length > 0) {
      saveActiveMockState(mockId, { answers, current });
    }
  }, [answers, current, mockId, mock]);

  function selectAnswer(option: string) {
    setAnswers({ ...answers, [current]: option });
  }

  async function submitTest() {
    if (submitting || !user) return;
    setSubmitting(true);
    
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += (question.marks || 1);
      } else if (answers[index]) {
        score -= (mock.negativeMarking || 0);
      }
    });

    const analytics = generateAnalytics({ questions, answers });

    try {
      // 1. Save Attempt
      saveAttempt(user.uid, {
        mockId: mock.id,
        mockTitle: mock.title,
        score,
        accuracy: analytics.accuracy,
        cheatFlags: tabSwitchCount,
        answers,
        timeTaken: (mock.duration * 60) // Simple duration for MVP
      });

      // 2. Update Leaderboard & XP
      updateUserRank(user.uid, profile?.name || "Aspirant", 50, analytics.accuracy);

      // 3. Track Daily Progress
      trackProgress(user.uid, 'mocks', 1);
      trackProgress(user.uid, 'questions', Object.keys(answers).length);

      toast({ title: "Submission Captured", description: `Score: ${score.toFixed(2)} | Synchronizing Rank...` });
      
      clearActiveMockState();
      setTimeout(() => router.push("/mocks/result"), 1500);
    } catch (e: any) {
      toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full" />
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing CBT Engine</p>
      </div>
    );
  }

  if (!mock) return null;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 flex flex-col">
      <AnimatePresence>
        {cheatAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6"
          >
            <div className="bg-destructive text-white p-5 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20">
               <ShieldAlert className="w-6 h-6 animate-pulse" />
               <div>
                 <p className="font-bold">Anti-Cheat Alert</p>
                 <p className="text-xs opacity-80">Tab switching detected. Incident logged to audit profile.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase leading-none">{mock.title}</h1>
          <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> {mock.exam}</span>
            <span>{questions.length} Items</span>
            {!isOnline && <span className="text-destructive flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> Offline Mode</span>}
          </div>
        </div>

        <Timer duration={mock.duration} onFinish={submitTest} />
      </header>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-4 gap-10 flex-1 items-start">
        <div className="lg:col-span-3 flex flex-col h-full gap-10">
          <div className="flex-1">
            {questions[current] && (
              <QuestionCard
                question={questions[current]}
                selected={answers[current] || null}
                onSelect={selectAnswer}
              />
            )}
          </div>

          <div className="flex justify-between items-center bg-zinc-900/40 p-8 rounded-[40px] border border-white/5">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrent(Math.max(current - 1, 0))}
              disabled={current === 0}
              className="rounded-2xl h-14 px-8 border-white/10 bg-zinc-900"
            >
              <ChevronLeft className="mr-2 w-5 h-5" />
              Previous
            </Button>

            <div className="flex flex-col items-center">
              <span className="font-black text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-1">Navigation</span>
              <span className="text-xl font-mono font-black text-primary">
                {current + 1} / {questions.length}
              </span>
            </div>

            <Button
              size="lg"
              onClick={() => setCurrent(Math.min(current + 1, questions.length - 1))}
              disabled={current === questions.length - 1}
              className="rounded-2xl h-14 px-8 bg-primary blue-glow"
            >
              Next
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        <aside className="space-y-8 h-full sticky top-10">
          <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[48px] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Question Palette</h2>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
            </div>

            <QuestionPalette
              questions={questions}
              current={current}
              answers={answers}
              setCurrent={setCurrent}
            />

            <div className="mt-10 pt-10 border-t border-white/5">
              <Button
                onClick={submitTest}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] h-16 font-black text-xl shadow-2xl shadow-emerald-900/20"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5 mr-3" />}
                FINAL SUBMIT
              </Button>
              <p className="text-[9px] text-center text-zinc-600 font-black uppercase mt-4 tracking-widest">
                Safe Protocol: AUTO-SYNC ENABLED
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
