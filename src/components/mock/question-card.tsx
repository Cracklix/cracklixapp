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
 * Exactly mirrors institutional standards of Testbook and Oliveboard.
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

  // Dynamic Content Sizing for 0-Scroll Mandate
  const enLen = question.en?.question?.length || 0;
  const paLen = question.pa?.question?.length || 0;
  const totalLen = enLen + paLen;
  
  const qFontSize = totalLen > 400 ? 'text-lg' : 'text-[22px]';
  const optFontSize = totalLen > 500 ? 'text-[13px]' : 'text-sm';

  return (
    <div className="space-y-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
         <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 text-white border-none px-4 py-1 font-black uppercase text-[9px] tracking-[0.2em]">
               {question.subject.toUpperCase()}
            </Badge>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Question {index + 1}</span>
         </div>
         <button onClick={toggleBookmark} className="text-slate-400 hover:text-blue-600 transition-colors">
            <Bookmark size={18} className={cn(isBookmarked ? "fill-current text-blue-600" : "")} />
         </button>
      </div>

      {/* Question Narrative Stack */}
      <div className="space-y-4">
         {showEnglish && question.en?.question && (
            <div className={cn(qFontSize, "font-bold text-slate-800 leading-snug tracking-tight")}>
               {question.en.question}
            </div>
         )}

         {showPunjabi && question.pa?.question && (
            <div className={cn(qFontSize, "font-medium text-slate-500 leading-snug tracking-tight border-l-4 border-blue-500/10 pl-6 italic font-body")}>
               {question.pa.question}
            </div>
         )}
      </div>

      {/* Option Matrix - Compact 0-Scroll Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
                 "w-full text-left p-4 rounded-3xl border transition-all duration-150 flex items-start gap-4 group relative",
                 isOptionSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-xl ring-4 ring-blue-600/10" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-600/30"
               )}
             >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-all shadow-inner",
                  isOptionSelected ? "bg-white text-blue-600 border-white" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-1 flex-1 pt-1.5">
                   {showEnglish && enOption && <p className={cn(optFontSize, "font-bold leading-tight")}>{enOption}</p>}
                   {showPunjabi && paOption && <p className="text-[12px] font-medium leading-tight font-body opacity-80 italic">{paOption}</p>}
                </div>
                {isOptionSelected && (
                   <div className="absolute top-4 right-5 text-white opacity-40">
                      <CheckCircle2 size={20} />
                   </div>
                )}
             </button>
           );
         })}
      </div>
      
      {/* Engine Signal */}
      <div className="flex justify-end pt-4 opacity-10">
         <div className="flex items-center gap-2">
            <Zap className="text-yellow-500 fill-current" size={12} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-950">CRACKLIX CORE v32.5</span>
         </div>
      </div>
    </div>
  );
}
