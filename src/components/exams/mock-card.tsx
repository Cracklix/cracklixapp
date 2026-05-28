'use client';

import { MockTest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  FileText, 
  Trophy, 
  ChevronRight, 
  ShieldAlert, 
  Zap,
  Target,
  Languages,
  Users,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MockCardProps {
  mock: MockTest;
}

export default function MockCard({ mock }: MockCardProps) {
  const isPremium = mock.premium;
  const totalMarks = mock.totalQuestions * (mock.marksPerQuestion || 1);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className={cn(
        "rounded-[32px] bg-zinc-900/40 border-white/5 overflow-hidden relative h-full flex flex-col transition-all duration-300",
        "hover:bg-zinc-900 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
        isPremium && "border-primary/10 bg-primary/[0.01]"
      )}>
        {/* Top Section: Exam Branding & Badges */}
        <div className="p-6 pb-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                  isPremium ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-500"
                )}>
                   <Target size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{mock.exam}</p>
                   <h3 className="text-lg font-black leading-tight text-white group-hover:text-primary transition-colors line-clamp-1">
                      {mock.title}
                   </h3>
                </div>
             </div>
             <div className="flex flex-col items-end gap-1.5">
                {isPremium ? (
                  <Badge className="bg-primary text-white border-none font-black text-[8px] px-2 py-0.5 uppercase tracking-widest">PASS+</Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 font-black text-[8px] px-2 py-0.5 uppercase">FREE</Badge>
                )}
                <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-black uppercase">{mock.type}</Badge>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Now</span>
             </div>
             <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">•</span>
             <div className="flex items-center gap-1.5">
                <Users size={10} className="text-zinc-600" />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">1.2k Attempted</span>
             </div>
          </div>
        </div>

        {/* Middle Section: CBT Specs Grid */}
        <div className="p-6 flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-y-5 gap-x-8">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Questions</p>
                <div className="flex items-center gap-2">
                   <FileText size={14} className="text-zinc-400" />
                   <span className="text-sm font-bold text-zinc-200">{mock.totalQuestions} Artifacts</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Marks</p>
                <div className="flex items-center gap-2">
                   <Trophy size={14} className="text-zinc-400" />
                   <span className="text-sm font-bold text-zinc-200">{totalMarks} Marks</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Duration</p>
                <div className="flex items-center gap-2">
                   <Clock size={14} className="text-zinc-400" />
                   <span className="text-sm font-bold text-zinc-200">{mock.duration} Mins</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Language</p>
                <div className="flex items-center gap-2">
                   <Languages size={14} className="text-zinc-400" />
                   <span className="text-sm font-bold text-zinc-200">EN + PA + HI</span>
                </div>
             </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/50 border border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-red-500/70" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Penalty: -{mock.negativeMarking} / wrong</span>
             </div>
             <Badge variant="outline" className="border-white/5 text-[9px] font-black text-zinc-600 px-2">{mock.difficulty?.toUpperCase()}</Badge>
          </div>
        </div>

        {/* Bottom Section: Strategic CTAs */}
        <div className="p-6 pt-0 space-y-3">
           <Link href={`/mocks/${mock.id}`} className="block">
              <Button className={cn(
                "w-full h-14 rounded-2xl text-base font-black transition-all group/btn shadow-xl",
                isPremium ? "bg-primary hover:bg-primary/90 blue-glow" : "bg-white text-black hover:bg-zinc-200"
              )}>
                 BEGIN SESSION
                 <ChevronRight className="ml-1 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
              </Button>
           </Link>
           
           <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10">
                 Syllabus
              </Button>
              <Button variant="ghost" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10">
                 Instructions
              </Button>
           </div>
        </div>
      </Card>
    </motion.div>
  );
}