
'use client';

import React, { useEffect, useState } from "react";
import { getMock, getQuestions } from "@/services/mock";
import QuestionCard from "@/components/mock/question-card";
import QuestionPalette from "@/components/mock/question-palette";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { addDoc, collection, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send, Loader2, WifiOff, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { saveActiveMockState, getActiveMockState, clearActiveMockState } from "@/services/offline-sync";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
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
    
    // Anti-Cheat: Detect Tab Switching
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
          getMock(mockId),
          getQuestions(mockId)
        ]);
        
        // Anti-Cheat: Randomize Option Order for each question
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
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
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
    setAnswers({
      ...answers,
      [current]: option,
    });
  }

  function submitTest() {
    if (submitting) return;
    setSubmitting(true);
    
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.marks || 1;
      } else if (answers[index]) {
        score -= (mock.negativeMarking || 0);
      }
    });

    const analytics = generateAnalytics({
      questions,
      answers,
    });

    if (!navigator.onLine) {
      toast({ title: "Offline Submission", description: "You are currently offline. Progress is saved locally but cannot be synced to leaderboard.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const attemptsRef = collection(db, "attempts");
    addDoc(attemptsRef, {
      userId: user?.uid,
      mockId: mock.id,
      answers,
      score,
      cheatFlags: tabSwitchCount, // Record anti-cheat data
      createdAt: Date.now(),
    }).catch(async (serverError) => {
       const permissionError = new FirestorePermissionError({
          path: attemptsRef.path,
          operation: 'create',
          requestResourceData: { userId: user?.uid, mockId: mock.id },
       } satisfies SecurityRuleContext);
       errorEmitter.emit('permission-error', permissionError);
    });

    const analyticsRef = collection(db, "analytics");
    addDoc(analyticsRef, {
      userId: user?.uid,
      mockId: mock.id,
      ...analytics,
      createdAt: Date.now(),
    }).catch(async (serverError) => {
       const permissionError = new FirestorePermissionError({
          path: analyticsRef.path,
          operation: 'create',
          requestResourceData: { userId: user?.uid, mockId: mock.id },
       } satisfies SecurityRuleContext);
       errorEmitter.emit('permission-error', permissionError);
    });

    if (user?.uid) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        xp: increment(50),
        lastActive: Date.now(),
      }).catch(async (serverError) => {
         const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { xp: 'increment(50)' },
         } satisfies SecurityRuleContext);
         errorEmitter.emit('permission-error', permissionError);
      });
    }

    toast({
      title: "Test Submitted",
      description: `Score: ${score} | Accuracy: ${analytics.accuracy}%`,
    });
    
    clearActiveMockState();
    router.push("/mocks/result");
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing CBT Engine...</p>
      </div>
    );
  }

  if (!mock) return null;

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8 flex flex-col">
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
                 <p className="font-bold">Anti-Cheat Warning</p>
                 <p className="text-xs opacity-90">Tab switching detected. This incident will be logged in your final report.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold font-headline">{mock.title}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
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

          <div className="flex justify-between items-center bg-card/40 p-6 rounded-[32px] border border-white/5">
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

            <span className="font-mono text-sm text-muted-foreground">
              Question {current + 1} of {questions.length}
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
          <div className="bg-card/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Question Palette
            </h2>

            <QuestionPalette
              questions={questions}
              current={current}
              answers={answers}
              setCurrent={setCurrent}
            />

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Answered
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-700" /> Unanswered
                </span>
              </div>

              <Button
                onClick={submitTest}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-bold text-lg shadow-lg shadow-emerald-900/20"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
