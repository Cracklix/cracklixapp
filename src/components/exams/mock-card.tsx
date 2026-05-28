
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
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MockCardProps {
  mock: MockTest;
}

export default function MockCard({ mock }: MockCardProps) {
  const isElite = mock.premium;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className={cn(
        "rounded-[48px] bg-zinc-900/40 border-white/5 p-10 overflow-hidden relative h-full flex flex-col justify-between transition-all duration-500",
        "hover:bg-zinc-900 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5",
        isElite && "border-primary/10 bg-primary/[0.02]"
      )}>
        {/* Glow Decor */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all" />

        <div className="space-y-8 relative z-10">
          <div className="flex justify-between items-start">
             <div className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110",
               isElite ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-500"
             )}>
                <Target size={28} />
             </div>
             <div className="flex flex-col items-end gap-2">
                {isElite && <Badge className="bg-primary text-white border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest">PASS+</Badge>}
                <Badge variant="outline" className="border-white/10 text-zinc-500 text-[9px] font-black uppercase">{mock.type}</Badge>
             </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{mock.exam}</p>
            <h3 className="text-2xl font-black leading-tight tracking-tight text-white group-hover:text-primary transition-colors">
               {mock.title}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Quantity</p>
                <div className="flex items-center gap-2">
                   <FileText size={14} className="text-zinc-400" />
                   <span className="text-sm font-bold text-zinc-300">{mock.totalQuestions} Qs</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Duration</p>
                <div className="flex items-center gap-2">
                   <Clock size={14} className="text-zinc-400" />
                   <span className="text-sm font-bold text-zinc-300">{mock.duration} Mins</span>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-12 space-y-4 relative z-10">
           <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-600 px-2 tracking-widest">
              <span>Penalty: -{mock.negativeMarking}</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE NOW</span>
           </div>
           
           <Link href={`/mocks/${mock.id}`} className="block">
              <Button className={cn(
                "w-full h-16 rounded-2xl text-lg font-black transition-all group/btn",
                isElite ? "bg-primary hover:bg-primary/90 blue-glow" : "bg-white text-black hover:bg-zinc-200"
              )}>
                 BEGIN SESSION
                 <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
              </Button>
           </Link>
        </div>
      </Card>
    </motion.div>
  );
}
