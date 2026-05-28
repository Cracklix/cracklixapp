
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
  Filter,
  Zap,
  Timer,
  Trophy,
  CheckCircle2,
  LayoutGrid,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PYQPracticeCard from '@/components/pyqs/pyq-practice-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EXAMS = ["All", "PSSSB", "Punjab Police", "PPSC", "PSTET"];
const YEARS = ["All", "2024", "2023", "2022", "2021", "2020"];
const SUBJECTS = ["General Knowledge", "Math", "Reasoning", "English", "Punjabi", "ICT"];

export default function PYQLibraryPage() {
  const { toast } = useToast();
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeExam, setActiveExam] = useState("All");
  const [activeYear, setActiveYear] = useState("All");
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');

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
      <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
        {/* ACTION HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-950 border border-white/5 p-8 rounded-[32px] shadow-2xl">
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center blue-glow">
                   <History className="text-orange-500 w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black tracking-tight uppercase text-white leading-none">PYQ Practice Arena</h1>
             </div>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Official Board Archives • National Engine v12</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
             <div className="bg-zinc-900 p-1 rounded-2xl border border-white/5 flex gap-1">
                <button 
                  onClick={() => setMode('practice')}
                  className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all", mode === 'practice' ? "bg-orange-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
                >Practice</button>
                <button 
                  onClick={() => setMode('exam')}
                  className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all", mode === 'exam' ? "bg-orange-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
                >Exam Mode</button>
             </div>
             <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                <Input 
                  placeholder="Scan library..." 
                  className="pl-11 h-12 bg-zinc-900 border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-orange-500/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
           {/* LEFT: FILTER ARCHITECTURE */}
           <aside className="lg:col-span-3 space-y-6">
              <div className="bg-zinc-950 border border-white/5 p-6 rounded-[32px] shadow-xl space-y-8 h-fit sticky top-24">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Recruitment Board</h4>
                    <div className="grid grid-cols-1 gap-1.5">
                       {EXAMS.map(ex => (
                         <button
                           key={ex}
                           onClick={() => setActiveExam(ex)}
                           className={cn(
                             "text-left px-4 py-2.5 rounded-xl transition-all text-xs font-bold border",
                             activeExam === ex 
                               ? "bg-orange-600/10 border-orange-600/20 text-orange-500" 
                               : "text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300"
                           )}
                         >
                           {ex}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Cycle Year</h4>
                    <div className="grid grid-cols-3 gap-2">
                       {YEARS.map(yr => (
                         <button
                           key={yr}
                           onClick={() => setActiveYear(yr)}
                           className={cn(
                             "py-2 rounded-lg transition-all text-[9px] font-black uppercase border",
                             activeYear === yr 
                               ? "bg-white text-black border-white" 
                               : "text-zinc-600 border-white/5 hover:border-white/10"
                           )}
                         >
                           {yr}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Subject Stream</h4>
                    <div className="flex flex-wrap gap-2">
                       {SUBJECTS.map(s => (
                         <Badge key={s} variant="outline" className="bg-zinc-900 border-white/5 text-zinc-600 text-[8px] px-2 py-1 cursor-pointer hover:border-orange-500/30 hover:text-zinc-300">
                           {s}
                         </Badge>
                       ))}
                    </div>
                 </div>
              </div>
           </aside>

           {/* CENTER: CONTENT FEED */}
           <main className="lg:col-span-6 space-y-6">
              {loading ? (
                <div className="space-y-6">
                   {[1,2,3].map(i => <div key={i} className="h-64 bg-zinc-900/40 animate-pulse rounded-[32px] border border-white/5" />)}
                </div>
              ) : filtered.length > 0 ? (
                <div className="space-y-6">
                   <AnimatePresence mode="popLayout">
                    {filtered.map((q, i) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <PYQPracticeCard question={q} mode={mode} index={i} />
                      </motion.div>
                    ))}
                   </AnimatePresence>
                </div>
              ) : (
                <div className="py-40 text-center bg-zinc-950 border-2 border-dashed border-white/5 rounded-[48px]">
                   <FileSearch className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                   <h3 className="text-xl font-black uppercase text-zinc-600 tracking-tighter">No Artifacts Found</h3>
                   <p className="text-zinc-700 mt-2 text-xs font-bold uppercase tracking-widest">The archives are currently quiet for this selection.</p>
                </div>
              )}
           </main>

           {/* RIGHT: PERFORMANCE SIGNALS */}
           <aside className="lg:col-span-3 space-y-6">
              <div className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] shadow-xl sticky top-24 space-y-8">
                 <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.3em] flex items-center gap-2">
                   <TrendingUp size={14} className="text-emerald-500" /> Mastery Pulse
                 </h3>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 text-center">
                       <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Attempted</p>
                       <h4 className="text-2xl font-black text-white">42</h4>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 text-center">
                       <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Precision</p>
                       <h4 className="text-2xl font-black text-emerald-500">84%</h4>
                    </div>
                 </div>

                 <div className="space-y-6 pt-4 border-t border-white/5">
                    <div className="space-y-3">
                       <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
                          <span>Punjab GK Mastery</span>
                          <span className="text-white">92%</span>
                       </div>
                       <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-600 w-[92%]" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
                          <span>Quant Velocity</span>
                          <span className="text-white">65%</span>
                       </div>
                       <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[65%]" />
                       </div>
                    </div>
                 </div>

                 <Card className="bg-orange-600/5 border border-orange-600/20 p-6 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                       <Zap size={14} className="text-orange-500 fill-current" />
                       <h5 className="text-[10px] font-black uppercase text-orange-500 tracking-widest">AI Mentor</h5>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                       "Strategic Hint: Historically, 40% of PSSSB GK focus on 19th Century Punjab battles. Target those PYQs today."
                    </p>
                 </Card>
              </div>
           </aside>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
