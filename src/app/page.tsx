"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  BrainCircuit, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Star,
  Flame,
  ShieldCheck
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Premium Landing Page
 * Designed for High-Performance conversion with Testbook-style trust factors.
 */
export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-primary/30 overflow-x-hidden">
      {/* DYNAMIC BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
         <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
         <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* HEADER */}
      <header className="container mx-auto px-6 py-10 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-primary flex items-center justify-center blue-glow">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter uppercase">CRACKLIX</span>
        </div>
        <nav className="hidden lg:flex gap-12 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
          <Link href="#features" className="hover:text-primary transition-colors">Technology</Link>
          <Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
          <Link href="/marketplace" className="hover:text-primary transition-colors">Notes</Link>
          <Link href="/pass" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex gap-4">
          <Button asChild variant="ghost" className="font-black text-[11px] uppercase tracking-widest rounded-2xl h-12 text-zinc-400 hover:text-white">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl h-12 px-8 blue-glow transition-all hover:scale-105">
            <Link href="/login?tab=signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-16 pb-32">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            <Badge className="bg-primary/10 border-primary/20 text-primary px-5 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px]">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              v3.0 ENTERPRISE ENGINE NOW LIVE
            </Badge>
            <h1 className="text-7xl md:text-[100px] font-black leading-[0.85] tracking-tighter">
              DOMINATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">PUNJAB</span> EXAMS.
            </h1>
            <p className="text-xl text-zinc-500 max-w-xl leading-relaxed font-medium">
              The smartest AI-driven learning ecosystem for Punjab Govt aspirants. Realistic simulations, deep analytics, and 24/7 AI mentoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button asChild size="lg" className="h-20 px-12 rounded-[24px] bg-primary hover:bg-primary/90 text-xl font-black blue-glow group">
                <Link href="/login?tab=signup">
                  Start Training Free
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-20 px-12 rounded-[24px] border-white/10 hover:bg-white/5 text-xl font-bold">
                <Link href="/pass">View PASS Plans</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-10 border-t border-white/5">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-[#050816] overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i + 50}/100`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex text-yellow-500 gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Trust of <span className="text-white">15,000+</span> Aspirants</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <div className="cracklix-glass relative z-10 p-12 rounded-[48px] animate-float shadow-2xl">
              <div className="flex justify-between items-start mb-16">
                <div className="space-y-3">
                  <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Aspirant Profile</p>
                  <h2 className="text-5xl font-black tracking-tighter">Punjab Rank <span className="text-primary">#12</span></h2>
                </div>
                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-accent p-0.5 shadow-2xl">
                   <div className="w-full h-full bg-[#050816] rounded-[30px] flex items-center justify-center">
                      <Flame className="text-primary w-12 h-12 fill-current" />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-16">
                <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 space-y-3">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">CBT Accuracy</p>
                  <h3 className="text-5xl font-black tracking-tight">89<span className="text-primary text-2xl">%</span></h3>
                </div>
                <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 space-y-3">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Streak</p>
                  <h3 className="text-5xl font-black text-orange-500 tracking-tight">17 <span className="text-lg uppercase tracking-tighter">Days</span></h3>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                  <span>Target: SI Rank 1</span>
                  <span className="text-white">8,420 / 10,000 XP</span>
                </div>
                <div className="h-4 w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "84%" }}
                    transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent blue-glow shadow-[0_0_20px_hsla(217,91%,60%,0.5)]" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-y border-white/5 bg-white/[0.01] py-16">
        <div className="container mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-50 grayscale hover:opacity-100 transition-opacity duration-500">
          {['PPSC PCS', 'PSSSB CLERK', 'PUNJAB POLICE SI', 'PATWARI 2024', 'EXCISE INSPECTOR'].map(exam => (
            <span key={exam} className="text-xl font-black tracking-tighter text-zinc-600">{exam}</span>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="container mx-auto max-w-7xl px-6 py-40 relative">
        <div className="text-center space-y-6 mb-24">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">ENGINEERED FOR <span className="text-primary uppercase">EXCELLENCE.</span></h2>
          <p className="text-zinc-500 text-xl max-w-2xl mx-auto font-medium">Proprietary AI technology designed to isolate weaknesses and accelerate your learning velocity.</p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {[
            { 
              icon: BrainCircuit, 
              title: "AI COMMAND CENTER", 
              desc: "Deep-learning analysis of your CBT results to generate hyper-personalized study blueprints.",
              color: "text-blue-500",
              badge: "PRO"
            },
            { 
              icon: Zap, 
              title: "NATIVE MOCK ENGINE", 
              desc: "Timed simulations that mirror the real PPSC/PSSSB exam environment with adaptive difficulty.",
              color: "text-accent",
              badge: "LIVE"
            },
            { 
              icon: Trophy, 
              title: "REALTIME RANKING", 
              desc: "Compare your performance against thousands of real aspirants across 23 districts in Punjab.",
              color: "text-orange-500",
              badge: "GLOBAL"
            }
          ].map((feature, i) => (
            <motion.div key={i} variants={item}>
              <div className="cracklix-glass h-full group p-10 rounded-[40px] hover:bg-white/[0.05] transition-all duration-500">
                <div className="flex justify-between items-start mb-10">
                  <div className={`w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <Badge className="bg-white/5 text-zinc-500 border-white/10 text-[9px] font-black px-3 py-1">{feature.badge}</Badge>
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="container mx-auto max-w-6xl px-6 pb-48">
        <div className="relative rounded-[60px] p-16 md:p-24 overflow-hidden border border-primary/30 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-[#050816] to-accent/20" />
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[3s]">
            <Zap size={400} />
          </div>
          
          <div className="relative z-10 text-center space-y-10">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">READY TO<br /><span className="text-primary">DOMINATE?</span></h2>
            <p className="text-2xl text-zinc-400 max-w-2xl mx-auto font-medium">Join the next generation of Punjab Government officers today. Your journey to Rank 1 begins here.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Button asChild size="lg" className="h-24 px-16 rounded-3xl bg-white text-black hover:bg-zinc-200 text-2xl font-black transition-transform hover:scale-105 shadow-2xl">
                <Link href="/login?tab=signup">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-24 px-16 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 text-2xl font-black">
                <Link href="/pass">Go Premium</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Secure Stream • ISO 27001 Ready
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-24 px-6 bg-zinc-950/50">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <Zap className="text-primary w-8 h-8 fill-current" />
              <span className="font-headline text-2xl font-black tracking-tighter uppercase">CRACKLIX</span>
            </div>
            <p className="text-zinc-500 max-w-md text-lg leading-relaxed font-medium">The most advanced AI learning ecosystem engineered exclusively for Punjab Government exam excellence.</p>
            <div className="flex gap-6">
               {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/50 transition-colors" />)}
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white">Ecosystem</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-bold uppercase tracking-widest">
              <li><Link href="/exams" className="hover:text-primary transition-colors">Exam Engine</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Rankings</Link></li>
              <li><Link href="/marketplace" className="hover:text-primary transition-colors">Creator Hub</Link></li>
              <li><Link href="/pass" className="hover:text-primary transition-colors">Pass Pricing</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white">Resources</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-bold uppercase tracking-widest">
              <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Career Prep</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Core</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Service Level</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl pt-24 mt-24 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">
          © 2024 CRACKLIX ENTERPRISE ECOSYSTEM • ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}