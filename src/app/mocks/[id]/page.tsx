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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, ExamAttempt, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * INSTITUTIONAL CBT ENGINE v30.5 (Production Rebuild)
 */
export default function CBTEngineV30({ params }: { params: Promise<{ id: string }> }) {
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
    } catch (e) {
      setPhase('gateway');
    }
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

  const handleSubmitFinal = async () => {
    if (!user || !attempt?.id || !mock) return;
    setPhase('submitting');
    try {
      const analytics = calculateAttemptMetrics(questions, answers, mock, timeRemaining);
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      toast({ title: "Transmission Error", variant: "destructive" });
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-[#F1F5F9] flex flex-col items-center justify-center text-center space-y-6">
         <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Establishing Secure Buffer...</p>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
         <header className="h-[70px] bg-white border-b border-slate-200 flex items-center px-10 justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-6">
               <Button variant="ghost" size="icon" onClick={() => router.push('/exams')} className="rounded-full"><ArrowLeft size={20} /></Button>
               <h1 className="font-bold text-xl uppercase tracking-tight">{mock?.title}</h1>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto p-10">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-10">
                     <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 uppercase">
                        <CheckCircle2 className="text-emerald-500 w-7 h-7" /> Institutional Instructions
                     </h3>
                     <div className="space-y-5 text-slate-600 leading-relaxed font-medium">
                        <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> Total duration: <strong>{mock?.duration} minutes</strong>.</p>
                        <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> Each correct answer gains <strong>1 mark</strong>.</p>
                        <p className="flex gap-4"><AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} /> Penalty of <strong>{mock?.negativeMarking} marks</strong> for incorrect responses.</p>
                        <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> The exam uses real-time auto-save technology.</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <Card className="rounded-[40px] bg-white border border-slate-200 p-10 space-y-8 shadow-sm">
                     <div className="text-center space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initialization Mode</p>
                        <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                           <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-2xl font-black text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-white text-slate-900 border-slate-200">
                              <SelectItem value="bilingual">Bilingual (EN + PA)</SelectItem>
                              <SelectItem value="english">English Only</SelectItem>
                              <SelectItem value="punjabi">Punjabi Only</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <Button onClick={handleStartExam} className="w-full h-16 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/20 uppercase tracking-widest transition-all">
                        START MOCK TEST
                     </Button>
                  </Card>
               </div>
            </div>
         </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F1F5F9] flex flex-col overflow-hidden">
       <header className="h-[65px] px-8 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50 shadow-2xl">
          <div className="flex flex-col">
             <span className="font-black text-sm tracking-tight uppercase truncate max-w-[200px] md:max-w-md">{mock?.title}</span>
             <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Arena Active
             </span>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2 hidden md:flex">
                <Globe size={14} className="text-blue-400" />
                <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                   <SelectTrigger className="h-9 w-32 bg-white/5 border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest px-3"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-[#1e293b] text-white border-white/10">
                      <SelectItem value="bilingual">Bilingual</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="punjabi">Punjabi</SelectItem>
                   </SelectContent>
                </Select>
             </div>

             <Timer duration={timeRemaining / 60} onFinish={handleSubmitFinal} />
             
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">
                SUBMIT
             </Button>
             
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="rounded-xl hover:bg-white/5"><Menu size={22} /></Button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-12 bg-white relative">
             <div className="max-w-5xl mx-auto space-y-12 pb-24">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                   <div className="flex items-center gap-4">
                      <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-4 py-1 font-black uppercase text-[10px] tracking-widest">
                         {questions[current]?.subject || 'GENERAL STUDIES'}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold">Q {current + 1}</Badge>
                   </div>
                </div>

                <AnimatePresence mode="wait">
                   {questions[current] && (
                     <motion.div key={questions[current].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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

       <footer className="h-[75px] px-6 md:px-10 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl h-11 px-4 md:px-8 border-slate-200 font-black text-[11px] uppercase tracking-widest text-slate-600">Review</Button>
          </div>
          <div className="flex gap-4 md:gap-6 items-center">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-0">Back</button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-14 px-8 md:px-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 transition-all">
                SAVE & NEXT
             </Button>
          </div>
       </footer>

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[40px] p-12 max-w-lg border-none shadow-2xl">
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mx-auto shadow-inner"><ShieldCheck className="text-emerald-500 w-10 h-10" /></div>
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">End Assessment?</DialogTitle>
               <DialogDescription className="text-slate-500 text-lg font-medium text-center">Verified signals will be transmitted for performance audit.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-4 flex flex-col sm:flex-row mt-6">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-16 rounded-2xl flex-1 font-black">RESUME</Button>
               <Button onClick={handleSubmitFinal} className="h-16 rounded-2xl flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black">FINAL SUBMIT</Button>
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
