'use client';

import { Suspense, lazy } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/app/lib/i18n-context';
import HeroCard from '@/components/dashboard/hero-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppErrorBoundary } from '@/components/error-boundary';
import { DEFAULT_SERIES } from '@/services/test-series';

const LiveActivity = lazy(() => import('@/components/live-activity'));
const DailyTargets = lazy(() => import('@/components/dashboard/daily-targets'));
const DailyQuiz = lazy(() => import('@/components/daily-quiz'));
const ReadinessPredictor = lazy(() => import('@/components/dashboard/readiness-predictor'));

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();

  return (
    <AppErrorBoundary>
      <AppLayout>
        <div className="space-y-10 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8">
              {profile && (
                <HeroCard
                  name={profile.name}
                  streak={profile.streak}
                  xp={profile.xp}
                />
              )}
            </div>

            <div className="lg:col-span-4">
              <Card className="rounded-[40px] bg-primary/10 border-primary/20 overflow-hidden h-full flex flex-col justify-between">
                <CardContent className="p-8 relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-1">{t('punjab_rank')}</p>
                      <h3 className="text-4xl font-black tracking-tighter">#842</h3>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">↑ Rising</Badge>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg blue-glow">
                      <Trophy className="text-white w-6 h-6" />
                    </div>
                  </div>
                  <div className="pt-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Preparation Readiness</p>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[72%]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Target Recruitment</h2>
                  <Link href="/exams" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-2 transition-all">View All <ChevronRight size={14} /></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DEFAULT_SERIES.map((series) => (
                    <Link key={series.id} href={`/test-series/${series.id}`}>
                      <Card className="rounded-[32px] bg-zinc-900/40 border-white/5 hover:border-primary/40 hover:bg-zinc-900 transition-all group overflow-hidden h-full">
                        <CardContent className="p-6 flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-white/5 group-hover:scale-105 transition-transform">
                            <img src={series.thumbnail} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black uppercase mb-1">{series.category}</Badge>
                            <h4 className="font-bold text-sm leading-tight text-white group-hover:text-primary transition-colors line-clamp-2 uppercase">{series.title}</h4>
                            <div className="flex items-center gap-3 mt-2 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                              <span>{series.totalTests} Tests</span>
                              <span>•</span>
                              <span className="text-emerald-500">{series.freeTests} Free</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-all" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              <Suspense fallback={<div>Loading...</div>}>
                <ReadinessPredictor />
              </Suspense>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Suspense fallback={<div>Loading...</div>}>
                  <DailyQuiz />
                </Suspense>
                <Suspense fallback={<div>Loading...</div>}>
                  <DailyTargets />
                </Suspense>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-10">
              <Suspense fallback={<div>Loading...</div>}>
                <div className="p-8 rounded-[40px] bg-gradient-to-br from-blue-600 to-primary border border-white/10 shadow-2xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Layers size={140} /></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Master Pass</h3>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Unlock 500+ Official Mocks</p>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <p className="text-sm font-medium text-white/90">Get unlimited access to PSSSB, Police, and PPSC Test Series for one year.</p>
                    <Link href="/pass">
                      <Button className="w-full h-12 rounded-xl bg-white text-black font-black uppercase tracking-widest shadow-xl">ACTIVATE PASS+</Button>
                    </Link>
                  </div>
                </div>
                <LiveActivity />
              </Suspense>
            </div>
          </div>
        </div>
        <Navbar />
      </AppLayout>
    </AppErrorBoundary>
  );
}
