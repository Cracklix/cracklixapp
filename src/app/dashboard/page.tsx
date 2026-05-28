'use client';

import { useAuth } from '@/lib/auth-context';
import HeroCard from '@/components/dashboard/hero-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import NotificationPanel from '@/components/notification-panel';
import LiveActivity from '@/components/live-activity';
import DailyTargets from '@/components/dashboard/daily-targets';
import StudyTimer from '@/components/practice/study-timer';
import DailyQuiz from '@/components/daily-quiz';
import InstallPrompt from '@/components/pwa/install-prompt';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Sparkles, Beaker, Mic, Camera, FileDown, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        {profile && (
          <HeroCard
            name={profile.name}
            streak={profile.streak}
            xp={profile.xp}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Left Column */}
          <div className="lg:col-span-8 space-y-8">
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
                    OCR, Voice Assistant, and focus engines.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <Link href="/ai-lab">
                    <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-black group">
                      Open Lab
                      <Beaker className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: Camera, label: "OCR Scan", href: "/ai-lab" },
                   { icon: Mic, label: "Voice", href: "/ai-lab" },
                   { icon: BookOpen, label: "Mistakes", href: "/coach" },
                   { icon: Target, label: "Planner", href: "/ai" },
                 ].map((tool, i) => (
                   <Link key={i} href={tool.href}>
                     <motion.div 
                       whileHover={{ scale: 1.05 }}
                       className="h-full p-4 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-zinc-900 transition-colors"
                     >
                        <tool.icon className="w-6 h-6 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">{tool.label}</span>
                     </motion.div>
                   </Link>
                 ))}
              </div>
            </div>

            <DailyQuiz />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DailyTargets />
              <Card className="rounded-[40px] cracklix-glass border-white/5 flex flex-col items-center justify-center p-8 text-center bg-accent/5">
                <div className="w-16 h-16 rounded-[28px] bg-accent/10 flex items-center justify-center mb-6">
                  <BookOpen className="text-accent w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Mistake Notebook</h3>
                <p className="text-sm text-zinc-500 mb-8 max-w-[200px]">Review questions you got wrong to ensure zero-gap mastery.</p>
                <Button variant="outline" className="w-full rounded-2xl h-12 border-accent/20 text-accent font-bold">
                  Review 12 Mistakes
                </Button>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <StudyTimer />
            <NotificationPanel />
            <LiveActivity />
          </div>
        </div>
      </div>
      
      {/* PWA Install Trigger */}
      <InstallPrompt />
      
      <Navbar />
    </AppLayout>
  );
}