'use client';

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number; // in minutes
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
  
  // High-visibility state detection
  const isWarning = timeLeft <= 600 && timeLeft > 60; // Last 10 mins
  const isCritical = timeLeft <= 60; // Last 1 min

  return (
    <div className={cn(
      "flex items-center gap-3 px-5 py-2 rounded-2xl font-mono border transition-all duration-500",
      isCritical 
        ? "bg-red-600 border-red-400 text-white animate-pulse scale-110 shadow-lg shadow-red-900/40" 
        : isWarning
        ? "bg-orange-500/20 border-orange-500 text-orange-500"
        : "bg-white/10 border-white/10 text-white"
    )}>
      {isCritical || isWarning ? <AlertCircle size={16} /> : <Clock size={16} className="text-primary" />}
      <span className="text-xl font-black tracking-tighter tabular-nums">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
