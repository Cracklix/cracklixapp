
"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Zap, Sparkles, ShieldCheck, Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PassPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const buyPass = async (amount: number, plan: string) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to buy a pass.", variant: "destructive" });
      return;
    }

    setLoading(plan);
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
        name: "CRACKLIX PASS",
        description: `${plan} Access - Punjab Govt Exam mastery`,
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
                plan,
                amount,
                userId: user.uid,
              }),
            });

            const verification = await verifyRes.json();
            if (verification.success) {
              toast({
                title: "PASS Activated!",
                description: `Welcome to the elite tier. Your ${plan} access is now live.`,
              });
            }
          } catch (err: any) {
            toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
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

  const plans = [
    {
      name: "Monthly",
      price: 199,
      description: "Perfect for a single exam sprint.",
      features: ["Unlimited Mocks", "Basic AI Coaching", "Standard Analytics", "Punjab GK PDF Access"],
      color: "bg-zinc-900",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "Quarterly",
      price: 499,
      description: "Our most popular plan for serious aspirants.",
      features: ["Everything in Monthly", "Advanced AI Coach", "Rank Predictor", "Current Affairs (Premium)", "Priority Support"],
      color: "bg-card/40 border-primary/50",
      highlight: true,
      buttonColor: "bg-primary hover:bg-primary/90"
    },
    {
      name: "Yearly",
      price: 999,
      description: "The ultimate edge for multi-exam domination.",
      features: ["Everything in Quarterly", "AI Mock Generator", "1-on-1 Strategy Support", "Exclusive Webinars", "Pass for Life Discount"],
      color: "bg-zinc-900",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700"
    }
  ];

  return (
    <AppLayout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest"
          >
            <Crown className="w-4 h-4" />
            Join the Elite
          </motion.div>
          <h1 className="font-headline text-5xl md:text-6xl font-bold">CRACKLIX <span className="text-primary">PASS</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI-driven learning and dominate Punjab government exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`rounded-[40px] border-white/5 flex flex-col h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] ${plan.color}`}>
                {plan.highlight && (
                  <div className="bg-primary text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
                    Best Value
                  </div>
                )}
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">{plan.description}</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹{plan.price}</span>
                    <span className="text-muted-foreground">/period</span>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1">
                  <div className="space-y-4 mt-6">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex gap-3 text-sm items-center">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-zinc-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button
                    onClick={() => buyPass(plan.price, plan.name)}
                    disabled={!!loading}
                    className={`w-full h-14 rounded-2xl text-lg font-bold ${plan.buttonColor}`}
                  >
                    {loading === plan.name ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="mr-2 w-5 h-5 fill-current" />
                        Get {plan.name} Pass
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-secondary/20 p-12 rounded-[48px] border border-white/5">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">Secure, Reliable & Trusted by Aspirants</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-emerald-500 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">Encrypted Payments</h4>
                  <p className="text-sm text-muted-foreground">All transactions are processed through Razorpay's bank-grade security.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Sparkles className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">Instant Activation</h4>
                  <p className="text-sm text-muted-foreground">Your premium features unlock the second your payment is confirmed.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-[32px] bg-gradient-to-tr from-primary/10 to-accent/10 border border-white/5 flex items-center justify-center overflow-hidden">
             <div className="text-center p-8">
               <Crown className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
               <p className="text-muted-foreground italic leading-relaxed">
                 "Join 5,000+ Punjab govt aspirants who have already upgraded their preparation with CRACKLIX PASS."
               </p>
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
