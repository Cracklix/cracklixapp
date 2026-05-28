
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Flame, TrendingUp, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

const leaderboardData = [
  { rank: 1, name: 'Alex Rivers', xp: 12450, streak: 45, change: 'up' },
  { rank: 2, name: 'Sarah Chen', xp: 11200, streak: 32, change: 'same' },
  { rank: 3, name: 'Marcus Thorne', xp: 10850, streak: 56, change: 'down' },
  { rank: 4, name: 'Elena Vance', xp: 9400, streak: 12, change: 'up' },
  { rank: 5, name: 'Jordan Hayes', xp: 8900, streak: 24, change: 'up' },
  { rank: 6, name: 'Sam Taylor', xp: 8100, streak: 15, change: 'down' },
  { rank: 7, name: 'Mia Wong', xp: 7500, streak: 21, change: 'same' },
  { rank: 8, name: 'Lucas Gray', xp: 7200, streak: 8, change: 'up' },
];

export default function LeaderboardPage() {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold">Global Rankings</h1>
            <p className="text-muted-foreground mt-2">Compete with the top performers across the Cracklix ecosystem.</p>
          </div>
          <div className="flex items-center bg-secondary/50 rounded-2xl px-4 h-12 border border-white/5 w-full md:w-64">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <Input className="bg-transparent border-none outline-none text-sm p-0 h-full" placeholder="Search students..." />
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-8">
          {/* Rank 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="order-2 md:order-1">
            <Card className="rounded-[32px] cracklix-glass pt-12 pb-8 px-6 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 rounded-full border-4 border-slate-300 relative">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={`https://picsum.photos/seed/sarah/200`} />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-800 font-bold text-xs shadow-lg">2</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mt-2">Sarah Chen</h3>
              <p className="text-primary font-bold text-lg">11,200 XP</p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                <Flame className="w-3 h-3 text-orange-500 fill-current" />
                32 Day Streak
              </div>
            </Card>
          </motion.div>

          {/* Rank 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="order-1 md:order-2">
            <Card className="rounded-[32px] cracklix-glass border-primary/20 bg-primary/5 pt-16 pb-10 px-8 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-primary relative">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={`https://picsum.photos/seed/alex/200`} />
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mt-2">Alex Rivers</h3>
              <p className="text-primary font-bold text-2xl">12,450 XP</p>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                <Flame className="w-4 h-4 text-orange-500 fill-current" />
                45 Day Streak
              </div>
              <div className="mt-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] font-bold">Supreme Champion</Badge>
              </div>
            </Card>
          </motion.div>

          {/* Rank 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="order-3 md:order-3">
            <Card className="rounded-[32px] cracklix-glass pt-12 pb-8 px-6 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 rounded-full border-4 border-amber-600 relative">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={`https://picsum.photos/seed/marcus/200`} />
                    <AvatarFallback>MT</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">3</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mt-2">Marcus Thorne</h3>
              <p className="text-primary font-bold text-lg">10,850 XP</p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                <Flame className="w-3 h-3 text-orange-500 fill-current" />
                56 Day Streak
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Table List */}
        <Card className="rounded-[32px] cracklix-glass border-white/5 overflow-hidden">
          <div className="p-4 space-y-1">
            {leaderboardData.slice(3).map((student, i) => (
              <motion.div 
                key={student.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground font-mono w-6">{student.rank}</span>
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={`https://picsum.photos/seed/${student.name}/200`} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold">{student.name}</h4>
                    <p className="text-xs text-muted-foreground">{student.streak} Day Streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-bold text-primary">{student.xp.toLocaleString()} XP</p>
                    <div className="flex items-center justify-end gap-1">
                      {student.change === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                      <span className="text-[10px] uppercase text-muted-foreground tracking-widest">{student.change}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Current User Fixed Row */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-6">
                  <span className="text-primary font-mono w-6">1402</span>
                  <Avatar className="w-10 h-10 border-2 border-primary">
                    <AvatarImage src={`https://picsum.photos/seed/${profile?.uid}/200`} />
                    <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold">{profile?.name} (You)</h4>
                    <p className="text-xs text-primary/70">{profile?.streak} Day Streak 🔥</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{profile?.xp || 0} XP</p>
                  <p className="text-[10px] uppercase text-primary/70 tracking-widest">Keep going!</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
