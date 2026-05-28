'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question, QuestionStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter, LayoutGrid, CheckCircle, HelpCircle, Eye, Info } from "lucide-react";
import { motion } from "framer-motion";

interface PaletteDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  current: number;
  answers: Record<string, AttemptAnswer>;
  setCurrent: (index: number) => void;
}

export default function PaletteDrawer({
  open,
  onClose,
  questions,
  current,
  answers,
  setCurrent,
}: PaletteDrawerProps) {
  const attemptedCount = Object.values(answers).filter(a => a.status === 'ANSWERED' || a.status === 'ANSWERED_AND_MARKED').length;
  const reviewCount = Object.values(answers).filter(a => a.status === 'MARKED_FOR_REVIEW' || a.status === 'ANSWERED_AND_MARKED').length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-white text-slate-900 z-[100] shadow-[-40px_0_120px_rgba(0,0,0,0.15)] flex flex-col"
    >
      <header className="h-20 px-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
         <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg blue-glow">
               <LayoutGrid size={22} className="text-white" />
            </div>
            <div>
               <h3 className="font-black text-sm uppercase tracking-tighter text-slate-900">Item Registry</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Real-time status monitor</p>
            </div>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-12 w-12 hover:bg-white hover:shadow-sm">
            <X size={26} />
         </Button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
         {/* KPI Summary Grid */}
         <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Answered', count: attemptedCount, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Marked', count: reviewCount, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Unseen', count: questions.length - Object.keys(answers).length, icon: HelpCircle, color: 'text-slate-300', bg: 'bg-slate-50' },
              { label: 'Total', count: questions.length, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/5' },
            ].map(s => (
              <div key={s.label} className={cn("p-5 rounded-[32px] border border-slate-100 flex flex-col justify-between h-32 transition-all hover:shadow-md", s.bg)}>
                 <s.icon size={20} className={s.color} />
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{s.count}</p>
                 </div>
              </div>
            ))}
         </div>

         {/* Legend / Key */}
         <div className="p-6 rounded-[32px] bg-slate-900 text-white space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Info size={80} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 relative z-10">Signal Legend</h4>
            <div className="grid grid-cols-2 gap-y-4 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-300">Answered</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-300">Marked</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-300">Unanswered</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-300">Current</span>
               </div>
            </div>
         </div>

         {/* Navigation Matrix */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <span className="text-[11px] font-black uppercase text-slate-900 tracking-[0.3em]">Grid Navigation</span>
               <Badge className="bg-primary/10 text-primary border-none text-[8px] px-3 font-black">SYNCED</Badge>
            </div>
            <div className="grid grid-cols-5 gap-3">
               {questions.map((q, i) => {
                 const ans = answers[q.id];
                 const isCurrent = current === i;
                 const status = ans?.status || 'NOT_VISITED';

                 let styles = "bg-white text-slate-400 border-slate-200 hover:border-slate-400";
                 if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600 shadow-xl shadow-emerald-900/10";
                 if (status === 'MARKED_FOR_REVIEW') styles = "bg-purple-600 text-white border-purple-700 shadow-xl";
                 if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-purple-700 ring-4 ring-emerald-500/20";

                 return (
                   <button
                     key={q.id}
                     onClick={() => { setCurrent(i); onClose(); }}
                     className={cn(
                       "h-14 rounded-2xl font-black text-xs transition-all duration-300 border flex items-center justify-center relative",
                       styles,
                       isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
                     )}
                   >
                     {i + 1}
                     {isCurrent && <div className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary" />}
                   </button>
                 );
               })}
            </div>
         </div>
      </div>

      <footer className="p-8 bg-white border-t border-slate-100 mt-auto">
         <Button onClick={onClose} className="w-full h-18 rounded-[28px] bg-slate-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95">
            RESUME ASSESSMENT
         </Button>
      </footer>
    </motion.div>
  );
}
