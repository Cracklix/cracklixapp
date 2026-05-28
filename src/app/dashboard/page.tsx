'use client';

import { useAuth } from '@/lib/auth-context';
import HeroCard from '@/components/dashboard/hero-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import NotificationPanel from '@/components/notification-panel';
import LiveActivity from '@/components/live-activity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Trophy, BrainCircuit, ArrowRight, Sparkles, Beaker, Mic, Camera, FileDown } from 'lucide-react';
import DailyQuiz from '@/components/daily-quiz';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-24">
        {profile && (
          <HeroCard
            name={profile.name}
            streak={profile.streak}
            xp={profile.xp}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* AI Lab Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-[40px] overflow-hidden border-none bg-gradient-to-br from-primary/20 via-accent/10 to-transparent relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BrainCircuit size={160} />
                </div>
                <CardHeader className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-primary w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">AI Power Tools</span>
                  </div>
                  <CardTitle className="text-2xl font-bold leading-tight">
                    Next-Gen AI Lab
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    OCR, Voice Assistant, and PDF synthesizers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <Link href="/ai-lab">
                    <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold group">
                      Open Lab
                      <Beaker className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: Camera, label: "OCR", href: "/ai-lab" },
                   { icon: Mic, label: "Voice", href: "/ai-lab" },
                   { icon: FileDown, label: "PDF", href: "/ai-lab" },
                   { icon: Target, label: "Planner", href: "/ai" },
                 ].map((tool, i) => (
                   <Link key={i} href={tool.href}>
                     <motion.div 
                       whileHover={{ scale: 1.05 }}
                       className="h-full p-4 rounded-3xl bg-secondary/50 border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-secondary transition-colors"
                     >
                        <tool.icon className="w-6 h-6 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">{tool.label}</span>
                     </motion.div>
                   </Link>
                 ))}
              </div>
            </div>

            <DailyQuiz />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[32px] bg-card/60 backdrop-blur-md border-white/5 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Target className="w-5 h-5 text-primary" />
                    Daily Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-muted-foreground">
                    You're on fire! Complete <span className="text-white font-bold">2 full-length mocks</span> today to hit your target.
                  </p>
                  <div className="mt-6 h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] bg-card/60 backdrop-blur-md border-white/5 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Trophy className="w-5 h-5 text-accent" />
                    Punjab State Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">#152</span>
                    <span className="text-accent text-sm font-bold">↑ 12 positions</span>
                  </div>
                  <p className="text-muted-foreground mt-4 text-sm">
                    Top 1% in General Awareness and Punjabi Literature.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-8">
            <NotificationPanel />
            <LiveActivity />
          </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}