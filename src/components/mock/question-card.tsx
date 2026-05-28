'use client';

import { cn } from "@/lib/utils";
import { Bookmark, AlertCircle, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: any;
  selected: string | null;
  onSelect: (option: string) => void;
  sideBySide?: boolean;
  activeLanguage?: 'en' | 'pa' | 'hi';
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
  sideBySide = false,
  activeLanguage = 'en'
}: QuestionCardProps) {
  const { user } = useAuth();
  
  const getPrimaryText = () => {
    if (activeLanguage === 'pa' && question.question_pa) return question.question_pa;
    return question.question_en;
  };

  const getPrimaryOptions = () => {
    if (activeLanguage === 'pa' && question.options_pa?.length) return question.options_pa;
    return question.options_en;
  };

  const getSecondaryText = () => {
    if (activeLanguage === 'en') return question.question_pa || "";
    return question.question_en;
  };

  const getSecondaryOptions = () => {
    if (activeLanguage === 'en') return question.options_pa || [];
    return question.options_en;
  };

  const toggleBookmark = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        bookmarks: arrayUnion({
          id: question.id,
          text: question.question_en,
          subject: question.subject,
          type: 'question',
          savedAt: Date.now()
        })
      }).catch(() => {});
      toast({ title: "Signal Indexed", description: "Artifact saved for revision." });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
      <div className="relative z-10 space-y-12">
        <div className="flex items-start justify-between">
           <div className="space-y-6 flex-1">
              <div className={cn("grid gap-12", sideBySide ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                <div className="space-y-6">
                   <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase px-3 py-1 tracking-widest">
                     PRIMARY: {activeLanguage.toUpperCase()}
                   </Badge>
                   <h2 className="text-2xl md:text-3xl font-bold leading-snug text-slate-800 tracking-tight">
                     {getPrimaryText()}
                   </h2>
                </div>
                {sideBySide && getSecondaryText() && (
                  <div className="space-y-6 border-l border-slate-100 pl-12">
                    <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] font-black uppercase px-3 py-1 tracking-widest">TRANSLATION</Badge>
                    <h2 className="text-2xl md:text-3xl font-medium leading-snug text-slate-400 tracking-tight italic">
                      {getSecondaryText()}
                    </h2>
                  </div>
                )}
              </div>
           </div>
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={toggleBookmark} 
             className="rounded-xl h-12 w-12 shrink-0 text-slate-300 hover:text-primary hover:bg-primary/5 ml-6"
           >
              <Bookmark className="w-6 h-6" />
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getPrimaryOptions().map((option: string, idx: number) => {
            const submissionValue = question.options_en[idx];
            const isSelected = selected === submissionValue;
            const letter = String.fromCharCode(65 + idx);
            const secondaryOption = getSecondaryOptions()[idx] || "";
            
            return (
              <button
                key={idx}
                onClick={() => onSelect(submissionValue)}
                className={cn(
                  "w-full text-left p-6 md:p-8 rounded-2xl border transition-all duration-200 flex items-center gap-6 group/opt",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                    : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-300 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all",
                  isSelected ? "bg-white text-primary" : "bg-white text-slate-400 shadow-sm"
                )}>
                  {letter}
                </div>
                <div className="flex flex-col gap-1">
                   <span className="font-bold text-base md:text-lg">{option}</span>
                   {sideBySide && secondaryOption && (
                     <span className={cn("text-xs font-medium", isSelected ? "text-white/60" : "text-slate-400")}>
                       {secondaryOption}
                     </span>
                   )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-12 flex justify-between items-center border-t border-slate-50 opacity-50">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Cracklix CBT Engine v4.2 • High Integrity Mode</p>
         <div className="flex gap-4">
            <AlertCircle size={14} className="text-slate-300" />
            <Languages size={14} className="text-slate-300" />
         </div>
      </div>
    </div>
  );
}
