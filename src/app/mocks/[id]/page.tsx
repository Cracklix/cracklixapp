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
  Maximize,
  CheckCircle2,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, LanguageMode, ExamAttempt, ExamSection } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * PRODUCTION CBT ENGINE v18.0 (CRACKLIX ENTERPRISE)
 * Testbook-Style Full Implementation: Mobile-First, Realtime Autosave, Sectional Tabs.
 */
export default function ProfessionalCBTEngine() {
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
  const [activeLang, setActiveLang] = useState<LanguageMode>('bilingual');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation artifact not found");

      const entitlement = await checkMockEntitlement(user.uid, mockData);
      if (!entitlement.allowed) {
        toast({ title: "Access Restricted", description: entitlement.reason, variant: "destructive" });
        router.push('/pass');
        return;
      }

      const qData = await getMockQuestions(mockId);
      if (qData.length === 0) {
        toast({ title: "Registry Error", description: "No questions detected in this mock." });
        router.push('/dashboard');
        return;
      }

      setMock(mockData);
      setQuestions(qData);
      
      let session = await getOngoingAttempt(user.uid, mockId);
      if (!session) {
        const id = await startAttempt(user.uid, mockData);
        session = { 
          id, ...mockData, 
          userId: user.uid, 
          answers: {}, 
          currentQuestionIndex: 0, 
          status: 'ongoing', 
          startedAt: Date.now(), 
          remainingTime: mockData.duration * 60 
        } as any;
      }
      
      setAttempt(session as any);
      setAnswers(session?.answers || {});
      setCurrent(session?.currentQuestionIndex || 0);
      setActiveSectionId(session?.currentSectionId || mockData.sections?.[0]?.id || "core");
      setPhase('engine');
      
      if (profile?.languageMode) setActiveLang(profile.languageMode as any);
      
    } catch (e: any) {
      toast({ title: "Boot Error", description: e.message, variant: "destructive" });
      router.push('/dashboard');
    }
  }, [mockId, user, profile, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

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
    if (phase === 'engine') {
       setPhase('paused');
       if (attempt?.id) await pauseAttempt(attempt.id, 0); 
    } else {
       setPhase('engine');
    }
  };

  if (phase === 'booting') return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
       <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
       </div>
       <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Loading Exam Engine...</h2>
       <p className="text-slate-400 text-xs mt-2 uppercase font-black tracking-widest">Establishing Secure Connection</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#f1f5f9] flex flex-col overflow-hidden font-body select-none">
       {/* COMPACT TOP HEADER */}
       <header className="h-[60px] px-4 md:px-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50 shadow-lg">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight truncate max-w-[150px] md:max-w-none">{mock?.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cloud Synced</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                <Globe size={12} className="text-blue-400" />
                <select 
                  value={activeLang} 
                  onChange={(e) => setActiveLang(e.target.value as any)}
                  className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer text-white"
                >
                   <option value="en" className="bg-slate-900">English</option>
                   <option value="pa" className="bg-slate-900">Punjabi</option>
                   <option value="bilingual" className="bg-slate-900">Bilingual</option>
                </select>
             </div>

             <Timer 
               duration={attempt?.remainingTime ? attempt.remainingTime / 60 : (mock?.duration || 60)} 
               onFinish={handleSubmitTest} 
               paused={phase === 'paused'}
             />

             <Button 
               variant="ghost" 
               size="icon" 
               onClick={togglePause} 
               className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
             >
                {phase === 'paused' ? <Play size={14} /> : <Pause size={14} />}
             </Button>

             <Button 
              onClick={() => setSubmitConfirmOpen(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 h-8 px-4 rounded-lg font-bold text-[10px] uppercase shadow-lg"
             >
                SUBMIT
             </Button>

             <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPaletteOpen(true)} 
              className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 lg:hidden"
             >
                <Menu size={16} />
             </Button>
          </div>
       </header>

       {/* SECTION TABS */}
       <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 shrink-0 overflow-x-auto no-scrollbar">
          {mock?.sections?.map(s => (
             <button 
              key={s.id}
              onClick={() => setActiveSectionId(s.id)}
              className={cn(
                "h-full px-6 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2",
                activeSectionId === s.id ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
             >
               {s.name}
             </button>
          ))}
       </div>

       <div className="flex-1 flex overflow-hidden">
          {/* MAIN QUESTION AREA */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-white relative">
             <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                   {questions[current] && phase === 'engine' ? (
                     <motion.div
                       key={questions[current].id}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="space-y-6"
                     >
                        <div className="flex items-center justify-between mb-6 text-slate-400">
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-800">Q.{current + 1}</span>
                              <div className="h-4 w-px bg-slate-200" />
                              <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-200">{questions[current].subject}</Badge>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
                              <span className="text-emerald-600">+{questions[current].marks}.0</span>
                              <span className="text-red-500">-{questions[current].negativeMarks}.0</span>
                           </div>
                        </div>

                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption as any || null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang}
                          examMode={mock?.examMode || 'PSSSB'}
                        />
                     </motion.div>
                   ) : phase === 'paused' ? (
                     <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
                           <Pause className="text-blue-600 w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">TEST PAUSED</h3>
                        <Button onClick={togglePause} size="lg" className="h-14 px-10 rounded-xl bg-blue-600 text-white font-bold shadow-xl">RESUME TEST</Button>
                     </div>
                   ) : null}
                </AnimatePresence>
             </div>
          </main>

          {/* RIGHT PALETTE (DESKTOP) */}
          <aside className="w-[300px] bg-slate-50 border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="p-6 border-b border-slate-200 bg-white flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                   <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} />
                   <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                   <p className="text-[11px] font-black uppercase text-slate-800 leading-none">{profile?.name}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reg: {user?.uid.substring(0,8)}</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Answered</p>
                      <h4 className="text-lg font-black text-emerald-700">{Object.values(answers).filter(a => a.status === 'ANSWERED').length}</h4>
                   </div>
                   <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Unvisited</p>
                      <h4 className="text-lg font-black text-slate-600">{questions.length - Object.keys(answers).length}</h4>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Palette</span>
                      <LayoutGrid size={12} className="text-slate-300" />
                   </div>
                   <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, i) => {
                        const ans = answers[q.id];
                        const isCurrent = current === i;
                        const status = ans?.status || 'NOT_VISITED';

                        let bg = "bg-white text-slate-400 border-slate-200";
                        if (status === 'ANSWERED') bg = "bg-emerald-500 text-white border-emerald-600";
                        if (status === 'MARKED_FOR_REVIEW') bg = "bg-blue-600 text-white border-blue-700";
                        if (status === 'ANSWERED_AND_MARKED') bg = "bg-purple-600 text-white border-purple-700";

                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrent(i)}
                            className={cn(
                              "h-9 w-full rounded-lg font-bold text-[10px] transition-all border flex items-center justify-center relative",
                              bg,
                              isCurrent && "ring-2 ring-blue-600 ring-offset-1 scale-105 z-10"
                            )}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>

             <div className="p-5 bg-white border-t border-slate-200">
                <Button onClick={() => setSubmitConfirmOpen(true)} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-tight shadow-lg">
                   FINISH TEST
                </Button>
             </div>
          </aside>
       </div>

       {/* STICKY BOTTOM BAR */}
       <footer className="h-[70px] px-4 md:px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-2">
             <Button variant="outline" onClick={handleMarkForReview} className="h-10 px-4 md:px-6 rounded-xl font-bold text-[10px] uppercase tracking-tight border-slate-200 text-slate-600">MARK FOR REVIEW</Button>
             <Button variant="ghost" onClick={handleClear} className="h-10 px-4 rounded-xl text-slate-400 font-bold text-[10px] uppercase hidden md:flex">CLEAR</Button>
          </div>
          
          <div className="flex gap-3 items-center">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-1 px-4 h-10 rounded-xl text-slate-500 font-bold text-[10px] uppercase hover:bg-slate-50 disabled:opacity-30">
                <ChevronLeft size={14} /> PREV
             </button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-11 px-8 md:px-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-md">
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
         mockTitle={mock?.title || "Exam"}
       />

       {/* PROFESSIONAL SUBMIT DIALOG */}
       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white text-slate-900 max-w-md rounded-3xl p-8 shadow-2xl">
            <DialogHeader className="text-center space-y-4">
               <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
                  <ShieldCheck className="text-emerald-500 w-8 h-8" />
               </div>
               <DialogTitle className="text-2xl font-bold uppercase tracking-tight">Final Submission</DialogTitle>
               <DialogDescription className="text-slate-500 text-sm font-medium">Are you sure you want to end your session?</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 my-8">
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Attempted</p>
                  <p className="text-xl font-black text-blue-600">{Object.values(answers).filter(a => a.status === 'ANSWERED').length}</p>
               </div>
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Skipped</p>
                  <p className="text-xl font-black text-slate-400">{questions.length - Object.values(answers).length}</p>
               </div>
            </div>

            <DialogFooter className="gap-3 flex flex-col sm:flex-row">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-12 rounded-xl flex-1 font-bold uppercase text-[10px] tracking-widest">RESUME</Button>
               <Button onClick={handleSubmitTest} disabled={isSubmitting} className="h-12 rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "SUBMIT TEST"}
               </Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
