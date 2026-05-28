
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
import InstallPrompt from '@/components/pwa/install-prompt';
import SupportTrigger from '@/components/support/support-trigger';
import ReadinessPredictor from '@/components/dashboard/readiness-predictor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Globe, 
  Briefcase, 
  Trophy, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  Gift,
  MessageCircle,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const [activeUsers, setActiveUsers] = useState(1240);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      // Simulate live "active" count based on total users
      setActiveUsers(snap.size + 1200); 
    });
    return () => unsub();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 pb-24">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
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
            className="lg:col-span-4"
          >
             <Card className="rounded-[32px] bg-primary/10 border-primary/20 overflow-hidden relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <CardContent className="p-8 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-1">{t('punjab_rank')}</p>
                      <h3 className="text-3xl font-black">#{profile?.uid ? profile.uid.charCodeAt(0) + 120 : '842'}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center blue-glow">
                       <Globe className="text-white w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-bold uppercase">
                       <span className="text-zinc-500">Live Aspirants</span>
                       <span className="text-white">{activeUsers.toLocaleString()}</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "92%" }}
                          className="h-full bg-accent" 
                        />
                     </div>
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-zinc-500 uppercase">District: {profile?.district || 'Ludhiana'}</span>
                     <Badge variant="outline" className="text-[9px] border-accent/20 text-accent font-black">REALTIME</Badge>
                  </div>
                </CardContent>
             </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            <ReadinessPredictor />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <Card className="rounded-[40px] cracklix-glass overflow-hidden border-white/5 relative group cursor-pointer h-64">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-all duration-500" />
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-105 transition-transform duration-700">
                    <BrainCircuit size={200} />
                  </div>
                  <CardHeader className="p-8 relative">
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1 font-black uppercase text-[9px]">PUNJAB AI CORE</Badge>
                    <CardTitle className="text-2xl font-black tracking-tight">{t('ai_command_center')}</CardTitle>
                    <CardDescription className="text-zinc-500 mt-1 font-medium">Bilingual AI Mentorship Ready</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative">
                     <Link href="/ai-lab">
                       <Button size="sm" className="rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 font-black">Launch Arena <ChevronRight className="w-4 h-4 ml-1" /></Button>
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
                        whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.04)" }}
                        className="h-full p-4 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-3 transition-all"
                      >
                         <tool.icon className={cn("w-6 h-6", tool.color)} />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">{tool.label}</span>
                      </motion.div>
                    </Link>
                  ))}
               </div>
            </div>

            <DailyQuiz />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="rounded-[32px] bg-[#111827] border-white/5 p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <MessageCircle className="text-emerald-500 w-6 h-6" />
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-500 font-bold text-[9px] border-none uppercase">Live Chat</Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Aspirant Community</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Real-time doubt solving</p>
                    <Link href="/community" className="w-full">
                      <Button variant="outline" className="w-full rounded-xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-bold">
                        Enter Discuss Arena
                      </Button>
                    </Link>
                  </div>
               </Card>

               <Card className="rounded-[32px] bg-[#111827] border-white/5 p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="text-primary w-6 h-6" />
                    </div>
                    <Badge className="bg-primary/20 text-primary font-bold text-[9px] border-none uppercase">Official</Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Pass Access</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Unlock elite mock tests</p>
                    <Link href="/pass" className="w-full">
                      <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-bold">
                        Upgrade To Pass+
                      </Button>
                    </Link>
                  </div>
               </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DailyTargets />
              <Card className="rounded-[32px] cracklix-glass flex flex-col justify-between p-10 bg-[#111827]">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-8">
                    <BookOpen className="text-accent w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 leading-tight uppercase tracking-tighter">Punjab<br />Expert Hub</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-bold">Targeted preparation for PPSC & PSSSB.</p>
                </div>
                <Link href="/exams">
                  <Button variant="outline" className="w-full rounded-xl h-12 border-accent/20 text-accent font-black tracking-widest mt-8 hover:bg-accent hover:text-black transition-all">
                    {t('all_exams').toUpperCase()}
                  </Button>
                </Link>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
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
