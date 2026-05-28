
"use client";

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Gift, Share2, Copy, Users, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ReferralPage() {
  const { profile } = useAuth();
  const referralCode = profile?.referralCode || "CRACKLIX_VIP";

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Code Copied!", description: "Share it with your fellow aspirants." });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-24">
        <div className="text-center space-y-4">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-20 h-20 rounded-[28px] bg-primary flex items-center justify-center mx-auto shadow-2xl blue-glow"
           >
              <Gift className="text-white w-10 h-10" />
           </motion.div>
           <h1 className="font-headline text-5xl font-black">Invite & Earn</h1>
           <p className="text-zinc-500 max-w-md mx-auto">Get 100 Coins for every friend who joins. Use coins to unlock Premium Mocks and AI sessions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           <Card className="rounded-[40px] cracklix-glass border-primary/20 bg-primary/5 overflow-hidden">
             <CardContent className="p-10 space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Your Unique Link</p>
                  <div className="flex gap-2 p-2 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex-1 px-4 py-3 font-mono text-sm text-primary font-bold truncate">
                      cracklix.in/join?ref={referralCode}
                    </div>
                    <Button size="icon" variant="ghost" onClick={copyCode} className="h-11 w-11 rounded-xl hover:bg-white/5">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-xl" onClick={copyCode}>
                  <Share2 className="mr-3 w-5 h-5" />
                  Share with Friends
                </Button>
             </CardContent>
           </Card>

           <div className="space-y-6">
              {[
                { title: "Invite Aspirants", desc: "Share your code on Telegram or WhatsApp groups.", icon: Users },
                { title: "They Join", desc: "Friend signs up and completes their first mock.", icon: CheckCircle2 },
                { title: "Get Rewarded", desc: "Instantly receive 100 Coins + 50 XP boost.", icon: Zap },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 items-start p-6 rounded-3xl bg-zinc-900/40 border border-white/5">
                   <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
                      <step.icon className="text-primary w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-bold text-lg">{step.title}</h4>
                     <p className="text-sm text-zinc-500 mt-1">{step.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <Card className="rounded-[40px] cracklix-glass border-white/5">
           <CardContent className="p-10 text-center space-y-6">
              <h3 className="text-2xl font-bold">Referral Leaderboard</h3>
              <div className="py-12 border-2 border-dashed border-white/5 rounded-[32px]">
                <p className="text-zinc-600 font-medium italic">Top inviters win 1 month free PASS every week.</p>
              </div>
           </CardContent>
        </Card>
      </div>
      <Navbar />
    </AppLayout>
  );
}
