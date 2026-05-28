'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt,
  checkMockAccess,
  getAttemptAnswers
} from "@/services/mocks";
import QuestionCard from "@/components/mock/question-card";
import QuestionPalette from "@/components/mock/question-palette";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Info, CheckCircle2, AlertCircle, Database, Timer as TimerIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TestbookStyleCBT() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'loading' | 'instructions' | 'engine' | 'result' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'pa'>('en');

  useEffect(() => {
    if (!user || !mockId) return;

    async function initialize() {
      try {
        const mockData = await getMockDetails(mockId);
        if (!mockData) {
          setErrorMsg("Simulation artifact not found in production registry.");
          setPhase('error');
          return;
        }

        const access = await checkMockAccess(user!.uid, mockData);
        if (!access.allowed) {
          toast({ title: "Access Denied", description: access.reason, variant: "destructive" });
          router.push('/pass');
          return;
        }

        const qData = await getMockQuestions(mockId);
        if (!qData || qData.length === 0) {
          setErrorMsg("No linked questions found for this simulation. Contact administrator.");
          setPhase('error');
          return;
        }

        const id = await startAttempt(user!.uid, mockData);
        setAttemptId(id);
        setMock(mockData);
        setQuestions(qData);
        setPhase('instructions');
      } catch (err: any) {
        console.error("CBT Init Fatal:", err);
        setErrorMsg("Failed to establish secure CBT session state.");
        setPhase('error');
      }
    }

    initialize();
  }, [mockId, user?.uid, router, toast]);

  const handleSelect = (option: string) => {
    if (!attemptId || !questions[current]) return;
    const payload: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: option,
      status: 'ANSWERED',
      timeSpent: 0,
      lastSavedAt: Date.now()
    };
    setAnswers(prev => ({ ...prev, [current]: payload }));
    saveAnswer(attemptId, current, payload);
  };

  const markForReview = () => {
    if (!attemptId || !questions[current]) return;
    const currentAns = answers[current];
    const nextStatus = currentAns?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW';
    
    const payload: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: currentAns?.selectedOption || null,
      status: nextStatus,
      timeSpent: 0,
      lastSavedAt: Date.now()
    };
    setAnswers(prev => ({ ...prev, [current]: payload }));
    saveAnswer(attemptId, current, payload);
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  const submitTest = useCallback(async () => {
    if (!user || !attemptId || !mock) return;
    try {
      setPhase('loading');
      const analytics = generateAnalytics({ questions, answers, mock });
      await finalizeAttempt(user.uid, attemptId, analytics);
      router.push("/mocks/result");
    } catch (e) {
      toast({ title: "Submission Failed", variant: "destructive" });
      setPhase('engine');
    }
  }, [user, questions, answers, mock, attemptId, router, toast]);

  if (phase === 'loading') return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Establishing Secure Signal...</p>
    </div>
  );

  if (phase === 'error') return (
    <div className="h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6 text-center">
       <div className="max-w-md space-y-8">
          <div className="w-20 h-20 rounded-[28px] bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto shadow-2xl">
             <AlertCircle className="text-destructive w-10 h-10" />
          </div>
          <div className="space-y-3">
             <h2 className="text-3xl font-black uppercase tracking-tighter">Simulation Failure</h2>
             <p className="text-zinc-500 font-medium leading-relaxed">{errorMsg}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="h-14 w-full rounded-2xl bg-white text-black font-black uppercase tracking-widest">Retry Session</Button>
          <Button variant="ghost" onClick={() => router.push('/exams')} className="text-zinc-600 uppercase font-black text-[10px]">Exit Arena</Button>
       </div>
    </div>
  );

  if (phase === 'instructions') return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-10 text-center">
         <div className="w-20 h-20 rounded-[28px] bg-primary/20 flex items-center justify-center mx-auto shadow-2xl blue-glow">
            <Info className="text-primary w-10 h-10" />
         </div>
         <div className="space-y-3">
           <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">{mock?.title}</h1>
           <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em]">{mock?.exam} • Official Pattern</p>
         </div>
         <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Questions", val: questions.length, icon: Database },
              { label: "Duration", val: `${mock?.duration}m`, icon: TimerIcon },
              { label: "Negative", val: `-${mock?.negativeMarking}`, icon: AlertCircle, color: "text-red-500" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-[32px] bg-zinc-900 border border-white/5 space-y-2">
                 <stat.icon className={cn("mx-auto w-4 h-4", stat.color || "text-primary")} />
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-xl font-black">{stat.val}</p>
              </div>
            ))}
         </div>
         <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-white/5 text-left space-y-4">
            <p className="text-sm font-bold flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Auto-save is active for every response.</p>
            <p className="text-sm font-bold flex items-center gap-3"><CheckCircle2 size={16} className="text-emerald-500" /> Switching tabs will trigger a security signal.</p>
         </div>
         <Button onClick={() => setPhase('engine')} className="w-full h-20 rounded-3xl bg-primary hover:bg-primary/90 text-2xl font-black shadow-2xl blue-glow">START SIMULATION</Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden select-none font-body">
      <header className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 z-50 shadow-xl">
        <div className="flex items-center gap-6">
           <span className="font-black text-xs uppercase tracking-widest truncate max-w-[300px]">{mock?.title}</span>
           <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> CLOUD SYNC: ON
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
             <button onClick={() => setActiveLang('en')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'en' ? "bg-white text-black" : "text-white/40")}>EN</button>
             <button onClick={() => setActiveLang('pa')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'pa' ? "bg-white text-black" : "text-white/40")}>ਪੰ</button>
           </div>
           <Timer duration={mock?.duration || 60} onFinish={submitTest} />
           <Button onClick={submitTest} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-xs uppercase shadow-lg">SUBMIT</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-slate-50 relative">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
              <span>Section: Common Core</span>
              <span>Question {current + 1} of {questions.length}</span>
            </div>
            {questions[current] && (
              <QuestionCard 
                question={questions[current]} 
                selected={answers[current]?.selectedOption || null} 
                activeLanguage={activeLang}
                onSelect={handleSelect} 
              />
            )}
          </div>
        </main>

        <aside className="w-[380px] bg-white border-l border-slate-200 hidden lg:flex flex-col">
           <div className="p-8 space-y-10 flex-1 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-3">
                 <Avatar className="w-10 h-10 border border-slate-100">
                    <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} />
                    <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div>
                    <p className="text-xs font-bold text-slate-800">{profile?.name}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400">Candidate Terminal</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Question Palette</h4>
                 <QuestionPalette questions={questions} current={current} answers={answers} setCurrent={setCurrent} />
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Status Legend</h4>
                 <div className="grid grid-cols-2 gap-3 text-[9px] font-bold uppercase text-slate-500">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-emerald-500" /> Answered</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-slate-200" /> Not Visited</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-purple-600" /> Marked</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-red-500" /> Unanswered</div>
                 </div>
              </div>
           </div>
        </aside>
      </div>

      <footer className="h-20 px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
         <div className="flex gap-4">
            <Button variant="outline" onClick={markForReview} className="h-12 px-8 rounded-xl border-slate-200 text-purple-600 font-black text-[10px] uppercase">Mark for Review & Next</Button>
            <Button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[current]; return n; })} variant="ghost" className="h-12 px-8 rounded-xl text-slate-400 font-black text-[10px] uppercase">Clear Response</Button>
         </div>
         <div className="flex gap-4">
            <Button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} variant="outline" className="h-12 px-10 rounded-xl border-slate-200 font-black text-[10px] uppercase">Previous</Button>
            <Button onClick={() => { if(current < questions.length-1) setCurrent(c => c + 1); }} className="h-12 px-20 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase shadow-2xl blue-glow">Save & Next</Button>
         </div>
      </footer>
    </div>
  );
}

function Avatar({ children, className }: any) {
   return <div className={cn("rounded-full overflow-hidden flex items-center justify-center bg-slate-100", className)}>{children}</div>;
}
function AvatarImage({ src }: any) { return <img src={src} className="w-full h-full object-cover" />; }
function AvatarFallback({ children, className }: any) { return <span className={className}>{children}</span>; }
