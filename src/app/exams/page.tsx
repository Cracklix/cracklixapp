
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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
  Sparkles,
  Loader2,
  XCircle
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

  useEffect(() => {
    const q = query(
      collection(db, "mocks"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
      // Manual sort since compound queries require indexes we might not have yet
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMocks(data);
      setLoading(false);
    }, (error) => {
      console.error("Mocks Fetch Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMocks = mocks.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesExam = examFilter === "All" || m.exam === examFilter;
    const matchesType = typeFilter === "All" || m.type === typeFilter;
    // Note: difficulty might be at mock level or per question, here we check mock level if exists
    const matchesDifficulty = difficultyFilter === "All" || (m as any).difficulty === difficultyFilter;
    
    return matchesSearch && matchesExam && matchesType && matchesDifficulty;
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-32 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center blue-glow shadow-lg">
                   <Rocket className="text-white w-6 h-6" />
                </div>
                <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none text-white">Live Arena</h1>
             </div>
             <p className="text-zinc-500 font-medium max-w-xl text-lg">Access server-synced CBT simulations for all Punjab Recruitment Boards.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600" />
                <Input 
                  placeholder="Find your target mock..." 
                  className="pl-12 h-14 bg-zinc-900 border-white/5 rounded-2xl text-sm" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/5 bg-zinc-900">
                <Filter className="w-5 h-5 text-zinc-500" />
             </Button>
          </div>
        </header>

        {/* Filter Toolbar */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
           <Select value={examFilter} onValueChange={setExamFilter}>
              <SelectTrigger className="w-[180px] h-11 bg-zinc-900 border-white/5 rounded-xl font-bold text-xs uppercase tracking-widest">
                 <SelectValue placeholder="Exam Board" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 text-white">
                 <SelectItem value="All">All Boards</SelectItem>
                 <SelectItem value="PSSSB">PSSSB</SelectItem>
                 <SelectItem value="Punjab Police">Punjab Police</SelectItem>
                 <SelectItem value="PPSC">PPSC</SelectItem>
                 <SelectItem value="CTET">CTET</SelectItem>
              </SelectContent>
           </Select>

           <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] h-11 bg-zinc-900 border-white/5 rounded-xl font-bold text-xs uppercase tracking-widest">
                 <SelectValue placeholder="Test Type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 text-white">
                 <SelectItem value="All">All Types</SelectItem>
                 <SelectItem value="full">Full Mock</SelectItem>
                 <SelectItem value="sectional">Sectional</SelectItem>
                 <SelectItem value="chapter">Chapter Test</SelectItem>
              </SelectContent>
           </Select>

           <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px] h-11 bg-zinc-900 border-white/5 rounded-xl font-bold text-xs uppercase tracking-widest">
                 <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 text-white">
                 <SelectItem value="All">Mixed Difficulty</SelectItem>
                 <SelectItem value="easy">Easy</SelectItem>
                 <SelectItem value="medium">Medium</SelectItem>
                 <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
           </Select>

           { (examFilter !== "All" || typeFilter !== "All" || difficultyFilter !== "All" || search !== "") && (
             <Button 
               variant="ghost" 
               className="h-11 rounded-xl text-zinc-500 hover:text-white font-black text-[10px] uppercase tracking-widest"
               onClick={() => { setExamFilter("All"); setTypeFilter("All"); setDifficultyFilter("All"); setSearch(""); }}
             >
                Clear Reset
             </Button>
           ) }
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-[40px] bg-zinc-900/40 animate-pulse border border-white/5" />
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
          <div className="py-40 text-center rounded-[64px] border-2 border-dashed border-white/5 bg-zinc-950/20">
             <div className="w-20 h-20 rounded-[28px] bg-zinc-900 flex items-center justify-center mx-auto mb-8">
                <Database className="text-zinc-800 w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black uppercase text-zinc-600 tracking-tighter">Sector Quiet</h3>
             <p className="text-zinc-700 mt-2 font-medium italic">No live mocks detected for this configuration. Check the schedule center.</p>
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
