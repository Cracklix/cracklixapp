'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/app/lib/i18n-context';
import HeroCard from '@/components/dashboard/hero-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, ChevronRight, Layers, Zap, ArrowRight, ShieldCheck, Star } from 'lucide-react';
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
  const { profile, user, loading } = useAuth();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // PUBLIC LANDING VIEW FOR UNAUTHENTICATED USERS
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-primary/30">
        <header className="fixed top-0 w-full z-[100] bg-black/50 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center blue-glow">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="font-headline text-2xl font-black tracking-tighter uppercase">CRACKLIX</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white">Access Terminal</Button>
              </Link>
              <Link href="/signup">
                <Button className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest shadow-xl blue-glow">
                  Enlist Now
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="pt-40 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.4em] shadow-sm animate-pulse">
                Punjab's #1 AI Exam Ecosystem
              </Badge>
              <h1 className="text-6xl md:text-[90px] font-black tracking-tighter uppercase leading-[0.85]">
                Dominate the <br />
                <span className="text-primary italic">Recruitment.</span>
              </h1>
              <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed mt-4">
                The elite preparation workstation for PSSSB, Police, and PPSC. Real CBT simulations with bilingual AI Mentorship.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <Button className="h-20 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-xl font-black blue-glow shadow-2xl group transition-all duration-300">
                  INITIALIZE ACCOUNT <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/exams">
                <Button variant="outline" className="h-20 px-12 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 text-xl font-black uppercase tracking-widest transition-all">
                  Browse Mocks
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">PSSSB Ready</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Star className="w-8 h-8 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">SI Elite</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Layers className="w-8 h-8 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">PPSC Pattern</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Trophy className="w-8 h-8 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">State Ranks</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

              <Suspense fallback={<div className="h-40 rounded-[32px] bg-zinc-900 animate-pulse" />}>
                <ReadinessPredictor />
              </Suspense>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Suspense fallback={<div className="h-40 rounded-[32px] bg-zinc-900 animate-pulse" />}>
                  <DailyQuiz />
                </Suspense>
                <Suspense fallback={<div className="h-40 rounded-[32px] bg-zinc-900 animate-pulse" />}>
                  <DailyTargets />
                </Suspense>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-10">
              <Suspense fallback={<div className="h-40 rounded-[32px] bg-zinc-900 animate-pulse" />}>
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
