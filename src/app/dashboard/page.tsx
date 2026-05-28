'use client';

import { useAuth } from '@/lib/auth-context';
import HeroCard from '@/components/dashboard/hero-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import NotificationPanel from '@/components/notification-panel';
import LiveActivity from '@/components/live-activity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Trophy, BrainCircuit, ArrowRight, Sparkles } from 'lucide-react';
import DailyQuiz from '@/components/daily-quiz';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
            {/* AI Assistant Call-to-Action */}
            <Card className="rounded-[40px] overflow-hidden border-none bg-gradient-to-br from-primary/20 via-accent/10 to-transparent relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit size={160} />
              </div>
              <CardHeader className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-primary w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Premium Access Active</span>
                </div>
                <CardTitle className="text-3xl font-bold max-w-md leading-tight">
                  Stuck on a tricky Punjab History question?
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-sm">
                  Your AI Tutor is ready to explain concepts in simple Punjabi or English.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <Link href="/ai">
                  <Button className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold group">
                    Chat with AI Tutor
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

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
