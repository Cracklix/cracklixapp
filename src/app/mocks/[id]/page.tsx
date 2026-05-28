
'use client';

import React, { useEffect, useState, useCallback } from "react";
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
import PaletteDrawer from "@/components/mock/palette-drawer";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  Monitor, 
  Menu,
  Timer as TimerIcon,
  AlertTriangle,
  Cloud,
  ChevronLeft,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function AdvancedCBTPlayer() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'booting' | 'instructions' | 'engine' | 'result'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'pa' | 'bilingual'>('en');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initializeSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation not found");

      const access = await checkMockAccess(user.uid, mockData);
      if (!access.allowed) {
        toast({ 
          title: "Access Restricted", 
          description: access.reason || "Upgrade to PASS+ for full access.", 
          variant: "destructive" 
        });
        router.push('/pass');
        return;
      }

      const qData = await getMockQuestions(mockId);
      if (qData.length === 0) {
        toast({ title: "Registry Empty", description: "This simulation has no artifacts linked." });
        router.push('/dashboard');
        return;
      }

      setMock(mockData);
      setQuestions(qData);
      
      const id = await startAttempt(user.uid, mockData);
      setAttemptId(id);
      setPhase('instructions');
    } catch (e: any) {
      toast({ title: "Signal Lost", description: "Failed to load simulation node.", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [mockId, user, router, toast]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const handleSelect = (option: string) => {
    if (!attemptId) return;
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
    if (!attemptId) return;
    const currentAns = answers[current];
    const payload: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: currentAns?.selectedOption || null,
      status: currentAns?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW',
      timeSpent: 0,
      lastSavedAt: Date.now()
    };
    setAnswers(prev => ({ ...prev, [current]: payload }));
    saveAnswer(attemptId, current, payload);
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  const submitTest = async () => {
    if (!user || !attemptId || !mock) return;
    setIsSubmitting(true);
    try {
      const analytics = generateAnalytics({ questions, answers, mock });
      await finalizeAttempt(user.uid, attemptId, analytics);
      router.push(`/mocks/result/${attemptId}`);
    } catch (e) {
      toast({ title: "Final Transmission Failed", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  if (phase === 'booting') return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
       <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 fill-current animate-pulse" />
       </div>
       <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">Initializing High-Fidelity Simulation...</p>
    </div>
  );

  if (phase === 'instructions') return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-body text-slate-900">
       <header className="h-[70px] px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
                <ArrowLeft size={18} />
             </Button>
             <span className="font-black text-xl tracking-tighter uppercase">Instructions Registry</span>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 px-3 py-1 font-bold">CBT CORE v15.5</Badge>
       </header>
       
       <main className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center no-scrollbar">
          <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-[48px] p-8 md:p-16 shadow-sm space-y-12">
             <div className="text-center space-y-6">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase text-slate-900">{mock?.title}</h1>
                <div className="flex flex-wrap justify-center gap-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                   <span className="flex items-center gap-2"><Monitor size={14} className="text-primary" /> {questions.length} Items</span>
                   <span className="flex items-center gap-2"><TimerIcon size={14} className="text-primary" /> {mock?.duration} Mins</span>
                   <span className="flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /> Negative Scheme Active</span>
                </div>
             </div>

             <div className="p-10 rounded-[40px] bg-primary/5 border border-primary/10 space-y-8">
                <div className="text-center space-y-2">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Initialize Translation Layer</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {['en', 'pa', 'bilingual'].map(l => (
                     <button
                       key={l}
                       onClick={() => setActiveLang(l as any)}
                       className={cn(
                         "h-16 rounded-[24px] font-black text-xs uppercase tracking-widest border-2 transition-all duration-300",
                         activeLang === l 
                            ? "bg-primary text-white border-primary shadow-2xl" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-primary/20"
                       )}
                     >
                       {l === 'en' ? 'English' : l === 'pa' ? 'ਪੰਜਾਬੀ' : 'Bilingual'}
                     </button>
                   ))}
                </div>
             </div>

             <Button onClick={() => setPhase('engine')} className="w-full h-20 rounded-[32px] bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-black shadow-2xl">
                AGREE & START ASSESSMENT
             </Button>
          </div>
       </main>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-body text-slate-900 select-none">
       <header className="h-[70px] px-8 bg-slate-900 text-white flex items-center justify-between shrink-0 z-50 shadow-2xl">
          <div className="flex items-center gap-6">
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="h-10 w-10 rounded-xl bg-white/5 border border-white/5">
                <Menu size={18} />
             </Button>
             <div className="flex flex-col border-l border-white/10 pl-6">
                <span className="font-black text-sm uppercase tracking-tight truncate max-w-[280px]">{mock?.title}</span>
                <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black px-2 py-0.5 uppercase w-fit">{mock?.exam}</Badge>
             </div>
          </div>

          <div className="flex items-center gap-8">
             <Timer duration={mock?.duration || 60} onFinish={submitTest} />
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">SUBMIT</Button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-[#f8fafc] relative">
             <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                   {questions[current] && (
                     <motion.div
                       key={questions[current].id}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.3 }}
                     >
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[current]?.selectedOption || null} 
                          onSelect={handleSelect}
                          activeLanguage={activeLang as any}
                          sideBySide={activeLang === 'bilingual'}
                        />
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>

          <aside className="w-[400px] bg-white border-l border-slate-200 hidden lg:flex flex-col shrink-0 shadow-2xl">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full border-2 border-slate-100 p-0.5 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${user?.uid}/100`} className="w-full h-full rounded-full object-cover" alt="" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-900 uppercase">{profile?.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {user?.uid.substring(0,8)}</p>
                   </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl border border-slate-100"><Settings size={16} className="text-slate-400" /></Button>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
                <div className="space-y-6">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                      <span>Grid Navigation</span>
                   </div>
                   <div className="grid grid-cols-5 gap-3">
                      {questions.map((_, i) => {
                        const ans = answers[i];
                        const isCurrent = current === i;
                        const status = ans?.status || 'NOT_VISITED';

                        let bg = "bg-slate-100 text-slate-400 border-slate-200";
                        if (status === 'ANSWERED') bg = "bg-emerald-500 text-white border-emerald-600 shadow-lg";
                        if (status === 'MARKED_FOR_REVIEW') bg = "bg-purple-600 text-white border-purple-700 shadow-lg";

                        return (
                          <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={cn(
                              "h-12 w-full rounded-xl font-black text-[11px] transition-all border flex items-center justify-center",
                              bg,
                              isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
                            )}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>
             
             <div className="p-8 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3 text-emerald-600">
                   <Cloud size={16} className="animate-pulse" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sync Active</p>
                </div>
             </div>
          </aside>
       </div>

       <footer className="h-[85px] px-10 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-4">
             <Button variant="outline" onClick={markForReview} className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">MARK FOR REVIEW</Button>
             <Button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[current]; return n; })} variant="ghost" className="h-14 px-8 rounded-2xl text-slate-400 font-black text-[11px] uppercase tracking-widest">CLEAR</Button>
          </div>
          <div className="flex gap-4 items-center">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-2 px-6 h-14 rounded-2xl text-slate-500 font-black text-[11px] uppercase hover:bg-slate-50 disabled:opacity-30">
                <ChevronLeft size={20} /> PREVIOUS
             </button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-14 px-24 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       <PaletteDrawer 
         open={paletteOpen} 
         onClose={() => setPaletteOpen(false)} 
         questions={questions} 
         current={current} 
         answers={answers} 
         setCurrent={setCurrent} 
       />

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white text-slate-900 max-w-md rounded-[48px] p-10">
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-emerald-500 w-10 h-10" />
               </div>
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Submit Simulation?</DialogTitle>
               <DialogDescription className="text-slate-400 font-medium text-sm">
                  Your artifacts are synced to the registry. Submitting will end the test and generate your preparation analytics.
               </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-3 flex flex-col md:flex-row mt-6">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-16 rounded-2xl flex-1 font-black uppercase text-[11px]">RESUME</Button>
               <Button onClick={submitTest} disabled={isSubmitting} className="h-16 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px]">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "FINAL SUBMIT"}
               </Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
