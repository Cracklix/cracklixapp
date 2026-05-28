
'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/lib/i18n-context";
import { Bookmark, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, addDoc, collection } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

interface QuestionCardProps {
  question: any;
  selected: string | null;
  onSelect: (option: string) => void;
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
}: QuestionCardProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Support for bilingual questions
  const qText = locale === 'pa' ? (question.question_pa || question.question) : (question.question_en || question.question);
  const options = locale === 'pa' ? (question.options_pa || question.options) : (question.options_en || question.options);

  const toggleBookmark = async () => {
    if (!user) return;
    setIsBookmarked(!isBookmarked);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bookmarks: arrayUnion({
          id: question.id,
          text: qText,
          subject: question.subject,
          type: 'question',
          savedAt: Date.now()
        })
      });
      toast({ title: "Question Bookmarked", description: "Saved to your revision desk." });
    } catch (e) {
      console.error(e);
    }
  };

  const reportError = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "questionReports"), {
        questionId: question.id,
        userId: user.uid,
        reason: "Reported during mock",
        status: "pending",
        createdAt: Date.now()
      });
      toast({ title: "Report Submitted", description: "Our team will verify the answer keys." });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-zinc-900 p-8 md:p-12 rounded-[48px] text-white border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <CheckCircle2 size={300} />
      </div>

      <div className="mb-10 flex items-center justify-between relative z-10">
        <div className="flex gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            {question.subject}
          </span>
          {question.pyq && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20">
              PYQ {question.year}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" onClick={toggleBookmark} className={cn("rounded-xl h-10 w-10", isBookmarked ? "text-primary" : "text-zinc-500")}>
              <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
           </Button>
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-xl">
             {question.marks || 1} Marks
           </span>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-12 leading-relaxed relative z-10">
        {qText}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {options.map((option: string, idx: number) => {
          const isSelected = selected === option;
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          
          return (
            <button
              key={idx}
              onClick={() => onSelect(option)}
              className={cn(
                "w-full text-left p-6 md:p-8 rounded-[32px] border transition-all duration-300 flex items-center gap-6 group/opt",
                isSelected
                  ? "bg-primary/20 border-primary text-white shadow-xl shadow-primary/10"
                  : "bg-zinc-800/40 border-white/5 text-zinc-400 hover:border-white/20 hover:bg-zinc-800"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 transition-all",
                isSelected ? "bg-primary text-white scale-110" : "bg-zinc-800 text-zinc-600 group-hover/opt:bg-zinc-700"
              )}>
                {letter}
              </div>
              <span className="font-bold text-lg">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
         <div className="flex gap-6">
            <button onClick={reportError} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-destructive transition-colors">
               <AlertCircle className="w-4 h-4" /> Report Issue
            </button>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
               <MessageSquare className="w-4 h-4" /> Discuss
            </button>
         </div>
         <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Question ID: {question.id?.substring(0, 8)}</p>
      </div>
    </div>
  );
}
