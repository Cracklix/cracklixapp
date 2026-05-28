'use client';

import { cn } from "@/lib/utils";
import { Bookmark, CheckCircle2, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Question, LanguageMode } from "@/types";

interface QuestionCardProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  activeLanguage: LanguageMode;
  index: number;
}

/**
 * PRODUCTION BILINGUAL RENDERER v32.0 (Optimized Core)
 * Features: High-fidelity vertical stack with 0-scroll desktop optimization.
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

  if (!question) return null;

  const isBookmarked = profile?.bookmarks?.some(b => b.id === question.id);

  const toggleBookmark = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        bookmarks: arrayUnion({
          id: question.id,
          text: question.en?.question || "Bilingual Artifact",
          subject: question.subject,
          savedAt: Date.now()
        })
      });
      toast({ title: "Signal Bookmarked", description: "Artifact saved to your revision desk." });
    } catch (e) {
      console.error(e);
    }
  };

  const showEnglish = activeLanguage === 'english' || activeLanguage === 'bilingual';
  const showPunjabi = activeLanguage === 'punjabi' || activeLanguage === 'bilingual';

  // Responsive Font Sizing based on content length
  const questionLength = (question.en?.question?.length || 0) + (question.pa?.question?.length || 0);
  const questionFontSize = questionLength > 400 ? 'text-xl' : questionLength > 200 ? 'text-2xl' : 'text-[26px]';

  return (
    <div className="space-y-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Question Narrative Stack */}
      <div className="space-y-4">
         {showEnglish && question.en?.question && (
            <div className={cn(questionFontSize, "font-bold text-slate-800 leading-snug tracking-tight")}>
               {question.en.question}
            </div>
         )}

         {showPunjabi && question.pa?.question && (
            <div className={cn(questionFontSize, "font-medium text-slate-500 leading-snug tracking-tight border-l-4 border-blue-500/10 pl-6 py-1 italic font-body")}>
               {question.pa.question}
            </div>
         )}
      </div>

      {/* Option Matrix - Optimized Height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
         {[0, 1, 2, 3].map((idx) => {
           const letter = String.fromCharCode(65 + idx);
           const isOptionSelected = selected === letter;
           
           const enOption = question.en?.options?.[idx];
           const paOption = question.pa?.options?.[idx];

           if (!enOption && !paOption) return null;

           return (
             <button
               key={idx}
               onClick={() => onSelect(letter)}
               className={cn(
                 "w-full text-left p-4 md:p-5 rounded-[24px] border transition-all duration-200 flex items-start gap-4 group relative overflow-hidden",
                 isOptionSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-xl ring-4 ring-blue-600/10" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-600/30"
               )}
             >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-all",
                  isOptionSelected ? "bg-white text-blue-600 border-white" : "bg-slate-100 text-slate-400 border-slate-100 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-1 flex-1 pt-1.5">
                   {showEnglish && enOption && <p className="font-bold text-sm md:text-base leading-tight">{enOption}</p>}
                   {showPunjabi && paOption && <p className="text-xs md:text-sm font-medium leading-tight font-body opacity-80">{paOption}</p>}
                </div>
                {isOptionSelected && (
                   <div className="absolute top-4 right-4 text-white opacity-40">
                      <CheckCircle2 size={20} />
                   </div>
                )}
             </button>
           );
         })}
      </div>

      {/* Utility Bar */}
      <div className="flex items-center justify-between pt-6 opacity-60">
         <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest" onClick={toggleBookmark}>
            <Bookmark size={16} className={cn(isBookmarked ? "fill-current text-blue-600" : "")} />
            {isBookmarked ? "Artifact Saved" : "Bookmark Artifact"}
         </button>
         <div className="flex items-center gap-4">
            <Zap className="text-yellow-500 fill-current" size={14} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">SIMULATION ENGINE v32.0</span>
         </div>
      </div>
    </div>
  );
}
