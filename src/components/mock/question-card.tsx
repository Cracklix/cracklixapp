'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/lib/i18n-context";
import { Bookmark, MessageSquare, AlertCircle, CheckCircle2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, addDoc, collection } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: any;
  selected: string | null;
  onSelect: (option: string) => void;
  sideBySide?: boolean;
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
  sideBySide = false,
}: QuestionCardProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // High-performance bilingual logic
  const enText = question.question_en || question.question;
  const paText = question.question_pa || "";
  const enOptions = question.options_en || question.options || [];
  const paOptions = question.options_pa || [];

  const toggleBookmark = async () => {
    if (!user) return;
    setIsBookmarked(!isBookmarked);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bookmarks: arrayUnion({
          id: question.id,
          text: enText,
          subject: question.subject,
          type: 'question',
          savedAt: Date.now()
        })
      });
      toast({ title: "Saved to Revision", description: "Bilingual asset indexed." });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-zinc-950/40 border border-white/5 rounded-[40px] p-6 md:p-10 shadow-2xl relative overflow-hidden group/card min-h-[400px] flex flex-col">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover/card:opacity-[0.05] transition-opacity">
        <div className="text-[200px] font-black leading-none">?</div>
      </div>

      <div className="relative z-10 space-y-8 md:space-y-12">
        <div className="flex items-start justify-between">
           <div className="space-y-4 flex-1">
              <div className={cn("grid gap-8", sideBySide ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                <div className="space-y-4">
                   <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">English</Badge>
                   <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-white tracking-tight">
                     {enText}
                   </h2>
                </div>
                {(sideBySide || locale === 'pa') && paText && (
                  <div className="space-y-4 border-l border-white/5 pl-8 lg:pl-10">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">Punjabi</Badge>
                    <h2 className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-300 tracking-tight">
                      {paText}
                    </h2>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">
                   {question.subject}
                 </Badge>
                 {question.pyq && (
                   <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20 text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">
                     PYQ {question.year}
                   </Badge>
                 )}
              </div>
           </div>
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={toggleBookmark} 
             className={cn("rounded-xl h-10 w-10 shrink-0 transition-colors ml-4", isBookmarked ? "text-primary bg-primary/10" : "text-zinc-600 hover:bg-white/5")}
           >
              <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enOptions.map((option: string, idx: number) => {
            const isSelected = selected === option;
            const letter = String.fromCharCode(65 + idx);
            const paOption = paOptions[idx] || "";
            
            return (
              <button
                key={idx}
                onClick={() => onSelect(option)}
                className={cn(
                  "w-full text-left p-6 md:p-8 rounded-3xl border transition-all duration-200 flex items-center gap-5 group/opt",
                  isSelected
                    ? "bg-primary/10 border-primary text-white shadow-lg ring-1 ring-primary/20"
                    : "bg-white/[0.01] border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/[0.03]"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all",
                  isSelected ? "bg-primary text-white scale-110 shadow-xl" : "bg-zinc-900 text-zinc-600 group-hover/opt:text-zinc-400 group-hover/opt:bg-zinc-800"
                )}>
                  {letter}
                </div>
                <div className="flex flex-col gap-1">
                   <span className="font-bold text-sm md:text-base">{option}</span>
                   {(sideBySide || locale === 'pa') && paOption && (
                     <span className="text-xs text-zinc-500 font-medium">{paOption}</span>
                   )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 border-t border-white/5">
         <div className="flex gap-6">
            <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-destructive transition-colors">
               <AlertCircle className="w-3.5 h-3.5" /> Flag Question
            </button>
            <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary transition-colors">
               <MessageSquare className="w-3.5 h-3.5" /> Peer Discussion
            </button>
         </div>
         <div className="flex items-center gap-3">
            <div className="h-1 w-20 bg-zinc-900 rounded-full overflow-hidden">
               <div className="h-full bg-primary/20 w-1/3" />
            </div>
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Confidence Score: Medium</p>
         </div>
      </div>
    </div>
  );
}
