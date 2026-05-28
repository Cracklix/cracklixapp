'use client';

import { cn } from "@/lib/utils";
import { Bookmark, AlertCircle, Globe, ShieldCheck } from "lucide-react";
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
      <div className="space-y-6">
         {/* English Question */}
         {(activeLanguage === 'en' || isBilingual) && (
           <div className="space-y-4">
              <Badge className="bg-blue-600 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">English</Badge>
              <div className="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap select-none">
                 {question.en.question}
              </div>
           </div>
         )}

         {/* Punjabi Question ( Raavi Font Style ) */}
         {(activeLanguage === 'pa' || (isBilingual && examMode === 'PSSSB')) && question.pa?.question && (
           <div className="space-y-4 border-t border-slate-100 pt-6">
              <Badge className="bg-orange-600 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">Punjabi</Badge>
              <div className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed whitespace-pre-wrap select-none">
                 {question.pa.question}
              </div>
           </div>
         )}

         {/* Hindi Question (for CTET) */}
         {activeLanguage === 'hi' && question.hi?.question && (
           <div className="space-y-4 border-t border-slate-100 pt-6">
              <Badge className="bg-emerald-600 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">Hindi</Badge>
              <div className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed whitespace-pre-wrap select-none">
                 {question.hi.question}
              </div>
         </div>
         )}

         {question.en.image && (
            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 mt-4">
               <img src={question.en.image} className="w-full max-h-[400px] object-contain" alt="Question Artifact" />
            </div>
         )}
      </div>

      {/* OPTIONS MATRIX */}
      <div className="grid grid-cols-1 gap-3 pt-6 border-t border-slate-100">
         {question.en.options.map((option: string, idx: number) => {
           const letter = String.fromCharCode(65 + idx);
           const isSelected = selected === letter;
           const paOption = question.pa?.options?.[idx];

           return (
             <button
               key={idx}
               onClick={() => onSelect(letter)}
               className={cn(
                 "w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center gap-4 group relative",
                 isSelected 
                   ? "bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-600/20" 
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
               )}
             >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border transition-all",
                  isSelected ? "bg-white text-blue-600 border-white" : "bg-slate-100 text-slate-400 border-slate-200 group-hover:text-blue-600"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                   <p className="font-bold text-sm md:text-base leading-tight">{option}</p>
                   {isBilingual && paOption && (
                     <p className={cn(
                       "text-[12px] md:text-[13px] font-medium leading-tight",
                       isSelected ? "text-white/80" : "text-slate-400"
                     )}>{paOption}</p>
                   )}
                </div>
             </button>
           );
         })}
      </div>

      <div className="flex items-center justify-between pt-10 pb-6 opacity-20 group-hover:opacity-100 transition-opacity">
         <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">CRACKLIX CORE CBT v18.0</p>
         <Button variant="ghost" size="icon" onClick={toggleBookmark} className="h-8 w-8 hover:bg-slate-100">
           <Bookmark size={14} className="text-slate-400 hover:text-blue-600" />
         </Button>
      </div>
    </div>
  );
}
