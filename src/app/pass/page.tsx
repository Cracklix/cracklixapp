"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Zap, Crown, Loader2, Star, ShieldCheck, ShieldAlert, BookOpen, Activity, Terminal, Target, Languages, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { getActivePlans, Plan } from '@/services/subscriptions';
import { getPublicPaymentConfig } from '@/services/payment-settings';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PassPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    getActivePlans().then(data => {
      setPlans(data);
      setLoadingPlans(false);
    }).catch(err => {
      console.error(err);
      setLoadingPlans(false);
    });
  }, []);

  const buyPass = async (plan: Plan) => {
    if (!user) {
      toast({ title: "Identity Required", description: "Please sign in to authorize pass purchase.", variant: "destructive" });
      return;
    }

    setLoading(plan.id);
    try {
      const config = await getPublicPaymentConfig();
      if (!config || !config.enabled) {
        throw new Error("Payment system is currently under maintenance.");
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.price }),
      });

      const order = await orderRes.json();
      if (order.error) throw new Error(order.error);

      const options = {
        key: config.keyId,
        amount: order.amount,
        currency: "INR",
        name: "CRACKLIX PASS+",
        description: `${plan.name} • Punjab Exam Dominance`,
        order_id: order.id,
        prefill: {
          name: profile?.name || "",
          email: user.email || "",
        },
        theme: { color: "#3b82f6" },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                response,
                plan: plan.name,
                planId: plan.id,
                duration: plan.duration,
                amount: plan.price,
                userId: user.uid,
              }),
            });

            const verification = await verifyRes.json();
            if (verification.success) {
              toast({ title: "PASS ACTIVATED", description: "Welcome to the elite 1%. Your PASS is now live." });
              window.location.href = '/dashboard';
            } else {
              throw new Error("Signature verification failed.");
            }
          } catch (err: any) {
            toast({ title: "Verification Breach", description: "Contact support if amount deducted.", variant: "destructive" });
          }
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      toast({ title: "Checkout Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppLayout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-7xl mx-auto space-y-24 pb-32">
        {/* Hero Section */}
        <div className="relative pt-10 text-center space-y-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-900 border border-white/5 shadow-2xl"
          >
            <Badge className="bg-primary text-white border-none font-black text-[10px] px-3 py-1">ELITE TIER</Badge>
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Master Punjab Exams with PASS+</span>
          </motion.div>

          <h1 className="font-headline text-7xl md:text-[110px] font-black tracking-tighter leading-[0.85] text-white">
            UNLIMITED<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">DOMINANCE.</span>
          </h1>
          
          <p className="text-2xl text-zinc-500 max-w-3xl mx-auto leading-relaxed font-medium">
            Join 15k+ aspirants who have upgraded to PASS+ to unlock professional simulations and AI performance insights.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <span>Infrastructure by Arsh Grewal</span>
          </div>
        </div>

        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { title: "500+ Mocks", desc: "Full-length simulations for PPSC, PSSSB & Police.", icon: BookOpen, color: "text-blue-500" },
             { title: "Bilingual Hub", desc: "Official RAAVI and English test engines.", icon: Languages, color: "text-purple-500" },
             { title: "State Ranks", desc: "Live district and state merit lists.", icon: Target, color: "text-emerald-500" },
             { title: "AI Coach", desc: "Cognitive gap analysis for every attempt.", icon: BrainCircuit, color: "text-accent" },
           ].map((feat, i) => (
             <div key={i} className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 space-y-4 hover:bg-zinc-900 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><feat.icon size={80} /></div>
                <div className={cn("w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center relative z-10", feat.color)}>
                   <feat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold relative z-10">{feat.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed relative z-10">{feat.desc}</p>
             </div>
           ))}
        </div>

        {/* Pricing Matrix */}
        <div className="space-y-12">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
              <h2 className="text-5xl font-black tracking-tight uppercase leading-none">Access Matrix</h2>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                 <span className="flex items-center gap-2"><Check className="text-emerald-500 w-4 h-4" /> Trusted Platform</span>
                 <span className="flex items-center gap-2"><Check className="text-emerald-500 w-4 h-4" /> Secure Gateway</span>
              </div>
           </div>

           {loadingPlans ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[1,2,3].map(i => <div key={i} className="h-[550px] rounded-[48px] bg-zinc-900/40 animate-pulse border border-white/5" />)}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {plans.map((plan, i) => {
                 const isBest = plan.tier === 'gold';
                 const isElite = plan.tier === 'elite';

                 return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="h-full"
                  >
                    <Card className={cn(
                      "rounded-[56px] border-white/5 bg-zinc-900/40 overflow-hidden h-full flex flex-col transition-all duration-500 hover:scale-[1.02] relative",
                      isBest && "border-primary/50 shadow-2xl shadow-primary/10",
                      isElite && "bg-gradient-to-b from-primary/10 to-transparent border-primary/20"
                    )}>
                      {isBest && (
                        <div className="bg-primary text-white text-center py-2 text-[10px] font-black uppercase tracking-[0.4em] absolute top-0 left-0 w-full">
                           RECOMMENDED BY TOPPERS
                        </div>
                      )}
                      
                      <CardHeader className={cn("p-12", isBest && "pt-16")}>
                         <div className="flex justify-between items-start mb-6">
                            <CardTitle className="text-4xl font-black tracking-tighter uppercase">{plan.name}</CardTitle>
                            {isElite && <Crown className="text-primary w-10 h-10 fill-current" />}
                         </div>
                         <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">{plan.duration} Days Validity</CardDescription>
                         <div className="mt-10 flex items-baseline gap-2">
                            <span className="text-7xl font-black tracking-tighter">₹{plan.price}</span>
                            <span className="text-zinc-600 font-black text-xs uppercase tracking-widest">/ Term</span>
                         </div>
                      </CardHeader>

                      <CardContent className="p-12 pt-0 flex-1">
                         <div className="space-y-5 mt-4">
                            {plan.features.map((f, idx) => (
                              <div key={idx} className="flex gap-4 items-start group/feat">
                                 <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-emerald-500/20 transition-colors">
                                    <Check className="w-3 h-3 text-emerald-500" strokeWidth={4} />
                                 </div>
                                 <span className="text-sm text-zinc-400 font-bold group-hover/feat:text-white transition-colors">{f}</span>
                              </div>
                            ))}
                         </div>
                      </CardContent>

                      <CardFooter className="p-12 pt-0">
                         <Button
                           onClick={() => buyPass(plan)}
                           disabled={!!loading}
                           className={cn(
                             "w-full h-18 py-8 rounded-[28px] text-xl font-black shadow-xl transition-all duration-300",
                             isElite ? "bg-white text-black hover:bg-zinc-200" : "bg-primary hover:bg-primary/90 blue-glow"
                           )}
                         >
                           {loading === plan.id ? <Loader2 className="animate-spin" /> : "ACTIVATE ACCESS"}
                         </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                 );
               })}
             </div>
           )}
        </div>

        {/* Security / Founder Quote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center border-t border-white/5 pt-24">
           <div className="space-y-10">
              <h2 className="text-5xl font-black leading-[0.9] tracking-tighter uppercase">FORGED FOR<br /><span className="text-zinc-600">PUNJAB EXCELLENCE.</span></h2>
              <div className="space-y-8">
                 <div className="flex gap-8 items-start">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5">
                       <ShieldCheck className="text-emerald-500" size={32} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-bold">Safe Transact</h4>
                       <p className="text-zinc-500 leading-relaxed max-w-sm mt-1">Payments are encrypted via Razorpay 256-bit protocol. Bank-grade security guaranteed.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 items-start">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5">
                       <Terminal className="text-primary" size={32} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-bold">System Integrity</h4>
                       <p className="text-zinc-500 leading-relaxed max-w-sm mt-1">Zero downtime infrastructure ensures your training session is never interrupted by backend lag.</p>
                    </div>
                 </div>
              </div>
           </div>

           <Card className="rounded-[64px] p-16 cracklix-glass border-white/5 text-center relative overflow-hidden">
              <Star className="text-primary/20 w-40 h-40 absolute -top-10 -right-10 rotate-12" />
              <p className="text-2xl text-zinc-400 italic leading-relaxed font-medium relative z-10">
                "The PASS+ isn't an expense; it's the digital infrastructure required to compete with the top 1% of Punjab's talent."
              </p>
              <div className="mt-12 relative z-10">
                 <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Arsh Grewal</p>
                 <p className="text-primary text-[11px] font-black uppercase tracking-widest mt-2">Platform Founder & Architect</p>
              </div>
           </Card>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}