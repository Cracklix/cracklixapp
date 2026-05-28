
'use client';

import { cn } from "@/lib/utils";
import { useI18n } from "@/app/lib/i18n-context";

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
  const { locale } = useI18n();
  
  // Support for bilingual questions
  const qText = locale === 'pa' ? (question.question_pa || question.question) : (question.question_en || question.question);
  const options = locale === 'pa' ? (question.options_pa || question.options) : (question.options_en || question.options);

  return (
    <div className="bg-zinc-900 p-8 rounded-[40px] text-white border border-white/5 shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {question.subject}
          </span>
          {question.pyq && (
            <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
              PYQ {question.year}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          {question.marks || 1} Marks
        </span>
      </div>

      <h2 className="text-2xl font-bold mb-10 leading-relaxed">
        {qText}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option: string, idx: number) => {
          const isSelected = selected === option;
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          
          return (
            <button
              key={idx}
              onClick={() => onSelect(option)}
              className={cn(
                "w-full text-left p-6 rounded-[28px] border transition-all duration-300 flex items-center gap-4 group",
                isSelected
                  ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10"
                  : "bg-zinc-800/40 border-white/5 text-zinc-400 hover:border-white/20 hover:bg-zinc-800"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors",
                isSelected ? "bg-primary text-white" : "bg-zinc-800 text-zinc-600 group-hover:bg-zinc-700"
              )}>
                {letter}
              </div>
              <span className="font-bold">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
