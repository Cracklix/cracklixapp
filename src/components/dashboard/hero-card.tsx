
'use client';

import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';

export default function HeroCard({ name, streak, xp }: { name: string; streak: number; xp: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary to-accent p-8 rounded-[32px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {name.split(' ')[0]}
      </h1>

      <p className="mt-2 text-white/80 font-medium">
        Continue your Punjab Govt exam preparation.
      </p>

      <div className="flex gap-8 mt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-300 fill-current" />
          </div>
          <div>
            <p className="text-xs text-white/70 uppercase tracking-widest font-bold">Streak</p>
            <h2 className="text-2xl font-bold">{streak} Days</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-yellow-300 fill-current" />
          </div>
          <div>
            <p className="text-xs text-white/70 uppercase tracking-widest font-bold">XP</p>
            <h2 className="text-2xl font-bold">{xp}</h2>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
