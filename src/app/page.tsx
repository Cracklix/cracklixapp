"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  BrainCircuit, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Star,
  Play,
  Flame
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-white">
      {/* GLOW DECORATIONS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="container mx-auto px-6 py-8 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center blue-glow">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter">CRACKLIX</span>
        </div>
        <nav className="hidden md:flex gap-10 text-sm font-bold uppercase tracking-widest text-zinc-400">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
          <Link href="/pass" className="hover:text-primary transition-colors">Pass</Link>
        </nav>
        <div className="flex gap-4">
          <Button asChild variant="ghost" className="font-bold rounded-2xl h-12">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 px-6 blue-glow transition-transform hover:scale-105 active:scale-95">
            <Link href="/login?tab=signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <Badge className="bg-primary/10 border-primary/20 text-primary px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px]">
              <Sparkles className="w-3 h-3 mr-2" />
              v2.0 Performance Engine Now Live
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
              MASTER <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">PUNJAB</span> EXAMS.
            </h1>
            <p className="text-xl text-zinc-400 max-w-xl leading-relaxed">
              Cracklix is the elite learning ecosystem for Punjab Govt aspirants. Powered by AI performance coaching and hyper-realistic CBT simulations.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button asChild size="lg" className="h-16 px-10 rounded-[20px] bg-primary hover:bg-primary/90 text-lg font-black blue-glow group">
                <Link href="/login?tab=signup">
                  Start Training Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-10 rounded-[20px] border-white/10 hover:bg-white/5 text-lg font-bold">
                <Link href="/pass">View PASS Plans</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-6 pt-8 border-t border-white/5">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center">
                    <img src={`https://picsum.photos/seed/${i + 20}/100`} className="rounded-full w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex text-yellow-500 gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-zinc-500 font-medium">Joined by <span className="text-white font-bold">12,000+</span> students this month</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <GlassCard className="relative z-10 p-10 animate-float">
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-2">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aspirant Profile</p>
                  <h2 className="text-4xl font-black">Punjab Rank <span className="text-primary">#12</span></h2>
                </div>
                <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-primary to-accent p-0.5 shadow-2xl">
                   <div className="w-full h-full bg-zinc-900 rounded-[30px] flex items-center justify-center">
                      <Flame className="text-primary w-10 h-10 fill-current" />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="p-6 rounded-[28px] bg-white/5 border border-white/5 space-y-2">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Accuracy</p>
                  <h3 className="text-4xl font-black">89<span className="text-primary text-xl">%</span></h3>
                </div>
                <div className="p-6 rounded-[28px] bg-white/5 border border-white/5 space-y-2">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Streak</p>
                  <h3 className="text-4xl font-black text-orange-500">17 <span className="text-sm uppercase tracking-tighter">Days</span></h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <span>XP Level 12</span>
                  <span className="text-white">5,420 / 6,000</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "82%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-primary blue-glow" 
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="container mx-auto max-w-7xl px-6 py-32 relative">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">ENGINEERED FOR <span className="text-primary">RESULTS.</span></h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Proprietary technology designed to isolate weaknesses and accelerate learning velocity.</p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { 
              icon: BrainCircuit, 
              title: "AI PERFORMANCE COACH", 
              desc: "Deep-learning analysis of your CBT results to generate hyper-personalized study blueprints.",
              color: "text-blue-500"
            },
            { 
              icon: Zap, 
              title: "DYNAMIC MOCK ENGINE", 
              desc: "Timed exam simulations that adapt difficulty based on your real-time performance metrics.",
              color: "text-accent"
            },
            { 
              icon: Trophy, 
              title: "STATE-WIDE RANKING", 
              desc: "Compare your performance against thousands of real aspirants across every district in Punjab.",
              color: "text-orange-500"
            }
          ].map((feature, i) => (
            <motion.div key={i} variants={item}>
              <GlassCard className="h-full group hover:-translate-y-2 transition-transform">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CALL TO ACTION */}
      <section className="container mx-auto max-w-5xl px-6 pb-40">
        <GlassCard className="bg-gradient-to-br from-primary/20 via-black to-accent/10 p-16 text-center border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Zap size={240} />
          </div>
          <div className="space-y-8 relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">READY TO DOMINATE?</h2>
            <p className="text-xl text-zinc-400 max-w-xl mx-auto">Join the next generation of Punjab Government officers today. Your journey to Level 1 begins here.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-zinc-200 text-xl font-black transition-transform hover:scale-105 active:scale-95">
                <Link href="/login?tab=signup">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-white/10 hover:bg-white/5 text-xl font-black">
                <Link href="/pass">Go Premium</Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-20 px-6 bg-zinc-950">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="text-primary w-6 h-6 fill-current" />
              <span className="font-headline text-xl font-black tracking-tighter">CRACKLIX</span>
            </div>
            <p className="text-zinc-500 max-w-xs leading-relaxed">The smartest AI-powered learning ecosystem built exclusively for Punjab Government exam excellence.</p>
            <div className="flex gap-4">
               {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5" />)}
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-widest text-white">Platform</h4>
            <ul className="space-y-3 text-sm text-zinc-500 font-medium">
              <li><Link href="/exams" className="hover:text-white">Exam Catalog</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white">Leaderboards</Link></li>
              <li><Link href="/pass" className="hover:text-white">Pass Pricing</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-widest text-white">Support</h4>
            <ul className="space-y-3 text-sm text-zinc-500 font-medium">
              <li><Link href="#" className="hover:text-white">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl pt-20 mt-20 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
          © 2024 CRACKLIX ECOSYSTEM • ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}