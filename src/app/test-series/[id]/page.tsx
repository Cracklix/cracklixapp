'use client';

import { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { getTestSeriesById, getSubjectsBySeries, getTestsBySubject, DEFAULT_SERIES } from '@/services/test-series';
import { TestSeries, ExamSubject, MockTest } from '@/types';
import { 
  ArrowLeft, Share2, Bookmark, Bell, Search, 
  CheckCircle2, Clock, Zap, Info, ShieldCheck, 
  ChevronRight, Lock, BookOpen, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TestSeriesDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const seriesId = unwrappedParams.id;
  const router = useRouter();
  
  const [series, setSeries] = useState<TestSeries | null>(null);
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fallback to real-looking data if Firestore is empty for MVP
      const data = await getTestSeriesById(seriesId) || DEFAULT_SERIES.find(s => s.id === seriesId);
      setSeries(data || null);
      
      const subjs = await getSubjectsBySeries(seriesId);
      setSubjects(subjs);
      if (subjs.length > 0) {
        setActiveSubjectId(subjs[0].id);
      }
      setLoading(false);
    }
    loadData();
  }, [seriesId]);

  useEffect(() => {
    if (activeSubjectId) {
      getTestsBySubject(activeSubjectId).then(setTests);
    }
  }, [activeSubjectId]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-40">
        {/* Header Hero */}
        <header className="relative rounded-[40px] bg-zinc-900 border border-white/5 overflow-hidden shadow-2xl mb-10">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
           <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row gap-10 items-center">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[32px] overflow-hidden border-4 border-black/40 shadow-2xl shrink-0">
                 <img src={series?.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 space-y-6 text-center md:text-left">
                 <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Badge className="bg-primary/20 text-primary border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest">{series?.category}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest">REAL EXAM PATTERN</Badge>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase">{series?.title}</h1>
                 <div className="flex flex-wrap justify-center md:justify-start gap-8 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><BookOpen size={14} className="text-primary" /> {series?.totalTests} Total Tests</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> {series?.freeTests} Free Samples</span>
                    <span className="flex items-center gap-2"><History size={14} className="text-orange-500" /> English & Punjabi</span>
                 </div>
              </div>
           </div>
        </header>

        {/* Categories Tabs */}
        <Tabs defaultValue="all" className="space-y-10">
           <TabsList className="bg-zinc-950 border border-white/5 p-1.5 rounded-[20px] h-14 w-fit shadow-xl">
              {['All Tests', 'Mock Tests', 'PYQ Series', 'Subject Tests', 'Chapter Tests'].map(tab => (
                <TabsTrigger key={tab} value={tab.toLowerCase().replace(' ', '-')} className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">
                  {tab}
                </TabsTrigger>
              ))}
           </TabsList>

           <div className="grid lg:grid-cols-12 gap-10">
              {/* Sidebar Subjects */}
              <aside className="lg:col-span-3 space-y-6">
                 <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] px-4">Subject Focus</h4>
                 <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-2 space-y-1">
                    {subjects.length > 0 ? subjects.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setActiveSubjectId(s.id)}
                        className={cn(
                          "w-full text-left px-5 py-3 rounded-2xl transition-all flex items-center justify-between group",
                          activeSubjectId === s.id ? "bg-primary text-white shadow-lg" : "text-zinc-500 hover:bg-white/5"
                        )}
                      >
                         <span className="text-xs font-bold uppercase tracking-tight">{s.name}</span>
                         <Badge variant="outline" className={cn("text-[9px] border-none px-2", activeSubjectId === s.id ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-500")}>
                           {s.totalTests}
                         </Badge>
                      </button>
                    )) : (
                      <div className="p-10 text-center opacity-30 italic text-xs">No subjects found.</div>
                    )}
                 </div>
              </aside>

              {/* Tests Grid */}
              <div className="lg:col-span-9 space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Simulation Arena</h3>
                    <div className="relative">
                       <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                       <input placeholder="Search mock title..." className="h-9 w-64 bg-zinc-900 border border-white/5 rounded-xl pl-9 text-[10px] font-bold uppercase outline-none focus:ring-1 ring-primary/40" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {tests.map((test, i) => (
                      <Card key={test.id} className="rounded-[32px] bg-zinc-950 border border-white/5 overflow-hidden group hover:border-primary/40 transition-all shadow-xl">
                         <CardContent className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                               <div className="space-y-1">
                                  <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{test.title}</h4>
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Bilingual Support • Official Mode</p>
                               </div>
                               <Badge className={cn(
                                 "text-[8px] font-black uppercase border-none px-3 py-1",
                                 test.accessType === 'free' ? "bg-emerald-600" : "bg-blue-600"
                               )}>{test.accessType === 'free' ? 'FREE' : 'PASS+'}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase">Questions</p>
                                  <p className="text-sm font-black text-zinc-300">{test.totalQuestions} ITEMS</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase">Max Score</p>
                                  <p className="text-sm font-black text-zinc-300">{test.totalQuestions} MARKS</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase">Penalty</p>
                                  <p className="text-sm font-black text-red-500">-{test.negativeMarking} MARK</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase">Duration</p>
                                  <p className="text-sm font-black text-primary">{test.duration} MINS</p>
                               </div>
                            </div>

                            <Button onClick={() => router.push(`/mocks/${test.id}`)} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest blue-glow">
                               START ASSESSMENT <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                         </CardContent>
                      </Card>
                    ))}

                    {tests.length === 0 && !loading && (
                      <div className="col-span-full py-40 text-center bg-zinc-900/20 border-2 border-dashed border-white/5 rounded-[40px]">
                         <Zap size={40} className="mx-auto text-zinc-800 mb-4" />
                         <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No tests indexed for this subject yet.</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </Tabs>
      </div>
      
      {/* Fixed Unlock Button */}
      <footer className="fixed bottom-0 left-0 w-full h-20 bg-zinc-950 border-t border-white/10 z-[60] flex items-center justify-center md:left-[240px] md:w-[calc(100%-240px)]">
         <div className="max-w-6xl w-full px-8 flex items-center justify-between">
            <div className="hidden md:block">
               <p className="text-xs font-bold text-zinc-400">Unlock {series?.totalTests} tests across all subjects.</p>
               <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Starting from ₹249/yr</p>
            </div>
            <Button onClick={() => router.push('/pass')} className="h-12 px-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs uppercase tracking-[0.2em] shadow-xl">
               UNLOCK TEST SERIES
            </Button>
         </div>
      </footer>

      <Navbar />
    </AppLayout>
  );
}
