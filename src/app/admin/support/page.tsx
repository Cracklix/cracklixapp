
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  AlertCircle,
  Mail,
  User,
  MoreVertical,
  ShieldCheck,
  Zap,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SupportAdminPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function updateStatus(id: string, status: string) {
    await updateDoc(doc(db, "support_tickets", id), { status, updatedAt: Date.now() });
    toast({ title: `Ticket ${status.toUpperCase()}` });
  }

  const filtered = tickets.filter(t => {
    const matchesSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || t.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center blue-glow shadow-lg">
                      <MessageSquare className="text-primary w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Support Signals</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Manage user reported issues, payment disputes, and bug reports.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600" />
                    <Input 
                      placeholder="Audit ticket strings..." 
                      className="pl-12 h-14 bg-zinc-900 border-white/5 rounded-2xl text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/5 bg-zinc-900">
                    <Filter className="w-5 h-5" />
                 </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: "Open Tickets", val: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
                 { label: "In Progress", val: tickets.filter(t => t.status === 'in-progress').length, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
                 { label: "Resolved", val: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                 { label: "Satisfaction", val: "94%", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
               ].map(stat => (
                 <div key={stat.label} className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 space-y-4 group hover:bg-zinc-900 transition-all">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                       <stat.icon size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1">{stat.label}</p>
                       <h2 className="text-4xl font-black">{stat.val}</h2>
                    </div>
                 </div>
               ))}
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between px-4">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500">Live Ticket Feed ({filtered.length})</h3>
                  <div className="flex gap-2">
                    {['all', 'open', 'in-progress', 'resolved'].map(f => (
                      <button 
                        key={f} 
                        onClick={() => setStatusFilter(f)}
                        className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", statusFilter === f ? "bg-primary text-white" : "bg-zinc-900 text-zinc-600 hover:text-white")}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="grid gap-4">
                  {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-32 rounded-[32px] bg-zinc-900/50 animate-pulse border border-white/5" />)
                  ) : filtered.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                       {filtered.map(t => (
                         <motion.div
                           key={t.id}
                           layout
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           className="bg-zinc-900/30 border border-white/5 rounded-[40px] p-8 hover:bg-zinc-900 transition-all group overflow-hidden relative"
                         >
                            <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                               <div className="flex gap-6 items-start flex-1">
                                  <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105",
                                    t.status === 'open' ? 'bg-red-500/10 text-red-500' : t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                  )}>
                                     {t.category === 'payment' ? <Zap size={24} /> : <Tag size={24} />}
                                  </div>
                                  <div className="space-y-4">
                                     <div>
                                        <div className="flex items-center gap-3 mb-1">
                                           <h4 className="text-xl font-bold text-white leading-none">{t.subject}</h4>
                                           <Badge className={cn("text-[8px] font-black uppercase border-none", t.status === 'open' ? 'bg-red-500' : t.status === 'resolved' ? 'bg-emerald-500' : 'bg-orange-500')}>
                                              {t.status}
                                           </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                                           <span className="flex items-center gap-1.5"><User size={12} /> {t.userName}</span>
                                           <span className="flex items-center gap-1.5"><Mail size={12} /> {t.userEmail}</span>
                                           <span className="text-[10px] uppercase font-black tracking-widest text-primary">{t.category}</span>
                                        </div>
                                     </div>
                                     <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{t.message}</p>
                                     <span className="text-[9px] font-black text-zinc-700 uppercase block pt-2">Received: {new Date(t.createdAt).toLocaleString()}</span>
                                  </div>
                               </div>
                               
                               <div className="flex md:flex-col gap-3 justify-end">
                                  {t.status !== 'resolved' && (
                                    <Button onClick={() => updateStatus(t.id, 'resolved')} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase">
                                       Resolve
                                    </Button>
                                  )}
                                  {t.status === 'open' && (
                                    <Button onClick={() => updateStatus(t.id, 'in-progress')} variant="outline" className="h-10 px-6 rounded-xl border-white/10 hover:bg-white/5 font-black text-[10px] tracking-widest uppercase">
                                       In Progress
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-600 hover:text-destructive">
                                     <Trash2 size={18} />
                                  </Button>
                               </div>
                            </div>
                         </motion.div>
                       ))}
                    </AnimatePresence>
                  ) : (
                    <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-zinc-950/20">
                       <ShieldCheck className="w-16 h-16 text-zinc-800 mx-auto mb-6 opacity-20" />
                       <h3 className="text-2xl font-black uppercase text-zinc-600 tracking-tighter">Quiet Frequency</h3>
                       <p className="text-zinc-700 mt-2 font-medium italic">No support signals detected in this channel.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
