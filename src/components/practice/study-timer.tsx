
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Brain, Coffee, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { trackProgress } from '@/services/daily-target';
import { useAuth } from '@/lib/auth-context';

export default function StudyTimer() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    if (mode === 'focus') {
      const minutes = 25;
      setTotalMinutes(prev => prev + minutes);
      if (user) trackProgress(user.uid, 'minutes', minutes);
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      setMode('focus');
      setTimeLeft(25 * 60);
    }
  };

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = mode === 'focus' ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'focus' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500'}`}>
            {mode === 'focus' ? <Brain size={20} /> : <Coffee size={20} />}
          </div>
          <div>
            <h3 className="font-bold">{mode === 'focus' ? 'Deep Work' : 'Refuel Break'}</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">25m Session</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary">
          <Zap size={10} className="mr-1 fill-current" />
          {totalMinutes}m Today
        </Badge>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-zinc-800"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="552.92"
            animate={{ strokeDashoffset: 552.92 - (552.92 * progress) / 100 }}
            className={mode === 'focus' ? 'text-primary' : 'text-green-500'}
          />
        </svg>
        <div className="absolute text-5xl font-black font-mono tracking-tighter">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <Button onClick={toggle} size="lg" className={`flex-1 h-14 rounded-2xl font-bold ${isActive ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-primary hover:bg-primary/90'}`}>
          {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isActive ? 'Pause' : 'Start Focus'}
        </Button>
        <Button onClick={reset} variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-white/10 hover:bg-white/5">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
