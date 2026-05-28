'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer } from "@/types";

interface QuestionPaletteProps {
  questions: any[];
  current: number;
  answers: Record<number, AttemptAnswer>;
  setCurrent: (index: number) => void;
}

export default function QuestionPalette({
  questions,
  current,
  answers,
  setCurrent,
}: QuestionPaletteProps) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {questions.map((_, index) => {
        const isCurrent = current === index;
        const answerState = answers[index];
        const status = answerState?.status || 'NOT_VISITED';

        let statusStyles = "bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-400";
        
        if (status === 'ANSWERED') {
          statusStyles = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
        } else if (status === 'MARKED_FOR_REVIEW' || status === 'ANSWERED_AND_MARKED') {
          statusStyles = "bg-purple-600 text-white border-purple-700 shadow-sm";
        } else if (status === 'NOT_ANSWERED') {
          statusStyles = "bg-red-500 text-white border-red-600 shadow-sm";
        }

        return (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-10 w-full rounded-xl font-black text-xs transition-all duration-150 border flex items-center justify-center relative",
              statusStyles,
              isCurrent && "ring-2 ring-primary ring-offset-2 scale-105 z-10"
            )}
          >
            {index + 1}
            {status === 'ANSWERED_AND_MARKED' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
}
