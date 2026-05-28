'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question, LanguageMode } from "@/types";
import { Button } from "@/components/ui/button";
import { X, LayoutGrid, ScrollText, CheckCircle2, Bookmark, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaletteDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  current: number;
  answers: Record<string, AttemptAnswer>;
  setCurrent: (index: number) => void;
  mockTitle: string;
  activeLanguage?: LanguageMode;
}

export default function PaletteDrawer({
  open,
  onClose,
  questions,
  current,
  answers,
  setCurrent,
  mockTitle,
  activeLanguage = 'bilingual'
}: PaletteDrawerProps) {
  const answeredCount = Object.values(answers).filter(a => a.selectedOption).length;
  const reviewCount = Object.values(answers).filter(a => a.status.includes('MARKED')).length;
  const visitedCount = Object.values(answers).filter(a => a.status === 'VISITED').length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full md:w-[380px] bg-white text-slate-900 z-[100] shadow-2xl flex flex-col border-l border-slate-100"
    >
      <header className="h-[65px] px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#1e293b] text-white shadow-lg">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
               <LayoutGrid size={18} />
            </div>
            <div>
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] leading-none">CBT Navigator</h3>
               <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1 truncate max-w-[180px]">{mockTitle}</p>
            </div>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-9 w-9 text-white/60 hover:text-white hover:bg-white/10">
            <X size={20} />
         </Button>
      </header>

      <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-6">
         <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
               <p className="text-[8px] font-black text-emerald-600 uppercase mb-0.5">Answered</p>
               <h4 className="text-xl font-black text-emerald-700">{answeredCount}</h4>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-center">
               <p className="text-[8px] font-black text-blue-600 uppercase mb-0.5">Review</p>
               <h4 className="text-xl font-black text-blue-700">{reviewCount}</h4>
            </div>
            <div className="p-3 rounded-2xl bg-slate-200 border border-slate-300 text-center">
               <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Skipped</p>
               <h4 className="text-xl font-black text-slate-700">{questions.length - answeredCount}</h4>
            </div>
         </div>
      </div>

      <Tabs defaultValue="grid" className="flex-1 flex flex-col overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-2xl p-1 h-11">
               <TabsTrigger value="grid" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Grid View</TabsTrigger>
               <TabsTrigger value="list" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Artifact Log</TabsTrigger>
            </TabsList>
         </div>

         <ScrollArea className="flex-1 px-6">
            <TabsContent value="grid" className="mt-6">
               <div className="grid grid-cols-5 gap-3 pb-10">
                  {questions.map((q, i) => {
                    const ans = answers[q.id];
                    const isCurrent = current === i;
                    const status = ans?.status || 'NOT_VISITED';

                    let styles = "bg-white text-slate-400 border-slate-200 hover:border-blue-300";
                    if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/10";
                    if (status === 'MARKED_FOR_REVIEW') styles = "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/10";
                    if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-500/10";
                    if (status === 'VISITED' && !ans?.selectedOption) styles = "bg-red-500 text-white border-red-600 shadow-md";

                    return (
                      <button
                        key={q.id}
                        onClick={() => { setCurrent(i); onClose(); }}
                        className={cn(
                          "h-11 w-full rounded-2xl font-black text-[11px] transition-all border flex items-center justify-center relative",
                          styles,
                          isCurrent && "ring-4 ring-blue-600/10 border-blue-600 z-10 scale-110"
                        )}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
               </div>
            </TabsContent>

            <TabsContent value="list" className="mt-6 space-y-3 pb-10">
               {questions.map((q, i) => (
                 <div 
                   key={q.id} 
                   onClick={() => { setCurrent(i); onClose(); }}
                   className={cn(
                   "p-4 rounded-[28px] border transition-all cursor-pointer flex gap-4 items-start group",
                   current === i ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                 )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0",
                      current === i ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-100 text-slate-400"
                    )}>
                       {i+1}
                    </div>
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                       <p className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight">
                          {activeLanguage === 'punjabi' ? (q.pa?.question || q.en.question) : q.en.question}
                       </p>
                       <div className="flex gap-2">
                          <Badge variant="outline" className="border-slate-200 text-slate-400 text-[7px] font-black uppercase">{q.subject}</Badge>
                          {answers[q.id]?.selectedOption && <Badge className="bg-emerald-500 text-white border-none text-[7px] font-black px-1.5">ANSWERED</Badge>}
                       </div>
                    </div>
                 </div>
               ))}
            </TabsContent>
         </ScrollArea>
      </Tabs>

      <footer className="p-6 bg-slate-50 border-t border-slate-200 mt-auto">
         <Button onClick={onClose} className="w-full h-14 rounded-3xl bg-[#1e293b] hover:bg-black text-white font-black text-[11px] uppercase tracking-widest shadow-2xl transition-transform active:scale-95">
            RESUME ASSESSMENT
         </Button>
      </footer>
    </motion.div>
  );
}
