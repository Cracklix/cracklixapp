
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Zap, Sparkles, ShieldCheck, Crown, Loader2, CreditCard, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivePlans, Plan } from '@/services/subscriptions';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

  const buyPass = async (amount: number, plan: Plan) => {
    if (!user) {
      toast({ title: "Identity Required", description: "Please sign in to authorize pass purchase.", variant: "destructive" });
      return;
    }

    setLoading(plan.id);
    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const order = await orderRes.json();
      if (order.error) throw new Error(order.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "CRACKLIX ELITE",
        description: `${plan.name} Access • Master Punjab Govt Exams`,
        order_id: order.id,
        prefill: {
          name: profile?.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
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
                amount,
                userId: user.uid,
              }),
            });

            const verification = await verifyRes.json();
            if (verification.success) {
              toast({
                title: "PASS ACTIVATED",
                description: `Welcome to the top 1%. Your ${plan.name} credentials are now live.`,
              });
              // Redirect or refresh
              window.location.href = '/dashboard';
            }
          } catch (err: any) {
            toast({ title: "Verification Breach", description: "Payment verification interrupted. Contact support if balance deducted.", variant: "destructive" });
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
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
      
      <div className="max-w-6xl mx-auto space-y-16 pb-32">
        <div className="text-center space-y-6 pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <Crown className="w-4 h-4" />
            Strategic Access Tier
          </motion.div>
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-none">CRACKLIX <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">PASS.</span></h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium">
            Dominate the competition with AI-powered coaching, live state rankings, and elite content archives.
          </p>
        </div>

        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-[500px] rounded-[48px] bg-zinc-900/40 animate-pulse border border-white/5" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, i) => {
               const isBestValue = i === 1;
               const isElite = i === 2;

               return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col h-full"
                >
                  <Card className={cn(
                    "rounded-[48px] border-white/5 flex flex-col h-full overflow-hidden transition-all duration-500 hover:scale-[1.03] bg-zinc-900/40 relative group",
                    isBestValue && "border-primary/50 ring-1 ring-primary/20 shadow-2xl shadow-primary/10",
                    isElite && "bg-gradient-to-b from-primary/10 to-transparent border-primary/30"
                  )}>
                    {isBestValue && (
                      <div className="bg-primary text-white text-center py-2.5 text-[10px] font-black uppercase tracking-[0.3em] absolute top-0 left-0 w-full z-10">
                        Strategic Choice
                      </div>
                    )}
                    
                    <CardHeader className={cn("p-10 pb-6", isBestValue && "pt-16")}>
                      <div className="flex justify-between items-start mb-4">
                         <CardTitle className="text-3xl font-black tracking-tight">{plan.name}</CardTitle>
                         {isElite && <Crown className="text-primary w-8 h-8 fill-current" />}
                      </div>
                      <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{plan.duration} Days of Unrestricted Alpha Access</CardDescription>
                      <div className="mt-8 flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter">₹{plan.price}</span>
                        <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">/period</span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-10 pt-0 flex-1">
                      <div className="space-y-4 mt-8">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex gap-4 text-sm items-start group/feat">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-emerald-500/20 transition-colors">
                               <Check className="w-3 h-3 text-emerald-500" strokeWidth={4} />
                            </div>
                            <span className="text-zinc-400 font-medium leading-tight group-hover/feat:text-white transition-colors">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="p-10 pt-0">
                      <Button
                        onClick={() => buyPass(plan.price, plan)}
                        disabled={!!loading}
                        className={cn(
                          "w-full h-16 rounded-[24px] text-xl font-black shadow-xl transition-all duration-300",
                          isElite ? "bg-white text-black hover:bg-zinc-200" : "bg-primary hover:bg-primary/90 blue-glow"
                        )}
                      >
                        {loading === plan.id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <Zap className="mr-2 w-5 h-5 fill-current" />
                            ACTIVATE PASS
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
               );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-zinc-900/50 p-16 rounded-[64px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <ShieldCheck size={300} />
          </div>
          <div className="space-y-8 relative z-10">
            <h2 className="text-5xl font-black leading-none tracking-tighter">Bank-Grade Security.<br /><span className="text-zinc-600">No Compromise.</span></h2>
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 shadow-lg">
                  <ShieldCheck className="text-emerald-500 w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">Encrypted Transactions</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">All payments are secured via Razorpay AES-256 encryption. We never store card details.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 shadow-lg">
                  <Sparkles className="text-accent w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">Instant Authorization</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">Your preparation credentials unlock the exact millisecond your payment signal is verified.</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="rounded-[48px] p-12 cracklix-glass border-white/5 flex flex-col items-center justify-center text-center relative z-10 h-full min-h-[350px]">
             <div className="absolute top-0 right-0 p-8">
                <Star className="text-yellow-500 w-6 h-6 fill-current animate-pulse" />
             </div>
             <Crown className="w-20 h-20 text-primary mb-8 opacity-20" />
             <p className="text-xl text-zinc-400 italic leading-relaxed font-medium">
               "Joining CRACKLIX ELITE was the single biggest ROI in my SI preparation. The AI Tutor alone saved me 50+ hours of doubt-hunting."
             </p>
             <div className="mt-8">
                <p className="font-black uppercase tracking-[0.2em] text-xs text-white">Arsh S. • Ludhiana</p>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Rank #42 Overall</p>
             </div>
          </Card>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
