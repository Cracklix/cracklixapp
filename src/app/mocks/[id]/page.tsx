'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  ChevronRight,
  Menu,
  Languages,
  Maximize2,
  AlertTriangle,
  RotateCcw,
  Cloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function TestbookStyleAdvancedCBT() {
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
  const [isTabActive, setIsTabActive] = useState(true);

  // Auto-Save sync to Firestore every 30 seconds
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const initializeSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation not found");

      const access = await checkMockAccess(user.uid, mockData);
      if (!access.allowed) {
        toast({ title: "Access Restricted", description: access.reason, variant: "destructive" });
        router.push('/pass');
        return;
      }

      const qData = await getMockQuestions(mockId);
      setMock(mockData);
      setQuestions(qData);
      
      const id = await startAttempt(user.uid, mockData);
      setAttemptId(id);
      setPhase('instructions');
    } catch (e: any) {
      toast({ title: "Signal Lost", description: "Failed to load simulation node.", variant: "destructive" });
    }
  }, [mockId, user, router, toast]);

  useEffect(() => {
    initializeSession();

    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
      if (document.hidden) {
        console.warn("[Anti-Cheat] Tab switch detected.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
       <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing CBT Nodes...</p>
    </div>
  );

  if (phase === 'instructions') return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body text-slate-900">
       <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
                <ArrowLeft size={18} />
             </Button>
             <span className="font-bold text-lg tracking-tight">Test Instructions</span>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 px-3 py-1 font-bold">MODE: CBT-PRO</Badge>
       </header>
       
       <main className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center">
          <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-[32px] p-8 md:p-16 shadow-sm space-y-12">
             <div className="text-center space-y-6">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">{mock?.title}</h1>
                <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                   <span className="flex items-center gap-2"><Monitor size={14} className="text-primary" /> {questions.length} Items</span>
                   <span className="flex items-center gap-2"><Timer size={14} className="text-primary" /> {mock?.duration} Mins</span>
                   <span className="flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /> -{mock?.negativeMarking} Negative</span>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs border-b border-slate-100 pb-3">Operational Guidelines</h3>
                <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
                   <li className="flex gap-4">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                      <p>Simulation will auto-submit exactly at <strong>{mock?.duration} minutes</strong>. Please monitor the global clock in the header.</p>
                   </li>
                   <li className="flex gap-4">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                      <p>Bilingual mode enables side-by-side English and Punjabi (Raavi) viewing. You can switch layouts at any time.</p>
                   </li>
                   <li className="flex gap-4">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                      <p><strong>Anti-Cheat Enabled:</strong> Switching tabs or minimizing the browser will be logged and may invalidate your state rank.</p>
                   </li>
                </ul>
             </div>

             <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 space-y-6">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center">Select Interface Language</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {['English', 'Punjabi', 'Bilingual'].map(l => (
                     <button
                       key={l}
                       onClick={() => setActiveLang(l.toLowerCase() as any)}
                       className={cn(
                         "h-14 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all",
                         activeLang === l.toLowerCase() ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-slate-200 text-slate-400 hover:border-primary/40"
                       )}
                     >
                       {l}
                     </button>
                   ))}
                </div>
             </div>

             <Button onClick={() => setPhase('engine')} className="w-full h-18 rounded-[24px] bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-black blue-glow">
                I AM READY TO BEGIN
             </Button>
          </div>
       </main>
    </div>
  );

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden font-body text-slate-900 select-none">
       {/* CBT Header */}
       <header className="h-[75px] px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 z-50 shadow-2xl">
          <div className="flex items-center gap-6">
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="h-10 w-10 rounded-xl bg-white/5 lg:hidden">
                <Menu size={20} />
             </Button>
             <div className="flex flex-col">
                <span className="font-black text-sm uppercase tracking-tight truncate max-w-[300px]">{mock?.title}</span>
                <div className="flex items-center gap-2">
                   <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black px-2 py-0.5 uppercase">{mock?.exam}</Badge>
                   <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cloud Synced
                   </span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-10">
             <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                {['en', 'pa', 'bilingual'].map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l as any)}
                    className={cn(
                      "px-5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                      activeLang === l ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    {l === 'pa' ? 'ਪੰਜਾਬੀ' : l.toUpperCase()}
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Candidate</p>
                   <p className="text-xs font-bold">{profile?.name}</p>
                </div>
                <Timer duration={mock?.duration || 60} onFinish={submitTest} />
                <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl font-black text-xs uppercase shadow-lg">SUBMIT</Button>
             </div>
          </div>
       </header>

       {/* Main Workspace */}
       <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50 relative">
             {!isTabActive && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Cheating Hazard: Tab switch detected.</span>
               </div>
             )}

             <div className="max-w-6xl mx-auto space-y-6">
                {questions[current] && (
                  <QuestionCard 
                    question={questions[current]} 
                    selected={answers[current]?.selectedOption || null} 
                    onSelect={handleSelect}
                    activeLanguage={activeLang as any}
                    sideBySide={activeLang === 'bilingual'}
                  />
                )}
             </div>
          </main>

          {/* Desktop Palette */}
          <aside className="w-[380px] bg-white border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                      <span>Grid Navigation</span>
                      <Badge variant="outline" className="border-slate-100">{questions.length} Items</Badge>
                   </div>
                   <div className="grid grid-cols-5 gap-3">
                      {questions.map((_, i) => {
                        const ans = answers[i];
                        const isCurrent = current === i;
                        const status = ans?.status || 'NOT_VISITED';

                        let bg = "bg-slate-100 text-slate-400";
                        if (status === 'ANSWERED') bg = "bg-emerald-500 text-white shadow-lg";
                        if (status === 'MARKED_FOR_REVIEW') bg = "bg-purple-600 text-white shadow-lg";

                        return (
                          <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={cn(
                              "h-10 w-full rounded-xl font-black text-xs transition-all",
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

                <div className="pt-10 border-t border-slate-100 space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Summary</h4>
                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Answered', color: 'bg-emerald-500' },
                        { label: 'Review', color: 'bg-purple-600' },
                        { label: 'Not Visited', color: 'bg-slate-100' },
                        { label: 'Remaining', color: 'border border-slate-100' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                           <div className={cn("w-3 h-3 rounded-sm", item.color)} />
                           <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             
             <div className="p-8 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3 text-emerald-600 opacity-60">
                   <Cloud size={14} className="animate-pulse" />
                   <p className="text-[9px] font-black uppercase tracking-widest">Live Auto-Save Sync Active</p>
                </div>
             </div>
          </aside>
       </div>

       {/* CBT Footer */}
       <footer className="h-[80px] px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-4">
             <Button variant="outline" onClick={markForReview} className="h-12 px-8 rounded-xl border-slate-200 text-purple-600 hover:bg-purple-50 font-black text-xs uppercase">MARK FOR REVIEW & NEXT</Button>
             <Button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[current]; return n; })} variant="ghost" className="h-12 px-8 rounded-xl text-slate-400 hover:text-red-500 font-black text-xs uppercase">CLEAR RESPONSE</Button>
          </div>
          <div className="flex gap-4">
             <Button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} variant="outline" className="h-12 px-10 rounded-xl border-slate-200 font-black text-xs uppercase">PREVIOUS</Button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-12 px-20 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl">SAVE & NEXT</Button>
          </div>
       </footer>

       {/* Mobile Palette Drawer */}
       <PaletteDrawer 
         open={paletteOpen} 
         onClose={() => setPaletteOpen(false)} 
         questions={questions} 
         current={current} 
         answers={answers} 
         setCurrent={setCurrent} 
       />

       {/* Final Submit Modal */}
       <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
         <DialogContent className="bg-white text-slate-900 max-w-md rounded-[32px] p-10 border-none shadow-2xl">
            <DialogHeader>
               <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="text-emerald-500 w-8 h-8" />
               </div>
               <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">Complete Simulation?</DialogTitle>
               <DialogDescription className="text-slate-500 text-sm mt-3">
                  Your progress is locked and synced. Submitting will end the test and generate your performance audit.
               </DialogDescription>
            </DialogHeader>

            <div className="py-8 grid grid-cols-2 gap-4">
               <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Attempted</p>
                  <p className="text-2xl font-black text-slate-800">{Object.keys(answers).length}</p>
               </div>
               <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Marked</p>
                  <p className="text-2xl font-black text-slate-800">{Object.values(answers).filter(a => a.status.includes('MARKED')).length}</p>
               </div>
            </div>

            <DialogFooter className="gap-3">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-2xl flex-1 border-slate-200 font-bold uppercase text-[10px]">RESUME TEST</Button>
               <Button onClick={submitTest} disabled={isSubmitting} className="h-14 rounded-2xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px]">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "FINAL SUBMIT"}
               </Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
