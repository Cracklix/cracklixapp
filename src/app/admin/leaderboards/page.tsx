"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Trophy, 
  TrendingUp, 
  RotateCcw, 
  Users, 
  Star,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function AdminLeaderboardPage() {
  const { toast } = useToast();
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanks();
  }, []);

  async function loadRanks() {
    setLoading(true);
    try {
      const q = query(collection(db, "leaderboards"), orderBy("xp", "desc"), limit(100));
      const snap = await getDocs(q);
      setRanks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm("This will erase ALL current rankings. This is usually done for new recruitment cycles. Continue?")) return;
    toast({ title: "Reset Sequence Initiated", description: "Archiving current cycle rankings..." });
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center blue-glow">
                      <Trophy className="text-primary w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter">Rank Registry</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Manage the Punjab State Rankings and student merit logs.</p>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-bold" onClick={loadRanks}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Refresh Board
                 </Button>
                 <Button className="h-14 px-8 rounded-2xl bg-destructive hover:bg-destructive/90 font-black text-xs uppercase tracking-widest" onClick={handleReset}>
                    Reset All Cycle
                 </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-8 flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                     <Users className="text-zinc-500 w-8 h-8" />
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px]">SYNCED</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">Ranked Aspirants</p>
                    <h2 className="text-4xl font-black">{ranks.length}</h2>
                  </div>
               </Card>

               <Card className="rounded-[40px] bg-primary/10 border-primary/20 p-8 flex flex-col justify-between h-48 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                     <Star size={100} />
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                     <Star className="text-primary w-8 h-8" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-black uppercase text-primary tracking-[0.2em] mb-1">Average XP Velocity</p>
                    <h2 className="text-4xl font-black">+42.5/hr</h2>
                  </div>
               </Card>

               <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-8 flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                     <TrendingUp className="text-accent w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">Cycle Status</p>
                    <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-tighter">PEAK ENGAGEMENT</h2>
                  </div>
               </Card>
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] overflow-hidden">
               <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                     <ShieldCheck className="text-primary w-5 h-5" />
                     Live Merit List
                  </h3>
                  <div className="flex gap-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                        <Input placeholder="Find identity..." className="pl-10 h-10 bg-black/40 border-white/5 rounded-xl text-xs w-64" />
                     </div>
                  </div>
               </div>
               
               <div className="divide-y divide-white/5">
                  {loading ? (
                    [1,2,3,4,5].map(i => <div key={i} className="h-20 animate-pulse bg-white/[0.02]" />)
                  ) : ranks.length > 0 ? (
                    ranks.map((r, i) => (
                      <div key={r.id} className="p-6 px-10 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-6">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i < 3 ? 'bg-primary/20 text-primary shadow-lg' : 'bg-zinc-900 text-zinc-600'}`}>
                              #{i + 1}
                           </div>
                           <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12 border border-white/10">
                                 <AvatarImage src={`https://picsum.photos/seed/${r.userId}/100`} />
                                 <AvatarFallback>{r.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{r.name}</h4>
                                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{r.userId.substring(0, 10)}...</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-12">
                           <div className="text-right">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">XP POOL</p>
                              <p className="text-xl font-black text-white">{r.xp?.toLocaleString()}</p>
                           </div>
                           <div className="text-right hidden md:block">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">ACCURACY</p>
                              <div className="flex items-center gap-2">
                                 <span className="text-xl font-black text-accent">{r.accuracy}%</span>
                                 <div className="h-4 w-1 bg-accent/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent" style={{ height: `${r.accuracy}%` }} />
                                 </div>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" className="rounded-xl text-zinc-700 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                           </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-32 text-center text-zinc-600 italic">No students have entered the merit cycle yet.</div>
                  )}
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-destructive/5 border border-destructive/20 flex gap-6 items-start">
               <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-destructive w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-lg font-bold text-destructive">Data Integrity Notice</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Leaderboard values are server-calculated. Manual modification of XP or Ranks is strictly prohibited to maintain platform meritocracy. 
                    Any suspicious activity should be reported to the security head.
                  </p>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
