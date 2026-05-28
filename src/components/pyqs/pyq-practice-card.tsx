
'use client';

import { useState } from 'react';
import { PYQ } from '@/services/pyqs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Share2, 
  Bookmark, 
  Zap,
  ShieldCheck,
  Target,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PYQPracticeCardProps {
  question: PYQ;
  mode: 'practice' | 'exam';
  index: number;
}

/**
 * PRODUCTION-GRADE PYQ PRACTICE CARD v12
 * Stacked bilingual rendering with instant feedback logic.
 */
export default function PYQPracticeCard({ question, mode, index }: PYQPracticeCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleSelect = (option: string) => {
    if (selected && mode === 'practice') return;
    setSelected(option);
  };

  const isCorrect = selected === question.correctAnswer;

  return (
    <Card className="rounded-[40px] bg-zinc-950 border border-white/5 overflow-hidden group hover:border-orange-500/20 transition-all duration-500 shadow-2xl">
      <div className="p-6 md:p-10 space-y-10">
        {/* META HEADER */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-xs text-zinc-500 shadow-inner">
                 #{index + 1}
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-2">
                    <Badge className="bg-orange-600 text-white border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 shadow-lg shadow-orange-900/20">{question.year}</Badge>
                    <Badge variant="outline" className="text-zinc-600 border-white/10 text-[8px] font-black uppercase tracking-widest px-3 py-1">{question.exam}</Badge>
                 </div>
                 <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{question.subject} • {question.topic || 'General'}</p>
              </div>
           </div>
           <div className="flex gap-2">
              <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-xl", bookmarked ? "text-orange-500" : "text-zinc-700")} onClick={() => setBookmarked(!bookmarked)}>
                 <Bookmark size={18} className={bookmarked ? "fill-current" : ""} />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-700 hover:text-white">
                 <Share2 size={18} />
              </Button>
           </div>
        </div>

        {/* BILINGUAL QUESTION STACK */}
        <div className="space-y-6">
           <div className="text-xl md:text-2xl font-bold leading-relaxed text-zinc-100">
              {question.question_en}
           </div>
           <div className="text-2xl md:text-3xl font-medium leading-relaxed text-zinc-500 border-l-4 border-orange-500/10 pl-6 italic">
              {question.question_pa}
           </div>
        </div>

        {/* OPTION MATRIX */}
        <div className="grid grid-cols-1 gap-3 pt-6 border-t border-white/[0.03]">
           {question.options_en.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selected === letter;
              const isCorrectOpt = letter === question.correctAnswer;
              
              let styles = "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900 hover:border-white/10";
              
              if (selected) {
                 if (isCorrectOpt) styles = "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]";
                 else if (isSelected && !isCorrectOpt) styles = "bg-red-500/10 border-red-500/30 text-red-500";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(letter)}
                  className={cn(
                    "w-full text-left p-5 rounded-3xl border transition-all duration-200 flex items-start gap-5 relative group",
                    styles
                  )}
                >
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border transition-all",
                     isSelected ? "bg-white text-black border-white" : "bg-zinc-900 border-white/5 text-zinc-600 group-hover:border-white/20"
                   )}>
                      {letter}
                   </div>
                   <div className="space-y-2 pt-1.5 flex-1">
                      <p className="font-bold text-base leading-none">{opt}</p>
                      <p className="text-sm font-medium leading-none opacity-50 italic">{question.options_pa[i]}</p>
                   </div>
                   {selected && isCorrectOpt && <ShieldCheck size={20} className="text-emerald-500 absolute right-6 top-6" />}
                </button>
              );
           })}
        </div>

        {/* INTERACTIVE ACTIONS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.03]">
           <div className="flex gap-4 w-full md:w-auto">
              <Button 
                onClick={() => setShowSolution(!showSolution)}
                className={cn(
                  "flex-1 md:flex-none h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                  showSolution ? "bg-white text-black" : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                )}
              >
                 {showSolution ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                 {showSolution ? "Hide Analysis" : "View Detailed Solution"}
              </Button>
              <Button variant="ghost" className="hidden md:flex h-12 px-6 rounded-2xl text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all">
                 <Target size={16} className="mr-2" /> Find Similar
              </Button>
           </div>
           
           {selected && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                <div className={cn(
                  "px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-[0.2em]",
                  isCorrect ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                   {isCorrect ? "Precision Signal: Perfect" : "Signal Deviation Detected"}
                </div>
                <Button size="icon" className="h-12 w-12 rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-lg">
                   <ArrowRight size={20} />
                </Button>
             </motion.div>
           )}
        </div>

        {/* SOLUTION ACCORDION */}
        <AnimatePresence>
           {showSolution && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="overflow-hidden"
             >
                <div className="mt-4 p-8 md:p-10 rounded-[32px] bg-white/[0.02] border border-white/10 space-y-10">
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                         <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600 text-white border-none text-[8px] font-black uppercase">Rationalization (EN)</Badge>
                         </div>
                         <p className="text-sm leading-relaxed text-zinc-300 font-medium whitespace-pre-wrap">
                            {question.explanation_en || "Professional analysis pending for this artifact."}
                         </p>
                      </div>
                      <div className="space-y-6 border-l border-white/5 pl-12">
                         <div className="flex items-center gap-2">
                            <Badge className="bg-orange-600 text-white border-none text-[8px] font-black uppercase">ਵਿਆਖਿਆ (PA)</Badge>
                         </div>
                         <p className="text-base leading-relaxed text-zinc-400 font-medium whitespace-pre-wrap italic">
                            {question.explanation_pa || "ਪੰਜਾਬੀ ਵਿਆਖਿਆ ਜਲਦੀ ਹੀ ਉਪਲਬਧ ਹੋਵੇਗੀ।"}
                         </p>
                      </div>
                   </div>

                   {(question.shortcut_trick || question.related_concept) && (
                     <div className="pt-10 border-t border-white/5 grid md:grid-cols-2 gap-12">
                        {question.shortcut_trick && (
                          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-3">
                             <h5 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <Zap size={14} className="fill-current" /> Elite Shortcut Trick
                             </h5>
                             <p className="text-xs text-zinc-300 leading-relaxed font-bold">{question.shortcut_trick}</p>
                          </div>
                        )}
                        {question.related_concept && (
                          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                             <h5 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                                <Target size={14} /> Cognitive Link
                             </h5>
                             <p className="text-xs text-zinc-300 leading-relaxed font-bold">{question.related_concept}</p>
                          </div>
                        )}
                     </div>
                   )}
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
