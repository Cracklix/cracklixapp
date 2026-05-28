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
  activeLanguage?: 'en' | 'pa';
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
  sideBySide = true,
  activeLanguage = 'en'
}: QuestionCardProps) {
  const { user } = useAuth();
  
  // Logic to handle structured schema (en.question, pa.question)
  const getPrimaryText = () => {
    if (activeLanguage === 'pa' && question.pa?.question) return question.pa.question;
    return question.en?.question || "";
  };

  const getPrimaryOptions = (): string[] => {
    if (activeLanguage === 'pa' && question.pa?.options?.length) return question.pa.options;
    return question.en?.options || [];
  };

  const getSecondaryText = () => {
    if (activeLanguage === 'en') return question.pa?.question || "";
    return question.en?.question || "";
  };

  const getSecondaryOptions = (): string[] => {
    if (activeLanguage === 'en') return question.pa?.options || [];
    return question.en?.options || [];
  };

  const toggleBookmark = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bookmarks: arrayUnion({
          id: question.id,
          text: question.en?.question || "Question Artifact",
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
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
      <div className="relative z-10 space-y-12">
        <div className="flex items-start justify-between">
           <div className="space-y-8 flex-1">
              <div className={cn("grid gap-12", sideBySide ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                <div className="space-y-6">
                   <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase px-4 py-1.5 tracking-widest">
                     PRIMARY: {activeLanguage.toUpperCase()}
                   </Badge>
                   <h2 className="text-2xl md:text-3xl font-bold leading-snug text-slate-800 tracking-tight">
                     {getPrimaryText()}
                   </h2>
                </div>
                {sideBySide && getSecondaryText() && (
                  <div className="space-y-6 border-l border-slate-100 pl-12">
                    <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] font-black uppercase px-4 py-1.5 tracking-widest">TRANSLATION</Badge>
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
             className="rounded-xl h-14 w-14 shrink-0 text-slate-300 hover:text-primary hover:bg-primary/5 ml-8 transition-all"
           >
              <Bookmark className="w-8 h-8" />
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {primaryOptions.map((option: string, idx: number) => {
            // We use English options as the data identity for consistency in answer checking
            const submissionValue = question.en?.options[idx] || option;
            const isSelected = selected === submissionValue;
            const letter = String.fromCharCode(65 + idx);
            const secondaryOption = secondaryOptions[idx] || "";
            
            return (
              <button
                key={idx}
                onClick={() => onSelect(submissionValue)}
                className={cn(
                  "w-full text-left p-8 rounded-3xl border transition-all duration-200 flex items-center gap-8 group/opt",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10"
                    : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-white hover:border-slate-300 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 transition-all",
                  isSelected ? "bg-white text-primary" : "bg-white text-slate-400 shadow-sm"
                )}>
                  {letter}
                </div>
                <div className="flex flex-col gap-1.5 overflow-hidden">
                   <span className="font-bold text-lg md:text-xl truncate">{option}</span>
                   {sideBySide && secondaryOption && (
                     <span className={cn("text-xs font-medium truncate", isSelected ? "text-white/60" : "text-slate-400")}>
                       {secondaryOption}
                     </span>
                   )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-16 flex justify-between items-center border-t border-slate-50 opacity-40">
         <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Cracklix High Integrity CBT Engine v4.2</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Infrastructure Engineered by Arsh Grewal</p>
         </div>
         <div className="flex gap-6">
            <AlertCircle size={16} className="text-slate-300" />
            <Languages size={16} className="text-slate-300" />
         </div>
      </div>
    </div>
  );
}