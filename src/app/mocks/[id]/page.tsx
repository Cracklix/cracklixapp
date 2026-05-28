'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt,
  checkMockAccess
} from "@/services/mocks";
import QuestionCard from "@/components/mock/question-card";
import QuestionPalette from "@/components/mock/question-palette";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Zap, 
  Monitor, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Cloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

type BootStep = {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'success' | 'error';
};

export default function TestbookStyleCBT() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'booting' | 'instructions' | 'engine' | 'result' | 'error' | 'locked' | 'empty'>('booting');
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'pa'>('en');
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bootSteps, setBootSteps] = useState<BootStep[]>([
    { id: 'auth', label: 'Verifying Identity', status: 'loading' },
    { id: 'mock', label: 'Accessing Mock Registry', status: 'pending' },
    { id: 'questions', label: 'Syncing Question Artifacts', status: 'pending' },
    { id: 'validate', label: 'Validating Neural Payload', status: 'pending' },
  ]);

  const updateStep = (id: string, status: BootStep['status']) => {
    setBootSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const validateAndRepair = (qs: any[]): Question[] => {
    return qs.map(q => {
      const en = q.en || { 
        question: q.question_en || "Question content missing", 
        options: q.options_en || ["A", "B", "C", "D"], 
        explanation: q.explanation_en || "" 
      };
      const options = en.options || [];
      while (options.length < 4) options.push(`Option ${options.length + 1} Missing`);
      
      return {
        ...q,
        en: { ...en, options: options.slice(0, 4) },
        correctAnswer: q.correctAnswer || options[0],
        subject: q.subject || "General",
        difficulty: q.difficulty || "medium"
      } as Question;
    });
  };

  useEffect(() => {
    if (!user || !mockId) return;

    async function initializeMockSession(retries = 3) {
      try {
        updateStep('auth', 'success');
        updateStep('mock', 'loading');

        const mockData = await getMockDetails(mockId);
        if (!mockData) throw new Error("Simulation artifact not found.");

        const access = await checkMockAccess(user!.uid, mockData);
        if (!access.allowed) {
          setErrorMsg(access.reason || "Insufficient Access Tier.");
          setPhase('locked');
          return;
        }

        setMock(mockData);
        updateStep('mock', 'success');
        updateStep('questions', 'loading');

        const qData = await getMockQuestions(mockId);
        if (!qData || qData.length === 0) {
          setPhase('empty');
          return;
        }

        updateStep('questions', 'success');
        updateStep('validate', 'loading');

        const validatedQuestions = validateAndRepair(qData);
        setQuestions(validatedQuestions);
        updateStep('validate', 'success');

        const id = await startAttempt(user!.uid, mockData);
        setAttemptId(id);
        
        setTimeout(() => setPhase('instructions'), 800);
      } catch (err: any) {
        if (retries > 0) {
          setTimeout(() => initializeMockSession(retries - 1), 1500);
        } else {
          setErrorMsg(err.message || "Failed to establish secure CBT session.");
          setPhase('error');
        }
      }
    }

    initializeMockSession();
  }, [mockId, user?.uid]);

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
    if (!user || !attemptId || !mock || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const analytics = generateAnalytics({ questions, answers, mock });
      await finalizeAttempt(user.uid, attemptId, analytics);
      router.push("/mocks/result");
    } catch (e) {
      toast({ title: "Submission Failed", variant: "destructive" });
      setIsSubmitting(false);
    }
  }, [user, questions, answers, mock, attemptId, router, toast, isSubmitting]);

  const attemptedCount = Object.values(answers).filter(a => a.status === 'ANSWERED' || a.status === 'ANSWERED_AND_MARKED').length;
  const reviewCount = Object.values(answers).filter(a => a.status === 'MARKED_FOR_REVIEW' || a.status === 'ANSWERED_AND_MARKED').length;

  if (phase === 'booting') return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
       <div className="max-w-md w-full space-y-12">
          <div className="relative inline-block">
             <div className="w-20 h-20 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
             <Monitor className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6" />
          </div>
          <div className="space-y-2">
             <h2 className="text-xl font-bold text-slate-800">Establishing Secure CBT Signal</h2>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Version 12.5 Production Core</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 shadow-sm">
             {bootSteps.map(step => (
               <div key={step.id} className="flex items-center justify-between">
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-wider",
                    step.status === 'loading' ? "text-primary animate-pulse" : 
                    step.status === 'success' ? "text-emerald-500" : "text-slate-300"
                  )}>
                    {step.label}
                  </span>
                  {step.status === 'loading' && <Loader2 size={12} className="animate-spin text-primary" />}
                  {step.status === 'success' && <CheckCircle2 size={12} className="text-emerald-500" />}
                  {step.status === 'pending' && <div className="w-3 h-3 rounded-full border border-slate-200" />}
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  if (phase === 'instructions') return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Zap size={16} className="text-white fill-current" /></div>
            <span className="font-bold text-lg tracking-tight text-slate-800">Simulation Instructions</span>
         </div>
         <Button variant="ghost" onClick={() => router.push('/exams')} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit to Dashboard
         </Button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
         <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-[32px] p-10 md:p-16 shadow-sm space-y-12">
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">{mock?.title}</h1>
              <div className="flex flex-wrap gap-4">
                 <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 px-3 py-1 font-bold">{mock?.exam}</Badge>
                 <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-bold">OFFICIAL PATTERN</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                  <Database className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                  <p className="text-2xl font-black text-slate-800">{questions.length}</p>
               </div>
               <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                  <Monitor className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-2xl font-black text-slate-800">{mock?.duration}m</p>
               </div>
               <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                  <AlertCircle className="w-5 h-5 text-destructive mx-auto" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Negative</p>
                  <p className="text-2xl font-black text-slate-800">-{mock?.negativeMarking}</p>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Info className="w-5 h-5 text-primary" /> General Instructions
               </h3>
               <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                  <p className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span> Total time for the examination is {mock?.duration} minutes.</p>
                  <p className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span> The countdown timer in the top right corner will display the remaining time.</p>
                  <p className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span> Every question has 4 options. Only one option is correct.</p>
                  <p className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span> For each correct answer, you get 1 mark. For each wrong answer, {mock?.negativeMarking} marks will be deducted.</p>
               </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
               <Button onClick={() => setPhase('engine')} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-lg">
                  I AM READY TO BEGIN
                  <ChevronRight className="ml-2 w-5 h-5" />
               </Button>
            </div>
         </div>
      </main>
    </div>
  );

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden select-none font-body text-slate-900">
      {/* CBT Header */}
      <header className="h-[70px] px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 z-50 shadow-xl border-b border-white/5">
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
              <span className="font-black text-sm uppercase tracking-tight truncate max-w-[280px]">{mock?.title}</span>
              <div className="flex items-center gap-2">
                 <Badge className="bg-white/10 text-white/60 border-none text-[8px] font-black tracking-widest px-2 py-0 h-4">{mock?.exam}</Badge>
                 <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400">
                    <Cloud size={10} className="animate-pulse" /> SYNC ACTIVE
                 </span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
             <button onClick={() => setActiveLang('en')} className={cn("px-5 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'en' ? "bg-primary text-white" : "text-white/40 hover:text-white/60")}>ENGLISH</button>
             <button onClick={() => setActiveLang('pa')} className={cn("px-5 py-1.5 rounded-lg text-[10px] font-black transition-all", activeLang === 'pa' ? "bg-primary text-white" : "text-white/40 hover:text-white/60")}>ਪੰਜਾਬੀ</button>
           </div>
           
           <div className="flex items-center gap-8">
              <Timer duration={mock?.duration || 60} onFinish={submitTest} />
              <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-xs uppercase shadow-lg">SUBMIT TEST</Button>
           </div>
        </div>
      </header>

      {/* Main CBT Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50 relative">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 pr-4">Section: Common Core</span>
                 <span className="text-sm font-bold text-slate-700">Question {current + 1} of {questions.length}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-500">
                 <span className="text-emerald-600">+1.0 Marks</span>
                 <span className="text-red-500">-{mock?.negativeMarking} Penalty</span>
              </div>
            </div>

            {questions[current] && (
              <QuestionCard 
                question={questions[current]} 
                selected={answers[current]?.selectedOption || null} 
                activeLanguage={activeLang}
                onSelect={handleSelect} 
                sideBySide={true}
              />
            )}
          </div>
        </main>

        <aside className="w-[360px] bg-white border-l border-slate-200 hidden lg:flex flex-col shrink-0">
           <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                 <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-slate-200 border-2 border-white shadow-sm">
                    <img src={`https://picsum.photos/seed/${user?.uid}/100`} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800 leading-none">{profile?.name}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Exam Terminal</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                    <span>Question Palette</span>
                    <Badge variant="outline" className="text-[9px] border-slate-200">{questions.length} Items</Badge>
                 </div>
                 <QuestionPalette questions={questions} current={current} answers={answers} setCurrent={setCurrent} />
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-5">
                 <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Status Summary</h4>
                 <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { label: "Answered", count: attemptedCount, color: "bg-emerald-500" },
                      { label: "Not Answered", count: questions.length - attemptedCount, color: "bg-slate-200" },
                      { label: "Marked", count: reviewCount, color: "bg-purple-600" },
                      { label: "Remaining", count: questions.length - current - 1, color: "border border-slate-200" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className={cn("w-3 h-3 rounded-sm shadow-sm", item.color)} />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{item.label}</span>
                            <span className="text-xs font-bold text-slate-800 mt-0.5">{item.count}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center gap-3 text-slate-400">
                 <RotateCcw size={14} />
                 <p className="text-[9px] font-bold uppercase tracking-widest">Auto-saved 4 seconds ago</p>
              </div>
           </div>
        </aside>
      </div>

      {/* CBT Footer Actions */}
      <footer className="h-[75px] px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-2xl relative z-40">
         <div className="flex gap-4">
            <Button variant="outline" onClick={markForReview} className="h-12 px-8 rounded-xl border-slate-200 text-purple-600 hover:bg-purple-50 font-bold text-xs uppercase tracking-tight">MARK FOR REVIEW & NEXT</Button>
            <Button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[current]; return n; })} variant="ghost" className="h-12 px-8 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-tight">CLEAR RESPONSE</Button>
         </div>
         <div className="flex gap-4">
            <Button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} variant="outline" className="h-12 px-10 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-tight">PREVIOUS</Button>
            <Button onClick={() => { if(current < questions.length-1) setCurrent(c => c + 1); }} className="h-12 px-20 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl">SAVE & NEXT</Button>
         </div>
      </footer>

      {/* Submission Confirmation */}
      <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <DialogContent className="bg-white text-slate-900 max-w-md rounded-[32px] p-10 border-none shadow-2xl">
          <DialogHeader>
            <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center mb-6">
               <ShieldCheck className="text-emerald-500 w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Final Submission</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-2">
               You are about to submit your simulation. Once submitted, you cannot change your responses.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 grid grid-cols-2 gap-4">
             <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Attempted</p>
                <p className="text-2xl font-black text-slate-800">{attemptedCount}</p>
             </div>
             <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Marked</p>
                <p className="text-2xl font-black text-slate-800">{reviewCount}</p>
             </div>
          </div>

          <DialogFooter className="gap-3">
             <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 border-slate-200 font-bold">RESUME TEST</Button>
             <Button onClick={submitTest} disabled={isSubmitting} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "SUBMIT TEST"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
