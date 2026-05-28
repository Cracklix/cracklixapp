'use client';

import { cn } from "@/lib/utils";
import { Bookmark, AlertCircle, Languages, Target, CheckCircle2, Info } from "lucide-react";
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
    <div className="space-y-10">
      {/* Question Identity Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-lg text-primary shadow-sm">
               {question.order || 'Q'}
            </div>
            <div>
               <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">{question.subject}</h4>
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5",
                    question.difficulty === 'hard' ? "bg-red-50 text-red-500 border-red-100" : 
                    question.difficulty === 'medium' ? "bg-orange-50 text-orange-500 border-orange-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                  )}>{question.difficulty}</Badge>
               </div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Section: Core Proficiency</p>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> +{question.marks}.0</span>
               <span className="flex items-center gap-1.5"><AlertCircle size={12} className="text-red-500" /> -{question.negativeMarks}.0</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleBookmark} className="h-10 w-10 rounded-xl hover:bg-slate-50 transition-all">
               <Bookmark size={18} className="text-slate-300 group-hover:text-primary" />
            </Button>
         </div>
      </div>

      {/* Multilingual Viewport */}
      <div className={cn(
        "grid gap-12",
        sideBySide ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
         {/* Left/Main Column */}
         <div className="space-y-8">
            <div className="flex items-center justify-between">
               <Badge className="bg-slate-900 text-white border-none text-[8px] font-black uppercase px-3 py-1 tracking-[0.3em]">PRIMARY VIEW</Badge>
               <Info size={14} className="text-slate-200" />
            </div>
            <div className="prose prose-slate max-w-none">
               <p className="text-xl md:text-2xl font-bold leading-relaxed text-slate-800 tracking-tight whitespace-pre-wrap select-none">
                 {getPrimaryText()}
               </p>
            </div>
            
            {question.en.image && (
               <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                  <img src={question.en.image} className="w-full h-auto object-contain bg-slate-50" alt="Artifact" />
               </div>
            )}
         </div>

         {/* Right/Secondary Column (Bilingual Only) */}
         {sideBySide && getSecondaryText() && (
           <div className="space-y-8 border-l border-slate-100 pl-12 hidden lg:block">
              <div className="flex items-center justify-between">
                 <Badge variant="outline" className="text-slate-400 border-slate-200 text-[8px] font-black uppercase px-3 py-1 tracking-[0.3em]">TRANSLATION VIEW</Badge>
              </div>
              <div className="prose prose-slate max-w-none">
                 <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-400 tracking-tight italic whitespace-pre-wrap select-none">
                   {getSecondaryText()}
                 </p>
              </div>
           </div>
         )}
      </div>

      {/* Options Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-slate-100">
         {primaryOptions.map((option: string, idx: number) => {
           const letter = String.fromCharCode(65 + idx);
           const isSelected = selected === letter;
           const secondaryOption = secondaryOptions[idx];

           return (
             <button
               key={idx}
               onClick={() => onSelect(letter)}
               className={cn(
                 "w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center gap-6 group relative overflow-hidden",
                 isSelected 
                   ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10" 
                   : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-lg"
               )}
             >
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-sm transition-all",
                  isSelected ? "bg-white text-primary" : "bg-white text-slate-400 group-hover:text-primary"
                )}>
                   {letter}
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                   <p className="font-bold text-lg md:text-xl truncate leading-tight">{option}</p>
                   {sideBySide && secondaryOption && (
                     <p className={cn(
                       "text-[11px] font-medium truncate italic",
                       isSelected ? "text-white/60" : "text-slate-400"
                     )}>{secondaryOption}</p>
                   )}
                </div>
                {isSelected && (
                  <motion.div 
                    layoutId="selected-indicator" 
                    className="absolute right-6 w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white]" 
                  />
                )}
             </button>
           );
         })}
      </div>

      {/* CBT Status Indicators */}
      <div className="flex items-center justify-between pt-12 opacity-30">
         <div className="flex flex-col">
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.4em]">CRACKLIX CORE CBT v17.0</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Infrastructure Engineered for High-Fidelity Assessment</p>
         </div>
         <div className="flex items-center gap-6">
            <Target size={18} className="text-slate-400" />
            <ShieldCheck size={18} className="text-slate-400" />
         </div>
      </div>
    </div>
  );
}
