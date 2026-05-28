'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter, LayoutGrid, CheckCircle, HelpCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface PaletteDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  current: number;
  answers: Record<number, AttemptAnswer>;
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
      className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-white text-slate-900 z-[100] shadow-[-40px_0_100px_rgba(0,0,0,0.2)] flex flex-col"
    >
      <header className="h-20 px-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
               <LayoutGrid size={20} className="text-white" />
            </div>
            <div>
               <h3 className="font-black text-sm uppercase tracking-tighter">Item Registry</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Section: Common Core</p>
            </div>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-11 w-11 hover:bg-white hover:shadow-sm">
            <X size={24} />
         </Button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
         {/* KPI Summary */}
         <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Answered', count: attemptedCount, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'In Review', count: reviewCount, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Remaining', count: questions.length - Object.keys(answers).length, icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-50' },
              { label: 'Total Qs', count: questions.length, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/5' },
            ].map(s => (
              <div key={s.label} className={cn("p-5 rounded-[28px] border border-slate-100 space-y-3", s.bg)}>
                 <s.icon size={18} className={s.color} />
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{s.count}</p>
                 </div>
              </div>
            ))}
         </div>

         {/* Navigation Matrix */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Grid Navigation</span>
               <Badge className="bg-primary text-white text-[8px] px-3">PAGE 1</Badge>
            </div>
            <div className="grid grid-cols-5 gap-3">
               {questions.map((_, i) => {
                 const ans = answers[i];
                 const isCurrent = current === i;
                 const status = ans?.status || 'NOT_VISITED';

                 let styles = "bg-slate-50 text-slate-300 border-slate-100 hover:bg-slate-100";
                 if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600 shadow-xl shadow-emerald-900/10";
                 if (status === 'MARKED_FOR_REVIEW') styles = "bg-purple-600 text-white border-purple-700 shadow-xl shadow-purple-900/10";
                 if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-500 ring-offset-2";

                 return (
                   <button
                     key={i}
                     onClick={() => { setCurrent(i); onClose(); }}
                     className={cn(
                       "h-14 rounded-2xl font-black text-xs transition-all duration-300 border flex items-center justify-center relative",
                       styles,
                       isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
                     )}
                   >
                     {i + 1}
                   </button>
                 );
               })}
            </div>
         </div>
      </div>

      <footer className="p-8 bg-slate-50 border-t border-slate-100">
         <Button onClick={onClose} className="w-full h-16 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl">
            RESUME ASSESSMENT
         </Button>
      </footer>
    </motion.div>
  );
}
