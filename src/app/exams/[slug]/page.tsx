
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getExamBySlug, ExamCategory } from '@/services/exams';
import { getSyllabusByExam, SyllabusItem } from '@/services/syllabus';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ExamDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [exam, setExam] = useState<ExamCategory | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const examData = await getExamBySlug(slug);
        if (examData) {
          setExam(examData);
          const syllabusData = await getSyllabusByExam(examData.id);
          setSyllabus(syllabusData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return null;
  if (!exam) return <div className="p-20 text-center">Exam not found.</div>;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-32">
        {/* Header Hero */}
        <div className="relative rounded-[48px] bg-gradient-to-br from-primary/20 via-zinc-950 to-black border border-white/5 p-12 overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <div className="text-[120px] font-black">{exam.icon}</div>
           </div>
           <div className="relative z-10 space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 font-black uppercase tracking-widest text-[10px]">
                {exam.department}
              </Badge>
              <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-none">
                {exam.name.toUpperCase()}
              </h1>
              <div className="flex flex-wrap gap-8 text-sm text-zinc-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {exam.duration} Minutes</span>
                <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" /> {exam.totalMarks} Marks</span>
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> {exam.totalMocks} Mocks Ready</span>
              </div>
              <div className="flex gap-4 pt-4">
                 <Link href={`/mocks`}>
                   <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black blue-glow">
                     Start Training
                   </Button>
                 </Link>
                 <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 font-bold">
                    Official Guide
                 </Button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Main Content */}
           <div className="lg:col-span-8 space-y-10">
              
              {/* Exam Roadmap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Eligibility", desc: exam.eligibility || "Degree/12th Pass", icon: AlertCircle, color: "text-blue-400" },
                   { label: "Selection", desc: "CBT + Physical", icon: CheckCircle2, color: "text-emerald-400" },
                   { label: "Pay Scale", desc: exam.salary || "Level 4-6", icon: TrendingUp, color: "text-accent" },
                 ].map((item, i) => (
                   <Card key={i} className="rounded-3xl cracklix-glass border-white/5 p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <item.icon className={item.color} size={20} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</p>
                      </div>
                      <p className="font-bold text-lg">{item.desc}</p>
                   </Card>
                 ))}
              </div>

              {/* Syllabus breakdown */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="font-headline text-3xl font-bold">Syllabus Engine</h3>
                    <Badge variant="outline" className="border-primary/20 text-primary">v4 AI Insights</Badge>
                 </div>
                 <div className="grid gap-4">
                    {syllabus.length > 0 ? (
                      syllabus.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-zinc-900/50 border border-white/5 p-6 rounded-[32px] group hover:bg-zinc-900 transition-all"
                        >
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                <h4 className="text-xl font-bold">{item.subject}</h4>
                                <p className="text-xs text-zinc-500 mt-1 uppercase font-black tracking-widest">{item.topics.length} Targeted Topics</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-primary uppercase mb-1">Weightage</p>
                                <p className="text-2xl font-black">{item.weightage || 20}%</p>
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {item.topics.map(topic => (
                               <Badge key={topic} variant="secondary" className="bg-zinc-800 text-zinc-400 border-none px-3 py-1 text-[10px] font-bold">
                                 {topic}
                               </Badge>
                             ))}
                           </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-16 text-center rounded-[32px] border-2 border-dashed border-white/5 text-zinc-600">
                        Indexing official PSSSB/PPSC syllabus data...
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Sidebar */}
           <div className="lg:col-span-4 space-y-10">
              <Card className="rounded-[40px] cracklix-glass border-primary/20 bg-primary/5 p-8">
                 <CardHeader className="p-0 mb-6">
                   <div className="flex items-center gap-3">
                     <BrainCircuit className="text-primary w-6 h-6" />
                     <CardTitle className="text-xl font-bold">AI Strategy</CardTitle>
                   </div>
                 </CardHeader>
                 <div className="space-y-6">
                    <p className="text-sm text-zinc-400 leading-relaxed italic">
                      "For the <strong>{exam.name}</strong>, focus heavily on <strong>Punjab GK</strong> and <strong>Current Affairs</strong>. Historically, these subjects comprise 40% of the paper with a high ROI."
                    </p>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                       <p className="text-[10px] font-black uppercase text-primary">Readiness Rank</p>
                       <div className="flex justify-between items-end">
                         <h3 className="text-3xl font-black">72<span className="text-sm">%</span></h3>
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px]">IMPROVING</Badge>
                       </div>
                       <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[72%]" />
                       </div>
                    </div>
                    <Button className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold">
                      Get Study Plan
                    </Button>
                 </div>
              </Card>

              <div className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-4">Artifacts</h4>
                 {[
                   { label: "Previous Papers", count: "12 Sets", icon: FileText, href: "#" },
                   { label: "Topic-wise MCQs", count: "2.4k Qs", icon: BookOpen, href: "#" },
                   { label: "Department News", count: "Active", icon: Zap, href: "#" },
                 ].map((artifact, i) => (
                   <Link key={i} href={artifact.href}>
                     <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <artifact.icon className="text-zinc-500 group-hover:text-primary transition-colors" size={18} />
                           </div>
                           <div>
                             <p className="font-bold text-sm">{artifact.label}</p>
                             <p className="text-[10px] text-zinc-500 font-bold">{artifact.count}</p>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-all" />
                     </div>
                   </Link>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
