'use client';

import { cn } from "@/lib/utils";
import { AttemptAnswer, Question } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, LayoutGrid, List, CheckCircle, Info, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PaletteDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  current: number;
  answers: Record<string, AttemptAnswer>;
  setCurrent: (index: number) => void;
  mockTitle: string;
}

export default function PaletteDrawer({
  open,
  onClose,
  questions,
  current,
  answers,
  setCurrent,
  mockTitle
}: PaletteDrawerProps) {
  const attemptedCount = Object.values(answers).filter(a => a.status === 'ANSWERED' || a.status === 'ANSWERED_AND_MARKED').length;
  const reviewCount = Object.values(answers).filter(a => a.status === 'MARKED_FOR_REVIEW' || a.status === 'ANSWERED_AND_MARKED').length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full md:w-[360px] bg-white text-slate-900 z-[100] shadow-2xl flex flex-col"
    >
      <header className="h-[60px] px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#1e293b] text-white">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
               <LayoutGrid size={16} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-tight">Question Palette</h3>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 text-white/60 hover:text-white hover:bg-white/10">
            <X size={20} />
         </Button>
      </header>

      <Tabs defaultValue="grid" className="flex-1 flex flex-col overflow-hidden">
         <div className="p-4 bg-slate-50 border-b border-slate-100">
           <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-10 w-full">
              <TabsTrigger value="grid" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                 <LayoutGrid size={12} className="mr-2" /> Grid View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                 <List size={12} className="mr-2" /> List View
              </TabsTrigger>
           </TabsList>
         </div>

         <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
            <TabsContent value="grid" className="m-0 space-y-8">
               {/* Stats Summary */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                     <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Answered</p>
                     <h4 className="text-xl font-black text-emerald-700">{attemptedCount}</h4>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                     <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Review</p>
                     <h4 className="text-xl font-black text-blue-700">{reviewCount}</h4>
                  </div>
               </div>

               {/* Legend */}
               <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Legend</h4>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold uppercase text-zinc-400">Answered</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        <span className="text-[9px] font-bold uppercase text-zinc-400">Review</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-bold uppercase text-zinc-400">Unvisited</span>
                     </div>
                  </div>
               </div>

               {/* Grid */}
               <div className="grid grid-cols-5 gap-2.5">
                  {questions.map((q, i) => {
                    const ans = answers[q.id];
                    const isCurrent = current === i;
                    const status = ans?.status || 'NOT_VISITED';

                    let styles = "bg-white text-slate-400 border-slate-200 hover:border-slate-300";
                    if (status === 'ANSWERED') styles = "bg-emerald-500 text-white border-emerald-600 shadow-md";
                    if (status === 'MARKED_FOR_REVIEW') styles = "bg-blue-600 text-white border-blue-700 shadow-md";
                    if (status === 'ANSWERED_AND_MARKED') styles = "bg-purple-600 text-white border-purple-700";

                    return (
                      <button
                        key={q.id}
                        onClick={() => { setCurrent(i); onClose(); }}
                        className={cn(
                          "h-11 w-full rounded-xl font-bold text-xs transition-all border flex items-center justify-center",
                          styles,
                          isCurrent && "ring-2 ring-blue-600 ring-offset-2 scale-110 z-10"
                        )}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
               </div>
            </TabsContent>

            <TabsContent value="list" className="m-0 space-y-2">
               {questions.map((q, i) => (
                 <button 
                  key={q.id}
                  onClick={() => { setCurrent(i); onClose(); }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group",
                    current === i ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:bg-slate-50"
                  )}
                 >
                    <span className="text-xs font-black text-slate-400 w-6">#{i+1}</span>
                    <p className="text-xs font-bold text-slate-700 line-clamp-1 flex-1">
                      {q.en?.question || q.pa?.question || "Question Payload Missing"}
                    </p>
                    {answers[q.id]?.status === 'ANSWERED' && <CheckCircle size={14} className="text-emerald-500" />}
                 </button>
               ))}
            </TabsContent>
         </div>
      </Tabs>

      <footer className="p-6 bg-slate-50 border-t border-slate-200 mt-auto">
         <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-[#1e293b] hover:bg-black text-white font-bold text-xs uppercase tracking-widest shadow-xl">
            CONTINUE TEST
         </Button>
      </footer>
    </motion.div>
  );
}