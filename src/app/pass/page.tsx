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
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      setLoadingPlans(true);
      const data = await getActivePlans();
      if (data.length === 0) {
        // Fallback production plans if none are indexed in the primary collection yet
        setPlans([
          { 
            id: 'silver_30', 
            name: 'Monthly Silver Pass', 
            price: 299, 
            duration: 30, 
            tier: 'pass_plus', 
            features: ['All PSSSB Mocks', 'Punjab GK Notes Archive', 'Daily Study Targets', 'Bilingual Support'] 
          },
          { 
            id: 'gold_365', 
            name: 'Elite Annual Pass', 
            price: 999, 
            duration: 365, 
            tier: 'premium', 
            features: ['Unlimited PPSC & Police SI Mocks', 'AI Performance Coach', 'Official PYQ Explanations', 'Ad-Free Interface', 'Priority Support'] 
          },
          { 
            id: 'elite_life', 
            name: 'Lifetime Master Pass', 
            price: 2499, 
            duration: 9999, 
            tier: 'elite', 
            features: ['Lifetime Unrestricted Access', '1-on-1 AI Mentoring Beta', 'Offline PDF Vault', 'Founder Telegram Access', 'All Future Test Series'] 
          }
        ]);
      } else {
        setPlans(data);
      }
      setLoadingPlans(false);
    }
    loadPlans();
  }, []);

  const handleAcquisition = async (plan: any) => {
    if (!user) {
      toast({ title: "Authorization Required", description: "Please sign in to acquire a Preparation Pass.", variant: "destructive" });
      return;
    }

    setLoading(plan.id);
    
    // Testbook-Style Simulated Checkout Flow
    // In a real production build, this triggers the processPassPayment service which opens the Razorpay Modal.
    setTimeout(async () => {
      try {
        await verifyAndActivatePass(user.uid, 'PROD_TXN_' + Date.now(), plan);
        toast({ 
          title: "ENROLLMENT SUCCESSFUL", 
          description: `The ${plan.name} has been synchronized with your identity. Access unlocked.` 
        });
        window.location.href = '/dashboard';
      } catch (err) {
        toast({ title: "Signal Desync", description: "Failed to activate pass. Please contact Arsh Grewal support.", variant: "destructive" });
      } finally {
        setLoading(null);
      }
    }, 1200);
  };

  return (
    <AppLayout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-6xl mx-auto space-y-20 pb-32">
        <header className="text-center space-y-6 pt-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">Enlist in Elite Preparation</Badge>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Master Every<br />Punjab Government Exam</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Unlock 500+ Simulations, AI Performance Coaching, and Unlimited PYQ Repository access designed by Arsh Grewal.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {loadingPlans ? (
             [1,2,3].map(i => <div key={i} className="h-[550px] rounded-[40px] bg-zinc-900/40 animate-pulse border border-white/5" />)
           ) : plans.map((plan, i) => {
             const isBestValue = plan.tier === 'premium' || plan.id.includes('gold');
             return (
              <motion.div 
                key={plan.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }} 
                className="h-full"
              >
                <Card className={cn(
                  "rounded-[40px] border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl relative",
                  isBestValue && "border-primary ring-2 ring-primary ring-offset-4 dark:ring-offset-black scale-105 z-10"
                )}>
                  {isBestValue && (
                    <div className="bg-primary text-white text-center py-2 text-[10px] font-black uppercase tracking-widest absolute top-0 left-0 w-full">TOP ASPIRANT CHOICE</div>
                  )}
                  <CardHeader className={cn("p-10", isBestValue && "pt-12")}>
                     <CardTitle className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{plan.name}</CardTitle>
                     <div className="mt-8 flex items-baseline gap-2">
                        <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">₹{plan.price}</span>
                        <span className="text-slate-400 font-bold text-xs uppercase">/ {plan.duration >= 999 ? 'LIFETIME' : plan.duration + ' DAYS'}</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 flex-1">
                     <div className="space-y-4">
                        {(plan.features || []).map((f: string, idx: number) => (
                          <div key={idx} className="flex gap-3 items-start">
                             <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-600" strokeWidth={4} />
                             </div>
                             <span className="text-sm text-slate-600 dark:text-zinc-400 font-medium">{f}</span>
                          </div>
                        ))}
                     </div>
                  </CardContent>
                  <CardFooter className="p-10 pt-0">
                     <Button 
                        onClick={() => handleAcquisition(plan)} 
                        disabled={!!loading} 
                        className={cn(
                          "w-full h-14 rounded-2xl text-lg font-black shadow-lg transition-all active:scale-95", 
                          isBestValue ? "bg-primary hover:bg-primary/90 blue-glow" : "bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800"
                        )}
                     >
                        {loading === plan.id ? <Loader2 className="animate-spin" /> : "ACTIVATE PASS+"}
                     </Button>
                  </CardFooter>
                </Card>
              </motion.div>
             );
           })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { title: "Syllabus Mastery", desc: "100% Alignment with latest PSSSB & PPSC criteria.", icon: Trophy, color: "bg-orange-100 text-orange-600" },
             { title: "Bilingual Depth", desc: "EN & Gurmukhi (Raavi) side-by-side exam mode.", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
             { title: "AI Cognitive Audit", desc: "Identifies weak subjects with neural precision.", icon: ZapIcon, color: "bg-purple-100 text-purple-600" },
             { title: "Exam Simulation", desc: "Real CBT interface as used by state boards.", icon: Timer, color: "bg-emerald-100 text-emerald-600" },
           ].map((benefit, i) => (
             <div key={i} className="p-8 rounded-[32px] bg-slate-50 dark:bg-zinc-900/20 border border-slate-100 dark:border-white/5 space-y-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", benefit.color)}>
                   <benefit.icon size={24} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-zinc-200">{benefit.title}</h4>
                <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">{benefit.desc}</p>
             </div>
           ))}
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
