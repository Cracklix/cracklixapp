
'use client';

import React, { useEffect, useState } from "react";
import { getMockDetails, getMockQuestions, saveAttempt } from "@/services/mocks";
import { updateUserRank } from "@/services/leaderboard";
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
        
        // Randomize Option Order for production authenticity
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
          toast({ title: "Session Restored", description: "Your previous progress was loaded from local cache." });
        }
      } catch (error: any) {
        toast({ title: "Initialization Error", description: error.message, variant: "destructive" });
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
  }, [mockId, toast]);

  useEffect(() => {
    if (mock && Object.keys(answers).length > 0) {
      saveActiveMockState(mockId, { answers, current });
    }
  }, [answers, current, mockId, mock]);

  function selectAnswer(option: string) {
    setAnswers({ ...answers, [current]: option });
  }

  function submitTest() {
    if (submitting || !user) return;
    setSubmitting(true);
    
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.marks || 1;
      } else if (answers[index]) {
        score -= (mock.negativeMarking || 0);
      }
    });

    const analytics = generateAnalytics({ questions, answers });

    if (!navigator.onLine) {
      toast({ title: "Offline Submission", description: "Progress saved locally. Syncing will occur once reconnected.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Save Attempt via Service
    saveAttempt(user.uid, {
      mockId: mock.id,
      score,
      accuracy: analytics.accuracy,
      cheatFlags: tabSwitchCount,
      answers
    });

    // Update Global Leaderboard
    updateUserRank(user.uid, profile?.name || "Aspirant", 50, analytics.accuracy);

    toast({ title: "Submission Captured", description: `Computed Score: ${score} | Finalizing Analysis...` });
    
    clearActiveMockState();
    setTimeout(() => router.push("/mocks/result"), 1500);
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing CBT Engine</p>
      </div>
    );
  }

  if (!mock) return null;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col">
      <AnimatePresence>
        {cheatAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6"
          >
            <div className="bg-destructive text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
               <ShieldAlert className="w-6 h-6 animate-pulse" />
               <div>
                 <p className="font-bold">Anti-Cheat Triggered</p>
                 <p className="text-xs opacity-90">Tab switching detected. This event has been logged to your audit profile.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">{mock.title}</h1>
          <p className="text-zinc-500 mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            {!isOnline && <WifiOff className="w-4 h-4 text-destructive animate-pulse" />}
            <span className="w-2 h-2 rounded-full bg-primary" />
            {mock.exam} • {questions.length} Questions
          </p>
        </div>

        <Timer duration={mock.duration} onFinish={submitTest} />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-4 gap-8 flex-1">
        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between">
          {questions[current] && (
            <QuestionCard
              question={questions[current]}
              selected={answers[current] || null}
              onSelect={selectAnswer}
            />
          )}

          <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-[32px] border border-white/5">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrent(Math.max(current - 1, 0))}
              disabled={current === 0}
              className="rounded-2xl h-12 px-6 border-white/10"
            >
              <ChevronLeft className="mr-2 w-5 h-5" />
              Previous
            </Button>

            <span className="font-black text-[10px] text-zinc-500 uppercase tracking-widest">
              Question {current + 1} / {questions.length}
            </span>

            <Button
              size="lg"
              onClick={() => setCurrent(Math.min(current + 1, questions.length - 1))}
              disabled={current === questions.length - 1}
              className="rounded-2xl h-12 px-6 bg-primary"
            >
              Next
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-[32px] border border-white/5 h-fit sticky top-8">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-zinc-400">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              Palette
            </h2>

            <QuestionPalette
              questions={questions}
              current={current}
              answers={answers}
              setCurrent={setCurrent}
            />

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase text-zinc-600 px-1">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Done
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-700" /> Pending
                </span>
              </div>

              <Button
                onClick={submitTest}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black text-lg shadow-xl shadow-emerald-900/20"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                Final Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
