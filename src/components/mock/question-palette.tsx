
'use client';

import { cn } from "@/lib/utils";

interface QuestionPaletteProps {
  questions: any[];
  current: number;
  answers: Record<number, string>;
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
        const isAnswered = answers[index] !== undefined;

        return (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-10 w-full rounded-xl font-bold text-sm transition-all duration-200 border",
              isCurrent
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                : isAnswered
                ? "bg-emerald-600/20 border-emerald-600/50 text-emerald-500"
                : "bg-zinc-800/50 border-white/5 text-zinc-500 hover:border-white/20"
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
