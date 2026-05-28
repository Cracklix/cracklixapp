'use client';

import { useEffect, useState, useRef } from "react";
import { Clock, AlertCircle, Timer as TimerIcon, Pause as PauseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number; // in minutes
  onFinish: () => void;
  paused?: boolean;
}

export default function Timer({
  duration,
  onFinish,
  paused = false
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, onFinish]);

  // Sync with prop duration if it changes externally (e.g. from resume)
  useEffect(() => {
    setTimeLeft(Math.floor(duration * 60));
  }, [duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft <= 300 && timeLeft > 60; // 5 mins left
  const isCritical = timeLeft <= 60; // 1 min left

  return (
    <div className={cn(
      "flex items-center gap-4 px-6 py-2 rounded-2xl font-mono border transition-all duration-700 h-10",
      paused 
        ? "bg-slate-700 border-slate-600 text-slate-400 opacity-60" 
        : isCritical 
        ? "bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
        : isWarning
        ? "bg-orange-500 border-orange-400 text-white"
        : "bg-white/10 border-white/10 text-white"
    )}>
      {paused ? (
         <PauseIcon size={14} className="animate-pulse" />
      ) : isCritical || isWarning ? (
         <AlertCircle size={14} className="animate-bounce" />
      ) : (
         <TimerIcon size={14} className="text-primary fill-primary/20" />
      )}
      
      <div className="flex flex-col">
         <span className="text-xl font-black tracking-tight tabular-nums leading-none">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
         </span>
         {!paused && !isCritical && !isWarning && (
            <span className="text-[6px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">Time Remaining</span>
         )}
      </div>
    </div>
  );
}
