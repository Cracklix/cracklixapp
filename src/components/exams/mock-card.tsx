'use client';

import { MockTest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Target, 
  ChevronRight, 
  Users,
  AlertCircle,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/lib/auth-context';

interface MockCardProps {
  mock: MockTest;
}

/**
 * PRODUCTION MOCK CARD
 * Corrected Access Logic: IF mock.accessType === "free" THEN unlock for everyone.
 */
export default function MockCard({ mock }: MockCardProps) {
  const { user, profile } = useAuth();
  const { isPremium } = usePremium(user?.uid);
  
  // Admin universal bypass for QA
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || user?.email === 'arshdeepgrewal1122@gmail.com';
  
  // LOGIC FIX: Check accessType FIRST. 
  // If explicitly 'free', isLocked is ALWAYS false.
  const isLocked = !isAdmin && mock.accessType !== 'free' && !isPremium;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Card className={cn(
        "rounded-[32px] bg-zinc-900/40 border-white/5 overflow-hidden relative h-full flex flex-col transition-all duration-300",
        "hover:bg-zinc-900 hover:border-primary/30",
        isLocked && "grayscale-[0.2] opacity-80"
      )}>
        {/* Header: Identity */}
        <div className="p-6 pb-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                  !isLocked ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-500"
                )}>
                   {isLocked ? <Lock size={18} /> : <Target size={20} />}
                </div>
                <div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{mock.exam}</p>
                   <h3 className="text-lg font-black leading-tight text-white group-hover:text-primary transition-colors line-clamp-1">
                      {mock.title}
                   </h3>
                </div>
             </div>
             <div className="flex flex-col items-end gap-1.5">
                {mock.accessType === 'pass_plus' ? (
                  <Badge className="bg-primary text-white border-none font-black text-[8px] px-2 py-0.5 uppercase tracking-widest shadow-lg shadow-primary/20">PASS+</Badge>
                ) : mock.accessType === 'premium' ? (
                  <Badge className="bg-amber-500 text-black border-none font-black text-[8px] px-2 py-0.5 uppercase tracking-widest shadow-lg shadow-amber-500/20">PREMIUM</Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 font-black text-[8px] px-2 py-0.5 uppercase">FREE HUB</Badge>
                )}
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isLocked ? "bg-zinc-700" : "bg-emerald-500")} />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                  {isLocked ? 'Locked' : 'Available Now'}
                </span>
             </div>
             <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">•</span>
             <div className="flex items-center gap-1.5">
                <Users size={10} className="text-zinc-600" />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Aspirant Favorite</span>
             </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="p-6 flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
             <div className="space-y-0.5">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Questions</p>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-zinc-200">{mock.totalQuestions || 0} Artifacts</span>
                </div>
             </div>
             <div className="space-y-0.5">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Duration</p>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-zinc-200">{mock.duration} Minutes</span>
                </div>
             </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/50 border border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-red-500/70" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Negative: -{mock.negativeMarking}</span>
             </div>
             <Badge variant="outline" className="border-white/5 text-[9px] font-black text-zinc-600 px-2 uppercase">{mock.difficulty || 'mixed'}</Badge>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-0">
           <Link href={isLocked ? '/pass' : `/mocks/${mock.id}`} className="block">
              <Button className={cn(
                "w-full h-12 rounded-xl text-xs font-black transition-all group/btn shadow-xl",
                !isLocked ? "bg-primary hover:bg-primary/90 blue-glow" : "bg-zinc-800 text-zinc-500 border border-white/5"
              )}>
                 {isLocked ? (
                   <>
                     <Lock className="mr-2 w-3.5 h-3.5" /> UNLOCK WITH PASS+
                   </>
                 ) : (
                   <>
                     START SIMULATION
                     <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                   </>
                 )}
              </Button>
           </Link>
        </div>
      </Card>
    </motion.div>
  );
}