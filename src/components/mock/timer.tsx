'use client';

import { useEffect, useState, useRef } from "react";
import { Clock, AlertCircle, Timer as TimerIcon } from "lucide-react";
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

  useEffect(() => {
    setTimeLeft(Math.floor(duration * 60));
  }, [duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isCritical = timeLeft <= 60;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-1.5 rounded-xl font-mono border transition-all h-9 shrink-0",
      isCritical 
        ? "bg-red-50 border-red-200 text-red-600 animate-pulse" 
        : "bg-slate-50 border-slate-100 text-slate-700"
    )}>
      {isCritical ? (
         <AlertCircle size={12} className="animate-bounce" />
      ) : (
         <TimerIcon size={12} className="text-blue-500" />
      )}
      <div className="flex items-baseline gap-1">
         <span className="text-base font-black tracking-tighter tabular-nums leading-none">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
         </span>
         <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">Left</span>
      </div>
    </div>
  );
}