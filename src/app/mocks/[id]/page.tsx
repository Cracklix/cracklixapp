'use client';

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt,
  getOngoingAttempt
} from "@/services/mocks";
import QuestionCard from "@/components/mock/question-card";
import PaletteDrawer from "@/components/mock/palette-drawer";
import Timer from "@/components/mock/timer";
import { calculateAttemptMetrics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  Menu,
  ShieldCheck,
  Globe,
  CheckCircle2,
  Zap,
  Monitor,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, ExamAttempt, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * INSTITUTIONAL CBT ENGINE v32.5 (Enterprise Optimized)
 */
export default function CBTEngineV32({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const mockId = unwrappedParams.id;
  
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'booting' | 'gateway' | 'exam' | 'submitting'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageMode>('bilingual');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation artifact missing.");
      const qData = await getMockQuestions(mockId);
      if (qData.length === 0) throw new Error("This mock has no questions.");

      setMock(mockData);
      setQuestions(qData);
      
      const existing = await getOngoingAttempt(user.uid, mockId);
      if (existing) {
        setAttempt(existing);
        setAnswers(existing.answers || {});
        setCurrent(existing.currentQuestionIndex || 0);
        setTimeRemaining(existing.remainingTime || mockData.duration * 60);
      } else {
        setTimeRemaining(mockData.duration * 60);
      }
      setPhase('gateway');
    } catch (e: any) {
      toast({ title: "Signal Error", variant: "destructive" });
      router.push('/exams');
    }
  }, [mockId, user, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

  // Real-time Sync & Timer Logic
  useEffect(() => {
    if (phase !== 'exam' || !attempt?.id) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const syncInterval = setInterval(() => {
      saveAnswer(attempt.id, 'meta_sync', {
        remainingTime: timeRemaining,
        currentQuestionIndex: current,
        lastSynced: Date.now()
      } as any);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [phase, attempt?.id, timeRemaining, current]);

  const handleStartExam = async () => {
    if (!user || !mock) return;
    setPhase('booting');
    try {
      if (!attempt) {
        const id = await startAttempt(user.uid, mock);
        setAttempt({ id } as any);
      }
      setPhase('exam');
      if (mock.languageMode) setActiveLang(mock.languageMode);
    } catch (e) {
      setPhase('gateway');
    }
  };

  const handleOptionSelect = (option: string | null) => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const payload: AttemptAnswer = {
      questionId: qId,
      selectedOption: option,
      status: option ? 'ANSWERED' : 'NOT_VISITED',
      timeSpent: 0,
      lastUpdated: Date.now()
    };
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
  };

  const markForReview = () => {
    if (!attempt?.id || !questions[current]) return;
    const qId = questions[current].id;
    const currentAns = answers[qId];
    const newStatus = currentAns?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW';
    const payload = { ...currentAns, questionId: qId, status: newStatus, lastUpdated: Date.now() } as any;
    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
    handleNext();
  };

  const handleNext = () => current < questions.length - 1 && setCurrent(c => c + 1);
  const handlePrev = () => current > 0 && setCurrent(c => c - 1);

  const handleSubmitFinal = async () => {
    if (!user || !attempt?.id || !mock) return;
    setPhase('submitting');
    try {
      const analytics = calculateAttemptMetrics(questions, answers, mock, timeRemaining);
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
         <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 rounded-[28px] bg-primary flex items-center justify-center blue-glow">
            <Monitor className="text-white w-8 h-8" />
         </motion.div>
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">{phase === 'booting' ? 'Initializing Neural Buffer' : 'Syncing Final Audit'}</p>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
         <header className="h-16 bg-black/40 border-b border-white/5 flex items-center px-8 justify-between shrink-0 backdrop-blur-xl">
            <div className="flex items-center gap-5">
               <Button variant="ghost" size="icon" onClick={() => router.push('/exams')} className="rounded-xl border border-white/5"><ArrowLeft size={16} /></Button>
               <div>
                  <h1 className="font-black text-sm uppercase tracking-tight leading-none">{mock?.title}</h1>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Instructional Protocol</p>
               </div>
            </div>
         </header>
         <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-6">
                  <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-10 shadow-2xl relative overflow-hidden">
                     <h3 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-tighter mb-8">
                        <ShieldCheck className="text-primary w-6 h-6" /> Simulation Standard
                     </h3>
                     <div className="space-y-5 text-zinc-400 font-medium text-sm leading-relaxed">
                        <p className="flex gap-3 items-start"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={16} /> Total: <strong className="text-white">{mock?.duration} minutes</strong>.</p>
                        <p className="flex gap-3 items-start"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={16} /> Scheme: <strong className="text-white">+1.0</strong> / <strong className="text-red-500">-{mock?.negativeMarking}</strong>.</p>
                        <p className="flex gap-3 items-start"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={16} /> Heartbeat sync enabled (every 10s).</p>
                     </div>
                  </Card>
               </div>
               <div className="lg:col-span-4">
                  <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-8 space-y-8">
                     <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] px-1">Language Buffer</p>
                        <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                           <SelectTrigger className="h-14 bg-black/40 border-white/10 rounded-2xl font-black text-[11px] uppercase px-6"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-zinc-950 text-white border-white/10">
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="punjabi">Punjabi</SelectItem>
                              <SelectItem value="bilingual">Bilingual</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <Button onClick={handleStartExam} className="w-full h-16 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black text-base blue-glow uppercase tracking-widest">
                        BEGIN TEST <ChevronRight size={20} className="ml-1" />
                     </Button>
                  </Card>
               </div>
            </div>
         </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-slate-900 flex flex-col overflow-hidden relative">
       {/* 0-Scroll Header */}
       <header className="h-[65px] px-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="rounded-lg h-9 w-9 hover:bg-white/10"><Menu size={20} /></Button>
             <div className="flex flex-col">
                <span className="font-black text-xs uppercase tracking-tight truncate max-w-[120px] md:max-w-xs">{mock?.title}</span>
                <span className="text-[7px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> LIVE STREAM
                </span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
                <Globe size={12} className="text-blue-400" />
                <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                   <SelectTrigger className="h-8 w-28 bg-white/5 border-white/10 rounded-lg font-black text-[8px] uppercase tracking-widest px-2"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-[#1e293b] text-white border-white/10">
                      <SelectItem value="english">EN</SelectItem>
                      <SelectItem value="punjabi">PA</SelectItem>
                      <SelectItem value="bilingual">EN+PA</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <Timer duration={timeRemaining / 60} onFinish={handleSubmitFinal} />
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">SUBMIT</Button>
          </div>
       </header>

       {/* 0-Scroll Workspace */}
       <div className="flex-1 flex overflow-hidden cbt-workspace">
          <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 bg-slate-50 relative">
             <div className="max-w-5xl mx-auto space-y-4 pb-20">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                   <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600 text-white border-none px-3 py-0.5 font-black uppercase text-[8px] tracking-widest">
                         {questions[current]?.subject.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="border-slate-300 text-slate-500 text-[8px] font-black uppercase">ARTIFACT {current + 1}</Badge>
                   </div>
                </div>

                <AnimatePresence mode="wait">
                   {questions[current] && (
                     <motion.div key={questions[current].id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption || null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang}
                          index={current}
                        />
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>
       </div>

       {/* 0-Scroll Footer */}
       <footer className="h-[75px] px-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-2">
             <Button variant="outline" onClick={markForReview} className="rounded-xl h-11 px-6 border-slate-200 font-black text-[9px] uppercase tracking-widest text-blue-600">MARK REVIEW</Button>
             <Button variant="ghost" onClick={() => handleOptionSelect(null)} className="rounded-xl h-11 px-4 font-bold text-[9px] uppercase text-zinc-400">Clear</Button>
          </div>
          <div className="flex gap-4 items-center">
             <button disabled={current === 0} onClick={handlePrev} className="font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all">Prev</button>
             <Button onClick={handleNext} disabled={current === questions.length - 1} className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 active:scale-95">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[32px] p-10 max-w-md border-none shadow-2xl">
            <DialogHeader className="text-center space-y-4">
               <div className="w-16 h-16 rounded-[22px] bg-emerald-50 flex items-center justify-center mx-auto"><ShieldCheck className="text-emerald-500 w-8 h-8" /></div>
               <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Complete Audit?</DialogTitle>
               <DialogDescription className="text-slate-500 text-sm font-medium text-center">Verified signals will be transmitted for performance scoring.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 mt-6 flex flex-col sm:flex-row">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-12 rounded-xl flex-1 font-black text-[10px] uppercase">RESUME</Button>
               <Button onClick={handleSubmitFinal} className="h-12 rounded-xl flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">SUBMIT FINAL</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>

       <PaletteDrawer 
         open={paletteOpen} 
         onClose={() => setPaletteOpen(false)} 
         questions={questions} 
         current={current} 
         answers={answers} 
         setCurrent={setCurrent} 
         mockTitle={mock?.title || "Assessment"}
         activeLanguage={activeLang}
       />
    </div>
  );
}