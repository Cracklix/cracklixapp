
'use client';

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowLeft, BarChart3, Target, Timer, Zap, BrainCircuit, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function ResultPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-24 space-y-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full bg-zinc-900 border border-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tight">Performance Audit</h1>
              <p className="text-muted-foreground">Punjab Police SI Mock Test #12 • June 2024 Cycle</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-2xl h-12 border-white/10 font-bold bg-zinc-900">
            <Share2 className="w-4 h-4 mr-2" /> Share Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Final Score", val: "42.5", sub: "+5 XP Boost", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
            { label: "Accuracy", val: "85%", sub: "High Precision", icon: Target, color: "text-accent", bg: "bg-accent/10" },
            { label: "Avg. Speed", val: "42s", sub: "per question", icon: Timer, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Punjab Rank", val: "#42", sub: "Top 2%", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[40px] cracklix-glass border-white/5 p-8 text-center h-full flex flex-col justify-center">
                <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-6", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{stat.label}</p>
                <h2 className="text-4xl font-black">{stat.val}</h2>
                <p className="text-[9px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">{stat.sub}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[48px] border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-10 border-b border-white/5 bg-white/[0.01]">
                   <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <BarChart3 className="text-primary w-6 h-6" />
                        Topic Deep-Dive
                      </CardTitle>
                      <Badge variant="outline" className="border-white/10 text-zinc-500 uppercase text-[9px] font-black tracking-widest">PSSSB Standards</Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  {[
                    { label: "Punjab GK", value: 92, total: 10, correct: 9, color: "bg-primary" },
                    { label: "Current Affairs", value: 65, total: 12, correct: 8, color: "bg-accent" },
                    { label: "Quant", value: 40, total: 15, correct: 5, color: "bg-destructive" },
                    { label: "Reasoning", value: 85, total: 13, correct: 11, color: "bg-emerald-500" },
                  ].map((topic) => (
                    <div key={topic.label} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="font-bold text-lg">{topic.label}</h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{topic.correct} Correct of {topic.total} Questions</p>
                        </div>
                        <span className="text-2xl font-black">{topic.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.value}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn("h-full", topic.color)} 
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[48px] bg-gradient-to-br from-primary/20 via-zinc-950 to-black border-primary/20 p-10 flex flex-col justify-between overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BrainCircuit size={150} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <BrainCircuit className="text-primary w-6 h-6" />
                       <h3 className="text-xl font-bold">AI Strategy Brief</h3>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed italic mb-10">
                      "Your accuracy in <strong>Punjab GK</strong> is elite, but <strong>Quant</strong> is pulling your rank down. Focused practice on 'Profit & Loss' could boost your rank by <span className="text-white font-bold">150+ slots</span>."
                    </p>
                    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 mb-8">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Readiness Score</p>
                       <div className="flex justify-between items-end mb-4">
                          <h4 className="text-4xl font-black">74<span className="text-sm text-zinc-500">%</span></h4>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase font-black">IMPROVING</Badge>
                       </div>
                       <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[74%]" />
                       </div>
                    </div>
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold relative z-10">
                    Generate Study Plan
                 </Button>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                 <Button asChild className="h-14 rounded-2xl bg-zinc-900 border border-white/5 font-bold">
                    <Link href="/dashboard">Home</Link>
                 </Button>
                 <Button asChild className="h-14 rounded-2xl bg-primary text-white font-bold">
                    <Link href="/exams">Next Mock</Link>
                 </Button>
              </div>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
