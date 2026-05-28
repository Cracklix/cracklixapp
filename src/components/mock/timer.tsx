
'use client';

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number; // in minutes
  onFinish: () => void;
}

export default function Timer({
  duration,
  onFinish,
}: TimerProps) {
  const [time, setTime] = useState(duration * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onFinish]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const isCritical = time < 300; // 5 minutes left

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl font-mono border transition-all duration-500 shadow-lg",
      isCritical 
        ? "bg-destructive/10 border-destructive/30 text-destructive animate-pulse scale-105" 
        : "bg-white/[0.02] border-white/10 text-zinc-300"
    )}>
      {isCritical ? <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />}
      <span className="text-sm md:text-xl font-black tracking-tighter tabular-nums">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
