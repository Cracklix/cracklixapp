'use client';

import { cn } from "@/lib/utils";
import { Bookmark, AlertCircle, Globe, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  activeLanguage?: 'en' | 'pa' | 'hi' | 'bilingual';
  examMode?: 'PSSSB' | 'CTET' | 'PPSC';
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
  activeLanguage = 'bilingual',
  examMode = 'PSSSB'
}: QuestionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const toggleBookmark = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bookmarks: arrayUnion({
          id: question.id,
          text: question.en.question,
          subject: question.subject,
          type: 'question',
          savedAt: Date.now()
        })
      });
      toast({ title: "Question Saved", description: "Added to your revision desk." });
    } catch (e) {
      console.error(e);
    }
  };

  const isBilingual = activeLanguage === 'bilingual';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* STACKED BILINGUAL QUESTION AREA */}
      <div className="space-y-4">
         {/* English Question */}
         {(activeLanguage === 'en' || isBilingual) && (
            <div className="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap select-none">
               {question.en.question}
            </div>
         )}

         {/* Punjabi Question ( Raavi Font Style - No Divider ) */}
         {(activeLanguage === 'pa' || (isBilingual && examMode === 'PSSSB')) && question.pa?.question && (
            <div className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed whitespace-pre-wrap select-none border-l-4 border-primary/20 pl-4 py-2 bg-slate-50/50 rounded-r-xl">
               {question.pa.question}
            </div>
         )}

         {/* Hindi Question (for CTET) */}
         {activeLanguage === 'hi' && question.hi?.question && (
            <div className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed whitespace-pre-wrap select-none border-l-4 border-emerald-500/20 pl-4 py-2 bg-emerald-50/20 rounded-r-xl">
               {question.hi.question}
            </div>
         )}

         {question.en.image && (
            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 mt-6">
               <img src={question.en.image} className="w-full max-h-[400px] object-contain" alt="Question Artifact" />
            </div>
         )}
      </div>

      {/* OPTIONS MATRIX (Stacked Bilingual) */}
      <div className="grid grid-cols-1 gap-4 pt-8 border-t border-slate-100">
         {question.en.options.map((option: string, idx: number) => {
           const letter = String.fromCharCode(65 + idx);
           const isSelected = selected === letter;
           const paOption = question.pa?.options?.[idx];
           const hiOption = question.hi?.options?.[idx];

           return (
             <button
               key={idx}
               onClick={() => onSelect(letter)}
               className={cn(
                 "w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-5 group relative",
                 isSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-lg ring-2 ring-blue-600/20" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
               )}
             >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-all",
                  isSelected ? "bg-white text-blue-600 border-white shadow-inner" : "bg-slate-100 text-slate-400 border-slate-200 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-2 flex-1 pt-1.5">
                   <p className="font-bold text-sm md:text-base leading-tight">{option}</p>
                   {isBilingual && paOption && (
                     <p className={cn(
                       "text-[14px] md:text-[15px] font-medium leading-tight",
                       isSelected ? "text-white/70" : "text-slate-400 italic"
                     )}>{paOption}</p>
                   )}
                   {activeLanguage === 'hi' && hiOption && (
                     <p className={cn(
                       "text-[14px] md:text-[15px] font-medium leading-tight",
                       isSelected ? "text-white/70" : "text-slate-400 italic"
                     )}>{hiOption}</p>
                   )}
                </div>
                {isSelected && (
                   <div className="absolute top-4 right-4">
                      <ShieldCheck size={16} className="text-white animate-in zoom-in-50" />
                   </div>
                )}
             </button>
           );
         })}
      </div>

      <div className="flex items-center justify-between pt-10 pb-6 opacity-30 group-hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-6">
            <Target size={18} className="text-slate-400" />
            <ShieldCheck size={18} className="text-slate-400" />
         </div>
         <div className="flex items-center gap-4">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">CRACKLIX CORE CBT v18.0</span>
            <Button variant="ghost" size="icon" onClick={toggleBookmark} className="h-10 w-10 hover:bg-slate-100 rounded-xl">
              <Bookmark size={18} className="text-slate-400 hover:text-blue-600" />
            </Button>
         </div>
      </div>
    </div>
  );
}