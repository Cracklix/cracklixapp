'use client';

import { cn } from "@/lib/utils";
import { Bookmark, CheckCircle2, Zap } from "lucide-react";
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
 * PRODUCTION BILINGUAL RENDERER v32.5 (0-Scroll Optimized)
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
      toast({ title: "Artifact Saved" });
    } catch (e) {
      console.error(e);
    }
  };

  const showEnglish = activeLanguage === 'english' || activeLanguage === 'bilingual';
  const showPunjabi = activeLanguage === 'punjabi' || activeLanguage === 'bilingual';

  // Enterprise Dynamic Font Scaling
  const charCount = (question.en?.question?.length || 0) + (question.pa?.question?.length || 0);
  const qFontSize = charCount > 500 ? 'text-lg' : charCount > 250 ? 'text-xl' : 'text-2xl';
  const optFontSize = charCount > 400 ? 'text-xs' : 'text-sm';

  return (
    <div className="space-y-4 select-none animate-in fade-in slide-in-from-bottom-1 duration-200">
      {/* Question Narrative - High Contrast */}
      <div className="space-y-3">
         {showEnglish && question.en?.question && (
            <div className={cn(qFontSize, "font-bold text-slate-800 leading-snug tracking-tight")}>
               {question.en.question}
            </div>
         )}

         {showPunjabi && question.pa?.question && (
            <div className={cn(qFontSize, "font-medium text-slate-500 leading-snug tracking-tight border-l-4 border-blue-500/10 pl-4 py-0.5 italic font-body")}>
               {question.pa.question}
            </div>
         )}
      </div>

      {/* Option Matrix - Compact 0-Scroll Logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
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
                 "w-full text-left p-3.5 md:p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3.5 group relative",
                 isOptionSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-600/10" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-600/20"
               )}
             >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border transition-all",
                  isOptionSelected ? "bg-white text-blue-600 border-white" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 pt-0.5">
                   {showEnglish && enOption && <p className={cn(optFontSize, "font-bold leading-tight")}>{enOption}</p>}
                   {showPunjabi && paOption && <p className="text-[11px] md:text-xs font-medium leading-tight font-body opacity-80">{paOption}</p>}
                </div>
                {isOptionSelected && (
                   <div className="absolute top-3 right-3 text-white opacity-30">
                      <CheckCircle2 size={16} />
                   </div>
                )}
             </button>
           );
         })}
      </div>

      {/* Low-Key Utility Bar */}
      <div className="flex items-center justify-between pt-4 opacity-40">
         <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[9px] font-black uppercase tracking-widest" onClick={toggleBookmark}>
            <Bookmark size={14} className={cn(isBookmarked ? "fill-current text-blue-600" : "")} />
            {isBookmarked ? "Saved" : "Save Question"}
         </button>
         <div className="flex items-center gap-2">
            <Zap className="text-yellow-500 fill-current" size={12} />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400">ENGINE v32.5</span>
         </div>
      </div>
    </div>
  );
}