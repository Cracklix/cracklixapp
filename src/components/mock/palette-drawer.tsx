'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question, LanguageMode } from "@/types";
import { Button } from "@/components/ui/button";
import { LayoutGrid, CheckCircle2, Bookmark, Clock, List } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PaletteDrawerProps {
  questions: Question[];
  current: number;
  answers: Record<string, AttemptAnswer>;
  setCurrent: (index: number) => void;
  mockTitle: string;
  activeLanguage: LanguageMode;
}

export default function PaletteDrawer({
  questions,
  current,
  answers,
  setCurrent,
  mockTitle,
  activeLanguage
}: PaletteDrawerProps) {
  const answeredCount = Object.values(answers).filter(a => a.selectedOption !== null).length;
  const markedCount = Object.values(answers).filter(a => a.status.includes('MARKED')).length;
  const skippedCount = Object.values(answers).filter(a => a.status === 'VISITED' && a.selectedOption === null).length;

  return (
    <div className="flex flex-col h-full">
      <header className="p-6 border-b border-slate-100 space-y-6 bg-slate-50/50">
         <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-xs">{answeredCount}</div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Answered</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white font-black text-xs">{markedCount}</div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marked</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-black text-xs">{skippedCount}</div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Skipped</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200">{questions.length - answeredCount - skippedCount}</div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unseen</span>
            </div>
         </div>
      </header>

      <Tabs defaultValue="grid" className="flex-1 flex flex-col overflow-hidden">
         <div className="px-6 py-4 bg-white border-b border-slate-100">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1">
               <TabsTrigger value="grid" className="rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Grid View</TabsTrigger>
               <TabsTrigger value="list" className="rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">List View</TabsTrigger>
            </TabsList>
         </div>

         <ScrollArea className="flex-1">
            <TabsContent value="grid" className="p-6 m-0">
               <div className="grid grid-cols-5 gap-3">
                  {questions.map((q, i) => {
                    const ans = answers[q.id];
                    const isCurrent = current === i;
                    const status = ans?.status || 'NOT_VISITED';

                    let styles = "bg-white text-slate-300 border-slate-200 hover:border-slate-400";
                    if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/10";
                    if (status === 'MARKED_FOR_REVIEW') styles = "bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-500/10";
                    if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-white border-2 shadow-lg shadow-purple-500/20";
                    if (status === 'VISITED' && ans?.selectedOption === null) styles = "bg-red-500 text-white border-red-600 shadow-md";

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrent(i)}
                        className={cn(
                          "h-10 w-full rounded-xl font-black text-[11px] transition-all border flex items-center justify-center relative",
                          styles,
                          isCurrent && "ring-4 ring-blue-600/10 border-blue-600 z-10 scale-105"
                        )}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
               </div>
            </TabsContent>

            <TabsContent value="list" className="p-4 m-0 space-y-2">
               {questions.map((q, i) => (
                 <div 
                   key={q.id} 
                   onClick={() => setCurrent(i)}
                   className={cn(
                   "p-3 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start group",
                   current === i ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200"
                 )}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0",
                      current === i ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-100 text-slate-400"
                    )}>
                       {i+1}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                       <p className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight uppercase">
                          {activeLanguage === 'punjabi' ? q.questionPa : q.questionEn}
                       </p>
                       <div className="flex gap-2">
                          <Badge variant="outline" className="border-slate-200 text-slate-400 text-[7px] font-black uppercase px-1">{q.subject}</Badge>
                          {answers[q.id]?.selectedOption !== null && <CheckCircle2 size={10} className="text-emerald-500 mt-0.5" />}
                       </div>
                    </div>
                 </div>
               ))}
            </TabsContent>
         </ScrollArea>
      </Tabs>

      <footer className="p-6 bg-slate-50 border-t border-slate-200">
         <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.4em] text-center">Infrastructure by Arsh Grewal</p>
      </footer>
    </div>
  );
}
