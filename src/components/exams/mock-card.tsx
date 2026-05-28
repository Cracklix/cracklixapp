'use client';

import { MockTest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Target, 
  ChevronRight, 
  Users,
  Timer,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/lib/auth-context';

interface MockCardProps {
  mock: MockTest;
}

export default function MockCard({ mock }: MockCardProps) {
  const { user, profile } = useAuth();
  const { isPremium } = usePremium(user?.uid);
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || user?.email === 'arshdeepgrewal1122@gmail.com';
  const isLocked = !isAdmin && mock.accessType !== 'free' && !isPremium;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className={cn(
        "rounded-2xl bg-zinc-900/40 border-white/5 overflow-hidden flex flex-col h-full transition-all duration-200",
        "hover:border-primary/40 hover:bg-zinc-900 shadow-sm",
        isLocked && "opacity-90"
      )}>
        {/* Card Header */}
        <div className="p-4 pb-3 border-b border-white/5 bg-white/[0.01] relative">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">
                {mock.exam}
              </span>
              <h3 className="text-sm font-bold text-white line-clamp-1">
                {mock.title}
              </h3>
            </div>
            {mock.accessType === 'pass_plus' ? (
              <Badge className="bg-blue-600 text-white border-none text-[8px] px-2 py-0 font-black uppercase">PASS+</Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[8px] px-2 py-0 uppercase font-black">FREE</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-[9px] font-bold text-zinc-500 uppercase tracking-tight">
             <span className="flex items-center gap-1">
               <Users size={10} className="text-zinc-600" />
               {mock.attemptCount || 0} Attempts
             </span>
             <span>•</span>
             <span className={cn(isLocked ? "text-zinc-600" : "text-emerald-500")}>
               {isLocked ? 'Locked' : 'Available'}
             </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="p-4 py-5 flex items-center justify-between flex-1">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                 <FileText size={14} className="text-zinc-400" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">Questions</p>
                 <p className="text-xs font-bold text-zinc-200">{mock.totalQuestions || 0} Qs</p>
              </div>
           </div>
           
           <div className="h-6 w-px bg-white/5" />

           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                 <Timer size={14} className="text-zinc-400" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">Duration</p>
                 <p className="text-xs font-bold text-zinc-200">{mock.duration} Mins</p>
              </div>
           </div>
        </div>

        {/* Action Button */}
        <div className="p-4 pt-0">
          <Link href={isLocked ? '/pass' : `/mocks/${mock.id}`} className="block">
            <Button className={cn(
              "w-full h-10 rounded-xl text-[10px] font-black tracking-widest transition-all",
              !isLocked ? "bg-primary hover:bg-primary/90 blue-glow" : "bg-zinc-800 text-zinc-500"
            )}>
              {isLocked ? (
                <>
                  <Lock size={12} className="mr-2" /> UNLOCK WITH PASS+
                </>
              ) : (
                <>
                  START SIMULATION
                  <ChevronRight size={14} className="ml-1" />
                </>
              )}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}