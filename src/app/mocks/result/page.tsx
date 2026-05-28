'use client';

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  ArrowLeft, 
  BarChart3, 
  Target, 
  Timer, 
  Zap, 
  BrainCircuit, 
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ResultPage() {
  // Demo data - in production this would come from local state or route params
  const stats = [
    { label: "Final Score", val: "72.5", sub: "+12 XP Gain", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
    { label: "Accuracy", val: "84%", sub: "High Precision", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Avg. Speed", val: "38s", sub: "per question", icon: Timer, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Punjab Rank", val: "#142", sub: "Top 4%", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const topics = [
    { label: "Punjab GK", value: 92, total: 20, correct: 18, color: "bg-primary" },
    { label: "Reasoning", value: 75, total: 15, correct: 11, color: "bg-emerald-500" },
    { label: "Quant", value: 45, total: 25, correct: 12, color: "bg-red-500" },
    { label: "English", value: 80, total: 10, correct: 8, color: "bg-blue-500" },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-32 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-500 hover:text-slate-800 p-0 h-auto">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Terminal
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Performance Audit</h1>
              <p className="text-slate-500 font-medium">PSSSB Excise Inspector • Sunday Mega Mock #42</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl h-12 border-slate-200 font-bold bg-white text-slate-700">
               <Share2 className="w-4 h-4 mr-2" /> Share Report
             </Button>
             <Button className="rounded-2xl h-12 bg-primary hover:bg-primary/90 font-black px-8">
               VIEW SOLUTIONS
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[32px] border-slate-200 bg-white p-8 h-full flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
                <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-6", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-center space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">{stat.val}</h2>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-1">{stat.sub}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[40px] border-slate-200 bg-white overflow-hidden shadow-sm">
                <CardHeader className="p-10 border-b border-slate-100 bg-slate-50/50">
                   <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900 uppercase tracking-tight">
                        <BarChart3 className="text-primary w-6 h-6" />
                        Subject Analysis
                      </CardTitle>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 uppercase text-[9px] font-black tracking-widest px-3 py-1">Benchmark: Topper (94.5)</Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                    {topics.map((topic) => (
                      <div key={topic.label} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="font-bold text-slate-800">{topic.label}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{topic.correct} / {topic.total} Correct</p>
                          </div>
                          <span className="text-xl font-black text-slate-900">{topic.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${topic.value}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn("h-full", topic.color)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="rounded-[32px] border-slate-200 bg-white p-8 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                       <Clock className="w-4 h-4 text-primary" /> Time Distribution
                    </h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Attempted Questions</span>
                          <span className="font-bold text-slate-800">42m 12s</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Unattempted Questions</span>
                          <span className="font-bold text-slate-800">14m 48s</span>
                       </div>
                       <div className="pt-4 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Analysis</p>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">You spent <strong>12% more time</strong> than the average user on Quant. Consider practicing speed tricks.</p>
                       </div>
                    </div>
                 </Card>

                 <Card className="rounded-[32px] border-slate-200 bg-white p-8 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-emerald-500" /> Accuracy Pulse
                    </h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Correct Signals</span>
                          <span className="font-bold text-emerald-600">68 Questions</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Incorrect Signals</span>
                          <span className="font-bold text-red-500">12 Questions</span>
                       </div>
                       <div className="pt-4 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Penalty Impact</p>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">Incorrect responses cost you <strong>3.00 marks</strong>. Precision improvement could boost your rank by 80 slots.</p>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[40px] bg-slate-900 text-white p-10 flex flex-col justify-between overflow-hidden relative shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BrainCircuit size={150} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                          <BrainCircuit className="text-white w-6 h-6" />
                       </div>
                       <h3 className="text-xl font-bold uppercase tracking-tight">AI Strategy Insight</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed italic mb-10">
                      "Your accuracy in <strong>Punjab GK</strong> is elite (92%), placing you in the top 1%. However, your <strong>Quant</strong> performance is a critical bottleneck. Master 'Ratio & Proportion' to unlock a 90+ score."
                    </p>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-10">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Readiness Index</p>
                       <div className="flex justify-between items-end mb-4">
                          <h4 className="text-5xl font-black text-white">78<span className="text-sm text-zinc-500">%</span></h4>
                          <Badge className="bg-emerald-500 text-white border-none text-[9px] uppercase font-black px-2">IMPROVING</Badge>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "78%" }}
                            className="h-full bg-primary" 
                          />
                       </div>
                    </div>
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest shadow-xl">
                    GENERATE CUSTOM STUDY PLAN
                 </Button>
              </Card>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">Next Operational Steps</h4>
                 <div className="grid grid-cols-1 gap-3">
                    <Button asChild variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                       <Link href="/exams"><Award className="w-4 h-4 mr-2 text-primary" /> Attempt Recommended Mock</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                       <Link href="/bookmarks"><Target className="w-4 h-4 mr-2 text-accent" /> Review Saved Questions</Link>
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
