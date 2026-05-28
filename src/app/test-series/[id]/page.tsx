'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { getTestSeriesById, getSubjectsBySeries, getTestsBySeries, DEFAULT_SERIES, MOCK_SUBJECTS } from '@/services/test-series';
import { TestSeries, ExamSubject, MockTest } from '@/types';
import { 
  ArrowLeft, Share2, Bookmark, Search, 
  CheckCircle2, Zap, ShieldCheck, 
  ChevronRight, Lock, BookOpen, History, Info,
  Filter, LayoutGrid, List, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { usePremium } from '@/hooks/usePremium';

/**
 * PRODUCTION TEST SERIES HUB v18.0
 * Exactly Testbook Style: Mock Tests, PYPs, Study Notes, Sticky Unlock Button.
 */
export default function TestSeriesHub() {
  const params = useParams();
  const seriesId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium } = usePremium(user?.uid);
  
  const [series, setSeries] = useState<TestSeries | null>(null);
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [activeTab, setActiveTab] = useState("mock-tests");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesId) return;

    async function loadData() {
      setLoading(true);
      const data = await getTestSeriesById(seriesId) || DEFAULT_SERIES.find(s => s.id === seriesId);
      setSeries(data || null);
      
      const subjs = await getSubjectsBySeries(seriesId);
      setSubjects(subjs.length > 0 ? subjs : MOCK_SUBJECTS.filter(s => s.seriesId === seriesId));
      
      const testList = await getTestsBySeries(seriesId, activeTab);
      setTests(testList);
      
      setLoading(false);
    }
    loadData();
  }, [seriesId, activeTab]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-slate-800 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-48 space-y-8 px-4 md:px-0">
        {/* HEADER HERO */}
        <header className="relative rounded-[32px] bg-[#1e293b] border border-white/5 overflow-hidden shadow-2xl mb-8 group">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-slate-950/90 to-transparent" />
           <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-black/20 shadow-2xl shrink-0">
                 <img src={series?.thumbnail} className="w-full h-full object-cover" alt={series?.title} />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                 <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Badge className="bg-blue-600/20 text-blue-400 border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest">{series?.category}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest">GVT APPROVED</Badge>
                 </div>
                 <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight uppercase text-white">{series?.title}</h1>
                 <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><FileText size={14} className="text-blue-500" /> {series?.totalTests} Tests</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> {series?.freeTests} Free</span>
                    <span className="flex items-center gap-2"><History size={14} className="text-orange-500" /> Multilingual</span>
                 </div>
              </div>
              <div className="flex gap-2 self-start md:self-center">
                 <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 border border-white/5 text-white hover:bg-white/10"><Share2 size={16} /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 border border-white/5 text-white hover:bg-white/10"><Bookmark size={16} /></Button>
              </div>
           </div>
        </header>

        {/* NAVIGATION TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
           <div className="overflow-x-auto no-scrollbar pb-2">
             <TabsList className="bg-zinc-950 border border-white/5 p-1 rounded-2xl h-14 w-fit shadow-xl">
                {[
                  { id: 'mock-tests', label: 'Mock Tests' },
                  { id: 'pyq', label: 'PYPs (Previous Year)' },
                  { id: 'study-notes', label: 'Study Notes' },
                  { id: 'sectional', label: 'Sectional' },
                  { id: 'chapter', label: 'Chapter Tests' }
                ].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 transition-all text-slate-400">
                    {tab.label}
                  </TabsTrigger>
                ))}
             </TabsList>
           </div>

           <div className="grid lg:grid-cols-12 gap-8">
              {/* SIDEBAR FILTERS */}
              <aside className="lg:col-span-3 space-y-6">
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-4">Subject Filter</h4>
                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-1.5 space-y-0.5">
                        {subjects.map(s => (
                          <button
                            key={s.id}
                            className="w-full text-left px-5 py-3 rounded-2xl transition-all flex items-center justify-between group hover:bg-white/5"
                          >
                             <span className="text-xs font-bold uppercase tracking-tight text-slate-400 group-hover:text-white">{s.name}</span>
                             <Badge variant="outline" className="text-[8px] border-none bg-zinc-800 text-zinc-500 group-hover:bg-blue-600/20 group-hover:text-blue-500">
                               {s.totalTests}
                             </Badge>
                          </button>
                        ))}
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-600/20 space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap size={16} className="text-blue-600 fill-current" />
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600">AI Mentor</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                       "Strategic Tip: Focus on Punjab History & Culture (Section A). It carries high weightage for PSSSB exams."
                    </p>
                 </div>
              </aside>

              {/* LISTING AREA */}
              <main className="lg:col-span-9 space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Available Training</h3>
                    <div className="relative">
                       <Search className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
                       <input 
                         placeholder="Search mock..." 
                         className="h-10 w-full md:w-64 bg-zinc-900 border border-white/5 rounded-xl pl-11 text-[10px] font-bold uppercase outline-none focus:ring-1 ring-blue-600/40 text-white shadow-inner" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tests.length > 0 ? tests.map((test) => (
                      <Card key={test.id} className="rounded-3xl bg-zinc-950 border border-white/5 overflow-hidden group hover:border-blue-600/30 transition-all">
                         <CardContent className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2 mb-2">
                                     <Badge variant="outline" className="border-blue-600/20 text-blue-400 text-[7px] font-black uppercase px-2 py-0.5">{test.category}</Badge>
                                     <Badge variant="outline" className="border-white/5 text-slate-600 text-[7px] font-black uppercase px-2 py-0.5">BILINGUAL</Badge>
                                  </div>
                                  <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{test.title}</h4>
                               </div>
                               <Badge className={cn(
                                 "text-[7px] font-black uppercase border-none px-2 py-0.5",
                                 test.accessType === 'free' ? "bg-emerald-600" : "bg-blue-600"
                               )}>{test.accessType === 'free' ? 'FREE' : 'PASS+'}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                               <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 flex flex-col justify-center gap-0.5">
                                  <p className="text-[7px] font-black text-slate-600 uppercase">Artifacts</p>
                                  <p className="text-xs font-bold text-white">{test.totalQuestions} Qs</p>
                               </div>
                               <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 flex flex-col justify-center gap-0.5">
                                  <p className="text-[7px] font-black text-slate-600 uppercase">Duration</p>
                                  <p className="text-xs font-bold text-white">{test.duration} Min</p>
                               </div>
                            </div>

                            <Button 
                               onClick={() => router.push(`/mocks/${test.id}`)} 
                               className={cn(
                                 "w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg",
                                 test.accessType === 'free' || isPremium ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-800 text-slate-400 hover:bg-zinc-700"
                               )}
                            >
                               {test.accessType === 'free' || isPremium ? (
                                 <>START SIMULATION <ChevronRight className="ml-1 w-3 h-3" /></>
                               ) : (
                                 <><Lock className="mr-2 w-3 h-3" /> UNLOCK WITH PASS+</>
                               )}
                            </Button>
                         </CardContent>
                      </Card>
                    )) : (
                      <div className="col-span-full py-32 text-center bg-zinc-900/10 border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                         <BookOpen size={40} className="mx-auto mb-4 text-slate-600" />
                         <p className="text-xs font-bold uppercase tracking-widest">Registry Empty</p>
                      </div>
                    )}
                 </div>
              </main>
           </div>
        </Tabs>
      </div>

      {/* BOTTOM STICKY CTA */}
      {!isPremium && (
        <footer className="fixed bottom-0 left-0 w-full h-20 bg-zinc-950 border-t border-white/10 z-[60] flex items-center justify-center md:left-60 md:w-[calc(100%-240px)]">
           <div className="max-w-4xl w-full px-6 flex items-center justify-between gap-4">
              <div className="hidden sm:block">
                 <p className="text-sm font-bold text-white uppercase tracking-tight">Unlock {series?.totalTests || 'All'} Premium Tests</p>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Join 15,000+ Aspirants today</p>
              </div>
              <Button onClick={() => router.push('/pass')} className="w-full sm:w-auto h-12 px-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl">
                 UNLOCK ALL TESTS
              </Button>
           </div>
        </footer>
      )}

      <Navbar />
    </AppLayout>
  );
}
