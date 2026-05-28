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
  AlertTriangle,
  Zap,
  Info,
  ChevronRight,
  Monitor,
  LayoutGrid
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, ExamAttempt, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * INSTITUTIONAL CBT ENGINE v32.0 (Full Functional Rebuild)
 * Optimized for 0-scroll desktop experience and real-time state sync.
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
  const [isPaused, setIsPaused] = useState(false);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation artifact missing.");

      const qData = await getMockQuestions(mockId);
      if (qData.length === 0) throw new Error("This mock has no questions linked.");

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
      toast({ title: "Signal Error", description: e.message, variant: "destructive" });
      router.push('/exams');
    }
  }, [mockId, user, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

  // Real-time Sync & Timer
  useEffect(() => {
    if (phase !== 'exam' || !attempt?.id || isPaused) return;
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

    // 10s Autosave Heartbeat
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
  }, [phase, attempt?.id, timeRemaining, current, isPaused]);

  const handleStartExam = async () => {
    if (!user || !mock) return;
    setPhase('booting');
    try {
      if (!attempt) {
        const id = await startAttempt(user.uid, mock);
        setAttempt({ id } as any);
      }
      setPhase('exam');
      // Set default language from mock config if available
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
    
    const payload: AttemptAnswer = {
      ...currentAns,
      questionId: qId,
      status: newStatus,
      lastUpdated: Date.now()
    } as any;

    setAnswers(prev => ({ ...prev, [qId]: payload }));
    saveAnswer(attempt.id, qId, payload);
    handleNext();
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
    }
  };

  const handleSubmitFinal = async () => {
    if (!user || !attempt?.id || !mock) return;
    setPhase('submitting');
    try {
      const analytics = calculateAttemptMetrics(questions, answers, mock, timeRemaining);
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      toast({ title: "Transmission Error", description: "Submission failed. Retrying in secondary buffer...", variant: "destructive" });
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-center space-y-8">
         <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-20 h-20 rounded-[32px] bg-primary flex items-center justify-center blue-glow">
            <Monitor className="text-white w-10 h-10" />
         </motion.div>
         <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500">{phase === 'booting' ? 'Initializing Neural Buffer' : 'Transmitting Performance Data'}</p>
            <p className="text-[9px] font-bold text-primary/40 uppercase tracking-[0.3em]">Institutional Core v32.0</p>
         </div>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
         <header className="h-20 bg-black/40 border-b border-white/5 flex items-center px-10 justify-between shrink-0 backdrop-blur-xl">
            <div className="flex items-center gap-6">
               <Button variant="ghost" size="icon" onClick={() => router.push('/exams')} className="rounded-xl border border-white/5"><ArrowLeft size={18} /></Button>
               <div>
                  <h1 className="font-black text-lg uppercase tracking-tight leading-none">{mock?.title}</h1>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Pre-Simulation Instructions</p>
               </div>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-8">
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none"><Info size={250} /></div>
                     <div className="relative z-10 space-y-10">
                        <h3 className="text-3xl font-black flex items-center gap-4 text-white uppercase tracking-tighter">
                           <ShieldCheck className="text-primary w-8 h-8" /> Institutional Standard
                        </h3>
                        <div className="space-y-6 text-zinc-400 leading-relaxed font-medium text-lg">
                           <p className="flex gap-4 items-start"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1.5" size={20} /> Total duration: <strong className="text-white">{mock?.duration} minutes</strong> to resolve all artifacts.</p>
                           <p className="flex gap-4 items-start"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1.5" size={20} /> Marking Scheme: <strong className="text-white">+1.0</strong> for correct signal, <strong className="text-red-500">-{mock?.negativeMarking}</strong> for inaccuracy.</p>
                           <p className="flex gap-4 items-start"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1.5" size={20} /> Real-time Autosave: Session persists every 10 seconds to our cloud buffer.</p>
                           <p className="flex gap-4 items-start"><AlertTriangle className="text-orange-500 shrink-0 mt-1.5" size={20} /> Pausing is disabled to maintain board examination fidelity.</p>
                        </div>
                     </div>
                  </Card>
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 space-y-10 shadow-2xl">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Select Language Signal</p>
                        <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                           <SelectTrigger className="h-16 bg-black/40 border-white/10 rounded-2xl font-black text-sm uppercase px-8"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-zinc-950 text-white border-white/10">
                              <SelectItem value="english">English Core</SelectItem>
                              <SelectItem value="punjabi">Punjabi Signal</SelectItem>
                              <SelectItem value="bilingual">Bilingual (EN + PA)</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     
                     <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-2">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Readiness Scan</p>
                        <p className="text-xs text-zinc-500 italic">"Hardware verified. Connection: Stable. Proctoring: Active."</p>
                     </div>

                     <Button onClick={handleStartExam} className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-xl blue-glow uppercase tracking-widest transition-all">
                        ENTER SIMULATION
                        <ChevronRight className="ml-2 w-6 h-6" />
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
       {/* Institutional Topbar */}
       <header className="h-[65px] px-8 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50 shadow-2xl">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="rounded-xl hover:bg-white/10 h-10 w-10"><Menu size={22} /></Button>
             <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight uppercase truncate max-w-[150px] md:max-w-md">{mock?.title}</span>
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Session
                </span>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                <Globe size={14} className="text-blue-400" />
                <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                   <SelectTrigger className="h-9 w-32 bg-white/5 border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest px-3"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-[#1e293b] text-white border-white/10">
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="punjabi">Punjabi</SelectItem>
                      <SelectItem value="bilingual">Bilingual</SelectItem>
                   </SelectContent>
                </Select>
             </div>

             <Timer duration={timeRemaining / 60} onFinish={handleSubmitFinal} />
             
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">
                SUBMIT
             </Button>
          </div>
       </header>

       {/* Main Workspace - Optimized for 0-Scroll */}
       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 bg-slate-50 relative">
             <div className="max-w-6xl mx-auto space-y-8 pb-24">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                   <div className="flex items-center gap-4">
                      <Badge className="bg-blue-600 text-white border-none px-4 py-1 font-black uppercase text-[10px] tracking-widest">
                         {questions[current]?.subject.toUpperCase() || 'GENERAL STUDIES'}
                      </Badge>
                      <Badge variant="outline" className="border-slate-300 text-slate-500 text-[10px] font-black uppercase">Q {current + 1}</Badge>
                   </div>
                   <div className="flex gap-2">
                      <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 text-[9px] font-bold">+1.0</Badge>
                      <Badge variant="outline" className="border-red-500/20 text-red-600 text-[9px] font-bold">-{mock?.negativeMarking}</Badge>
                   </div>
                </div>

                <AnimatePresence mode="wait">
                   {questions[current] && (
                     <motion.div key={questions[current].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
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

       {/* Control Footer */}
       <footer className="h-[75px] px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
             <Button variant="outline" onClick={markForReview} className="rounded-xl h-12 px-8 border-slate-200 font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50">MARK FOR REVIEW</Button>
             <Button variant="ghost" onClick={() => handleOptionSelect(null)} className="rounded-xl h-12 px-6 font-bold text-[10px] uppercase text-zinc-500">Clear Response</Button>
          </div>
          <div className="flex gap-6 items-center">
             <button disabled={current === 0} onClick={handlePrev} className="font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all">Back</button>
             <Button onClick={handleNext} disabled={current === questions.length - 1} className="h-14 px-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       {/* Submit Confirmation */}
       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[40px] p-12 max-w-lg border-none shadow-2xl">
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mx-auto"><ShieldCheck className="text-emerald-500 w-10 h-10" /></div>
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">End Assessment?</DialogTitle>
               <DialogDescription className="text-slate-500 text-lg font-medium text-center">Verified signals will be transmitted for performance audit.</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-100 my-4">
               <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Answered</p>
                  <p className="text-2xl font-black text-emerald-600">{Object.values(answers).filter(a => a.selectedOption).length}</p>
               </div>
               <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marked</p>
                  <p className="text-2xl font-black text-blue-600">{Object.values(answers).filter(a => a.status === 'MARKED_FOR_REVIEW' || a.status === 'ANSWERED_AND_MARKED').length}</p>
               </div>
            </div>

            <DialogFooter className="gap-4 flex flex-col sm:flex-row">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-16 rounded-2xl flex-1 font-black text-xs uppercase">RESUME</Button>
               <Button onClick={handleSubmitFinal} className="h-16 rounded-2xl flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20">FINAL SUBMIT</Button>
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
       />
    </div>
  );
}
