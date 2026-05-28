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
    <div className="grid grid-cols-5 gap-3">
      {questions.map((_, index) => {
        const isCurrent = current === index;
        const answerState = answers[index];
        const status = answerState?.status || 'NOT_VISITED';

        let statusColor = "bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-400";
        
        if (status === 'ANSWERED') {
          statusColor = "bg-emerald-500 text-white border-none shadow-md";
        } else if (status === 'MARKED_FOR_REVIEW' || status === 'ANSWERED_AND_MARKED') {
          statusColor = "bg-purple-600 text-white border-none shadow-md";
        } else if (status === 'NOT_ANSWERED') {
          statusColor = "bg-red-500 text-white border-none shadow-md";
        }

        return (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-10 w-full rounded-xl font-black text-xs transition-all duration-150 border flex items-center justify-center relative",
              statusColor,
              isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
            )}
          >
            {index + 1}
            {status === 'ANSWERED_AND_MARKED' && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
}
