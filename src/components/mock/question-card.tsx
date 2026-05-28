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

  return (
    <div className="space-y-8 select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
         <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 text-white border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest">
               {question.subject.toUpperCase()}
            </Badge>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Artifact {index + 1}</span>
         </div>
         <button onClick={toggleBookmark} className="text-slate-300 hover:text-blue-600 transition-colors">
            <Bookmark size={20} className={cn(isBookmarked ? "fill-current text-blue-600" : "")} />
         </button>
      </div>

      <div className="space-y-6">
         {showEnglish && (
            <div className="text-[26px] font-bold text-slate-800 leading-tight tracking-tight">
               {question.questionEn}
            </div>
         )}
         {showPunjabi && (
            <div className="text-[26px] font-medium text-slate-500 leading-tight tracking-tight border-l-4 border-blue-500/10 pl-6 italic font-body">
               {question.questionPa}
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 gap-4 pt-6">
         {[0, 1, 2, 3].map((idx) => {
           const isOptionSelected = selected === idx;
           const opt = question.options[idx];
           const letter = String.fromCharCode(65 + idx);

           if (!opt) return null;

           return (
             <button
               key={idx}
               onClick={() => onSelect(idx)}
               className={cn(
                 "w-full text-left p-5 rounded-[28px] border transition-all duration-200 flex items-start gap-5 group relative",
                 isOptionSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-xl" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-600/30"
               )}
             >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border transition-all shadow-inner",
                  isOptionSelected ? "bg-white text-blue-600 border-white" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-1 pt-1.5 flex-1">
                   {showEnglish && <p className="font-bold text-base leading-tight">{opt.en}</p>}
                   {showPunjabi && <p className="text-[13px] font-medium leading-tight font-body opacity-80 italic">{opt.pa}</p>}
                </div>
                {isOptionSelected && (
                   <div className="absolute top-6 right-8 text-white opacity-40">
                      <CheckCircle2 size={24} />
                   </div>
                )}
             </button>
           );
         })}
      </div>
      
      <div className="flex justify-end pt-8 opacity-5">
         <div className="flex items-center gap-2">
            <Zap className="text-yellow-500 fill-current" size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-950">CRACKLIX ENGINE v12</span>
         </div>
      </div>
    </div>
  );
}
