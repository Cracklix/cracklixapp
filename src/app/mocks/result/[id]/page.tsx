'use client';

import { useEffect, useState, use } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { getMockDetails, getMockQuestions } from "@/services/mocks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  Award,
  Loader2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from '@/lib/auth-context';

export default function DetailedResultPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const attemptId = unwrappedParams.id;
  const { user } = useAuth();
  
  const [attempt, setAttempt] = useState<any>(null);
  const [mock, setMock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!attemptId) return;
      try {
        const attemptRef = doc(db, 'attempts', attemptId);
        const attemptSnap = await getDoc(attemptRef);
        if (attemptSnap.exists()) {
          const data = attemptSnap.data();
          setAttempt(data);
          const mockData = await getMockDetails(data.mockId);
          setMock(mockData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-10 h-10 animate-spin text-primary" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Generating Performance Audit...</p>
    </div>
  );

  const stats = [
    { label: "Final Score", val: attempt?.score || 0, sub: "Out of 100", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
    { label: "Accuracy", val: `${attempt?.accuracy || 0}%`, sub: "Precision Signal", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "State Rank", val: "#142", sub: "Ludhiana Cluster", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Percentile", val: "84.2", sub: "Top 15% Elite", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-40 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 md:px-0">
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-zinc-500 hover:text-white p-0 h-auto font-bold uppercase text-[10px] tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Command Center
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Simulation Audit</h1>
              <p className="text-zinc-500 font-bold uppercase text-[11px] tracking-widest mt-2">{mock?.title} • {new Date(attempt?.completedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 border-white/10 font-black text-[10px] uppercase tracking-widest bg-zinc-950">
               <Share2 className="w-4 h-4 mr-2" /> Share Report
             </Button>
             <Button className="flex-1 md:flex-none rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest blue-glow px-10">
               VIEW SOLUTIONS
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[40px] border-white/5 bg-zinc-900/40 p-10 h-full flex flex-col justify-center transition-all hover:bg-zinc-900">
                <div className={cn("w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl", stat.bg)}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <div className="text-center space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
                   <h2 className="text-5xl font-black text-white tracking-tighter">{stat.val}</h2>
                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest pt-2">{stat.sub}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-10">
              <Card className="rounded-[48px] border-white/5 bg-zinc-900/40 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                   <h3 className="text-2xl font-black flex items-center gap-4 text-white uppercase tracking-tighter">
                     <BarChart3 className="text-primary w-7 h-7" />
                     Cognitive Performance
                   </h3>
                   <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 uppercase text-[9px] font-black tracking-widest px-4 py-1.5 bg-emerald-500/5">Strong Signal Detected</Badge>
                </div>
                <div className="p-10 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                    {Object.entries(attempt?.topicPerformance || {}).map(([label, data]: [string, any]) => {
                      const perc = Math.round((data.correct / data.total) * 100);
                      return (
                      <div key={label} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="font-bold text-zinc-100 text-lg">{label}</h4>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{data.correct} / {data.total} Correct Signals</p>
                          </div>
                          <span className={cn("text-2xl font-black", perc > 80 ? "text-emerald-500" : perc > 50 ? "text-primary" : "text-red-500")}>{perc}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${perc}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={cn("h-full", perc > 80 ? "bg-emerald-500" : perc > 50 ? "bg-primary" : "bg-red-500")} 
                          />
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="rounded-[40px] border-white/5 bg-zinc-900/40 p-10 space-y-8">
                    <h4 className="font-bold text-white text-lg flex items-center gap-3 uppercase tracking-tighter">
                       <Clock className="w-5 h-5 text-primary" /> Temporal Efficiency
                    </h4>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-zinc-500">Attempted Buffer</span>
                          <span className="text-white font-black">42m 12s</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-zinc-500">Decision Delay</span>
                          <span className="text-zinc-400">14m 48s</span>
                       </div>
                       <div className="pt-6 border-t border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                             <ShieldCheck className="text-emerald-500 w-3 h-3" />
                             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Audit Result</p>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed italic">You spent <strong className="text-white">12% more time</strong> than the topper on Reasoning. Target speed improvement in the next cycle.</p>
                       </div>
                    </div>
                 </Card>

                 <Card className="rounded-[40px] border-white/5 bg-zinc-900/40 p-10 space-y-8">
                    <h4 className="font-bold text-white text-lg flex items-center gap-3 uppercase tracking-tighter">
                       <AlertTriangle className="w-5 h-5 text-red-500" /> Accuracy Integrity
                    </h4>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-zinc-500">Validated Signals</span>
                          <span className="text-emerald-500 font-black">{attempt?.correct} Qs</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-zinc-500">Faulty Signals</span>
                          <span className="text-red-500 font-black">{attempt?.wrong} Qs</span>
                       </div>
                       <div className="pt-6 border-t border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                             <Trophy className="text-primary w-3 h-3" />
                             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Marking Impact</p>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed italic">Incorrect responses neutralized <strong className="text-white">3.00 marks</strong>. Precision calibration could boost your rank by 12%.</p>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-10">
              <Card className="rounded-[48px] bg-gradient-to-br from-blue-900/20 to-black text-white p-12 flex flex-col justify-between overflow-hidden relative shadow-2xl border border-blue-500/20">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BrainCircuit size={180} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl blue-glow">
                          <BrainCircuit className="text-white w-8 h-8" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Neural Insights</h3>
                          <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mt-1">v4.0 Performance Coach</p>
                       </div>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed italic mb-12">
                      "Your accuracy in <strong>Punjab GK</strong> is elite (92%), placing you in the top 1% of the state. However, your <strong>Quant</strong> performance is a critical bottleneck. Master 'Ratio & Proportion' to unlock a 90+ score."
                    </p>
                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/10 mb-12">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Readiness Probability</p>
                       <div className="flex justify-between items-end mb-4">
                          <h4 className="text-6xl font-black text-white tracking-tighter">78<span className="text-sm text-zinc-500 ml-1">%</span></h4>
                          <Badge className="bg-emerald-500 text-white border-none text-[9px] uppercase font-black px-3 py-1 mb-2">IMPROVING</Badge>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "78%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full bg-primary blue-glow" 
                          />
                       </div>
                    </div>
                 </div>
                 <Button className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl blue-glow active:scale-95 transition-all">
                    GENERATE TACTICAL REVISION PLAN
                 </Button>
              </Card>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-6">Operational Continuity</h4>
                 <div className="grid grid-cols-1 gap-4">
                    <Button asChild variant="outline" className="h-16 rounded-[24px] border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-sm font-bold uppercase text-[10px] tracking-widest transition-all">
                       <Link href="/exams"><Award className="w-4 h-4 mr-3 text-primary" /> Recommended Mock</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[24px] border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-sm font-bold uppercase text-[10px] tracking-widest transition-all">
                       <Link href="/bookmarks"><Target className="w-4 h-4 mr-3 text-accent" /> Review Error signals</Link>
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
