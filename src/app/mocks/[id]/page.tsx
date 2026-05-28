'use client';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getMockDetails, 
  getMockQuestions, 
  startAttempt, 
  saveAnswer, 
  finalizeAttempt
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
  LayoutGrid
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MockTest, Question, AttemptAnswer, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PRODUCTION CBT ENGINE v16.0
 * Mobile-first, Independent Bilingual Scrolling, Cloud Auto-Save.
 */
export default function TestbookCBTPlayer() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mockId = params?.id as string;
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<'booting' | 'engine'>('booting');
  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageMode>('en');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Save Reference
  const lastSyncRef = useRef<number>(Date.now());

  const bootSession = useCallback(async () => {
    if (!user || !mockId) return;
    try {
      const mockData = await getMockDetails(mockId);
      if (!mockData) throw new Error("Simulation not found");

      // 1. Entitlement Gate
      const entitlement = await checkMockEntitlement(user.uid, mockData);
      if (!entitlement.allowed) {
        toast({ title: "Access Restricted", description: entitlement.reason, variant: "destructive" });
        router.push('/pass');
        return;
      }

      // 2. Load Artifacts
      const qData = await getMockQuestions(mockId);
      if (qData.length === 0) {
        toast({ title: "Registry Empty", description: "This simulation has no artifacts linked." });
        router.push('/dashboard');
        return;
      }

      setMock(mockData);
      setQuestions(qData);
      
      // 3. Initialize Cloud Attempt
      const id = await startAttempt(user.uid, mockData);
      setAttemptId(id);
      setPhase('engine');
      
      // Pre-set user language preference
      if (profile?.languageMode) setActiveLang(profile.languageMode as any);
      
    } catch (e: any) {
      toast({ title: "Boot Error", description: e.message, variant: "destructive" });
      router.push('/dashboard');
    }
  }, [mockId, user, profile, router, toast]);

  useEffect(() => {
    bootSession();
  }, [bootSession]);

  const handleSelect = (option: string) => {
    if (!attemptId) return;
    const payload: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: option,
      status: 'ANSWERED',
      timeSpent: 0
    };
    setAnswers(prev => ({ ...prev, [current]: payload }));
    
    // Periodic Auto-Sync Logic (Every 15s)
    const now = Date.now();
    if (now - lastSyncRef.current > 15000) {
       saveAnswer(attemptId, current, payload);
       lastSyncRef.current = now;
    }
  };

  const markForReview = () => {
    if (!attemptId) return;
    const currentAns = answers[current];
    const payload: AttemptAnswer = {
      questionId: questions[current].id,
      selectedOption: currentAns?.selectedOption || null,
      status: currentAns?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW',
      timeSpent: 0
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
       <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
       <h2 className="text-xl font-black uppercase tracking-tighter text-white">Initializing High-Fidelity Signal</h2>
       <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2">Checking Access Tiers & Preloading Artifacts</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden font-body text-slate-900 select-none">
       {/* CBT Header */}
       <header className="h-[65px] px-4 md:px-8 bg-slate-900 text-white flex items-center justify-between shrink-0 z-50 shadow-xl">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="h-9 w-9 rounded-lg bg-white/5 border border-white/5">
                <LayoutGrid size={16} />
             </Button>
             <div className="flex flex-col border-l border-white/10 pl-4 hidden md:flex">
                <span className="font-black text-xs uppercase tracking-tight truncate max-w-[250px]">{mock?.title}</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">{mock?.exam}</span>
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
             <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                <Globe size={12} className="text-primary" />
                <select 
                  value={activeLang} 
                  onChange={(e) => setActiveLang(e.target.value as any)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                >
                   <option value="en" className="bg-slate-900">EN</option>
                   <option value="pa" className="bg-slate-900">ਪੰ</option>
                   <option value="hi" className="bg-slate-900">हिं</option>
                   <option value="bilingual" className="bg-slate-900">Bilingual</option>
                </select>
             </div>
             <Timer duration={mock?.duration || 60} onFinish={submitTest} />
             <Button onClick={() => setSubmitConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl">SUBMIT</Button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          {/* Main Question Terminal */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-white relative">
             <div className="max-w-6xl mx-auto h-full flex flex-col">
                <AnimatePresence mode="wait">
                   {questions[current] && (
                     <motion.div
                       key={questions[current].id}
                       initial={{ opacity: 0, y: 5 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -5 }}
                       className="flex-1"
                     >
                        <QuestionCard 
                          question={questions[current]} 
                          selected={answers[current]?.selectedOption || null} 
                          onSelect={handleSelect}
                          activeLanguage={activeLang}
                          sideBySide={activeLang === 'bilingual'}
                        />
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>

          {/* Desktop Palette Sidebar */}
          <aside className="w-[320px] bg-slate-50 border-l border-slate-200 hidden lg:flex flex-col shrink-0">
             <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                   <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} />
                   <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-900 leading-none">{profile?.name}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recruitment ID: {user?.uid.substring(0,8)}</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Answered</p>
                      <p className="text-xl font-black text-emerald-700">{Object.values(answers).filter(a => a.status === 'ANSWERED').length}</p>
                   </div>
                   <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Not Visited</p>
                      <p className="text-xl font-black text-slate-500">{questions.length - Object.keys(answers).length}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Item Navigator</span>
                   </div>
                   <div className="grid grid-cols-5 gap-2">
                      {questions.map((_, i) => {
                        const ans = answers[i];
                        const isCurrent = current === i;
                        const status = ans?.status || 'NOT_VISITED';

                        let bg = "bg-white text-slate-400 border-slate-200";
                        if (status === 'ANSWERED') bg = "bg-emerald-500 text-white border-emerald-600 shadow-md";
                        if (status === 'MARKED_FOR_REVIEW') bg = "bg-purple-600 text-white border-purple-700 shadow-md";

                        return (
                          <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={cn(
                              "h-9 w-full rounded-lg font-black text-[10px] transition-all border flex items-center justify-center",
                              bg,
                              isCurrent && "ring-2 ring-primary ring-offset-1 scale-105 z-10"
                            )}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>
             
             <div className="p-6 bg-white border-t border-slate-100 mt-auto flex items-center gap-3">
                <ShieldCheck size={14} className="text-emerald-500 animate-pulse" />
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Secure Preparation Buffer</p>
             </div>
          </aside>
       </div>

       {/* Bottom Control Dock */}
       <footer className="h-[75px] px-4 md:px-10 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-50">
          <div className="flex gap-2">
             <Button variant="outline" onClick={markForReview} className="h-11 px-4 md:px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">MARK FOR REVIEW</Button>
             <Button variant="ghost" onClick={() => setAnswers(prev => { const n = {...prev}; delete n[current]; return n; })} className="h-11 px-4 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hidden md:flex">CLEAR</Button>
          </div>
          <div className="flex gap-3 items-center">
             <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-2 px-4 h-11 rounded-xl text-slate-500 font-black text-[10px] uppercase hover:bg-slate-50 disabled:opacity-30">
                <ChevronLeft size={16} /> PREV
             </button>
             <Button onClick={() => { if(current < questions.length - 1) setCurrent(c => c + 1); }} className="h-12 px-10 md:px-20 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-xl">
                SAVE & NEXT <ChevronRight className="ml-1" size={16} />
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
         <DialogContent className="bg-white text-slate-900 max-w-md rounded-[40px] p-8">
            <DialogHeader className="text-center space-y-4">
               <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <ShieldCheck className="text-emerald-500 w-8 h-8" />
               </div>
               <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Submit Simulation?</DialogTitle>
               <DialogDescription className="text-slate-500 font-medium text-xs leading-relaxed">
                  Final submission will initiate a performance audit. Total Attempted: {Object.values(answers).length} / {questions.length}.
               </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-3 flex flex-col md:flex-row mt-6">
               <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} className="h-14 rounded-xl flex-1 font-black uppercase text-[10px]">RESUME</Button>
               <Button onClick={submitTest} disabled={isSubmitting} className="h-14 rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px]">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "FINAL SUBMIT"}
               </Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
