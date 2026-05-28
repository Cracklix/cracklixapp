
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
  ShieldCheck,
  Globe,
  MessageSquare,
  ShieldAlert,
  Mail,
  Phone,
  Send
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from '@/lib/placeholder-images';

const SUPPORT_EMAIL = "cracklixhelp@gmail.com";
const SUPPORT_PHONE = "+91 9888188602";

export default function LandingPage() {
  const founderImg = PlaceHolderImages.find(img => img.id === 'founder-portrait');

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
          <div className="flex flex-col">
            <span className="font-headline text-2xl font-black tracking-tighter uppercase leading-none">CRACKLIX</span>
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1 text-primary">by Arsh Grewal</span>
          </div>
        </div>
        <nav className="hidden lg:flex gap-12 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
          <Link href="#technology" className="hover:text-primary transition-colors">Technology</Link>
          <Link href="/exams" className="hover:text-primary transition-colors">Exams</Link>
          <Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
          <Link href="/pass" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex gap-4">
          <Button asChild variant="ghost" className="font-black text-[11px] uppercase tracking-widest rounded-2xl h-12 text-zinc-400 hover:text-white">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl h-12 px-8 blue-glow transition-all hover:scale-105">
            <Link href="/signup">Get Started</Link>
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
              PUNJAB’S #1 AI-POWERED ECOSYSTEM
            </Badge>
            <h1 className="text-7xl md:text-[100px] font-black leading-[0.85] tracking-tighter">
              DOMINATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">PUNJAB</span> EXAMS.
            </h1>
            <p className="text-xl text-zinc-500 max-w-xl leading-relaxed font-medium">
              The only bilingual prep platform engineered exclusively for PPSC, PSSSB, and Punjab Police aspirants. Real-time district rankings and 24/7 AI mentoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button asChild size="lg" className="h-20 px-12 rounded-[24px] bg-primary hover:bg-primary/90 text-xl font-black blue-glow group">
                <Link href="/signup">
                  Start Training Free
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-20 px-12 rounded-[24px] border-white/10 hover:bg-white/5 text-xl font-bold">
                <Link href="/pass">Unlock Premium PASS</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-10 border-t border-white/5">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-[#050816] overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i + 50}/100`} className="w-full h-full object-cover" alt="User" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex text-yellow-500 gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Trusted by <span className="text-white">15,000+</span> Punjab Aspirants</p>
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
                  <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Aspirant Pulse</p>
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
                  <span>Target: Punjab Police SI</span>
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

      {/* CORE BOARDS */}
      <section className="border-y border-white/5 bg-white/[0.01] py-16">
        <div className="container mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-50 grayscale hover:opacity-100 transition-opacity duration-500">
          {['PPSC PCS', 'PSSSB CLERK', 'PUNJAB POLICE', 'PATWARI 2024', 'TEACHING EXAMS', 'PSPCL JE'].map(exam => (
            <span key={exam} className="text-xl font-black tracking-tighter text-zinc-600">{exam}</span>
          ))}
        </div>
      </section>

      {/* FOUNDER VISION SECTION */}
      <section className="container mx-auto max-w-7xl px-6 py-40">
         <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
               <div className="space-y-4">
                  <Badge variant="outline" className="border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5">Founder's Brief</Badge>
                  <h2 className="text-5xl font-black tracking-tighter">THE NATIONAL VISION FOR <span className="text-primary">PUNJAB.</span></h2>
                  <p className="text-xl text-zinc-500 leading-relaxed font-medium">
                    "Punjab’s talent belongs in the elite ranks of governance. CRACKLIX is more than an app; it's the digital infrastructure I built to ensure every aspirant from Amritsar to Bathinda has access to high-yield intelligence and simulation technology."
                  </p>
               </div>
               <div className="p-10 rounded-[48px] bg-zinc-900/50 border border-white/5 flex gap-8 items-start">
                  <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center shrink-0 shadow-2xl">
                     <ShieldAlert className="text-white w-8 h-8" />
                  </div>
                  <div>
                     <h4 className="text-xl font-bold mb-2">Student-First Philosophy</h4>
                     <p className="text-sm text-zinc-500 leading-relaxed">
                        Every feature in the ecosystem—from the AI Coach to the Bilingual Engine—is designed to minimize friction and maximize cognitive retention for competitive exams.
                     </p>
                  </div>
               </div>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-primary/5 rounded-[60px] blur-[100px]" />
               <div className="p-1 px-1 bg-gradient-to-br from-white/10 to-transparent rounded-[60px]">
                  <div className="bg-[#050816] rounded-[59px] overflow-hidden p-12 space-y-12 border border-white/5">
                     <div className="flex justify-between items-center">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/20 overflow-hidden">
                           <img 
                            src={founderImg?.imageUrl} 
                            data-ai-hint={founderImg?.imageHint}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover" 
                            alt="Founder" 
                           />
                        </div>
                        <Badge className="bg-primary text-white border-none font-black text-[9px] px-3 py-1">VERIFIED FOUNDER</Badge>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight">ARSH GREWAL</h3>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Architect of CRACKLIX Ecosystem</p>
                     </div>
                     <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-zinc-600 uppercase">Core Focus</p>
                           <p className="text-sm font-bold">AI Infrastructure</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-zinc-600 uppercase">Mission</p>
                           <p className="text-sm font-bold">State Meritocracy</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="technology" className="container mx-auto max-w-7xl px-6 py-40 relative">
        <div className="text-center space-y-6 mb-24">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">ENGINEERED FOR <span className="text-primary uppercase">DOMINANCE.</span></h2>
          <p className="text-zinc-500 text-xl max-w-2xl mx-auto font-medium">Proprietary AI and real-time competitive systems designed to maximize your rank across 23 Punjab districts.</p>
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
              icon: Globe, 
              iconColor: "text-blue-500",
              title: "BILINGUAL ENGINE", 
              desc: "Seamlessly switch between English and Punjabi for all mock tests, PYQs, and AI explanations.",
              badge: "NATIVE"
            },
            { 
              icon: Zap, 
              iconColor: "text-accent",
              title: "LIVE ARENA", 
              desc: "Compete in scheduled Sunday Mega Tests with server-synced timers and anti-cheat protection.",
              badge: "LIVE"
            },
            { 
              icon: BrainCircuit, 
              iconColor: "text-purple-500",
              title: "AI PERFORMANCE COACH", 
              desc: "Deep analysis of your CBT results to identify weak subjects and generate tactical revision plans.",
              badge: "PRO"
            }
          ].map((feature, i) => (
            <motion.div key={i} variants={item}>
              <div className="cracklix-glass h-full group p-10 rounded-[40px] hover:bg-white/[0.05] transition-all duration-500">
                <div className="flex justify-between items-start mb-10">
                  <div className={`w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${feature.iconColor}`}>
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
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">READY TO<br /><span className="text-primary">MASTER PUNJAB?</span></h2>
            <p className="text-2xl text-zinc-400 max-w-2xl mx-auto font-medium">Join the elite rankers today. Secure your PASS and get unrestricted access to the most powerful prep engine in the state.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Button asChild size="lg" className="h-24 px-16 rounded-3xl bg-white text-black hover:bg-zinc-200 text-2xl font-black transition-transform hover:scale-105 shadow-2xl">
                <Link href="/signup">Start Free Training</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-24 px-16 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 text-2xl font-black">
                <Link href="/pass">View Premium PASS</Link>
              </Button>
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
              <div className="flex flex-col">
                <span className="font-headline text-2xl font-black tracking-tighter uppercase leading-none">CRACKLIX</span>
                <span className="text-[8px] text-primary font-bold uppercase tracking-[0.4em] mt-1">Infrastructure by Arsh Grewal</span>
              </div>
            </div>
            <p className="text-zinc-500 max-w-md text-lg leading-relaxed font-medium">The state-of-the-art AI learning ecosystem engineered exclusively for Punjab Government exam excellence.</p>
            <div className="flex gap-4">
               <Button asChild size="icon" variant="outline" className="rounded-xl border-white/5 bg-white/[0.03] hover:text-primary">
                  <a href="https://t.me/cracklixapp" target="_blank"><Send size={18} /></a>
               </Button>
               <Button size="icon" variant="outline" className="rounded-xl border-white/5 bg-white/[0.03] hover:text-primary"><MessageSquare size={18} /></Button>
               <Button size="icon" variant="outline" className="rounded-xl border-white/5 bg-white/[0.03] hover:text-primary"><Trophy size={18} /></Button>
               <Button size="icon" variant="outline" className="rounded-xl border-white/5 bg-white/[0.03] hover:text-primary"><Globe size={18} /></Button>
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white">Punjab Elite</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-bold uppercase tracking-widest">
              <li><Link href="/exams" className="hover:text-primary transition-colors">Exam Hub</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Punjab Rankings</Link></li>
              <li><Link href="/marketplace" className="hover:text-primary transition-colors">Notes Marketplace</Link></li>
              <li><Link href="/pass" className="hover:text-primary transition-colors">PASS Subscription</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white">Official Support</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-3 hover:text-primary transition-colors group">
                <Mail size={16} className="text-primary mt-1 shrink-0" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-medium text-zinc-500 group-hover:text-primary transition-colors break-words overflow-hidden">{SUPPORT_EMAIL}</a>
              </li>
              <li className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone size={16} className="text-primary shrink-0" />
                <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`} className="text-sm font-medium text-zinc-500 hover:text-primary transition-colors">{SUPPORT_PHONE}</a>
              </li>
              
              <li className="pt-4 space-y-4">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Direct Founder Access</p>
                <Button asChild className="w-full h-14 rounded-2xl bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold group shadow-lg shadow-blue-500/10">
                  <a href="https://t.me/cracklixapp" target="_blank" className="flex items-center justify-center gap-3">
                    <Send size={18} className="fill-current" />
                    <span className="text-sm uppercase tracking-widest">Join Telegram</span>
                  </a>
                </Button>
              </li>
              
              <li className="pt-2">
                <Link href="#" className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-destructive transition-colors">Report Critical Bug</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl pt-24 mt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">
            © 2024 CRACKLIX EDTECH ENTERPRISE • ENGINEERED FOR PUNJAB
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Founded by Arsh Grewal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            <span>Built in Punjab</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
