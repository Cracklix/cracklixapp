
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Flame, 
  Trophy, 
  Clock, 
  Play, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const performanceData = [
  { name: 'Mon', score: 65, avg: 60 },
  { name: 'Tue', score: 72, avg: 62 },
  { name: 'Wed', score: 68, avg: 63 },
  { name: 'Thu', score: 85, avg: 64 },
  { name: 'Fri', score: 78, avg: 65 },
  { name: 'Sat', score: 92, avg: 66 },
  { name: 'Sun', score: 88, avg: 67 },
];

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold text-white">Welcome back, {profile?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Your performance is looking 12% better than last week.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/exams">
              <Button className="rounded-2xl bg-primary h-12 px-6 group">
                <Play className="mr-2 w-4 h-4 fill-current" />
                Start Exam
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-[32px] cracklix-glass border-white/5 relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap className="text-primary w-6 h-6 fill-current" />
                </div>
                <Badge className="bg-primary/5 text-primary border-primary/20">+150 Today</Badge>
              </div>
              <p className="text-muted-foreground text-sm font-medium">XP</p>
              <h3 className="text-3xl font-bold mt-1 text-white">{profile?.xp || 0} <span className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Points</span></h3>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20" />
          </Card>

          <Card className="rounded-[32px] cracklix-glass border-white/5 relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <Flame className="text-orange-500 w-6 h-6 fill-current" />
                </div>
                <Badge className="bg-orange-500/5 text-orange-500 border-orange-500/20">Active</Badge>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Streak</p>
              <h3 className="text-3xl font-bold mt-1 text-white">{profile?.streak || 0} <span className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Days</span></h3>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500/20" />
          </Card>

          <Card className="rounded-[32px] cracklix-glass border-white/5 relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Trophy className="text-accent w-6 h-6" />
                </div>
                <Badge className="bg-accent/5 text-accent border-accent/20">Global Rank</Badge>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Global Ranking</p>
              <h3 className="text-3xl font-bold mt-1 text-white">#1,402 <span className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Top 5%</span></h3>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-accent/20" />
          </Card>

          <Card className="rounded-[32px] cracklix-glass border-white/5 relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="text-blue-500 w-6 h-6" />
                </div>
                <Badge className="bg-blue-500/5 text-blue-500 border-blue-500/20">Weekly</Badge>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Study Time</p>
              <h3 className="text-3xl font-bold mt-1 text-white">12.5 <span className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Hours</span></h3>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/20" />
          </Card>
        </div>

        {/* Middle Section: Chart and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[32px] cracklix-glass border-white/5 overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white">Performance Analytics</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Weekly score progression against community average.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">Last 7 Days</Button>
            </CardHeader>
            <CardContent className="p-8 pt-0 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1E2228', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] cracklix-glass border-white/5">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold text-white">Skill Mastery</CardTitle>
              <p className="text-sm text-muted-foreground">Topics requiring your attention.</p>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              {[
                { label: 'Quantum Physics', value: 85, color: 'bg-primary' },
                { label: 'Organic Chemistry', value: 42, color: 'bg-destructive' },
                { label: 'Advanced Calculus', value: 68, color: 'bg-accent' },
                { label: 'Molecular Biology', value: 91, color: 'bg-green-500' }
              ].map((skill, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-white">
                    <span>{skill.label}</span>
                    <span className="text-muted-foreground">{skill.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      className={cn("h-full", skill.color)}
                    />
                  </div>
                </div>
              ))}
              
              <div className="pt-4">
                <Link href="/coach">
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-primary/20 text-primary hover:bg-primary/5">
                    Consult AI Performance Coach
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
