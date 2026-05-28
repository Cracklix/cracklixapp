
"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/services/leaderboard";
import Navbar from "@/components/navbar";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderboard();
        setLeaders(data);
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        <div>
          <h1 className="font-headline text-4xl font-bold">Punjab Rankings</h1>
          <p className="text-muted-foreground mt-2">
            Real-time standings of top aspirants across the state.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-card/40 animate-pulse rounded-[24px] border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {leaders.length > 0 ? (
              leaders.map((leader, index) => (
                <motion.div
                  key={leader.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card/60 backdrop-blur-md p-5 rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-card/80 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 relative">
                      #{index + 1}
                      {index === 0 && <Trophy className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 drop-shadow-md" />}
                    </div>

                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/10">
                        <AvatarImage src={`https://picsum.photos/seed/${leader.userId}/200`} />
                        <AvatarFallback>{leader.name?.charAt(0) || "S"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold">{leader.name}</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          {leader.exam || "Punjab Govt Aspirant"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end">
                      <div className="flex items-center gap-1 text-orange-400 font-bold">
                        <Flame className="w-4 h-4 fill-current" />
                        {leader.streak || 0}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Day Streak</p>
                    </div>

                    <div className="text-right">
                      <h3 className="text-2xl font-black text-primary">{leader.xp?.toLocaleString() || 0} XP</h3>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-accent font-bold uppercase tracking-widest">
                        <TrendingUp className="w-3 h-3" />
                        {leader.accuracy || 0}% Acc
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center rounded-[32px] border border-dashed border-white/10">
                <p className="text-muted-foreground">The competitive season is just starting. Join a mock to get ranked!</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
