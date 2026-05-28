
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
  Pause,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Info,
  Globe,
  Play,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, LanguageMode, ExamAttempt } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CBTEngineV25() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  // States
  const [phase, setPhase] = useState<'booting' | 'gateway' | 'exam' | 'paused' | 'submitting'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageMode>('bilingual');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'exam') {
        toast({
          title: "System Warning",
          description: "Anti-cheat alert: Tab switching is strictly monitored. Incident logged.",
          variant: "destructive"
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase, toast]);

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation not found");

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
      toast({ title: "Sync Error", description: e.message, variant: "destructive" });
      router.push('/dashboard');
    }
  }, [mockId, user, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

  // Real-time Autosave Sync (Every 5 seconds)
  useEffect(() => {
    if (phase !== 'exam' || !attempt?.id) return;

    const interval = setInterval(() => {
      saveAnswer(attempt.id, 'session_meta', {
        remainingTime: timeRemaining,
        currentQuestionIndex: current,
        lastSynced: Date.now()
      } as any);
    }, 5000);

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
          ...mock, 
          userId: user.uid, 
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
      toast({ title: "Submission Error", variant: "destructive" });
      setPhase('exam');
    }
  };

  if (phase === 'booting' || phase === 'submitting') {
    return (
      <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center space-y-6">
         <Loader2 className="w-12 h-12 animate-spin text-primary" />
         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Synchronizing Session Buffers...</p>
      </div>
    );
  }

  if (phase === 'gateway') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
         <header className="h-[70px] bg-white border-b border-slate-200 flex items-center px-10 justify-between shrink-0">
            <div className="flex items-center gap-6">
               <Button variant="ghost" size="icon" onClick={() => router.push('/exams')} className="rounded-full hover:bg-slate-100"><ArrowLeft size={20} /></Button>
               <div>
                  <h1 className="font-bold text-xl leading-none">{mock?.title}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Mock Strategy Panel</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest">{mock?.accessType}</Badge>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto p-10">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-10">
                     <div className="space-y-6">
                        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                           <Info className="text-blue-600 w-7 h-7" /> Instructions & Protocol
                        </h3>
                        <div className="space-y-5 text-slate-600 leading-relaxed font-medium">
                           <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> Total duration: <strong>{mock?.duration} minutes</strong>.</p>
                           <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> Each correct answer gains <strong>1 mark</strong>.</p>
                           <p className="flex gap-4"><AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} /> Penalty of <strong>{mock?.negativeMarking} marks</strong> for incorrect responses.</p>
                           <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> The exam uses real-time auto-save technology.</p>
                           <p className="flex gap-4"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} /> Anti-cheat layer is active. Tab switching will log warnings.</p>
                        </div>
                     </div>

                     <div className="pt-10 border-t border-slate-100">
                        <h4 className="font-black uppercase text-[10px] text-slate-400 tracking-widest mb-6">Simulation Subjects</h4>
                        <div className="flex flex-wrap gap-3">
                           {['Punjab GK', 'Reasoning', 'Maths', 'Computer', 'English', 'Punjabi Grammar'].map(s => (
                             <Badge key={s} variant="outline" className="px-4 py-2 rounded-xl text-xs font-bold border-slate-200 text-slate-600 bg-slate-50">{s}</Badge>
                           ))}
                        </div>
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
                              <SelectItem value="bilingual">English + Punjabi</SelectItem>
                              <SelectItem value="en">English Only</SelectItem>
                              <SelectItem value="pa">Punjabi Only</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                           <p className="text-[9px] font-black text-slate-400 uppercase">Artifacts</p>
                           <p className="text-xl font-black">{mock?.totalQuestions}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                           <p className="text-[9px] font-black text-slate-400 uppercase">Penalty</p>
                           <p className="text-xl font-black text-red-500">-{mock?.negativeMarking}</p>
                        </div>
                     </div>

                     <Button onClick={handleStartExam} className="w-full h-16 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
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
       {/* TESTBOOK STYLE HEADER */}
       <header className="h-[65px] px-8 bg-[#1e293b] text-white flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight truncate max-w-[300px] uppercase">{mock?.title}</span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Arena Sync Active
                </span>
             </div>
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
               paused={phase === 'paused'}
             />
             
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-900/20">
                SUBMIT TEST
             </Button>
             
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="rounded-xl hover:bg-white/5"><Menu size={22} /></Button>
          </div>
       </header>

       {/* SUBJECT SECTIONS TAB */}
       <div className="h-12 bg-white border-b border-slate-200 flex items-center px-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-10">
             <button className="h-full border-b-4 border-blue-600 flex items-center px-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">Part A: Punjabi Qualifying</span>
             </button>
             <button className="h-full border-b-4 border-transparent flex items-center px-2 hover:border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Part B: Core Proficiency</span>
             </button>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          {/* MAIN ARENA */}
          <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-12 bg-white relative">
             <div className="max-w-5xl mx-auto space-y-12">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                   <div className="flex items-center gap-4">
                      <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-4 py-1 font-black uppercase text-[10px] tracking-widest">
                         {questions[current]?.subject || 'GENERAL KNOWLEDGE'}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold">QUESTION {current + 1}</Badge>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-400">
                         <Target size={14} />
                         <span className="text-[10px] font-bold uppercase">{questions[current]?.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500 font-black">
                         <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px]">+1.0</Badge>
                         <Badge variant="outline" className="border-red-100 text-red-500 text-[10px]">-{mock?.negativeMarking}</Badge>
                      </div>
                   </div>
                </div>

                <AnimatePresence mode="wait">
                   {questions[current] && (
                     <motion.div key={questions[current].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[questions[current].id]?.selectedOption as any || null} 
                          onSelect={handleOptionSelect}
                          activeLanguage={activeLang}
                          index={current}
                        />
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>

          {/* DESKTOP PALETTE */}
          <aside className="w-[340px] bg-slate-50 border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="p-8 border-b border-white bg-white">
                <div className="flex items-center gap-4 mb-6">
                   <Avatar className="h-12 w-12 border-2 border-white shadow-xl">
                      <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200`} />
                      <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                      <p className="text-sm font-black text-slate-800 uppercase leading-none">{profile?.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aspirant ID: {user?.uid.substring(0, 8)}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Answered</p>
                      <p className="text-xl font-black text-emerald-700">{Object.values(answers).filter(a => a.status === 'ANSWERED').length}</p>
                   </div>
                   <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Remaining</p>
                      <p className="text-xl font-black text-blue-700">{questions.length - Object.keys(answers).length}</p>
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="space-y-8">
                   <div className="grid grid-cols-5 gap-3">
                      {questions.map((q, i) => {
                        const ans = answers[q.id];
                        const isCurrent = current === i;
                        return (
                        <button
                          key={q.id}
                          onClick={() => setCurrent(i)}
                          className={cn(
                            "h-11 w-full rounded-xl font-black text-xs transition-all border flex items-center justify-center relative",
                            ans ? "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-white text-slate-400 border-slate-200",
                            isCurrent && "ring-4 ring-blue-600/10 border-blue-600 text-blue-600 scale-110 z-10"
                          )}
                        >
                           {i + 1}
                        </button>
                      )})}
                   </div>
                </div>
             </div>
             
             <div className="p-8 border-t border-slate-200 bg-white">
                <Button onClick={() => setSubmitConfirmOpen(true)} className="w-full h-14 rounded-2xl bg-[#1e293b] hover:bg-black text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl">
                   FINISH SIMULATION
                </Button>
             </div>
          </aside>
       </div>

       {/* FOOTER ACTIONS */}
       <footer className="h-[75px] px-10 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl h-11 px-8 border-slate-200 font-black text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">Mark for Review</Button>
             <Button variant="ghost" className="rounded-xl h-11 px-8 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-slate-600" onClick={() => {
                const nextAnswers = { ...answers };
                delete nextAnswers[questions[current].id];
                setAnswers(nextAnswers);
             }}>Clear Response</Button>
          </div>
          <div className="flex gap-6 items-center">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all">Previous</button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-14 px-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                SAVE & NEXT <ChevronRight className="ml-2 w-4 h-4" />
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
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><ShieldCheck size={200} /></div>
            <DialogHeader className="text-center space-y-6">
               <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mx-auto shadow-inner"><ShieldCheck className="text-emerald-500 w-10 h-10" /></div>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">End Simulation?</DialogTitle>
               <DialogDescription className="text-slate-500 text-lg font-medium">You have Answered <strong>{Object.keys(answers).length}</strong> out of <strong>{questions.length}</strong> artifacts.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 my-10">
               <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Answered</p>
                  <p className="text-2xl font-black text-emerald-600">{Object.keys(answers).length}</p>
               </div>
               <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Remaining</p>
                  <p className="text-2xl font-black text-blue-600">{questions.length - Object.keys(answers).length}</p>
               </div>
            </div>
            <DialogFooter className="gap-4 flex flex-col sm:flex-row">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-16 rounded-2xl flex-1 font-black border-slate-200 text-slate-600 text-[11px] uppercase tracking-widest">RESUME TEST</Button>
               <Button onClick={handleSubmitFinal} className="h-16 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-900/20">FINAL SUBMIT</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
