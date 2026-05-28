'use client';

import { cn } from "@/lib/utils";
import { Bookmark, AlertCircle, Languages, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  sideBySide?: boolean;
  activeLanguage?: 'en' | 'pa' | 'hi' | 'bilingual';
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
  sideBySide = true,
  activeLanguage = 'en'
}: QuestionCardProps) {
  const { user } = useAuth();
  
  const getPrimaryText = () => {
    if (activeLanguage === 'pa' && question.pa?.question) return question.pa.question;
    if (activeLanguage === 'hi' && question.hi?.question) return question.hi.question;
    return question.en.question;
  };

  const getPrimaryOptions = (): string[] => {
    if (activeLanguage === 'pa' && question.pa?.options?.length) return question.pa.options;
    if (activeLanguage === 'hi' && question.hi?.options?.length) return question.hi.options;
    return question.en.options || [];
  };

  const getSecondaryText = () => {
    if (activeLanguage === 'en') return question.pa?.question || "";
    return question.en.question;
  };

  const getSecondaryOptions = (): string[] => {
    if (activeLanguage === 'en') return question.pa?.options || [];
    return question.en.options || [];
  };

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
      toast({ title: "Artifact Indexed", description: "Saved to your revision desk." });
    } catch (e) {
      console.error(e);
    }
  };

  const primaryOptions = getPrimaryOptions();
  const secondaryOptions = getSecondaryOptions();

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col min-h-[600px]">
      <div className="relative z-10 space-y-12">
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                 <Badge className="bg-primary text-white border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest">Question {question.order || 1}</Badge>
                 <Badge variant="outline" className="border-slate-200 text-slate-400 text-[8px] font-black uppercase px-2 py-0.5">{question.subject}</Badge>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 <span>Marks: <span className="text-emerald-600">+{question.marks}</span></span>
                 <span>Negative: <span className="text-red-500">-{question.negativeMarks}</span></span>
              </div>
           </div>
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={toggleBookmark} 
             className="rounded-xl h-10 w-10 text-slate-300 hover:text-primary transition-colors"
           >
              <Bookmark className="w-5 h-5" />
           </Button>
        </div>

        <div className={cn("grid gap-12", (sideBySide || activeLanguage === 'bilingual') ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
           <div className="space-y-6">
              <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[8px] font-black uppercase px-3 py-1 tracking-widest">PRIMARY VIEW</Badge>
              <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-800 tracking-tight select-none">
                {getPrimaryText()}
              </h2>
           </div>
           
           {(sideBySide || activeLanguage === 'bilingual') && getSecondaryText() && (
             <div className="space-y-6 border-l border-slate-100 pl-10">
                <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[8px] font-black uppercase px-3 py-1 tracking-widest">TRANSLATION VIEW</Badge>
                <h2 className="text-xl md:text-2xl font-medium leading-relaxed text-slate-400 tracking-tight italic select-none">
                  {getSecondaryText()}
                </h2>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-slate-100">
          {primaryOptions.map((option: string, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selected === letter;
            const secondaryOption = secondaryOptions[idx] || "";
            
            return (
              <button
                key={idx}
                onClick={() => onSelect(letter)}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-5 group",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.01]"
                    : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-white hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm",
                  isSelected ? "bg-white text-primary" : "bg-white text-slate-400"
                )}>
                  {letter}
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                   <span className="font-bold text-base md:text-lg truncate leading-snug">{option}</span>
                   {(sideBySide || activeLanguage === 'bilingual') && secondaryOption && (
                     <span className={cn("text-[10px] font-medium truncate", isSelected ? "text-white/60" : "text-slate-400")}>
                       {secondaryOption}
                     </span>
                   )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-16 flex justify-between items-center opacity-40">
         <div className="flex flex-col">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">CRACKLIX CBT CORE v15.0</p>
            <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mt-1">Infrastructure Engineered by Arsh Grewal</p>
         </div>
         <div className="flex gap-4">
            <AlertCircle size={14} className="text-slate-300" />
            <Target size={14} className="text-slate-300" />
         </div>
      </div>
    </div>
  );
}
