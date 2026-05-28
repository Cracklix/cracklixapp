'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, LayoutGrid, List, CheckCircle, Info, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PaletteDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  current: number;
  answers: Record<string, AttemptAnswer>;
  setCurrent: (index: number) => void;
  mockTitle: string;
}

export default function PaletteDrawer({
  open,
  onClose,
  questions,
  current,
  answers,
  setCurrent,
  mockTitle
}: PaletteDrawerProps) {
  const answeredCount = Object.values(answers).filter(a => a.selectedOption).length;
  const reviewCount = Object.values(answers).filter(a => a.status === 'MARKED_FOR_REVIEW' || a.status === 'ANSWERED_AND_MARKED').length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full md:w-[380px] bg-white text-slate-900 z-[100] shadow-2xl flex flex-col"
    >
      <header className="h-[65px] px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#1e293b] text-white">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
               <LayoutGrid size={18} />
            </div>
            <div>
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] leading-none">CBT Palette</h3>
               <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest mt-1 truncate max-w-[180px]">{mockTitle}</p>
            </div>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-10 w-10 text-white/60 hover:text-white hover:bg-white/10">
            <X size={20} />
         </Button>
      </header>

      <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-6">
         {/* Key Metrics */}
         <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
               <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Answered</p>
               <h4 className="text-3xl font-black text-emerald-700">{answeredCount}</h4>
            </div>
            <div className="p-4 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col items-center">
               <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Review</p>
               <h4 className="text-3xl font-black text-blue-700">{reviewCount}</h4>
            </div>
         </div>

         {/* Status Legend */}
         <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-emerald-500" />
               <span className="text-[8px] font-black uppercase text-slate-500">Answered</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-600" />
               <span className="text-[8px] font-black uppercase text-slate-500">Review</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-slate-200" />
               <span className="text-[8px] font-black uppercase text-slate-500">Unvisited</span>
            </div>
         </div>
      </div>

      <ScrollArea className="flex-1 p-6">
         <div className="grid grid-cols-5 gap-3">
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const isCurrent = current === i;
              const status = ans?.status || 'NOT_VISITED';

              let styles = "bg-white text-slate-400 border-slate-200 hover:border-blue-300";
              if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/10";
              if (status === 'MARKED_FOR_REVIEW') styles = "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/10";
              if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-purple-700";

              return (
                <button
                  key={q.id}
                  onClick={() => { setCurrent(i); onClose(); }}
                  className={cn(
                    "h-12 w-full rounded-2xl font-black text-xs transition-all border flex items-center justify-center relative",
                    styles,
                    isCurrent && "ring-4 ring-blue-600/20 border-blue-600 z-10"
                  )}
                >
                  {i + 1}
                  {status === 'ANSWERED_AND_MARKED' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    </div>
                  )}
                </button>
              );
            })}
         </div>
      </ScrollArea>

      <footer className="p-6 bg-slate-50 border-t border-slate-200 mt-auto">
         <Button onClick={onClose} className="w-full h-16 rounded-[24px] bg-[#1e293b] hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
            RESUME SIMULATION
         </Button>
      </footer>
    </motion.div>
  );
}
