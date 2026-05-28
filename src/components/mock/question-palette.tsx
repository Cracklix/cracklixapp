
'use client';

import { cn } from "@/lib/utils";

interface QuestionPaletteProps {
  questions: any[];
  current: number;
  answers: Record<number, string>;
  markedForReview: Set<number>;
  visited: Set<number>;
  setCurrent: (index: number) => void;
}

export default function QuestionPalette({
  questions,
  current,
  answers,
  markedForReview,
  visited,
  setCurrent,
}: QuestionPaletteProps) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
      {questions.map((_, index) => {
        const isCurrent = current === index;
        const isAnswered = answers[index] !== undefined && answers[index] !== "";
        const isMarked = markedForReview.has(index);
        const hasVisited = visited.has(index);

        let statusColor = "bg-zinc-900 text-zinc-600 border-white/5 hover:border-white/20";
        
        if (isMarked) {
          statusColor = "bg-purple-600 text-white border-none shadow-inner ring-1 ring-purple-400/50";
        } else if (isAnswered) {
          statusColor = "bg-emerald-600 text-white border-none shadow-inner ring-1 ring-emerald-400/50";
        } else if (hasVisited) {
          statusColor = "bg-destructive text-white border-none shadow-inner ring-1 ring-destructive/50";
        } else {
          statusColor = "bg-zinc-800 text-zinc-500 border-white/5";
        }

        return (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-10 w-full md:h-12 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all duration-150 border flex items-center justify-center relative",
              statusColor,
              isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-black scale-105 z-10 shadow-xl"
            )}
          >
            {index + 1}
            {isCurrent && (
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
            )}
          </button>
        );
      })}
    </div>
  );
}
