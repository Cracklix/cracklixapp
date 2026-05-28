
'use client';

import { cn } from "@/lib/utils";
import { Bookmark, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Question, LanguageMode } from "@/types";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: Question;
  selected: number | null;
  onSelect: (option: number) => void;
  activeLanguage: LanguageMode;
  index: number;
}

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
          text: question.questionEn,
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

  // Dynamic Font Sizing based on content length
  const questionLength = (question.questionEn?.length || 0) + (question.questionPa?.length || 0);
  const qFontSize = questionLength > 400 ? 'text-lg' : questionLength > 200 ? 'text-xl' : 'text-2xl';

  return (
    <div className="space-y-6 select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
         <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 text-white border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest">
               {question.subject?.toUpperCase() || 'GENERAL'}
            </Badge>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Artifact {index + 1}</span>
         </div>
         <button onClick={toggleBookmark} className="text-slate-300 hover:text-blue-600 transition-colors">
            <Bookmark size={18} className={cn(isBookmarked ? "fill-current text-blue-600" : "")} />
         </button>
      </div>

      <div className="space-y-4">
         {showEnglish && (
            <div className={cn("font-bold text-slate-800 leading-tight tracking-tight", qFontSize)}>
               {question.questionEn}
            </div>
         )}
         {showPunjabi && (
            <div className={cn("font-medium text-slate-500 leading-tight tracking-tight border-l-4 border-blue-500/10 pl-6 italic font-body", qFontSize)}>
               {question.questionPa}
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 gap-3 pt-4">
         {[0, 1, 2, 3].map((idx) => {
           const isOptionSelected = selected === idx;
           const opt = question.options?.[idx];
           const letter = String.fromCharCode(65 + idx);

           if (!opt) return null;

           return (
             <button
               key={idx}
               onClick={() => onSelect(idx)}
               className={cn(
                 "w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 group relative",
                 isOptionSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-xl" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-600/30"
               )}
             >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border transition-all shadow-inner",
                  isOptionSelected ? "bg-white text-blue-600 border-white" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-0.5 pt-1 flex-1">
                   {showEnglish && <p className="font-bold text-sm leading-tight">{opt.en}</p>}
                   {showPunjabi && <p className="text-[12px] font-medium leading-tight font-body opacity-80 italic">{opt.pa}</p>}
                </div>
                {isOptionSelected && (
                   <div className="absolute top-4 right-6 text-white opacity-40">
                      <CheckCircle2 size={20} />
                   </div>
                )}
             </button>
           );
         })}
      </div>
      
      <div className="flex justify-end pt-4 opacity-5">
         <div className="flex items-center gap-2">
            <Zap className="text-yellow-500 fill-current" size={12} />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-950">CRACKLIX v45.0</span>
         </div>
      </div>
    </div>
  );
}
