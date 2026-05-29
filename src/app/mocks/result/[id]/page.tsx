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
  TrendingUp, 
  Loader2, 
  Share2,
  CheckCircle2,
  BrainCircuit,
  Zap,
  ChevronRight,
  Flame,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PerformanceAuditV45({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const attemptId = unwrappedParams.id;
  
  const [attempt, setAttempt] = useState<any>(null);
  const [mock, setMock] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
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
          const [mockData, qData] = await Promise.all([
            getMockDetails(data.mockId),
            getMockQuestions(data.mockId)
          ]);
          setMock(mockData);
          setQuestions(qData);
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
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
       <Loader2 className="w-12 h-12 animate-spin text-primary" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Generating Cognitive Performance Audit...</p>
    </div>
  );

  const stats = [
    { label: "Final Score", val: attempt?.score || 0, sub: `Out of ${mock?.totalMarks || 100}`, icon: Trophy, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "State Rank", val: `#${attempt?.rank || '--'}`, sub: `Top ${attempt?.percentile || 0}%`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Accuracy", val: `${attempt?.accuracy || 0}%`, sub: "Precision Signal", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Correct", val: attempt?.correctCount || 0, sub: `${attempt?.incorrectCount || 0} Incorrect`, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-40 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-zinc-500 hover:text-white p-0 h-auto font-black uppercase text-[9px] tracking-widest">
                <ArrowLeft className="w-3 h-3 mr-2" /> Back to Terminal
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Simulation Audit</h1>
              <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest mt-1.5">{mock?.title}</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-12 border-white/10 font-black text-[9px] uppercase tracking-widest bg-white/5">
               <Share2 className="w-3 h-3 mr-2" /> Share Report
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[40px] border-white/5 bg-zinc-900/40 p-8 h-full flex flex-col justify-center transition-all hover:bg-zinc-900">
                <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-center space-y-0.5">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
                   <h2 className="text-4xl font-black text-white tracking-tighter">{stat.val}</h2>
                   <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest pt-1">{stat.sub}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="solutions" className="space-y-8">
           <TabsList className="bg-zinc-950 border border-white/5 p-1 rounded-[24px] h-14 w-fit">
              <TabsTrigger value="analysis" className="rounded-xl px-10 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary">
                 <BarChart3 className="w-3.5 h-3.5 mr-2" /> Analysis
              </TabsTrigger>
              <TabsTrigger value="solutions" className="rounded-xl px-10 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary">
                 <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Accurate Solutions
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-xl px-10 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary">
                 <Trophy className="w-3.5 h-3.5 mr-2" /> Leaderboard
              </TabsTrigger>
           </TabsList>

           <TabsContent value="analysis" className="m-0 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                 <div className="lg:col-span-8">
                    <Card className="rounded-[40px] bg-zinc-900/30 border-white/5 overflow-hidden">
                       <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                          <h3 className="text-xl font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                            <BarChart3 className="text-primary w-6 h-6" /> Subject Insights
                          </h3>
                       </div>
                       <div className="p-8 space-y-10">
                         {Object.entries(attempt?.topicPerformance || {}).map(([label, data]: [string, any]) => {
                           const perc = Math.round((data.correct / data.total) * 100);
                           return (
                             <div key={label} className="space-y-3">
                               <div className="flex justify-between items-end">
                                 <div>
                                   <h4 className="font-bold text-white text-base">{label}</h4>
                                   <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{data.correct} / {data.total} Correct</p>
                                 </div>
                                 <span className={cn("text-xl font-black", perc > 80 ? "text-emerald-500" : perc > 50 ? "text-primary" : "text-red-500")}>{perc}%</span>
                               </div>
                               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${perc}%` }} className={cn("h-full", perc > 80 ? "bg-emerald-500" : perc > 50 ? "bg-primary" : "bg-red-500")} />
                               </div>
                             </div>
                           )
                         })}
                       </div>
                    </Card>
                 </div>

                 <div className="lg:col-span-4 space-y-10">
                    <Card className="rounded-[40px] bg-gradient-to-br from-blue-700 to-blue-900 text-white p-10 flex flex-col justify-between overflow-hidden relative shadow-2xl min-h-[350px]">
                       <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit size={150} /></div>
                       <div className="relative z-10 space-y-8">
                          <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl"><BrainCircuit className="text-blue-700 w-6 h-6" /></div>
                             <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Neural Guide</h3>
                          </div>
                          <p className="text-base text-blue-50 leading-relaxed italic">"Your performance in <strong>{Object.keys(attempt?.topicPerformance || {})[0] || 'Core Subjects'}</strong> is elite. Target weak areas to secure a top 10 slot."</p>
                       </div>
                       <Button className="w-full h-14 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-[9px] uppercase tracking-[0.3em] shadow-2xl">RETRY WEAK SECTORS</Button>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="solutions" className="m-0 space-y-6">
              {questions.map((q, i) => {
                const userAns = attempt?.answers?.[q.id];
                const isCorrect = userAns?.selectedOption === q.correctAnswer;
                const attempted = userAns?.selectedOption !== null && userAns?.selectedOption !== undefined;

                return (
                  <Card key={q.id} className="rounded-[40px] bg-zinc-900/30 border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                       <div className="flex items-center gap-3">
                          <Badge className="bg-zinc-800 text-white border-none font-black px-4 py-1 uppercase text-[9px]">Artifact {i+1}</Badge>
                          {attempted ? (
                            isCorrect ? <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 uppercase text-[9px] font-black">ACCURATE SIGNAL</Badge> : <Badge className="bg-red-500/10 text-red-500 border-none px-4 py-1 uppercase text-[9px] font-black">SIGNAL DEVIATION</Badge>
                          ) : (
                            <Badge className="bg-zinc-800 text-zinc-500 border-none px-4 py-1 uppercase text-[9px] font-black">UNATTEMPTED</Badge>
                          )}
                       </div>
                       <div className="flex items-center gap-2 text-zinc-600">
                          <Clock size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{q.timeEstimate || 45}s Avg</span>
                       </div>
                    </div>
                    <div className="p-10 space-y-8">
                       <div className="grid lg:grid-cols-2 gap-16">
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <p className="text-xl font-bold text-white leading-tight">{q.questionEn}</p>
                                <p className="text-xl font-medium text-zinc-500 italic font-body border-l-4 border-white/5 pl-6">{q.questionPa}</p>
                             </div>
                             <div className="grid gap-2">
                                {q.options.map((opt: any, idx: number) => {
                                  const isCorrectOpt = idx === q.correctAnswer;
                                  const isUserChoice = idx === userAns?.selectedOption;
                                  
                                  return (
                                    <div key={idx} className={cn(
                                      "p-4 rounded-2xl border flex items-center gap-4",
                                      isCorrectOpt ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold" : (isUserChoice && !isCorrect ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-black/20 border-white/5 text-zinc-600")
                                    )}>
                                       <div className={cn(
                                         "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border transition-all shadow-inner",
                                         isCorrectOpt ? "bg-emerald-500 text-white" : (isUserChoice && !isCorrect ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-600")
                                       )}>{String.fromCharCode(65+idx)}</div>
                                       <div>
                                          <p className="text-sm font-bold">{opt.en}</p>
                                          <p className="text-[10px] opacity-60 font-body">{opt.pa}</p>
                                       </div>
                                    </div>
                                  )
                                })}
                             </div>
                          </div>
                          <div className="space-y-6 border-l border-white/5 pl-12">
                             <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5"><CheckCircle2 size={100} /></div>
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><CheckCircle2 className="text-white w-5 h-5" /></div>
                                   <h4 className="text-base font-black uppercase tracking-tighter">Academic Rationalization</h4>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed">
                                   <p className="text-zinc-300">{q.explanationEn}</p>
                                   <p className="text-zinc-500 italic border-t border-white/5 pt-3">{q.explanationPa}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </Card>
                )
              })}
           </TabsContent>

           <TabsContent value="leaderboard" className="m-0">
              <Card className="rounded-[40px] bg-zinc-900/30 border-white/5 overflow-hidden">
                 <div className="p-20 text-center opacity-30">
                    <Flame size={60} className="mx-auto mb-6 text-zinc-700" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing State Rankings...</p>
                 </div>
              </Card>
           </TabsContent>
        </Tabs>
      </div>
      <Navbar />
    </AppLayout>
  );
}
