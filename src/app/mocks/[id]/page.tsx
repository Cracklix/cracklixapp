
'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { generateAnalytics } from "@/services/analytics-engine";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  Menu,
  ChevronRight,
  ShieldCheck,
  Globe,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, ExamAttempt, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * INSTITUTIONAL CBT PLAYER v25.0
 * Features: High-frequency autosave, Stacked Bilingual, Sectional tabs.
 */
export default function CBTEngineV25() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  // States
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

  // Sync Logic
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

  // Real-time Autosave Heartbeat (Every 10 seconds)
  useEffect(() => {
    if (phase !== 'exam' || !attempt?.id) return;

    const interval = setInterval(() => {
      saveAnswer(attempt.id, 'meta_sync', {
        remainingTime: timeRemaining,
        currentQuestionIndex: current,
        lastSynced: Date.now()
      } as any);
    }, 10000);

    return () => clearInterval(interval);
  }, [phase, attempt?.id, timeRemaining, current]);

  const handleStartExam = async () => {
    if (!user || !mock) return;
    setPhase('booting');
    try {
      if (!attempt) {
        const id = await startAttempt(user.uid, mock);
        setAttempt({ 
          id, 
          userId: user.uid, 
          mockId: mock.id,
          mockTitle: mock.title,
          answers: {}, 
          currentQuestionIndex: 0, 
          status: 'ongoing', 
          startedAt: Date.now(), 
          remainingTime: mock.duration * 60 
        } as any);
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
      const analytics = generateAnalytics({ questions, answers, mock });
      await finalizeAttempt(user.uid, attempt.id, analytics);
      router.push(`/mocks/result/${attempt.id}`);
    } catch (e) {
      toast({ title: "Transmission Error", variant: "destructive" });
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center space-y-6">
         <Loader2 className="w-12 h-12 animate-spin text-primary" />
         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Establishing Secure Buffer...</p>
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
                     <h3 className="text-2xl font-black flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500 w-7 h-7" /> Examination Protocol
                     </h3>
                     <div className="space-y-6 text-slate-600 font-medium">
                        <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> Duration: <strong>{mock?.duration} Minutes</strong></p>
                        <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> Marking: <strong>+1.0 Correct</strong> / <strong>-{mock?.negativeMarking} Incorrect</strong></p>
                        <p className="flex gap-4"><AlertTriangle className="text-orange-500 shrink-0 mt-1" size={18} /> Tab switching will trigger a security signal.</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <Card className="rounded-[40px] bg-white border-slate-200 p-10 space-y-8 shadow-sm">
                     <div className="text-center space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Mode</p>
                        <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                           <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-2xl font-black text-xs uppercase px-6">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-white text-slate-900 border-slate-200">
                              <SelectItem value="bilingual">Bilingual (EN + PA)</SelectItem>
                              <SelectItem value="en">English Only</SelectItem>
                              <SelectItem value="pa">Punjabi Only</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <Button onClick={handleStartExam} className="w-full h-16 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/20 uppercase tracking-widest transition-all">
                        Begin Assessment
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
             <span className="font-black text-sm tracking-tight uppercase">{mock?.title}</span>
             <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Arena Active
             </span>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                <Globe size={14} className="text-blue-400" />
                <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                   <SelectTrigger className="h-9 w-32 bg-white/5 border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest px-3">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1e293b] text-white border-white/10">
                      <SelectItem value="bilingual">Bilingual</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pa">Punjabi</SelectItem>
                   </SelectContent>
                </Select>
             </div>

             <Timer 
               duration={timeRemaining / 60} 
               onFinish={handleSubmitFinal} 
             />
             
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">
                SUBMIT
             </Button>
             
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="rounded-xl hover:bg-white/5"><Menu size={22} /></Button>
          </div>
       </header>

       {/* SECTION TABS */}
       <div className="h-12 bg-white border-b border-slate-200 flex items-center px-10 shrink-0">
          <div className="flex items-center gap-10">
             <button className="h-full border-b-4 border-blue-600 flex items-center px-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">Part A: Core Proficiency</span>
             </button>
             <button className="h-full border-b-4 border-transparent flex items-center px-2 hover:border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Part B: Native Qualifiers</span>
             </button>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto no-scrollbar p-12 bg-white relative">
             <div className="max-w-5xl mx-auto space-y-12">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                   <div className="flex items-center gap-4">
                      <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-4 py-1 font-black uppercase text-[10px] tracking-widest">
                         {questions[current]?.subject || 'GENERAL STUDIES'}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold">ARTIFACT {current + 1}</Badge>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-400">
                         <Target size={14} />
                         <span className="text-[10px] font-bold uppercase">{questions[current]?.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500 font-black">
                         <Badge className="bg-emerald text-emerald-600 border-emerald-100 text-[10px]">+1.0</Badge>
                         <Badge variant="outline" className="border-red-100 text-red-500 text-[10px]">-{mock?.negativeMarking}</Badge>
                      </div>
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

          {/* PALETTE PANEL */}
          <aside className="w-[340px] bg-slate-50 border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="p-8 border-b border-white bg-white">
                <div className="flex items-center gap-4 mb-6">
                   <Avatar className="h-12 w-12 border-2 border-white shadow-xl">
                      <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200`} />
                      <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                      <p className="text-sm font-black text-slate-800 uppercase leading-none">{profile?.name || 'Aspirant'}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {user?.uid.substring(0, 8)}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Answered</p>
                      <p className="text-xl font-black text-emerald-700">{Object.keys(answers).length}</p>
                   </div>
                   <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Unvisited</p>
                      <p className="text-xl font-black text-blue-700">{questions.length - Object.keys(answers).length}</p>
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="grid grid-cols-5 gap-3">
                   {questions.map((q, i) => (
                      <button
                        key={q.id}
                        onClick={() => setCurrent(i)}
                        className={cn(
                          "h-11 w-full rounded-xl font-black text-xs transition-all border flex items-center justify-center",
                          answers[q.id] ? "bg-emerald-500 text-white border-emerald-600 shadow-lg" : "bg-white text-slate-400 border-slate-200",
                          current === i && "ring-4 ring-blue-600/10 border-blue-600 text-blue-600 scale-110 z-10"
                        )}
                      >
                        {i + 1}
                      </button>
                   ))}
                </div>
             </div>
             
             <div className="p-8 border-t border-slate-200 bg-white">
                <Button onClick={() => setSubmitConfirmOpen(true)} className="w-full h-14 rounded-2xl bg-[#1e293b] hover:bg-black text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl">
                   FINISH SIMULATION
                </Button>
             </div>
          </aside>
       </div>

       <footer className="h-[75px] px-10 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl h-11 px-8 border-slate-200 font-black text-[11px] uppercase tracking-widest text-slate-600">Mark for Review</Button>
          </div>
          <div className="flex gap-6 items-center">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-0">Previous</button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-14 px-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 transition-all">
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
         mockTitle={mock?.title || "Simulation"}
       />

       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white rounded-[40px] p-12 max-w-lg border-none shadow-2xl overflow-hidden">
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mx-auto shadow-inner"><ShieldCheck className="text-emerald-500 w-10 h-10" /></div>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">End Simulation?</DialogTitle>
               <DialogDescription className="text-slate-500 text-lg font-medium">Verified signals will be transmitted for performance audit.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-4 flex flex-col sm:flex-row mt-10">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-16 rounded-2xl flex-1 font-black">RESUME</Button>
               <Button onClick={handleSubmitFinal} className="h-16 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black">FINAL SUBMIT</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
