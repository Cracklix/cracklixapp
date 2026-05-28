
"use client";

import { motion } from 'framer-motion';
import { Rocket, Brain, Trophy, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="text-primary-foreground w-5 h-5 fill-current" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tight">CRACKLIX</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
            <Link href="#coach" className="hover:text-primary transition-colors">AI Coach</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login?tab=signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary">
              v1.0 is now live for all students
            </Badge>
            <h1 className="font-headline text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight">
              Master Any Subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI Performance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Cracklix combines gamified progress, real-time analytics, and an AI Performance Coach to help you dominate your exams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 rounded-2xl group">
                  Start Training Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg rounded-2xl border-white/10 hover:bg-white/5">
                  View Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Engineered for Excellence</h2>
            <p className="text-muted-foreground">Every tool you need to track, optimize, and accelerate your learning.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-6 h-6 text-primary" />,
                title: "AI Performance Coach",
                description: "Deep-learning analysis of your quiz results to generate hyper-personalized study plans."
              },
              {
                icon: <Zap className="w-6 h-6 text-accent" />,
                title: "Dynamic Exam Engine",
                description: "Timed environments with real-time scoring and difficulty adjustment for peak performance."
              },
              {
                icon: <Trophy className="w-6 h-6 text-primary" />,
                title: "Gamified XP System",
                description: "Earn points, maintain streaks, and climb global leaderboards to stay motivated."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] cracklix-glass hover:bg-card/80 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* XP/Stats Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-headline text-4xl font-bold mb-6">Persistent Study Profiles</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your data is synchronized across all devices. Track your history, monitor your login streaks, and watch your XP grow as you master new topics.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Rocket className="w-6 h-6 text-primary" />
                <span className="font-medium">Accelerated Progress Tracking</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/10 border border-accent/20">
                <Trophy className="w-6 h-6 text-accent" />
                <span className="font-medium">Global Ranking Rewards</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[40px] bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/5 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-card rounded-[32px] shadow-2xl overflow-hidden border border-white/10 p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-muted rounded-full" />
                    <div className="h-3 w-16 bg-muted/50 rounded-full" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="h-24 bg-secondary rounded-2xl" />
                  <div className="h-24 bg-secondary rounded-2xl" />
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary" />
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-secondary/20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-primary w-6 h-6 fill-current" />
            <span className="font-headline text-lg font-bold tracking-tight">CRACKLIX</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 Cracklix. Built for performance.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
