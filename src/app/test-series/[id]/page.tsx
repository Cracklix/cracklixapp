'use client';

import { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { getTestSeriesById, getSubjectsBySeries, getTestsBySeries, DEFAULT_SERIES, MOCK_SUBJECTS } from '@/services/test-series';
import { TestSeries, ExamSubject, MockTest } from '@/types';
import { 
  ArrowLeft, Share2, Bookmark, Bell, Search, 
  CheckCircle2, Clock, Zap, ShieldCheck, 
  ChevronRight, Lock, BookOpen, History, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { usePremium } from '@/hooks/usePremium';

export default function TestSeriesDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const seriesId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium } = usePremium(user?.uid);
  
  const [series, setSeries] = useState<TestSeries | null>(null);
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [activeTab, setActiveTab] = useState("mock-tests");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-40 px-4 md:px-0">
        {/* Header Hero - Testbook Style */}
        <header className="relative rounded-[40px] bg-zinc-900 border border-white/5 overflow-hidden shadow-2xl mb-10 group">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-zinc-950/90 to-transparent" />
           <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row gap-10 items-center">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[32px] overflow-hidden border-4 border-black/40 shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-700">
                 <img src={series?.thumbnail} className="w-full h-full object-cover" alt={series?.title} />
              </div>
              <div className="flex-1 space-y-6 text-center md:text-left">
                 <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Badge className="bg-primary/20 text-primary border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest">{series?.category}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest">REAL BOARD PATTERN</Badge>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase text-white">{series?.title}</h1>
                 <div className="flex flex-wrap justify-center md:justify-start gap-8 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><BookOpen size={14} className="text-primary" /> {series?.totalTests} Total Tests</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> {series?.freeTests} Free Samples</span>
                    <span className="flex items-center gap-2"><History size={14} className="text-orange-500" /> EN | PA Support</span>
                 </div>
              </div>
              <div className="flex gap-3 self-start md:self-center">
                 <Button variant="ghost" size="icon" className="rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10"><Share2 size={18} /></Button>
                 <Button variant="ghost" size="icon" className="rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10"><Bookmark size={18} /></Button>
              </div>
           </div>
        </header>

        {/* Categories Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
           <div className="overflow-x-auto no-scrollbar pb-2">
             <TabsList className="bg-zinc-950 border border-white/5 p-1.5 rounded-[20px] h-14 w-fit shadow-xl">
                {[
                  { id: 'mock-tests', label: 'Full Mocks' },
                  { id: 'pyq', label: 'PYQ Archive' },
                  { id: 'subject', label: 'Sectional' },
                  { id: 'chapter', label: 'Topic Wise' },
                  { id: 'mini', label: 'Quick Drills' }
                ].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary transition-all">
                    {tab.label}
                  </TabsTrigger>
                ))}
             </TabsList>
           </div>

           <div className="grid lg:grid-cols-12 gap-10">
              {/* Sidebar Subjects */}
              <aside className="lg:col-span-3 space-y-8">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] px-4 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-primary" /> Subject Focus
                    </h4>
                    <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-2 space-y-1">
                        {subjects.map(s => (
                          <button
                            key={s.id}
                            className="w-full text-left px-5 py-3.5 rounded-2xl transition-all flex items-center justify-between group hover:bg-white/5"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-primary transition-colors" />
                                <span className="text-xs font-bold uppercase tracking-tight text-zinc-400 group-hover:text-white">{s.name}</span>
                             </div>
                             <Badge variant="outline" className="text-[8px] border-none bg-zinc-800 text-zinc-500 group-hover:bg-primary/20 group-hover:text-primary">
                               {s.totalTests}
                             </Badge>
                          </button>
                        ))}
                    </div>
                 </div>

                 <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap size={16} className="text-primary fill-current" />
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">AI Strategy</h5>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                       "Based on 2024 trends, Punjab GK and Reasoning comprise 45% of the total score. Focus on these sectional mocks first."
                    </p>
                 </div>
              </aside>

              {/* Tests Grid */}
              <main className="lg:col-span-9 space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Training Modules</h3>
                    <div className="relative">
                       <Search className="absolute left-4 top-3 w-4 h-4 text-zinc-600" />
                       <input 
                         placeholder="Search mock title..." 
                         className="h-10 w-full md:w-72 bg-zinc-900 border border-white/5 rounded-2xl pl-11 text-[10px] font-bold uppercase outline-none focus:ring-1 ring-primary/40 text-white" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {tests.length > 0 ? tests.map((test, i) => (
                      <Card key={test.id} className="rounded-[32px] bg-zinc-950 border border-white/5 overflow-hidden group hover:border-primary/40 transition-all shadow-xl hover:shadow-primary/5">
                         <CardContent className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2 mb-2">
                                     <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-2 py-0.5">{test.category}</Badge>
                                     <Badge variant="outline" className="border-white/10 text-zinc-600 text-[8px] font-black uppercase px-2 py-0.5">EN | PA</Badge>
                                  </div>
                                  <h4 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{test.title}</h4>
                               </div>
                               <Badge className={cn(
                                 "text-[8px] font-black uppercase border-none px-3 py-1",
                                 test.accessType === 'free' ? "bg-emerald-600" : "bg-blue-600"
                               )}>{test.accessType === 'free' ? 'FREE' : 'PASS+'}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col justify-center gap-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Questions</p>
                                  <p className="text-sm font-black text-white">{test.totalQuestions} ITEMS</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col justify-center gap-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Max Score</p>
                                  <p className="text-sm font-black text-white">{test.totalQuestions} MARKS</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col justify-center gap-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Penalty</p>
                                  <p className="text-sm font-black text-red-500">-{test.negativeMarking} MARK</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col justify-center gap-1">
                                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Duration</p>
                                  <p className="text-sm font-black text-primary">{test.duration} MINS</p>
                               </div>
                            </div>

                            <Button 
                               onClick={() => router.push(`/mocks/${test.id}`)} 
                               className={cn(
                                 "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg transition-all active:scale-95",
                                 test.accessType === 'free' || isPremium ? "bg-primary hover:bg-primary/90 blue-glow" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                               )}
                            >
                               {test.accessType === 'free' || isPremium ? (
                                 <>START ASSESSMENT <ChevronRight className="ml-2 w-4 h-4" /></>
                               ) : (
                                 <><Lock className="mr-2 w-3.5 h-3.5" /> UNLOCK WITH PASS+</>
                               )}
                            </Button>
                         </CardContent>
                      </Card>
                    )) : (
                      <div className="col-span-full py-40 text-center bg-zinc-900/20 border-2 border-dashed border-white/5 rounded-[48px] opacity-40">
                         <BookOpen size={48} className="mx-auto mb-6 text-zinc-700" />
                         <h4 className="text-xl font-bold uppercase tracking-tighter">No Tests Found</h4>
                         <p className="text-xs font-medium max-w-xs mx-auto mt-2">The academic team is indexing {activeTab.replace('-', ' ')} artifacts for this series.</p>
                      </div>
                    )}
                 </div>
              </main>
           </div>
        </Tabs>
      </div>
      
      {/* Testbook Style Bottom Sticky CTA */}
      <footer className="fixed bottom-0 left-0 w-full h-24 bg-zinc-950 border-t border-white/10 z-[60] flex items-center justify-center md:left-24 md:w-[calc(100%-96px)] lg:left-60 lg:w-[calc(100%-240px)]">
         <div className="max-w-6xl w-full px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="hidden md:block">
               <p className="text-sm font-bold text-white uppercase tracking-tight">Unlock {series?.totalTests} tests for {series?.title}</p>
               <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-0.5">Most Trusted</Badge>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">EN | PA | HI Support Included</p>
               </div>
            </div>
            <Button onClick={() => router.push('/pass')} className="w-full md:w-auto h-14 px-16 rounded-[20px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl blue-glow animate-pulse hover:animate-none">
               ACTIVATE PASS+ NOW
            </Button>
         </div>
      </footer>

      <Navbar />
    </AppLayout>
  );
}
