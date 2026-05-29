
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BookOpen, 
  Trophy, 
  Target, 
  Zap,
  ShieldCheck,
  Languages,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">CRACKLIX</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#exams" className="text-sm font-medium hover:text-primary transition-colors">Exams</Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="outline" className="mb-4 py-1 px-4 text-primary border-primary/20 bg-primary/5">
              🚀 The Ultimate Punjab Govt Exam Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Master Your Punjab <br />Govt Exams with AI.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience India&apos;s most advanced bilingual mock platform. 
              Designed for PSSSB, Punjab Police, Patwari, and 50+ State Exams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-2xl group">
                  Start Free Mock Test
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-2xl border-2">
                  <LayoutDashboard className="mr-2 w-5 h-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-y py-12 border-border/50"
          >
            {[
              { label: 'Active Students', value: '50K+' },
              { label: 'Exams Covered', value: '50+' },
              { label: 'Mock Tests', value: '1,000+' },
              { label: 'Bilingual PYQs', value: '25K+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to crack it.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve built powerful tools to help you learn faster and score higher.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="text-yellow-500" />,
                title: "AI Mock Builder",
                desc: "Generate full-length mocks based on latest board patterns in seconds."
              },
              {
                icon: <Languages className="text-blue-500" />,
                title: "Bilingual Mastery",
                desc: "Every question, option, and solution is available in English & Punjabi (Raavi)."
              },
              {
                icon: <Trophy className="text-emerald-500" />,
                title: "Real-time Analytics",
                desc: "Get state-wide rank, percentile, and deep subject-wise accuracy reports."
              },
              {
                icon: <Target className="text-purple-500" />,
                title: "Exam Specific Hubs",
                desc: "Dedicated test series for PSSSB Clerk, Punjab Police SI, Patwari, and more."
              },
              {
                icon: <Clock className="text-orange-500" />,
                title: "Sectional Timing",
                desc: "Practice with realistic sectional timers and negative marking rules."
              },
              {
                icon: <ShieldCheck className="text-red-500" />,
                title: "PYQ Archives",
                desc: "10+ years of solved previous year papers for all Punjab boards."
              }
            ].map((feature, i) => (
              <Card key={i} className="group border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {React.cloneElement(feature.icon as React.ReactElement, { className: "w-6 h-6" })}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">Ready to secure your government job?</h2>
              <p className="text-xl mb-10 text-primary-foreground/80 max-w-2xl mx-auto font-medium">
                Join 50,000+ students already preparing with Cracklix and get ahead of the competition.
              </p>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="h-16 px-10 text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-all">
                  Get Started Now — It&apos;s Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Zap className="text-primary w-5 h-5 fill-primary" />
              <span className="text-xl font-bold tracking-tighter">CRACKLIX</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground font-medium">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Support</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 CRACKLIX Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
