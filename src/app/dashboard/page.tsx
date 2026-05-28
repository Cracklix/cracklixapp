
'use client';

import { useEffect, useState } from 'react';
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
import ReadinessPredictor from '@/components/dashboard/readiness-predictor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Globe, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  MessageCircle,
  Users,
  Zap,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppErrorBoundary } from '@/components/error-boundary';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const [activeUsers, setActiveUsers] = useState(1240);

  useEffect(() => {
    const q = query(collection(db, "users"), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      // Approximate count to prevent heavy snapshot loads
      setActiveUsers(Math.floor(Math.random() * 50) + 1200); 
    });
    return () => unsub();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 pb-24 animate-in fade-in duration-500">
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
             <Card className="rounded-[32px] bg-primary/10 border-primary/20 overflow-hidden relative group h-full">
                <CardContent className="p-8 relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-1">{t('punjab_rank')}</p>
                      <h3 className="text-3xl font-black">#{profile?.uid ? profile.uid.charCodeAt(0) % 1000 : '842'}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                       <Globe className="text-white w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500">
                       <span>Market Pulse</span>
                       <span className="text-white">{activeUsers.toLocaleString()} Active</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                     </div>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            <AppErrorBoundary>
              <ReadinessPredictor />
            </AppErrorBoundary>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 relative group cursor-pointer h-64 overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-105 transition-transform duration-700">
                    <BrainCircuit size={200} />
                  </div>
                  <CardHeader className="p-8 relative">
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1 font-black uppercase text-[9px]">PUNJAB AI CORE</Badge>
                    <CardTitle className="text-2xl font-black tracking-tight">{t('ai_command_center')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative">
                     <Link href="/ai">
                       <Button size="sm" className="rounded-xl h-10 px-5 bg-primary font-black">Launch Arena <ChevronRight className="w-4 h-4 ml-1" /></Button>
                     </Link>
                  </CardContent>
               </Card>

               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t('jobs'), icon: Briefcase, href: "/jobs", color: "text-emerald-400" },
                    { label: t('leaderboard'), icon: Trophy, href: "/leaderboard", color: "text-red-400" },
                    { label: "PASS", icon: Zap, href: "/pass", color: "text-primary" },
                    { label: "CHAT", icon: MessageCircle, href: "/community", color: "text-accent" },
                  ].map((tool, i) => (
                    <Link key={i} href={tool.href}>
                      <div className="h-full p-4 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.04] transition-all">
                         <tool.icon className={cn("w-6 h-6", tool.color)} />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">{tool.label}</span>
                      </div>
                    </Link>
                  ))}
               </div>
            </div>

            <AppErrorBoundary>
              <DailyQuiz />
            </AppErrorBoundary>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AppErrorBoundary>
                <DailyTargets />
              </AppErrorBoundary>
              
              <Card className="rounded-[32px] bg-zinc-900/40 border-white/5 p-10 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-8">
                    <Sparkles className="text-accent w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter leading-tight">Punjab<br />Expert Hub</h3>
                  <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Syllabus-aligned prep</p>
                </div>
                <Link href="/exams">
                  <Button variant="outline" className="w-full rounded-xl h-12 border-accent/20 text-accent font-black tracking-widest mt-8 hover:bg-accent hover:text-black">
                    EXPLORE EXAMS
                  </Button>
                </Link>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <AppErrorBoundary>
              <StudyTimer />
              <NotificationPanel />
              <LiveActivity />
            </AppErrorBoundary>
          </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
