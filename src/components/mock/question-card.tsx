
'use client';

import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: any;
  selected: string | null;
  onSelect: (option: string) => void;
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="bg-zinc-900 p-6 rounded-[32px] text-white border border-white/5 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
          {question.subject}
        </span>
        <span className="text-xs text-muted-foreground">
          {question.marks} Marks
        </span>
      </div>

      <h2 className="text-xl font-bold mb-8 leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-4">
        {question.options.map((option: string, idx: number) => {
          const isSelected = selected === option;
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          
          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={cn(
                "w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group",
                isSelected
                  ? "bg-primary/20 border-primary text-white"
                  : "bg-zinc-800/50 border-white/5 text-zinc-300 hover:border-white/20 hover:bg-zinc-800"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                isSelected ? "bg-primary text-white" : "bg-zinc-700 text-zinc-400 group-hover:bg-zinc-600"
              )}>
                {letter}
              </div>
              <span className="font-medium">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
