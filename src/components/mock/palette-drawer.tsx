'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter, LayoutGrid } from "lucide-react";
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
      className="fixed top-0 right-0 h-full w-[380px] bg-white text-slate-900 z-[100] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col"
    >
      <header className="h-20 px-8 border-b border-slate-100 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <LayoutGrid size={18} className="text-primary" />
            <h3 className="font-black text-sm uppercase tracking-widest">Question Palette</h3>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 hover:bg-slate-50">
            <X size={20} />
         </Button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
         {/* Stats Summary */}
         <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Answered', count: attemptedCount, color: 'bg-emerald-500' },
              { label: 'Marked', count: reviewCount, color: 'bg-purple-600' },
              { label: 'Not Visited', count: questions.length - Object.keys(answers).length, color: 'bg-slate-200' },
              { label: 'Remaining', count: questions.length - current - 1, color: 'border border-slate-200' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                 <div className={cn("w-3 h-3 rounded-sm shadow-sm", s.color)} />
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{s.label}</p>
                    <p className="text-sm font-bold text-slate-800">{s.count}</p>
                 </div>
              </div>
            ))}
         </div>

         {/* Filter Section */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sections</span>
               <Filter size={12} className="text-slate-300" />
            </div>
            <div className="flex flex-wrap gap-2">
               <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase px-3 py-1">Common Core</Badge>
            </div>
         </div>

         {/* Grid Palette */}
         <div className="grid grid-cols-5 gap-3">
            {questions.map((_, i) => {
              const ans = answers[i];
              const isCurrent = current === i;
              const status = ans?.status || 'NOT_VISITED';

              let styles = "bg-slate-100 text-slate-400 border-slate-200";
              if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600";
              if (status === 'MARKED_FOR_REVIEW') styles = "bg-purple-600 text-white border-purple-700";
              if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-400 ring-offset-1";

              return (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); onClose(); }}
                  className={cn(
                    "h-12 rounded-xl font-black text-xs transition-all border flex items-center justify-center relative",
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

      <footer className="p-8 bg-slate-50 border-t border-slate-100">
         <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest">
            Back to Simulation
         </Button>
      </footer>
    </motion.div>
  );
}
