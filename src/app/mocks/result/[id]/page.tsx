
'use client';

import { useEffect, useState, use } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { getMockDetails } from "@/services/mocks";
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
  AlertTriangle,
  Flame,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from '@/lib/auth-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PerformanceAuditV25({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-6">
       <Loader2 className="w-12 h-12 animate-spin text-primary" />
       <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Generating Cognitive Preparation Audit...</p>
    </div>
  );

  const stats = [
    { label: "Final Score", val: attempt?.score || 0, sub: "Out of 100", icon: Trophy, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "State Rank", val: "#142", sub: "Ludhiana Cluster", icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Accuracy", val: `${attempt?.accuracy || 0}%`, sub: "Precision Signal", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Percentile", val: "84.2", sub: "Elite Tier (Top 15%)", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-40 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-500 hover:text-slate-900 p-0 h-auto font-black uppercase text-[10px] tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Command Center
              </Button>
            </Link>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Simulation Audit</h1>
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2">{mock?.title} • Session {attemptId.substring(0, 6)}</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 border-slate-200 font-black text-[11px] uppercase tracking-widest bg-white shadow-sm">
               <Share2 className="w-4 h-4 mr-2" /> Share Report
             </Button>
             <Button className="flex-1 md:flex-none rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 px-12">
               VIEW SOLUTIONS
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[40px] border-slate-100 bg-white p-10 h-full flex flex-col justify-center transition-all hover:shadow-xl shadow-sm border">
                <div className={cn("w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm", stat.bg)}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <div className="text-center space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                   <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{stat.val}</h2>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2">{stat.sub}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="analysis" className="space-y-10">
           <TabsList className="bg-slate-100 border border-slate-200 p-1.5 rounded-[28px] h-16 w-fit shadow-inner">
              <TabsTrigger value="analysis" className="rounded-[22px] px-12 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all">
                 <BarChart3 className="w-4 h-4 mr-2" /> Comprehensive Analysis
              </TabsTrigger>
              <TabsTrigger value="solutions" className="rounded-[22px] px-12 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all">
                 <ShieldCheck className="w-4 h-4 mr-2" /> Accurate Solutions
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-[22px] px-12 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all">
                 <LayoutGrid className="w-4 h-4 mr-2" /> Global Merit
              </TabsTrigger>
           </TabsList>

           <TabsContent value="analysis" className="m-0 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                 <div className="lg:col-span-8 space-y-10">
                    <Card className="rounded-[48px] border-slate-100 bg-white overflow-hidden shadow-sm">
                       <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                          <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 uppercase tracking-tighter">
                            <BarChart3 className="text-blue-600 w-7 h-7" /> Cognitive Breakdown
                          </h3>
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[9px] font-black tracking-widest px-4 py-1.5 border">Stable Prep Detected</Badge>
                       </div>
                       <div className="p-10 space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                           {Object.entries(attempt?.topicPerformance || {}).map(([label, data]: [string, any]) => {
                             const perc = Math.round((data.correct / data.total) * 100);
                             return (
                             <div key={label} className="space-y-4">
                               <div className="flex justify-between items-end">
                                 <div>
                                   <h4 className="font-bold text-slate-800 text-lg">{label}</h4>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.correct} / {data.total} Correct Signals</p>
                                 </div>
                                 <span className={cn("text-2xl font-black", perc > 80 ? "text-emerald-500" : perc > 50 ? "text-blue-600" : "text-red-500")}>{perc}%</span>
                               </div>
                               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${perc}%` }}
                                   transition={{ duration: 1.5, ease: "easeOut" }}
                                   className={cn("h-full", perc > 80 ? "bg-emerald-500" : perc > 50 ? "bg-blue-600" : "bg-red-500")} 
                                 />
                               </div>
                             </div>
                           )})}
                         </div>
                       </div>
                    </Card>
                 </div>

                 <div className="lg:col-span-4 space-y-10">
                    <Card className="rounded-[48px] bg-gradient-to-br from-blue-700 to-blue-900 text-white p-12 flex flex-col justify-between overflow-hidden relative shadow-2xl">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <BrainCircuit size={180} />
                       </div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-10">
                             <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
                                <BrainCircuit className="text-blue-700 w-8 h-8" />
                             </div>
                             <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Neural Insights</h3>
                                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-[0.3em] mt-1">v4.0 Performance Coach</p>
                             </div>
                          </div>
                          <p className="text-base text-blue-50 leading-relaxed italic mb-12">
                            "Your accuracy in <strong>Punjab GK</strong> is elite (92%), placing you in the top 1% of the state. However, your <strong>Quant</strong> performance is a critical bottleneck. Master 'Ratio & Proportion' to unlock a 90+ score."
                          </p>
                          <div className="p-8 rounded-[32px] bg-white/10 border border-white/20 mb-12">
                             <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-4">Readiness Probability</p>
                             <div className="flex justify-between items-end mb-4">
                                <h4 className="text-6xl font-black text-white tracking-tighter">78<span className="text-sm text-blue-300 ml-1">%</span></h4>
                                <Badge className="bg-emerald-400 text-[#001D3D] border-none text-[9px] uppercase font-black px-3 py-1 mb-2">IMPROVING</Badge>
                             </div>
                             <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "78%" }}
                                  transition={{ duration: 2, ease: "easeOut" }}
                                  className="h-full bg-white" 
                                />
                             </div>
                          </div>
                       </div>
                       <Button className="w-full h-16 rounded-[24px] bg-white text-blue-700 hover:bg-blue-50 font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                          GENERATE REVISION PLAN
                       </Button>
                    </Card>
                 </div>
              </div>
           </TabsContent>
        </Tabs>
      </div>
      <Navbar />
    </AppLayout>
  );
}
