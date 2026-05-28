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
import { Loader2, FileSearch, Info, Languages, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { AttemptAnswer, MockTest, Question } from "@/types";
import { AppErrorBoundary } from "@/components/error-boundary";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EnginePhase = 'loading' | 'instructions' | 'engine' | 'result' | 'error';

/**
 * PRODUCTION CBT ENGINE (TESTBOOK STYLE)
 * High-integrity examination arena with state recovery and institutional UI.
 */
export default function MockPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<EnginePhase>('loading');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'pa'>('en');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<number>(Date.now());

  // 1. PHASED INITIALIZATION PROTOCOL
  useEffect(() => {
    if (!user || !mockId || initializing) return;

    async function init() {
      setInitializing(true);
      try {
        // Validation Layer
        const mockData = await getMockDetails(mockId);
        if (!mockData || mockData.status === 'draft') {
          setErrorMsg("This simulation artifact is restricted or not found.");
          setPhase('error');
          return;
        }
        setMock(mockData);

        // Entitlement Logic
        const access = await checkMockAccess(user!.uid, mockData);
        if (!access.allowed) {
          toast({ title: "PASS+ Required", description: access.reason, variant: "destructive" });
          router.push('/pass');
          return;
        }

        // Data Ingress
        const qData = await getMockQuestions(mockId);
        setQuestions(qData);
        
        const id = await startAttempt(user!.uid, mockData);
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
      } catch (err: any) {
        console.error("CBT Arena Breach:", err);
        setErrorMsg("Failed to synchronize with CBT infrastructure. Check connection.");
        setPhase('error');
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, [mockId, user, router, toast]);

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
      toast({ title: "Synchronization Breach", description: "Could not commit results to cloud storage.", variant: "destructive" });
    }
  }, [user, questions, answers, mock, attemptId, profile, router, toast]);

  if (phase === 'loading') return (
    <div className="h-screen bg-[#050816] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8" />
      </div>
      <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Establishing CBT Arena...</p>
    </div>
  );

  if (phase === 'error') return (
    <div className="h-screen bg-[#050816] flex items-center justify-center p-6 text-center">
       <Card className="max-w-md w-full bg-zinc-900/40 border-white/5 p-12 rounded-[48px] space-y-8">
          <div className="w-20 h-20 rounded-[28px] bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
             <FileSearch className="text-red-500 w-10 h-10" />
          </div>
          <div className="space-y-2">
             <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Signal Lost</h2>
             <p className="text-zinc-500 leading-relaxed text-sm">{errorMsg}</p>
          </div>
          <Button onClick={() => router.push('/exams')} className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl">
             Exit to Exam Hub
          </Button>
       </Card>
    </div>
  );

  if (phase === 'instructions') return (
    <div className="min-h-screen bg-[#050816] text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-10">
         <header className="flex justify-between items-center border-b border-white/5 pb-8">
            <div className="space-y-1">
               <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black px-3 py-1 uppercase mb-2">Stage: Instructions</Badge>
               <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{mock?.title}</h1>
               <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{mock?.exam} • {mock?.totalQuestions} Questions</p>
            </div>
            <div className="hidden md:flex gap-4">
               <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-zinc-600 uppercase">Timer</p>
                  <p className="text-lg font-black text-white">{mock?.duration} Mins</p>
               </div>
               <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-zinc-600 uppercase">Penalty</p>
                  <p className="text-lg font-black text-red-500">-{mock?.negativeMarking}</p>
               </div>
            </div>
         </header>

         <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 space-y-6">
                  <h3 className="font-bold text-xl flex items-center gap-3"><Info className="text-primary" /> Board Compliance Rules</h3>
                  <ul className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                     <li className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">1</span>
                        <span>Session is strictly timed. Auto-submission initiates at <strong className="text-white">00:00</strong>.</span>
                     </li>
                     <li className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">2</span>
                        <span>Every incorrect artifact selection incurs a <strong className="text-red-500">{mock?.negativeMarking}</strong> point deduction.</span>
                     </li>
                     <li className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">3</span>
                        <span>Tab switching or browser resizing triggers a <strong className="text-orange-500">Security Signal</strong>.</span>
                     </li>
                  </ul>
               </div>

               <div className="flex items-start gap-4 p-8 rounded-[32px] bg-primary/5 border border-primary/20">
                  <Checkbox id="confirm" checked={hasConfirmed} onCheckedChange={(v) => setHasConfirmed(!!v)} className="mt-1" />
                  <div className="space-y-1">
                     <label htmlFor="confirm" className="text-sm font-bold text-zinc-300 cursor-pointer">I authorize entry into the CBT Arena and agree to all board rules.</label>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Digital Signature: VERIFIED-SIGNAL-{user?.uid.substring(0,6)}</p>
                  </div>
               </div>
            </div>

            <aside className="space-y-6">
               <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-6">Stage Metadata</h4>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                           <LayoutGrid className="text-primary w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-zinc-600 uppercase">Max Score</p>
                           <p className="text-sm font-bold">{mock?.totalQuestions}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                           <Languages className="text-orange-500 w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-zinc-600 uppercase">Dialects</p>
                           <p className="text-sm font-bold">English / Punjabi</p>
                        </div>
                     </div>
                  </div>
               </Card>
               <Button 
                 onClick={() => { setPhase('engine'); updateAttemptActivity(attemptId!, { status: 'ongoing' }); }} 
                 disabled={!hasConfirmed} 
                 className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black shadow-2xl blue-glow"
               >
                 ENTER ARENA
               </Button>
            </aside>
         </div>
      </div>
    </div>
  );

  return (
    <AppErrorBoundary>
      <div className="h-screen bg-slate-50 flex flex-col overflow-hidden select-none">
        {/* Institutional CBT Header */}
        <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/10">
                  <Info className="text-white w-4 h-4" />
                </div>
                <span className="font-black text-xs uppercase tracking-tight text-slate-800 truncate max-w-[300px]">{mock?.title}</span>
             </div>
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SYNC: ACTIVE</span>
             </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setActiveLang('en')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'en' ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-400")}
                >EN</button>
                <button 
                  onClick={() => setActiveLang('pa')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'pa' ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-400")}
                >ਪੰ</button>
             </div>
             <Timer duration={mock?.duration || 60} onFinish={submitTest} />
             <Button className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-emerald-600/10" onClick={submitTest}>SUBMIT STAGE</Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Question Arena */}
          <main className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar">
            <div className="max-w-5xl mx-auto">
               <div className="flex items-center justify-between mb-8">
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold uppercase text-[10px] px-4 py-1.5 rounded-full shadow-sm">
                    Section: General Ingress
                  </Badge>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artifact {current + 1} of {questions.length}</p>
               </div>

               {questions[current] ? (
                 <QuestionCard 
                   question={questions[current]} 
                   selected={answers[current]?.selectedOption || null} 
                   activeLanguage={activeLang}
                   sideBySide={true}
                   onSelect={(opt) => setAnswers(prev => ({...prev, [current]: { ...prev[current], selectedOption: opt, status: 'ANSWERED' }}))} 
                 />
               ) : (
                 <div className="py-40 text-center animate-pulse space-y-4">
                   <Loader2 className="w-12 h-12 text-slate-200 mx-auto animate-spin" />
                   <p className="text-slate-400 font-black uppercase text-xs">Decrypting Atomic Bank...</p>
                 </div>
               )}
            </div>
          </main>

          {/* Side Navigation Dashboard */}
          <aside className="hidden lg:flex w-[380px] bg-white border-l border-slate-200 flex-col">
             <div className="p-8 space-y-10 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                   <div className="w-14 h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 p-1">
                      <img src={`https://picsum.photos/seed/${user?.uid}/100`} className="w-full h-full object-cover rounded-xl grayscale" alt="Student" />
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-xs font-black text-slate-800 uppercase truncate">{profile?.name || 'Aspirant'}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {user?.uid.substring(0, 8)}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Navigation Matrix</h3>
                   <QuestionPalette questions={questions} current={current} answers={answers} setCurrent={setCurrent} />
                </div>

                <div className="pt-10 border-t border-slate-100 space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status Signals</p>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                         <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm" />
                         <span className="text-[10px] font-bold text-slate-600 uppercase">Answered</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                         <div className="w-3.5 h-3.5 rounded-md bg-purple-600 shadow-sm" />
                         <span className="text-[10px] font-bold text-slate-600 uppercase">Review</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                         <div className="w-3.5 h-3.5 rounded-md bg-red-500 shadow-sm" />
                         <span className="text-[10px] font-bold text-slate-600 uppercase">Pending</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                         <div className="w-3.5 h-3.5 rounded-md bg-slate-200 shadow-sm" />
                         <span className="text-[10px] font-bold text-slate-600 uppercase">Skipped</span>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="p-8 bg-slate-50 border-t border-slate-200">
                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-white transition-all">
                  Arena Instructions
                </Button>
             </div>
          </aside>
        </div>

        {/* CBT Control Bar */}
        <footer className="h-20 px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
           <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleAction(true)}
                className="h-12 px-8 rounded-xl border-slate-200 text-purple-600 font-black text-[10px] uppercase tracking-widest hover:bg-purple-50 transition-all"
              >
                Mark for Audit
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setAnswers(prev => ({...prev, [current]: { ...prev[current], selectedOption: null, status: 'NOT_ANSWERED' }}))}
                className="h-12 px-8 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-all"
              >
                Clear Artifact
              </Button>
           </div>

           <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrent(Math.max(0, current - 1))} 
                disabled={current === 0} 
                className="h-12 px-10 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest"
              >
                PREVIOUS
              </Button>
              <Button 
                onClick={() => handleAction(false)}
                className="h-12 px-16 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                SAVE & NEXT
              </Button>
           </div>
        </footer>
      </div>
    </AppErrorBoundary>
  );
}
