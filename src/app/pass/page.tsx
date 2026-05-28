
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Check, 
  Crown, 
  Loader2, 
  Zap as ZapIcon,
  ShieldCheck,
  Trophy,
  BookOpen,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { getActivePlans, verifyAndActivatePass } from '@/services/payment';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PassPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    getActivePlans().then(data => {
      if (data.length === 0) {
        // Fallback production plans if none in DB
        setPlans([
          { id: 'silver', name: 'Monthly Silver Pass', price: 299, duration: 30, tier: 'silver', features: ['All PSSSB Mocks', 'Punjab GK Notes', 'Daily Targets'] },
          { id: 'gold', name: 'Elite Annual Pass', price: 999, duration: 365, tier: 'gold', features: ['Unlimited PPSC/SI Mocks', 'AI Performance Coach', 'PYQ Video Solutions', 'Priority Support'] },
          { id: 'elite', name: 'Lifetime Master Pass', price: 2499, duration: 9999, tier: 'elite', features: ['Unrestricted System Access', '1-on-1 AI Mentoring', 'Offline PDF Vault', 'Founder Telegram Access'] }
        ]);
      } else {
        setPlans(data);
      }
      setLoadingPlans(false);
    });
  }, []);

  const buyPass = async (plan: any) => {
    if (!user) {
      toast({ title: "Identity Required", description: "Please sign in to enlist.", variant: "destructive" });
      return;
    }

    setLoading(plan.id);
    // SIMULATED RAZORPAY WORKFLOW FOR PRODUCTION FEEL
    setTimeout(async () => {
      try {
        await verifyAndActivatePass(user.uid, 'TXN_' + Date.now(), {
          type: plan.tier,
          durationDays: plan.duration,
          accessMatrix: { all_access: plan.tier === 'elite' }
        });
        toast({ title: "PASS ACTIVATED", description: `${plan.name} is now live in your dashboard.` });
        window.location.href = '/dashboard';
      } catch (err) {
        toast({ title: "Activation Failed", variant: "destructive" });
      } finally {
        setLoading(null);
      }
    }, 1500);
  };

  return (
    <AppLayout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-6xl mx-auto space-y-20 pb-32">
        <header className="text-center space-y-6 pt-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">Enlist in Elite Preparation</Badge>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">Master Every<br />Punjab Government Exam</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Unlock 500+ Simulations, AI Cognitive Performance Audits, and Unlimited PYQ Repository access.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {loadingPlans ? (
             [1,2,3].map(i => <div key={i} className="h-[500px] rounded-[40px] bg-slate-100 animate-pulse" />)
           ) : plans.map((plan, i) => {
             const isBestValue = plan.tier === 'gold';
             return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="h-full">
                <Card className={cn(
                  "rounded-[40px] border-slate-200 bg-white overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl relative",
                  isBestValue && "border-primary ring-2 ring-primary ring-offset-4 scale-105 z-10"
                )}>
                  {isBestValue && (
                    <div className="bg-primary text-white text-center py-2 text-[10px] font-black uppercase tracking-widest absolute top-0 left-0 w-full">TOP ASPIRANT CHOICE</div>
                  )}
                  <CardHeader className={cn("p-10", isBestValue && "pt-12")}>
                     <CardTitle className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{plan.name}</CardTitle>
                     <div className="mt-8 flex items-baseline gap-2">
                        <span className="text-6xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                        <span className="text-slate-400 font-bold text-xs uppercase">/ {plan.duration === 9999 ? 'Life' : plan.duration + 'd'}</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 flex-1">
                     <div className="space-y-4">
                        {plan.features.map((f: string, idx: number) => (
                          <div key={idx} className="flex gap-3 items-start">
                             <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-600" strokeWidth={4} />
                             </div>
                             <span className="text-sm text-slate-600 font-medium">{f}</span>
                          </div>
                        ))}
                     </div>
                  </CardContent>
                  <CardFooter className="p-10 pt-0">
                     <Button onClick={() => buyPass(plan)} disabled={!!loading} className={cn("w-full h-14 rounded-2xl text-lg font-black shadow-lg", isBestValue ? "bg-primary" : "bg-slate-900 hover:bg-slate-800")}>
                        {loading === plan.id ? <Loader2 className="animate-spin" /> : "ACTIVATE NOW"}
                     </Button>
                  </CardFooter>
                </Card>
              </motion.div>
             );
           })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { title: "Syllabus Mastery", desc: "100% Alignment with PSSSB & PPSC criteria.", icon: Trophy, color: "bg-orange-100 text-orange-600" },
             { title: "Bilingual Depth", desc: "EN & Gurmukhi (Raavi) side-by-side mode.", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
             { title: "AI Cognitive Audit", desc: "Identifies weak subjects with 99% precision.", icon: ZapIcon, color: "bg-purple-100 text-purple-600" },
             { title: "Exam Simulation", desc: "Real CBT interface used by state boards.", icon: Timer, color: "bg-emerald-100 text-emerald-600" },
           ].map((benefit, i) => (
             <div key={i} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", benefit.color)}>
                   <benefit.icon size={24} />
                </div>
                <h4 className="font-bold text-slate-800">{benefit.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
             </div>
           ))}
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
