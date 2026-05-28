'use client';

import { useEffect, useState } from "react";
import { Clock, AlertCircle, Timer as TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number;
  onFinish: () => void;
  expiresAt?: number;
}

export default function Timer({
  duration,
  onFinish,
  expiresAt,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    const calculateTime = () => {
      if (expiresAt) {
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        return remaining;
      }
      return duration * 60;
    };

    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, expiresAt, onFinish]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft <= 600 && timeLeft > 60;
  const isCritical = timeLeft <= 60;

  return (
    <div className={cn(
      "flex items-center gap-3 px-5 py-2 rounded-xl font-mono border transition-all duration-500",
      isCritical 
        ? "bg-red-600 border-red-400 text-white animate-pulse scale-105 shadow-lg shadow-red-900/40" 
        : isWarning
        ? "bg-orange-500 text-white border-orange-400"
        : "bg-white/10 border-white/10 text-white"
    )}>
      {isCritical || isWarning ? <AlertCircle size={14} /> : <TimerIcon size={14} className="text-primary-foreground opacity-60" />}
      <span className="text-xl font-black tracking-tight tabular-nums">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
