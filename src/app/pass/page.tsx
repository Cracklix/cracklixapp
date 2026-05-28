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
  Zap as ZapIcon,
  Award,
  BookOpen,
  Trophy,
  History,
  Timer
} from 'lucide-react';
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
      toast({ title: "Identity Required", description: "Please sign in to continue.", variant: "destructive" });
      return;
    }

    setLoading(plan.id);
    try {
      const config = await getPublicPaymentConfig();
      if (!config || !config.enabled) throw new Error("Payment system unavailable.");

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
        description: `${plan.name} Subscription`,
        order_id: order.id,
        prefill: { name: profile?.name || "", email: user.email || "" },
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
              toast({ title: "PASS ACTIVATED", description: "Your training inventory has been upgraded." });
              window.location.href = '/dashboard';
            }
          } catch (err) {
            toast({ title: "Verification Failed", variant: "destructive" });
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
      
      <div className="max-w-6xl mx-auto space-y-20 pb-32">
        <header className="text-center space-y-6 pt-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">Upgrade Your Preparation</Badge>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">One Pass for All<br />Punjab Exams</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Unlock 500+ Mocks, AI Performance Coaching, and Unlimited PYQ solutions for PPSC, PSSSB, and Punjab Police.</p>
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
                    <div className="bg-primary text-white text-center py-2 text-[10px] font-black uppercase tracking-widest absolute top-0 left-0 w-full">MOST POPULAR CHOICE</div>
                  )}
                  <CardHeader className={cn("p-10", isBestValue && "pt-12")}>
                     <CardTitle className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{plan.name}</CardTitle>
                     <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{plan.duration} Days Unlimited Access</CardDescription>
                     <div className="mt-8 flex items-baseline gap-2">
                        <span className="text-6xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                        <span className="text-slate-400 font-bold text-xs uppercase">/ term</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 flex-1">
                     <div className="space-y-4">
                        {plan.features.map((f, idx) => (
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
                        {loading === plan.id ? <Loader2 className="animate-spin" /> : "GET STARTED NOW"}
                     </Button>
                  </CardFooter>
                </Card>
              </motion.div>
             );
           })}
        </div>

        <div className="space-y-10">
           <div className="text-center">
             <h2 className="text-3xl font-bold text-slate-900">Elite Benefits</h2>
             <p className="text-slate-500 mt-2">Indistinguishable from the official board experience.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "Real-Time Ranks", desc: "See your standing among thousands of Punjab aspirants.", icon: Trophy, color: "bg-orange-100 text-orange-600" },
                { title: "Bilingual Solutions", desc: "Detailed explanations in both English and Gurmukhi.", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
                { title: "AI Coach", desc: "Personalized weak-area identification and study plans.", icon: ZapIcon, color: "bg-purple-100 text-purple-600" },
                { title: "Exam Simulation", desc: "CBT interface matching PSSSB and PPSC standards.", icon: Timer, color: "bg-emerald-100 text-emerald-600" },
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

        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[48px] p-12 md:p-16 text-center space-y-8 shadow-2xl relative overflow-hidden text-white">
           <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={200} /></div>
           <div className="relative z-10 space-y-8">
              <h3 className="text-4xl font-black uppercase tracking-tight leading-tight">Institutional Integrity Guaranteed</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">"Our commitment is to provide the highest-fidelity exam infrastructure. Every mock test is vetted by subject matter experts to ensure 100% syllabus alignment."</p>
              <div className="pt-4">
                 <p className="font-bold text-white uppercase tracking-widest text-sm">Arsh Grewal</p>
                 <p className="text-primary text-[10px] font-black uppercase mt-1">Platform Architect</p>
              </div>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
