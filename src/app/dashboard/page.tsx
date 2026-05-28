
'use client';

import { useAuth } from '@/lib/auth-context';
import HeroCard from '@/components/dashboard/hero-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-24">
        {profile && (
          <HeroCard
            name={profile.name}
            streak={profile.streak}
            xp={profile.xp}
          />
        )}

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
      <Navbar />
    </AppLayout>
  );
}
