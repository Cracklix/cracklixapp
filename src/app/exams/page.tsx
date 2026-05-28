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
  Rocket, 
  Database, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function ExamsPage() {
  const { user } = useAuth();
  const { isPremium } = usePremium(user?.uid);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("All");
  const [accessFilter, setAccessFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const q = query(
      collection(db, "mocks"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
      setMocks(data.filter(m => !m.expiresAt || m.expiresAt > Date.now()));
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
      const matchesAccess = accessFilter === "All" || 
                            (accessFilter === "Free" && m.accessType === 'free') ||
                            (accessFilter === "PASS+" && m.accessType === 'pass_plus');
      return matchesSearch && matchesExam && matchesAccess;
    })
    .sort((a, b) => {
      if (sortBy === "latest") return (b.publishedAt || b.createdAt || 0) - (a.publishedAt || a.createdAt || 0);
      if (sortBy === "duration") return b.duration - a.duration;
      return 0;
    });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-32 space-y-6">
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center blue-glow">
                  <Rocket className="text-white w-5 h-5" />
               </div>
               <div>
                  <h1 className="text-2xl font-black tracking-tight uppercase leading-none text-white">Simulation Arena</h1>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Practice for Punjab Board Exams</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 bg-zinc-950 p-1.5 rounded-xl border border-white/5">
               <div className="px-3 border-r border-white/10">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Pass Status</p>
                  <p className={cn("text-xs font-black uppercase", isPremium ? "text-emerald-500" : "text-zinc-500")}>
                    {isPremium ? "Active" : "Free Tier"}
                  </p>
               </div>
               <div className="px-3">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Total Tests</p>
                  <p className="text-xs font-black text-white">{mocks.length}</p>
               </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 items-center bg-zinc-950/40 p-3 rounded-2xl border border-white/5">
             <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-3 w-4 h-4 text-zinc-600" />
                <Input 
                  placeholder="Filter by mock title..." 
                  className="pl-11 h-10 bg-black/40 border-white/5 rounded-xl text-xs font-bold focus:ring-primary/20" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             
             <div className="flex flex-wrap gap-2 items-center">
                <Select value={sortBy} onValueChange={setSortBy}>
                   <SelectTrigger className="w-[130px] h-10 bg-zinc-900 border-white/5 rounded-xl font-bold text-[9px] uppercase tracking-widest">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="duration">Longest</SelectItem>
                   </SelectContent>
                </Select>

                <Select value={accessFilter} onValueChange={setAccessFilter}>
                   <SelectTrigger className="w-[110px] h-10 bg-zinc-900 border-white/5 rounded-xl font-bold text-[9px] uppercase tracking-widest">
                      <SelectValue placeholder="Access" />
                   </SelectTrigger>
                   <SelectContent className="bg-zinc-950 text-white border-white/10">
                      <SelectItem value="All">All Tiers</SelectItem>
                      <SelectItem value="Free">Free Hub</SelectItem>
                      <SelectItem value="PASS+">PASS+</SelectItem>
                   </SelectContent>
                </Select>

                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger className="w-[140px] h-10 bg-zinc-900 border-white/5 rounded-xl font-bold text-[9px] uppercase tracking-widest">
                     <SelectValue placeholder="Exam Board" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                     <SelectItem value="All">All Boards</SelectItem>
                     <SelectItem value="PSSSB">PSSSB</SelectItem>
                     <SelectItem value="Punjab Police">Punjab Police</SelectItem>
                     <SelectItem value="PPSC">PPSC</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-zinc-900/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredMocks.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {filteredMocks.map((mock) => (
                <MockCard key={mock.id} mock={mock} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-32 text-center rounded-3xl border-2 border-dashed border-white/5 bg-zinc-950/20">
             <Database className="text-zinc-800 w-10 h-10 mx-auto mb-4" />
             <h3 className="text-lg font-black uppercase text-zinc-600 tracking-widest">No Simulations Found</h3>
             <p className="text-zinc-700 text-xs mt-2 italic">Adjust filters or search criteria.</p>
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}