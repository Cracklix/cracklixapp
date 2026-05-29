'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PaletteDrawerProps {
  questions: Question[];
  current: number;
  answers: Record<string, AttemptAnswer>;
  setCurrent: (index: number) => void;
  activeLanguage: LanguageMode;
}

export default function PaletteDrawer({
  questions,
  current,
  answers,
  setCurrent,
  activeLanguage
}: PaletteDrawerProps) {
  const answeredCount = Object.values(answers).filter(a => a.selectedOption !== null).length;

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b border-slate-100 bg-slate-50/50">
         <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-[10px]">{answeredCount}</div>
               <span className="text-[9px] font-black text-slate-400 uppercase">Answered</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 font-black text-[10px]">{questions.length - answeredCount}</div>
               <span className="text-[9px] font-black text-slate-400 uppercase">Pending</span>
            </div>
         </div>
      </header>

      <ScrollArea className="flex-1 p-6">
         <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const isCurrent = current === i;
              const isAnswered = ans?.selectedOption !== null && ans?.selectedOption !== undefined;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-10 w-full rounded-lg font-black text-[11px] transition-all border flex items-center justify-center relative",
                    isAnswered ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-slate-300 border-slate-200",
                    isCurrent && "border-blue-600 border-2 shadow-lg scale-105 z-10"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
         </div>
      </ScrollArea>

      <footer className="p-6 bg-slate-50 border-t border-slate-200 text-center">
         <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.4em]">Engineered by Arsh Grewal</p>
      </footer>
    </div>
  );
}
