'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt,
  pauseAttempt,
  getOngoingAttempt
} from "@/services/mocks";
import { checkMockEntitlement } from "@/services/payment";
import QuestionCard from "@/components/mock/question-card";
import PaletteDrawer from "@/components/mock/palette-drawer";
import Timer from "@/components/mock/timer";
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  Menu,
  AlertTriangle,
  Monitor,
  Zap,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Pause,
  Play,
  LogOut,
  Maximize
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, LanguageMode, ExamAttempt } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * PRODUCTION CBT ENGINE v17.0 (CRACKLIX ADVANCED)
 * Mobile-first, Full Multilingual Support, Sectional Navigation, Cloud Auto-Save.
 */
export default function AdvancedCBTPlayer() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'booting' | 'engine' | 'paused'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageMode>('en');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  // Temporal references
  const timerRef = useRef<number>(0);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation artifact not found");

      // 1. Authorization Protocol
      const entitlement = await checkMockEntitlement(user.uid, mockData);
      if (!entitlement.allowed) {
        toast({ title: "Access Restricted", description: entitlement.reason, variant: "destructive" });
        router.push('/pass');
        return;
      }

      // 2. Artifact Preloading
      const qData = await getMockQuestions(mockId);
      if (qData.length === 0) {
        toast({ title: "Registry Error", description: "No artifacts detected in this simulation." });
        router.push('/dashboard');
        return;
      }

      setMock(mockData);
      setQuestions(qData);
      
      // 3. Session Handshake
      let session = await getOngoingAttempt(user.uid, mockId);
      if (!session) {
        const id = await startAttempt(user.uid, mockData);
        session = { id, ...mockData, userId: user.uid, answers: {}, currentQuestionIndex: 0, status: 'ongoing', startedAt: Date.now(), remainingTime: mockData.duration * 60 } as any;
      }
      
      setAttempt(session as any);
      setAnswers(session?.answers || {});
      setCurrent(session?.currentQuestionIndex || 0);
      setActiveSectionId(mockData.sections?.[0]?.id || "core");
      setPhase('engine');
      
      // Prefill user preference
      if (profile?.languageMode) setActiveLang(profile.languageMode as any);
      
    } catch (e: any) {
      toast({ title: "Boot Error", description: e.message, variant: "destructive" });
      router.push('/dashboard');
    }
  }, [mockId, user, profile, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

  // Periodic Cloud Sync
  useEffect(() => {
    if (phase === 'engine' && attempt?.id) {
      autoSaveInterval.current = setInterval(() => {
        syncToCloud();
      }, 15000); // 15s interval
    }
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
    };
  }, [phase, attempt?.id]);

  const syncToCloud = async () => {
    if (!attempt?.id) return;
    // Implementation for bulk sync
  };

  const handleOptionSelect = (option: string) => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const payload: AttemptAnswer = {
      questionId: qId,
      selectedOption: option,
      status: 'ANSWERED',
      timeSpent: 0,
      lastUpdated: Date.now()
    };
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
  };

  const handleMarkForReview = () => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const currentAns = answers[qId];
    const payload: AttemptAnswer = {
      questionId: qId,
      selectedOption: currentAns?.selectedOption || null,
      status: currentAns?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW',
      timeSpent: 0,
      lastUpdated: Date.now()
    };
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  const handleClear = () => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    setAnswers(prev => {
      const n = {...prev};
      delete n[qId];
      return n;
    });
    saveAnswer(attempt.id, qId, { questionId: qId, selectedOption: null, status: 'NOT_ANSWERED', timeSpent: 0, lastUpdated: Date.now() });
  };

  const handleSubmitTest = async () => {
    if (!user || !attempt?.id || !mock) return;
    setIsSubmitting(true);
    try {
      const answersMap: Record<number, any> = {};
      questions.forEach((q, idx) => {
        if (answers[q.id]) answersMap[idx] = answers[q.id];
      });

      const analytics = generateAnalytics({ questions, answers: answersMap, mock });
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      toast({ title: "Submission Failed", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const togglePause = async () => {
    if (!mock?.pausable) {
       toast({ title: "Pause Disabled", description: "This simulation does not support pausing." });
       return;
    }
    if (phase === 'engine') {
       setPhase('paused');
       if (attempt?.id) await pauseAttempt(attempt.id, timerRef.current);
    } else {
       setPhase('engine');
    }
  };

  if (phase === 'booting') return (
    <div className="h-screen bg-[#05070a] flex flex-col items-center justify-center p-6 text-center">
       <div className="relative mb-10">
          <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8 fill-current" />
       </div>
       <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Launching Simulation Engine</h2>
       <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mt-3">Validating Signal Integrity & Artifact Registry</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#F1F5F9] flex flex-col overflow-hidden font-body select-none">
       <header className="h-[64px] px-4 md:px-8 bg-[#1E293B] text-white flex items-center justify-between shrink-0 z-50 shadow-2xl">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg"><Monitor size={16} className="text-white" /></div>
                <div className="flex flex-col hidden sm:flex">
                   <span className="font-black text-xs uppercase tracking-tight truncate max-w-[200px]">{mock?.title}</span>
                   <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">{activeSectionId.toUpperCase()} SECTION</span>
                </div>
             </div>
             
             <div className="hidden lg:flex gap-1 ml-4 overflow-hidden rounded-lg bg-black/20 p-1">
                {mock?.sections?.map(s => (
                   <button 
                    key={s.id}
                    onClick={() => setActiveSectionId(s.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                      activeSectionId === s.id ? "bg-white text-slate-900 shadow-md" : "text-zinc-400 hover:text-white"
                    )}
                   >
                     {s.name}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                <Globe size={12} className="text-primary" />
                <select 
                  value={activeLang} 
                  onChange={(e) => setActiveLang(e.target.value as any)}
                  className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-white"
                >
                   <option value="en" className="bg-slate-900">English</option>
                   <option value="pa" className="bg-slate-900">ਪੰਜਾਬੀ</option>
                   <option value="hi" className="bg-slate-900">हिन्दी</option>
                   <option value="bilingual" className="bg-slate-900">Bilingual</option>
                </select>
             </div>

             <div className="flex items-center gap-4">
                <Timer 
                  duration={attempt?.remainingTime ? attempt.remainingTime / 60 : (mock?.duration || 60)} 
                  onFinish={handleSubmitTest} 
                  paused={phase === 'paused'}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={togglePause} 
                  className="h-9 w-9 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10"
                >
                   {phase === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                </Button>
             </div>

             <Button 
              onClick={() => setSubmitConfirmOpen(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl hidden sm:flex"
             >
                SUBMIT
             </Button>

             <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPaletteOpen(true)} 
              className="h-9 w-9 rounded-lg bg-white/5 border border-white/5 lg:hidden"
             >
                <LayoutGrid size={16} />
             </Button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-white relative">
             <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                   {questions[current] && phase === 'engine' ? (
                     <motion.div
                       key={questions[current].id}
                       initial={{ opacity: 0, x: 10 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -10 }}
                       className="space-y-8"
                     >
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption as any || null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang}
                          sideBySide={activeLang === 'bilingual'}
                        />
                     </motion.div>
                   ) : phase === 'paused' ? (
                     <div className="h-full flex flex-col items-center justify-center py-40 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center animate-pulse">
                           <Pause className="text-orange-500 w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">SIMULATION PAUSED</h3>
                        <Button onClick={togglePause} size="lg" className="h-16 px-12 rounded-2xl bg-primary text-xl font-black blue-glow">RESUME NOW</Button>
                     </div>
                   ) : null}
                </AnimatePresence>
             </div>
          </main>

          <aside className="w-[360px] bg-slate-50 border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="p-6 border-b border-slate-200 bg-white flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                   <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} alt="Candidate" />
                   <AvatarFallback className="bg-zinc-800 text-white font-black text-xs">{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                   <p className="text-[11px] font-black uppercase text-slate-900 leading-none">{profile?.name}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">ID: {user?.uid.substring(0,10)}</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Answered</p>
                      <h4 className="text-2xl font-black text-emerald-700">{Object.values(answers).filter(a => a.status === 'ANSWERED').length}</h4>
                   </div>
                   <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Not Visited</p>
                      <h4 className="text-2xl font-black text-slate-600">{questions.length - Object.keys(answers).length}</h4>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Item Matrix</h4>
                   <div className="grid grid-cols-5 gap-2.5">
                      {questions.map((q, i) => {
                        const ans = answers[q.id];
                        const isCurrent = current === i;
                        const status = ans?.status || 'NOT_VISITED';

                        let bg = "bg-white text-slate-400 border-slate-200 hover:border-slate-400";
                        if (status === 'ANSWERED') bg = "bg-emerald-500 text-white border-emerald-600 shadow-xl shadow-emerald-900/10";
                        if (status === 'MARKED_FOR_REVIEW') bg = "bg-purple-600 text-white border-purple-700 shadow-xl";
                        if (status === 'ANSWERED_AND_MARKED') bg = "bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-500 ring-offset-2";

                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrent(i)}
                            className={cn(
                              "h-10 w-full rounded-xl font-black text-[11px] transition-all border flex items-center justify-center relative",
                              bg,
                              isCurrent && "ring-2 ring-primary ring-offset-2 scale-105 z-10"
                            )}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>

             <div className="p-6 bg-[#1E293B] mt-auto">
                <Button onClick={() => setSubmitConfirmOpen(true)} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl">
                   FINAL SUBMISSION
                </Button>
             </div>
          </aside>
       </div>

       <footer className="h-[80px] px-4 md:px-12 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
             <Button variant="outline" onClick={handleMarkForReview} className="h-12 px-6 md:px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50">MARK FOR REVIEW</Button>
             <Button variant="ghost" onClick={handleClear} className="h-12 px-6 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hidden sm:flex">CLEAR RESPONSE</Button>
          </div>
          
          <div className="flex gap-4 items-center">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-2 px-6 h-12 rounded-2xl text-slate-500 font-black text-[10px] uppercase hover:bg-slate-100 disabled:opacity-30 transition-all">
                <ChevronLeft size={16} /> PREV
             </button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-14 px-12 md:px-24 rounded-[22px] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl blue-glow">
                SAVE & NEXT <ChevronRight className="ml-1" size={18} />
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
         <DialogContent className="bg-white text-slate-900 max-w-md rounded-[48px] p-10 overflow-hidden shadow-2xl">
            <DialogHeader className="text-center space-y-6 relative z-10">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="text-emerald-500 w-10 h-10" />
               </div>
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Submit Test?</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 my-10 relative z-10">
               <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Answered</p>
                  <p className="text-2xl font-black text-emerald-600">{Object.values(answers).filter(a => a.status === 'ANSWERED').length}</p>
               </div>
               <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Remaining</p>
                  <p className="text-2xl font-black text-slate-400">{questions.length - Object.values(answers).length}</p>
               </div>
            </div>

            <DialogFooter className="gap-4 flex flex-col sm:flex-row relative z-10">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 font-black uppercase text-[11px] tracking-widest border-slate-200">RESUME</Button>
               <Button onClick={handleSubmitTest} disabled={isSubmitting} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest shadow-xl">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "FINAL SUBMIT"}
               </Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}