"use client";

import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Timer, Trophy, Users, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LiveRankings from "@/components/live-rankings";

export default function LiveTestPage({ params }: { params: Promise<{ id: string }> }) {
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isTabActive, setIsActive] = useState(true);
  const unwrappedParams = React.use(params);
  const testId = unwrappedParams.id;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
      } else {
        setIsActive(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white border-none px-3 py-1 animate-pulse font-black uppercase tracking-widest text-[10px]">
                LIVE EVENT
              </Badge>
              <h1 className="font-headline text-4xl font-bold">Sunday Mega Test #12</h1>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              1,240 Aspirants currently competing
            </p>
          </div>

          <div className="bg-zinc-900 border border-white/5 p-4 rounded-3xl flex items-center gap-6 shadow-2xl">
            <div className="flex flex-col items-center px-4 border-r border-white/5">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Time Remaining</span>
              <div className="text-3xl font-black font-mono text-primary tracking-tighter">
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="flex items-center gap-3 pr-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="text-primary w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Prize Pool</p>
                <p className="font-black text-xl">500 XP</p>
              </div>
            </div>
          </div>
        </div>

        {!isTabActive && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive"
          >
            <ShieldAlert className="w-5 h-5" />
            <p className="text-sm font-bold">Anti-Cheat Alert: Tab switching detected. This incident has been logged.</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Competition Arena */}
          <div className="lg:col-span-8 space-y-8">
             <Card className="rounded-[40px] cracklix-glass border-white/5 min-h-[500px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[120px]" />
                </div>
                
                <div className="w-24 h-24 rounded-[40px] bg-zinc-800 flex items-center justify-center mb-8">
                  <Trophy className="text-zinc-500 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Are you ready to dominate?</h2>
                <p className="text-muted-foreground max-w-md mb-10">
                  The competition has already started. Join now to earn XP and secure your place in the Punjab State Rankings.
                </p>
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black blue-glow">
                  Enter Arena
                </Button>
             </Card>
          </div>

          {/* Sidebar Rankings */}
          <div className="lg:col-span-4">
            <LiveRankings />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}