
'use client';

import { cn } from "@/lib/utils";
import { Bookmark, Target, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  activeLanguage: 'en' | 'pa' | 'hi' | 'bilingual';
  index: number;
}

/**
 * PURE BILINGUAL RENDERER v20.0
 * Optimized for Raavi font and government exam fidelity.
 * Stacked layout: EN then PA/HI.
 */
export default function QuestionCard({
  question,
  selected,
  onSelect,
  activeLanguage = 'bilingual',
  index
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
      toast({ title: "Signal Cached", description: "Artifact added to revision desk." });
    } catch (e) {
      console.error(e);
    }
  };

  const isBilingual = activeLanguage === 'bilingual';

  return (
    <div className="space-y-12 select-none">
      {/* QUESTION PAYLOAD */}
      <div className="space-y-6">
         {/* English Header */}
         {(activeLanguage === 'en' || isBilingual) && (
            <div className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed break-words">
               {question.en.question}
            </div>
         )}

         {/* Punjabi Signal (Raavi Font Style) */}
         {(activeLanguage === 'pa' || isBilingual) && question.pa?.question && (
            <div className="text-2xl md:text-3xl font-medium text-slate-500 leading-relaxed break-words border-l-4 border-blue-500/10 pl-6 py-2">
               {question.pa.question}
            </div>
         )}

         {question.en.image && (
            <div className="rounded-[32px] border border-slate-100 overflow-hidden bg-slate-50 mt-8 shadow-inner p-4 flex justify-center">
               <img src={question.en.image} className="max-h-[450px] object-contain rounded-2xl" alt="Artifact" />
            </div>
         )}
      </div>

      {/* OPTION MATRIX (STACKED BILINGUAL) */}
      <div className="grid grid-cols-1 gap-4 pt-10 border-t border-slate-100">
         {question.en.options.map((option, idx) => {
           const letter = String.fromCharCode(65 + idx);
           const isSelected = selected === letter;
           const paOption = question.pa?.options?.[idx];

           return (
             <button
               key={idx}
               onClick={() => onSelect(letter)}
               className={cn(
                 "w-full text-left p-6 rounded-[24px] border transition-all duration-200 flex items-start gap-6 group relative",
                 isSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-xl ring-4 ring-blue-600/10" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
               )}
             >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border transition-all shadow-inner",
                  isSelected ? "bg-white text-blue-600 border-white" : "bg-slate-100 text-slate-400 border-slate-200 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-2 flex-1 pt-2.5">
                   <p className="font-bold text-base md:text-lg leading-tight">{option}</p>
                   {(isBilingual || activeLanguage === 'pa') && paOption && (
                     <p className={cn(
                       "text-[16px] md:text-[18px] font-medium leading-tight",
                       isSelected ? "text-white/70" : "text-slate-400 italic"
                     )}>{paOption}</p>
                   )}
                </div>
                {isSelected && (
                   <div className="absolute top-6 right-6">
                      <ShieldCheck size={20} className="text-white" />
                   </div>
                )}
             </button>
           );
         })}
      </div>

      <div className="flex items-center justify-between pt-12 opacity-40 group-hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-8">
            <Target size={20} className="text-slate-400" />
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 text-slate-400">{question.difficulty}</Badge>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">CRACKLIX CORE ENGINE v20.0</span>
            <Button variant="ghost" size="icon" onClick={toggleBookmark} className="h-10 w-10 hover:bg-slate-100 rounded-xl">
              <Bookmark size={20} className="text-slate-400 hover:text-blue-600" />
            </Button>
         </div>
      </div>
    </div>
  );
}
