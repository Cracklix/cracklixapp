'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import { MockTest } from '@/types';
import MockCard from '@/components/exams/mock-card';
import { 
  Search, 
  Filter, 
  Rocket, 
  Database, 
  Loader2,
  LayoutGrid,
  ListFilter,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExamsPage() {
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const q = query(
      collection(db, "mocks"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
      setMocks(data);
      setLoading(false);
    }, (error) => {
      console.error("Mocks Fetch Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMocks = mocks
    .filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchesExam = examFilter === "All" || m.exam === examFilter;
      const matchesType = typeFilter === "All" || m.type === typeFilter;
      const matchesDifficulty = difficultyFilter === "All" || (m as any).difficulty === difficultyFilter;
      return matchesSearch && matchesExam && matchesType && matchesDifficulty;
    })
    .sort((a, b) => {
      if (sortBy === "latest") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === "duration") return b.duration - a.duration;
      return 0;
    });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-32 space-y-12">
        {/* Header Hero Section */}
        <header className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center blue-glow shadow-lg border border-primary/20">
                     <Rocket className="text-white w-6 h-6" />
                  </div>
                  <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none text-white">Live Arena</h1>
               </div>
               <p className="text-zinc-500 font-medium max-w-xl text-lg">Server-synced CBT simulations for Punjab Recruitment Boards.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
               <div className="px-4 py-2 text-right border-r border-white/10">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Active Tests</p>
                  <p className="text-xl font-black text-white">{mocks.length}</p>
               </div>
               <div className="px-4 py-2">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Global Rank</p>
                  <p className="text-xl font-black text-primary">#42.5k</p>
               </div>
            </div>
          </div>

          {/* Strategic Search & Sort Toolbar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-zinc-950/40 p-4 rounded-[32px] border border-white/5 backdrop-blur-xl">
             <div className="lg:col-span-4 relative group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Filter by mock identity..." 
                  className="pl-12 h-12 bg-black/40 border-white/5 rounded-2xl text-sm font-bold focus:ring-primary/20" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             
             <div className="lg:col-span-8 flex flex-wrap gap-3 items-center justify-end">
                <Select value={sortBy} onValueChange={setSortBy}>
                   <SelectTrigger className="w-[140px] h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">
                      <ArrowUpDown className="w-3 h-3 mr-2" />
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      <SelectItem value="latest">Latest First</SelectItem>
                      <SelectItem value="duration">Longest First</SelectItem>
                   </SelectContent>
                </Select>

                <div className="h-8 w-px bg-white/5 hidden lg:block mx-2" />

                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger className="w-[160px] h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">
                     <SelectValue placeholder="Exam Board" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                     <SelectItem value="All">All Boards</SelectItem>
                     <SelectItem value="PSSSB">PSSSB</SelectItem>
                     <SelectItem value="Punjab Police">Punjab Police</SelectItem>
                     <SelectItem value="PPSC">PPSC</SelectItem>
                     <SelectItem value="CTET">CTET</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px] h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">
                     <SelectValue placeholder="Test Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                     <SelectItem value="All">All Types</SelectItem>
                     <SelectItem value="full">Full Mock</SelectItem>
                     <SelectItem value="sectional">Sectional</SelectItem>
                     <SelectItem value="chapter">Chapter Test</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[140px] h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">
                     <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                     <SelectItem value="All">All Difficulty</SelectItem>
                     <SelectItem value="easy">Easy</SelectItem>
                     <SelectItem value="medium">Medium</SelectItem>
                     <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                { (examFilter !== "All" || typeFilter !== "All" || difficultyFilter !== "All" || search !== "") && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-12 w-12 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5"
                    onClick={() => { setExamFilter("All"); setTypeFilter("All"); setDifficultyFilter("All"); setSearch(""); }}
                  >
                     <ListFilter className="w-5 h-5" />
                  </Button>
                ) }
             </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[450px] rounded-[40px] bg-zinc-900/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredMocks.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredMocks.map((mock) => (
                <MockCard key={mock.id} mock={mock} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-48 text-center rounded-[64px] border-2 border-dashed border-white/5 bg-zinc-950/20">
             <div className="w-20 h-20 rounded-[28px] bg-zinc-900 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Database className="text-zinc-800 w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black uppercase text-zinc-600 tracking-tighter">Sector Quiet</h3>
             <p className="text-zinc-700 mt-2 font-medium italic">The Board is currently finalizing the next batch of simulations. Check the schedule.</p>
             <Button variant="outline" className="mt-10 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest" onClick={() => window.location.reload()}>
                Refresh Stream
             </Button>
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}