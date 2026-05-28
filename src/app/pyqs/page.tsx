
'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { getRecentPYQs, getPYQsByExam, PYQ } from '@/services/pyqs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  ChevronRight,
  BookOpen,
  Target,
  FileSearch,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EXAMS = ["All", "PSSSB", "Punjab Police", "PPSC", "PSTET"];
const YEARS = ["All", "2024", "2023", "2022", "2021", "2020"];

export default function PYQLibraryPage() {
  const { toast } = useToast();
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeExam, setActiveExam] = useState("All");
  const [activeYear, setActiveYear] = useState("All");

  useEffect(() => {
    loadPYQs();
  }, [activeExam, activeYear]);

  async function loadPYQs() {
    setLoading(true);
    try {
      let data;
      if (activeExam === "All") {
        data = await getRecentPYQs();
      } else {
        const year = activeYear === "All" ? undefined : Number(activeYear);
        data = await getPYQsByExam(activeExam, year);
      }
      setPyqs(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Sync Error", description: "Could not fetch artifact library.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = pyqs.filter(q => 
    q.question_en.toLowerCase().includes(search.toLowerCase()) ||
    (q.subject && q.subject.toLowerCase().includes(search.toLowerCase())) ||
    (q.exam && q.exam.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[20px] bg-orange-600/20 flex items-center justify-center blue-glow">
                   <History className="text-orange-500 w-6 h-6" />
                </div>
                <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">PYQ Library</h1>
             </div>
             <p className="text-zinc-500 font-medium max-w-xl text-lg">Official previous year archives with AI-powered trilingual explanations.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600" />
                <Input 
                  placeholder="Filter artifacts..." 
                  className="pl-12 h-14 bg-zinc-900 border-white/5 rounded-2xl text-sm font-bold focus:ring-orange-500/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
           <aside className="w-full lg:w-72 space-y-10 shrink-0">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] px-4 flex items-center gap-2">
                   <Target size={12} className="text-orange-500" /> Recruitment Boards
                 </h4>
                 <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 bg-zinc-900/40 p-2 rounded-3xl border border-white/5">
                    {EXAMS.map(ex => (
                      <button
                        key={ex}
                        onClick={() => setActiveExam(ex)}
                        className={cn(
                          "text-left px-5 py-3 rounded-2xl transition-all text-xs font-bold",
                          activeExam === ex 
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" 
                            : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                        )}
                      >
                        {ex}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] px-4 flex items-center gap-2">
                   <Filter size={12} className="text-orange-500" /> Cycle Year
                 </h4>
                 <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                    {YEARS.map(yr => (
                      <button
                        key={yr}
                        onClick={() => setActiveYear(yr)}
                        className={cn(
                          "px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase",
                          activeYear === yr 
                            ? "bg-white text-black" 
                            : "text-zinc-600 border border-white/5 hover:border-white/10"
                        )}
                      >
                        {yr}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-6 rounded-[32px] bg-orange-600/5 border border-orange-600/20 space-y-4">
                 <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-500">Pro Tip</h5>
                 <p className="text-xs text-zinc-500 leading-relaxed italic">
                    "Official PSSSB and PPSC solutions are now linked with trilingual AI logic for better retention."
                 </p>
              </div>
           </aside>

           <main className="flex-1 space-y-6">
              {loading ? (
                <div className="grid gap-6">
                   {[1,2,3,4].map(i => <div key={i} className="h-40 bg-zinc-900/40 animate-pulse rounded-[40px] border border-white/5" />)}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid gap-6">
                   <AnimatePresence mode="popLayout">
                    {filtered.map((q, i) => (
                      <motion.div
                        key={q.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="rounded-[48px] bg-zinc-900/30 border-white/5 overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
                           <CardContent className="p-10 flex flex-col md:flex-row items-start justify-between gap-10">
                              <div className="flex-1 space-y-8">
                                 <div className="flex flex-wrap gap-3">
                                    <Badge className="bg-orange-600 text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 shadow-lg shadow-orange-900/20">{q.year}</Badge>
                                    <Badge variant="outline" className="text-zinc-500 border-white/10 font-black text-[9px] uppercase tracking-widest px-4 py-1.5">{q.subject}</Badge>
                                    <Badge variant="outline" className="text-zinc-500 border-white/10 font-black text-[9px] uppercase tracking-widest px-4 py-1.5">{q.exam}</Badge>
                                 </div>
                                 <div className="space-y-6">
                                    <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-white group-hover:text-orange-500 transition-colors">{q.question_en}</h3>
                                    <p className="text-lg font-medium text-zinc-400 italic leading-relaxed">{q.question_pa}</p>
                                 </div>
                                 <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                                    <button className="text-[10px] font-black uppercase text-orange-500 hover:text-orange-400 flex items-center gap-2 transition-all">
                                       <BookOpen size={14} className="fill-current" /> View Verified Solution
                                    </button>
                                    <button className="text-[10px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 transition-all">
                                       <Target size={14} /> Similar Concepts
                                    </button>
                                 </div>
                              </div>
                              <div className="flex md:flex-col gap-3 shrink-0">
                                 <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-orange-600 hover:text-white transition-all">
                                    <ChevronRight size={24} />
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                   </AnimatePresence>
                </div>
              ) : (
                <div className="py-52 text-center rounded-[64px] border-2 border-dashed border-white/5 bg-zinc-950/20">
                   <div className="w-24 h-24 rounded-[40px] bg-zinc-900 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <FileSearch className="text-zinc-800 w-12 h-12" />
                   </div>
                   <h3 className="text-3xl font-black uppercase text-zinc-600 tracking-tighter leading-none">Artifact Storage Empty</h3>
                   <p className="text-zinc-700 mt-4 font-medium italic text-lg max-w-sm mx-auto">The board archive is currently indexing new previous year records for {activeExam}.</p>
                   <Button variant="outline" className="mt-12 rounded-xl border-white/10 text-xs font-black uppercase" onClick={() => { setActiveExam("All"); setActiveYear("All"); }}>
                      Reset Library Filter
                   </Button>
                </div>
              )}
           </main>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
