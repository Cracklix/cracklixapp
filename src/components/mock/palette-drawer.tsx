'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question, LanguageMode } from "@/types";
import { Button } from "@/components/ui/button";
import { X, LayoutGrid, ScrollText } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PaletteDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  current: number;
  answers: Record<string, AttemptAnswer>;
  setCurrent: (index: number) => void;
  mockTitle: string;
  activeLanguage?: LanguageMode;
}

export default function PaletteDrawer({
  open,
  onClose,
  questions,
  current,
  answers,
  setCurrent,
  mockTitle,
  activeLanguage = 'bilingual'
}: PaletteDrawerProps) {
  const answeredCount = Object.values(answers).filter(a => a.selectedOption).length;
  const reviewCount = Object.values(answers).filter(a => a.status === 'MARKED_FOR_REVIEW' || a.status === 'ANSWERED_AND_MARKED').length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full md:w-[340px] bg-white text-slate-900 z-[100] shadow-2xl flex flex-col border-l border-slate-100"
    >
      <header className="h-[65px] px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#1e293b] text-white">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
               <LayoutGrid size={16} />
            </div>
            <div>
               <h3 className="font-black text-[9px] uppercase tracking-[0.2em] leading-none">CBT Palette</h3>
               <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest mt-1 truncate max-w-[140px]">{mockTitle}</p>
            </div>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg h-9 w-9 text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
         </Button>
      </header>

      <div className="p-5 bg-slate-50 border-b border-slate-100 space-y-4">
         <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
               <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Answered</p>
               <h4 className="text-2xl font-black text-emerald-700">{answeredCount}</h4>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center">
               <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Review</p>
               <h4 className="text-2xl font-black text-blue-700">{reviewCount}</h4>
            </div>
         </div>

         <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {[
              { label: 'Ans', color: 'bg-emerald-500' },
              { label: 'Rev', color: 'bg-blue-600' },
              { label: 'Ski', color: 'bg-slate-200' }
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                 <div className={cn("w-2 h-2 rounded-full", l.color)} />
                 <span className="text-[7px] font-black uppercase text-slate-400">{l.label}</span>
              </div>
            ))}
         </div>
      </div>

      <ScrollArea className="flex-1 p-5">
         <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const isCurrent = current === i;
              const status = ans?.status || 'NOT_VISITED';

              let styles = "bg-white text-slate-400 border-slate-200 hover:border-blue-300";
              if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
              if (status === 'MARKED_FOR_REVIEW') styles = "bg-blue-600 text-white border-blue-700 shadow-sm";
              if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-purple-700";

              return (
                <button
                  key={q.id}
                  onClick={() => { setCurrent(i); onClose(); }}
                  className={cn(
                    "h-10 w-full rounded-xl font-black text-[10px] transition-all border flex items-center justify-center relative",
                    styles,
                    isCurrent && "ring-2 ring-blue-600/20 border-blue-600 z-10 scale-105"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
         </div>

         {/* Extended List View for Language Sync Check */}
         <div className="mt-8 space-y-2 border-t border-slate-100 pt-6">
            <h4 className="text-[8px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-4">
              <ScrollText size={10} /> Artifact Signal Log
            </h4>
            {questions.map((q, i) => (
              <div key={i} className={cn(
                "p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer",
                current === i ? "bg-blue-50 border-blue-100" : "bg-slate-50/50 border-transparent hover:border-slate-200"
              )} onClick={() => setCurrent(i)}>
                 <span className="text-[9px] font-black text-slate-300 w-4">#{i+1}</span>
                 <p className="text-[10px] font-bold text-slate-600 line-clamp-1 flex-1">
                    {activeLanguage === 'punjabi' ? (q.pa?.question || q.en.question) : q.en.question}
                 </p>
                 {answers[q.id]?.selectedOption && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
              </div>
            ))}
         </div>
      </ScrollArea>

      <footer className="p-5 bg-slate-50 border-t border-slate-200 mt-auto">
         <Button onClick={onClose} className="w-full h-12 rounded-xl bg-[#1e293b] hover:bg-black text-white font-black text-[9px] uppercase tracking-widest shadow-lg">
            RESUME SESSION
         </Button>
      </footer>
    </motion.div>
  );
}