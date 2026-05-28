
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
  Timer,
  CreditCard,
  ArrowRight
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
      // Fallback for demo
      setPlans(data.length > 0 ? data : [
        { id: 'p_1', name: 'Monthly Silver Pass', price: 299, duration: 30, tier: 'pass_plus', features: ['All PSSSB Mocks', 'Punjab GK Notes Archive', 'Daily Study Targets', 'Bilingual Support'] },
        { id: 'p_2', name: 'Elite Annual Pass', price: 999, duration: 365, tier: 'premium', features: ['Unlimited PPSC & Police SI Mocks', 'AI Performance Coach', 'Official PYQ Explanations', 'Ad-Free Experience', 'Founder Telegram Group'] },
        { id: 'p_3', name: 'Lifetime Master Pass', price: 2499, duration: 9999, tier: 'elite', features: ['Lifetime Unrestricted Access', '1-on-1 AI Mentoring Beta', 'Offline PDF Vault', 'Free Entry to Physical Workshops'] }
      ]);
      setLoading(false);
    }
    load();
  }, []);

  const handleAcquire = async (plan: any) => {
    if (!user) {
      toast({ title: "Authorization Required", description: "Log in to enlist in preparation passes.", variant: "destructive" });
      return;
    }

    setAcquiringId(plan.id);
    
    // Testbook-Style Simulated Acquiring Protocol
    setTimeout(async () => {
      try {
        await verifyAndActivatePass(user.uid, 'TXN_' + Date.now(), plan);
        toast({ 
          title: "ENROLLMENT SUCCESSFUL", 
          description: `Identity synced with ${plan.name}. Access unlocked.` 
        });
        window.location.href = '/dashboard';
      } catch (err) {
        toast({ title: "Signal Lost", variant: "destructive" });
      } finally {
        setAcquiringId(null);
      }
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-20 pb-40 px-4 md:px-0">
        <header className="text-center space-y-8 pt-16">
          <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-sm">
             Enlist in the Elite Tier
          </Badge>
          <h1 className="text-5xl md:text-[80px] font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
             Master Every<br /><span className="text-blue-600">Punjab Exam.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
             Get unrestricted access to 500+ Simulations, AI Performance Coaching, and Official PYQ Archives used by top rankers.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {loading ? (
             [1,2,3].map(i => <div key={i} className="h-[600px] rounded-[48px] bg-slate-100 animate-pulse" />)
           ) : plans.map((plan, i) => {
             const isElite = plan.tier === 'premium' || plan.tier === 'elite';
             return (
              <motion.div 
                key={plan.id} 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn(
                  "rounded-[48px] bg-white border-slate-100 overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl border relative group",
                  isElite && "ring-8 ring-blue-600/5 scale-105 z-10 border-blue-600/20"
                )}>
                  {isElite && (
                    <div className="bg-blue-600 text-white text-center py-3 text-[10px] font-black uppercase tracking-[0.4em] absolute top-0 left-0 w-full">
                       MOST RECOMMENDED
                    </div>
                  )}
                  <CardHeader className={cn("p-12", isElite && "pt-16")}>
                     <CardTitle className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{plan.name}</CardTitle>
                     <div className="mt-10 flex items-baseline gap-2">
                        <span className="text-7xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                        <span className="text-slate-400 font-black text-xs uppercase tracking-widest">/ {plan.duration >= 999 ? 'LIFETIME' : plan.duration + ' DAYS'}</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-12 pt-0 flex-1 space-y-6">
                     <div className="space-y-4">
                        {plan.features.map((f: string, idx: number) => (
                          <div key={idx} className="flex gap-4 items-start group/feat">
                             <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-emerald-500 transition-colors duration-300">
                                <Check className="w-3.5 h-3.5 text-emerald-600 group-hover/feat:text-white" strokeWidth={4} />
                             </div>
                             <span className="text-base text-slate-600 font-bold group-hover/feat:text-slate-900 transition-colors">{f}</span>
                          </div>
                        ))}
                     </div>
                  </CardContent>
                  <CardFooter className="p-12 pt-0">
                     <Button 
                        onClick={() => handleAcquire(plan)} 
                        disabled={!!acquiringId} 
                        className={cn(
                          "w-full h-18 rounded-[24px] text-lg font-black tracking-widest shadow-xl transition-all active:scale-95 uppercase", 
                          isElite ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20" : "bg-slate-900 hover:bg-black text-white"
                        )}
                     >
                        {acquiringId === plan.id ? <Loader2 className="animate-spin" /> : "ACTIVATE PASS+"}
                     </Button>
                  </CardFooter>
                </Card>
              </motion.div>
             );
           })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
             { title: "Syllabus Mastery", desc: "100% Alignment with latest PSSSB & PPSC official criteria.", icon: Trophy, color: "bg-orange-50 text-orange-600" },
             { title: "Bilingual Depth", desc: "Native Raavi Punjabi & English side-by-side exam mode.", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
             { title: "AI Cognitive Audit", desc: "Identifies preparation bottlenecks with neural precision.", icon: Zap, color: "bg-yellow-50 text-yellow-600" },
             { title: "State Merit List", desc: "Compete with 15k+ aspirants and track your district rank.", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600" },
           ].map((benefit, i) => (
             <div key={i} className="p-10 rounded-[40px] bg-white border border-slate-100 space-y-6 shadow-sm">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", benefit.color)}>
                   <benefit.icon size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                   <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{benefit.title}</h4>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-[#1e293b] rounded-[60px] p-16 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <LayoutGrid size={800} className="text-white" />
           </div>
           <div className="relative z-10 space-y-12">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">Need more assurance?</h2>
              <p className="text-2xl text-slate-400 max-w-3xl mx-auto font-medium">Join our daily live classes and interactive doubt solving arena to see why CRACKLIX is Punjab's most trusted prep platform.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                 <Button className="h-20 px-16 rounded-[28px] bg-white text-black text-2xl font-black hover:bg-slate-200 transition-all">TRY FREE HUB</Button>
                 <Button variant="outline" className="h-20 px-16 rounded-[28px] border-white/10 text-white text-2xl font-black hover:bg-white/5 transition-all">TALK TO MENTOR</Button>
              </div>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
