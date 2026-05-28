
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Check, 
  Zap, 
  Crown, 
  Loader2, 
  Star, 
  ShieldCheck, 
  Terminal, 
  Target, 
  Languages, 
  BrainCircuit,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    getActivePlans().then(data => {
      setPlans(data);
      setLoadingPlans(false);
    }).catch(err => {
      console.error(err);
      setLoadingPlans(false);
    });

    const handleScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        {/* HERO CTA SECTION */}
        <div className="relative pt-10 text-center space-y-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-900 border border-white/5 shadow-2xl"
          >
            <Badge className="bg-primary text-white border-none font-black text-[10px] px-3 py-1">ELITE TIER</Badge>
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Punjab's #1 Preparation Infrastructure</span>
          </motion.div>

          <h1 className="font-headline text-6xl md:text-[110px] font-black tracking-tighter leading-[0.85] text-white">
            UNLIMITED<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">DOMINANCE.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto leading-relaxed font-medium px-4">
            Unlock 500+ Mocks, Bilingual Engine, and AI Performance Coaching. One PASS for all PPSC, PSSSB, and Punjab Police Exams.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
             <Button 
               size="lg" 
               className="h-18 px-12 rounded-[24px] bg-primary hover:bg-primary/90 text-xl font-black blue-glow group"
               onClick={() => document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' })}
             >
                UNLOCK PASS+ NOW
                <Zap className="ml-2 w-5 h-5 fill-current group-hover:rotate-12 transition-transform" />
             </Button>
             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span>15k+ Active Members</span>
             </div>
          </div>
        </div>

        {/* FEATURE COMPARISON TABLE */}
        <div className="space-y-12 px-4">
           <div className="text-center">
             <h2 className="text-4xl font-black tracking-tight uppercase">Access Matrix</h2>
             <p className="text-zinc-500 mt-2 font-medium">Why elite aspirants choose PASS+</p>
           </div>

           <div className="max-w-4xl mx-auto bg-zinc-900/30 border border-white/5 rounded-[48px] overflow-hidden backdrop-blur-xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-zinc-900/60 border-b border-white/5">
                       <th className="p-8 text-xs font-black uppercase text-zinc-500 tracking-[0.2em]">Feature Payload</th>
                       <th className="p-8 text-center text-xs font-black uppercase text-zinc-600 tracking-[0.2em]">Free Hub</th>
                       <th className="p-8 text-center text-xs font-black uppercase text-primary tracking-[0.2em]">PASS+ Tier</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {[
                      { f: "Mock Inventory", free: "Limited (5)", pro: "Unlimited (500+)" },
                      { f: "Bilingual Engine (RAAVI)", free: "Basic", pro: "Full Support" },
                      { f: "AI Performance Coach", free: "❌", pro: "✅ Included" },
                      { f: "Punjab State Ranking", free: "❌", pro: "✅ Realtime" },
                      { f: "PYQ Archives (10Y)", free: "Recent Only", pro: "Complete Vault" },
                      { f: "Selection Predictor", free: "❌", pro: "✅ Powered by AI" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                         <td className="p-6 px-10 text-sm font-bold text-zinc-300">{row.f}</td>
                         <td className="p-6 text-center text-xs font-medium text-zinc-600">{row.free}</td>
                         <td className="p-6 text-center text-sm font-black text-white">{row.pro}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* PRICING MATRIX */}
        <div id="pricing-matrix" className="space-y-12 px-4 scroll-mt-24">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Subscription Plans</h2>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                 <span className="flex items-center gap-2"><Check className="text-emerald-500 w-4 h-4" /> Trusted Gateway</span>
                 <span className="flex items-center gap-2"><Check className="text-emerald-500 w-4 h-4" /> Instant Activation</span>
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
                      
                      <CardHeader className={cn("p-10", isBest && "pt-16")}>
                         <div className="flex justify-between items-start mb-6">
                            <CardTitle className="text-3xl font-black tracking-tighter uppercase">{plan.name}</CardTitle>
                            {isElite && <Crown className="text-primary w-8 h-8 fill-current" />}
                         </div>
                         <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">{plan.duration} Days Validity</CardDescription>
                         <div className="mt-8 flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter">₹{plan.price}</span>
                            <span className="text-zinc-600 font-black text-xs uppercase tracking-widest">/ Term</span>
                         </div>
                      </CardHeader>

                      <CardContent className="p-10 pt-0 flex-1">
                         <div className="space-y-4 mt-2">
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

                      <CardFooter className="p-10 pt-0">
                         <Button
                           onClick={() => buyPass(plan)}
                           disabled={!!loading}
                           className={cn(
                             "w-full h-16 py-8 rounded-[28px] text-xl font-black shadow-xl transition-all duration-300",
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

        {/* SECURITY & FOUNDER VISION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center border-t border-white/5 pt-24 px-4">
           <div className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-black leading-[0.9] tracking-tighter uppercase">FORGED FOR<br /><span className="text-zinc-600">PUNJAB EXCELLENCE.</span></h2>
              <div className="space-y-8">
                 <div className="flex gap-8 items-start">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5">
                       <ShieldCheck className="text-emerald-500" size={32} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-bold">Encrypted Transact</h4>
                       <p className="text-zinc-500 leading-relaxed max-w-sm mt-1">Payments are encrypted via Razorpay 256-bit protocol. Bank-grade security guaranteed for every transaction.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 items-start">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5">
                       <Terminal className="text-primary" size={32} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-bold">Ecosystem Integrity</h4>
                       <p className="text-zinc-500 leading-relaxed max-w-sm mt-1">Zero downtime infrastructure ensures your training session is never interrupted by backend latency.</p>
                    </div>
                 </div>
              </div>
           </div>

           <Card className="rounded-[64px] p-12 md:p-16 cracklix-glass border-white/5 text-center relative overflow-hidden">
              <p className="text-2xl text-zinc-400 italic leading-relaxed font-medium relative z-10">
                "The PASS+ isn't just a subscription; it's the digital infrastructure required to compete at the highest level of Punjab's state governance."
              </p>
              <div className="mt-12 relative z-10">
                 <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Arsh Grewal</p>
                 <p className="text-primary text-[11px] font-black uppercase tracking-widest mt-2">Platform Founder & Architect</p>
              </div>
           </Card>
        </div>
      </div>

      {/* STICKY PURCHASE BAR */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur-2xl border-t border-primary/30 z-[70] p-4 md:p-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hidden sm:flex">
                     <Crown className="text-white w-5 h-5 fill-current" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-primary uppercase tracking-widest leading-none">Unlock Punjab Dominance</p>
                     <p className="text-lg font-black text-white mt-1">PASS+ <span className="text-zinc-500 text-sm font-bold">Starts at ₹99</span></p>
                  </div>
               </div>
               <Button 
                 size="lg" 
                 className="h-12 md:h-14 px-8 md:px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs md:text-sm blue-glow"
                 onClick={() => document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' })}
               >
                  UPGRADE NOW
                  <ArrowRight className="ml-2 w-4 h-4" />
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />
    </AppLayout>
  );
}
