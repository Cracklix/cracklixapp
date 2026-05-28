'use client';

import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';

export default function HeroCard({ name, streak, xp }: { name: string; streak: number; xp: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a] border border-white/5 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-between"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl" />
      
      <div className="relative">
        <h1 className="text-3xl font-black tracking-tight leading-tight">
          WELCOME BACK,<br /> {name.toUpperCase()}
        </h1>
        <p className="mt-3 text-zinc-500 text-sm font-bold uppercase tracking-widest">
          Punjab Recruitment Cycle: ACTIVE
        </p>
      </div>

      <div className="flex gap-10 mt-8 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Flame className="w-6 h-6 text-orange-500 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Streak</p>
            <h2 className="text-2xl font-black">{streak} Days</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Zap className="w-6 h-6 text-primary fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">XP Status</p>
            <h2 className="text-2xl font-black">{xp.toLocaleString()}</h2>
          </div>
        </div>
      </div>
    </motion.div>
  );
}