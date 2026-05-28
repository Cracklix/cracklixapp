"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Check, 
  Crown, 
  Loader2, 
  Zap,
  ShieldCheck,
  Trophy,
  BookOpen,
  ArrowRight,
  Sparkles,
  CreditCard,
  Lock,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivePlans, verifyAndActivatePass } from '@/services/payment';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PassAcquisitionPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [acquiringId, setAcquiringId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getActivePlans();
      // Testbook-Style High ROI Tiers
      setPlans(data.length > 0 ? data : [
        { id: 'p_1', name: 'Monthly PASS', price: 299, duration: 30, tier: 'pass_plus', features: ['500+ Official Mocks', 'Daily Live Classes', 'Bilingual (EN+PA) Mode', 'Sectional Rankings'] },
        { id: 'p_2', name: 'Elite Annual PASS', price: 999, duration: 365, tier: 'premium', features: ['Unlimited SI & PPSC Mocks', 'AI Performance Coach', 'All PYQ Solved Archive', 'Dedicated Mentor Group', 'Offline PDF Access'] },
        { id: 'p_3', name: 'Lifetime Master PASS', price: 2499, duration: 9999, tier: 'elite', features: ['Lifetime Unrestricted Entry', '1-on-1 AI Tutoring Beta', 'All Future Test Series', 'Early Access to PYQs'] }
      ]);
      setLoading(false);
    }
    load();
  }, []);

  const handleAcquire = async (plan: any) => {
    if (!user) {
      toast({ title: "Auth Required", description: "Please log in to acquire preparation passes.", variant: "destructive" });
      return;
    }

    setAcquiringId(plan.id);
    
    // Institutional Payment Bridge Simulation
    setTimeout(async () => {
      try {
        await verifyAndActivatePass(user.uid, 'TXN_PASS_' + Date.now(), plan);
        toast({ 
          title: "ENROLLMENT VERIFIED", 
          description: `Identity synced with ${plan.name}. High-yield access granted.` 
        });
        window.location.href = '/dashboard';
      } catch (err) {
        toast({ title: "Buffer Error", description: "Signal lost during acquisition.", variant: "destructive" });
      } finally {
        setAcquiringId(null);
      }
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-24 pb-40 px-6">
        <header className="text-center space-y-8 pt-20">
          <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.4em] shadow-sm animate-pulse">
             Elite Tier Enrollment
          </Badge>
          <h1 className="text-6xl md:text-[90px] font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
             Master Punjab<br /><span className="text-blue-600">Recruitment.</span>
          </h1>
          <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
             Join 15,000+ aspirants using our institutional-grade simulations to secure top ranks in PSSSB, Police, and PPSC.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
           {loading ? (
             [1,2,3].map(i => <div key={i} className="h-[650px] rounded-[56px] bg-slate-50 animate-pulse" />)
           ) : plans.map((plan, i) => {
             const isElite = plan.tier === 'premium' || plan.tier === 'elite';
             return (
              <motion.div 
                key={plan.id} 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="h-full"
              >
                <Card className={cn(
                  "rounded-[56px] bg-white border-slate-100 overflow-hidden h-full flex flex-col transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border relative group",
                  isElite && "ring-[12px] ring-blue-600/5 scale-105 z-10 border-blue-600/20"
                )}>
                  {isElite && (
                    <div className="bg-blue-600 text-white text-center py-4 text-[10px] font-black uppercase tracking-[0.5em] absolute top-0 left-0 w-full">
                       TOP RANKERS SELECTION
                    </div>
                  )}
                  <CardHeader className={cn("p-12 md:p-14", isElite && "pt-20")}>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">{plan.tier}</p>
                     <CardTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{plan.name}</CardTitle>
                     <div className="mt-12 flex items-baseline gap-2">
                        <span className="text-8xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                        <span className="text-slate-400 font-black text-sm uppercase tracking-widest">/ {plan.duration >= 900 ? 'LIFETIME' : plan.duration + ' DAYS'}</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-12 md:p-14 pt-0 flex-1 space-y-8">
                     <div className="space-y-5">
                        {plan.features.map((f: string, idx: number) => (
                          <div key={idx} className="flex gap-5 items-start group/feat">
                             <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-blue-600 transition-all duration-500">
                                <Check className="w-4 h-4 text-blue-600 group-hover/feat:text-white" strokeWidth={4} />
                             </div>
                             <span className="text-lg text-slate-600 font-bold group-hover/feat:text-slate-900 transition-colors">{f}</span>
                          </div>
                        ))}
                     </div>
                  </CardContent>
                  <CardFooter className="p-12 md:p-14 pt-0">
                     <Button 
                        onClick={() => handleAcquire(plan)} 
                        disabled={!!acquiringId} 
                        className={cn(
                          "w-full h-20 rounded-[28px] text-xl font-black tracking-widest shadow-2xl transition-all active:scale-95 uppercase", 
                          isElite ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30" : "bg-slate-900 hover:bg-black text-white"
                        )}
                     >
                        {acquiringId === plan.id ? <Loader2 className="animate-spin w-8 h-8" /> : "ENROLL NOW"}
                     </Button>
                  </CardFooter>
                </Card>
              </motion.div>
             );
           })}
        </div>

        {/* Institutional Assurance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
           {[
             { title: "Bilingual Mastery", desc: "Native Raavi-Punjabi signals for 100% board accuracy.", icon: Globe, color: "bg-blue-50 text-blue-600" },
             { title: "AI Cognitive Audit", desc: "Neural analysis of every attempt to fix weaknesses.", icon: BrainCircuit, color: "bg-purple-50 text-purple-600" },
             { title: "State Rankings", desc: "Real-time leaderboard across 23 Punjab districts.", icon: Trophy, color: "bg-orange-50 text-orange-600" },
             { title: "Verified Signal", desc: "Infrastructure engineered by Arsh Grewal for Punjab.", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600" },
           ].map((benefit, i) => (
             <div key={i} className="p-12 rounded-[56px] bg-white border border-slate-100 space-y-8 shadow-sm transition-all hover:shadow-xl group">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500", benefit.color)}>
                   <benefit.icon size={28} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                   <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{benefit.title}</h4>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-[#0f172a] rounded-[64px] p-20 md:p-32 text-center space-y-12 relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
           <div className="relative z-10 space-y-12">
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase">Still Hesitant?</h2>
              <p className="text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                 Access our <strong>Free Hub</strong> to attempt sample mocks and see why the toppers of the last SI cycle chose CRACKLIX.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                 <Button className="h-24 px-16 rounded-[32px] bg-white text-black text-2xl font-black hover:bg-slate-200 transition-all shadow-2xl">VISIT FREE HUB</Button>
                 <Button variant="outline" className="h-24 px-16 rounded-[32px] border-white/10 text-white text-2xl font-black hover:bg-white/5 transition-all">TALK TO EXPERT</Button>
              </div>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
