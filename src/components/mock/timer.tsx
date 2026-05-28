
'use client';

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
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
      "flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xl font-bold border transition-colors",
      isCritical 
        ? "bg-destructive/10 border-destructive text-destructive animate-pulse" 
        : "bg-primary/10 border-primary/20 text-primary"
    )}>
      <Clock className="w-5 h-5" />
      <span>
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
