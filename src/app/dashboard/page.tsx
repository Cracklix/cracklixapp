
'use client';

import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/app/lib/i18n-context';
import HeroCard from '@/components/dashboard/hero-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import NotificationPanel from '@/components/notification-panel';
import LiveActivity from '@/components/live-activity';
import DailyTargets from '@/components/dashboard/daily-targets';
import StudyTimer from '@/components/practice/study-timer';
import DailyQuiz from '@/components/daily-quiz';
import InstallPrompt from '@/components/pwa/install-prompt';
import SupportTrigger from '@/components/support/support-trigger';
import ReadinessPredictor from '@/components/dashboard/readiness-predictor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Sparkles, Beaker, Mic, Camera, FileText, Target, BookOpen, TrendingUp, Zap, ChevronRight, Gift, Briefcase, Globe, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();

  return (
    <AppLayout>
      <div className="space-y-10 pb-24">
        {/* Punjab Welcome Section */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1 w-full">
             {profile && (
               <HeroCard
                 name={profile.name}
                 streak={profile.streak}
                 xp={profile.xp}
               />
             )}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[400px]"
          >
             <Card className="rounded-[40px] cracklix-glass overflow-hidden border-primary/20 bg-primary/5">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-1">{t('punjab_rank')}</p>
                      <h3 className="text-3xl font-black">#842</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center blue-glow">
                       <Globe className="text-white w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-zinc-500">Percentile</span>
                       <span className="text-white">92.4%</span>
                     </div>
                     <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-[92%] cyan-glow" />
                     </div>
                  </div>
                </CardContent>
             </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            
            <ReadinessPredictor />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <Card className="rounded-[40px] cracklix-glass overflow-hidden border-none relative group cursor-pointer h-64">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent group-hover:from-primary/30 transition-all duration-500" />
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <BrainCircuit size={240} />
                  </div>
                  <CardHeader className="p-8 relative">
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20 mb-4 px-3 py-1 font-black uppercase tracking-widest text-[10px]">PUNJAB CORE v4</Badge>
                    <CardTitle className="text-3xl font-black tracking-tight">{t('ai_command_center')}</CardTitle>
                    <CardDescription className="text-zinc-500 mt-2 font-medium">Bilingual AI Mentorship</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative">
                     <Link href="/ai-lab">
                       <Button size="sm" className="rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 font-black">Enter Arena <ChevronRight className="w-4 h-4 ml-1" /></Button>
                     </Link>
                  </CardContent>
               </Card>

               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t('jobs').toUpperCase(), icon: Briefcase, href: "/jobs", color: "text-emerald-400" },
                    { label: "COINS", icon: Gift, href: "/referral", color: "text-orange-400" },
                    { label: t('leaderboard').toUpperCase(), icon: Trophy, href: "/leaderboard", color: "text-red-400" },
                    { label: "MOCKS", icon: Sparkles, href: "/exams", color: "text-accent" },
                  ].map((tool, i) => (
                    <Link key={i} href={tool.href}>
                      <motion.div 
                        whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                        className="h-full p-6 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-4 transition-all"
                      >
                         <tool.icon className={cn("w-7 h-7", tool.color)} />
                         <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 text-center">{tool.label}</span>
                      </motion.div>
                    </Link>
                  ))}
               </div>
            </div>

            <DailyQuiz />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <DailyTargets />
              <Card className="rounded-[40px] cracklix-glass flex flex-col justify-between p-10 bg-accent/5">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 cyan-glow">
                    <BookOpen className="text-accent w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-black mb-3">Punjab<br />Mastery</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">Targeted preparation for PPSC & PSSSB board exams.</p>
                </div>
                <Link href="/exams">
                  <Button variant="outline" className="w-full rounded-2xl h-14 border-accent/20 text-accent font-black tracking-tight mt-8 hover:bg-accent hover:text-black transition-all">
                    {t('all_exams')}
                  </Button>
                </Link>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <StudyTimer />
            <NotificationPanel />
            <LiveActivity />
          </div>
        </div>
      </div>
      
      <InstallPrompt />
      <SupportTrigger />
      <Navbar />
    </AppLayout>
  );
}
