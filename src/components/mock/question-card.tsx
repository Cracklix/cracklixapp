'use client';

import { cn } from "@/lib/utils";
import { Bookmark, Target, ShieldCheck, HelpCircle, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  activeLanguage: 'english' | 'punjabi' | 'bilingual';
  index: number;
}

/**
 * PRODUCTION BILINGUAL RENDERER v30.0
 * Pure vertical stack layout for English and Punjabi (Raavi font).
 * Font: 30px (Desktop) / 22px (Mobile)
 */
export default function QuestionCard({
  question,
  selected,
  onSelect,
  activeLanguage = 'bilingual',
  index
}: QuestionCardProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const isBookmarked = profile?.bookmarks?.some(b => b.id === question.id);

  const toggleBookmark = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        bookmarks: arrayUnion({
          id: question.id,
          text: question.en.question,
          subject: question.subject,
          savedAt: Date.now()
        })
      });
      toast({ title: "Artifact Bookmarked" });
    } catch (e) {
      console.error(e);
    }
  };

  const isBilingual = activeLanguage === 'bilingual';

  return (
    <div className="space-y-12 select-none animate-in fade-in slide-in-from-right-4 duration-500">
      {/* QUESTION PAYLOAD */}
      <div className="space-y-8">
         {/* English Header */}
         {(activeLanguage === 'english' || isBilingual) && (
            <div className="text-[30px] font-bold text-slate-800 leading-[1.5] max-md:text-[22px]">
               {question.en.question}
            </div>
         )}

         {/* Punjabi Signal (Raavi Font Optimization) */}
         {(activeLanguage === 'punjabi' || isBilingual) && question.pa?.question && (
            <div className="text-[30px] font-medium text-slate-500 leading-[1.5] max-md:text-[22px] border-l-4 border-blue-500/10 pl-10 py-2 italic font-body">
               {question.pa.question}
            </div>
         )}
      </div>

      {/* OPTION MATRIX (STACKED BILINGUAL) */}
      <div className="grid grid-cols-1 gap-5 pt-12 border-t border-slate-100">
         {question.en.options.map((option, idx) => {
           const letter = String.fromCharCode(65 + idx);
           const isOptionSelected = selected === letter;
           const paOption = question.pa?.options?.[idx];

           return (
             <button
               key={idx}
               onClick={() => onSelect(letter)}
               className={cn(
                 "w-full text-left p-6 md:p-8 rounded-[32px] border transition-all duration-300 flex items-start gap-8 group relative overflow-hidden",
                 isOptionSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-2xl ring-8 ring-blue-600/10 scale-[1.02]" 
                   : "bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-white hover:border-blue-600/30"
               )}
             >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border transition-all shadow-sm",
                  isOptionSelected ? "bg-white text-blue-600 border-white" : "bg-white text-slate-400 border-slate-100 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-3 flex-1 pt-3.5">
                   <p className="font-bold text-lg md:text-xl leading-tight">{option}</p>
                   {(isBilingual || activeLanguage === 'punjabi') && paOption && (
                     <p className={cn(
                       "text-[20px] md:text-[24px] font-medium leading-tight font-body",
                       isOptionSelected ? "text-white/70" : "text-slate-400"
                     )}>{paOption}</p>
                   )}
                </div>
                {isOptionSelected && (
                   <div className="absolute top-8 right-8 text-white">
                      <CheckCircle2 size={28} className="drop-shadow-xl" />
                   </div>
                )}
             </button>
           );
         })}
      </div>

      <div className="flex items-center justify-between pt-12 opacity-60 group-hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-10">
            <Button variant="ghost" className="h-10 gap-2 text-slate-400 hover:text-blue-600 rounded-xl" onClick={toggleBookmark}>
               <Bookmark size={20} className={cn(isBookmarked ? "fill-current text-blue-600" : "")} />
               <span className="text-[10px] font-black uppercase tracking-widest">Bookmark Artifact</span>
            </Button>
            <Button variant="ghost" className="h-10 gap-2 text-slate-400 hover:text-red-500 rounded-xl">
               <AlertTriangle size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Report Error</span>
            </Button>
         </div>
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <Zap className="text-yellow-500 fill-current" size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Analysis Ready</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">CORE ENGINE v30.0</span>
         </div>
      </div>
    </div>
  );
}
