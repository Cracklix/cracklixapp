
'use client';

import { cn } from "@/lib/utils";

interface QuestionPaletteProps {
  questions: any[];
  current: number;
  answers: Record<number, string>;
  markedForReview: Set<number>;
  setCurrent: (index: number) => void;
}

export default function QuestionPalette({
  questions,
  current,
  answers,
  markedForReview,
  setCurrent,
}: QuestionPaletteProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {questions.map((_, index) => {
        const isCurrent = current === index;
        const isAnswered = answers[index] !== undefined && answers[index] !== "";
        const isMarked = markedForReview.has(index);

        let statusColor = "bg-zinc-800 text-zinc-600 border-white/5 hover:border-white/20";
        if (isCurrent) statusColor = "ring-2 ring-primary ring-offset-2 ring-offset-black";
        
        if (isMarked) {
          statusColor = "bg-purple-600 text-white border-none shadow-lg shadow-purple-900/20";
        } else if (isAnswered) {
          statusColor = "bg-emerald-600 text-white border-none shadow-lg shadow-emerald-900/20";
        } else if (answers[index] === "") {
          statusColor = "bg-red-600 text-white border-none shadow-lg shadow-red-900/20";
        }

        return (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-12 w-full rounded-xl font-black text-sm transition-all duration-200 border flex items-center justify-center",
              statusColor
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
