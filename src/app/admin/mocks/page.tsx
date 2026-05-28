"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, Plus, Zap, Loader2, Search, BookOpen, 
  Trash2, Edit3, Copy, PlayCircle, Lock, Unlock, 
  Database, BarChart3, ShieldCheck, CheckCircle2,
  Filter, ChevronRight, MoreVertical, RefreshCw,
  Clock, Target, AlertCircle, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  getAllMocks, 
  publishMock, 
  deleteMock, 
  duplicateMock, 
  updateMock,
} from "@/services/mocks";
import { MockTest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * SIMULATION FACTORY (Operations Hub)
 * High-density registry for simulation tracking and lifecycle control.
 */
export default function SimulationFactoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadMocks();
  }, []);

  async function loadMocks() {
    setLoading(true);
    try {
      const data = await getAllMocks();
      setMocks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (mockId: string, action: string) => {
    setActionLoading(`${mockId}-${action}`);
    try {
      if (action === 'delete') {
        if (!confirm("Permanently purge this simulation artifact?")) return;
        await deleteMock(mockId);
      } else if (action === 'publish') {
        await publishMock(mockId, true);
      } else if (action === 'unpublish') {
        await publishMock(mockId, false);
      } else if (action === 'duplicate') {
        await duplicateMock(mockId);
        toast({ title: "Signal Cloned", description: "Deep copy successful." });
      } else if (action === 'lock') {
        await updateMock(mockId, { accessType: 'pass_plus' });
      } else if (action === 'unlock') {
        await updateMock(mockId, { accessType: 'free' });
      }
      
      toast({ title: "Sync Complete", description: `Operation ${action} verified.` });
      // Force immediate reload to ensure delete reflects in UI
      loadMocks();
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = mocks.filter(m => 
    m.title?.toLowerCase().includes(search.toLowerCase()) || 
    m.exam?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-x-hidden">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto no-scrollbar max-w-full">
          <div className="max-w-[1600px] mx-auto space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[
                 { label: "Total Artifacts", val: mocks.length, icon: Database, color: "text-blue-500", bg: "bg-blue-500/10" },
                 { label: "Live Productions", val: mocks.filter(m => m.status === 'published').length, icon: PlayCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                 { label: "Staging Area", val: mocks.filter(m => m.status === 'draft').length, icon: RefreshCw, color: "text-orange-500", bg: "bg-orange-500/10" },
                 { label: "Attempt Volume", val: mocks.reduce((acc, m) => acc + (m.attemptCount || 0), 0), icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
               ].map((kpi, i) => (
                 <div key={i} className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 space-y-4 group hover:bg-zinc-900 transition-all">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
                       <kpi.icon size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1">{kpi.label}</p>
                       <h2 className="text-3xl font-black">{kpi.val}</h2>
                    </div>
                 </div>
               ))}
            </div>

            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div className="space-y-1">
                <h1 className="font-headline text-4xl font-black tracking-tighter uppercase leading-none">Simulation Factory</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-1">Operational Lifecycle Manager v5.2</p>
              </div>
              <div className="flex gap-4">
                 <Button onClick={() => router.push('/admin/ai-mock-studio')} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-[11px] uppercase tracking-widest blue-glow shadow-2xl">
                    <Plus className="mr-2 w-4 h-4" /> Create New Simulation
                 </Button>
              </div>
            </header>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-950/40 p-4 rounded-[32px] border border-white/5 backdrop-blur-xl">
                 <div className="relative w-full md:w-[450px]">
                    <Search className="absolute left-5 top-4 w-5 h-5 text-zinc-600" />
                    <Input 
                      placeholder="Filter artifacts by identity or board..." 
                      className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl pl-14 font-bold text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-6 px-4">
                    <div className="flex items-center gap-3">
                       <Filter size={16} className="text-zinc-600" />
                       <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Active Sync: Global</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <Button variant="ghost" size="sm" onClick={loadMocks} className="text-zinc-500 hover:text-white"><RefreshCw size={14} className="mr-2" /> Refresh Feed</Button>
                 </div>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                 <div className="w-full">
                    <table className="w-full text-left table-fixed">
                       <thead className="bg-zinc-900/60 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5">
                          <tr>
                             <th className="px-10 py-8 w-[40%]">Simulation Identity</th>
                             <th className="px-10 py-8 w-[20%]">Board Profile</th>
                             <th className="px-10 py-8 text-center w-[15%]">Artifacts</th>
                             <th className="px-10 py-8 w-[15%]">Status</th>
                             <th className="px-10 py-8 text-right w-[10%]">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {loading ? (
                            [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-24" /></tr>)
                          ) : filtered.length > 0 ? (
                            filtered.map(m => (
                            <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-6 overflow-hidden">
                                     <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 shadow-lg relative shrink-0">
                                        <BookOpen className="text-zinc-500 w-5 h-5 group-hover:text-primary transition-colors" />
                                        {m.aiGenerated && <Sparkles size={10} className="absolute -top-1 -right-1 text-primary fill-current" />}
                                     </div>
                                     <div className="min-w-0">
                                        <p className="font-bold text-zinc-100 text-base leading-none mb-2 truncate">{m.title}</p>
                                        <div className="flex items-center gap-3">
                                           <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">ID: {m.id.substring(0,8)}</span>
                                           <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">•</span>
                                           <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {new Date(m.createdAt).toLocaleDateString()}</span>
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-3 h-5 mb-2">{m.category || 'FULL MOCK'}</Badge>
                                  <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{m.exam}</p>
                               </td>
                               <td className="px-10 py-8 text-center">
                                  <p className="text-sm font-black text-white">{m.totalQuestions || 0} Qs</p>
                                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{m.attemptCount || 0} Attempts</p>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="flex flex-col gap-2">
                                     <Badge className={cn("text-[8px] font-black uppercase px-3 py-1 rounded-lg border-none w-fit", m.accessType === 'free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/20 text-primary')}>
                                        {m.accessType === 'free' ? 'FREE HUB' : 'PASS+ ONLY'}
                                     </Badge>
                                     <Badge className={cn("text-[8px] font-black uppercase px-3 py-1 rounded-lg border-none w-fit", m.status === 'published' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500')}>
                                        {m.status}
                                     </Badge>
                                  </div>
                               </td>
                               <td className="px-10 py-8 text-right">
                                  <div className="flex justify-end items-center gap-2">
                                     <Button onClick={() => router.push(`/admin/mocks/${m.id}`)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-zinc-500 hover:text-primary" title="Calibrate"><Edit3 size={16} /></Button>
                                     <Button onClick={() => handleAction(m.id, 'duplicate')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-600/10 text-zinc-500 hover:text-blue-500" title="Clone"><Copy size={16} /></Button>
                                     {m.status === 'draft' ? (
                                       <Button onClick={() => handleAction(m.id, 'publish')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-emerald-600/10 text-zinc-500 hover:text-emerald-500" title="Publish"><PlayCircle size={16} /></Button>
                                     ) : (
                                       <Button onClick={() => handleAction(m.id, 'unpublish')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-orange-500/10 text-zinc-500 hover:text-orange-500" title="Unpublish"><RefreshCw size={16} /></Button>
                                     )}
                                     <Button onClick={() => handleAction(m.id, 'delete')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500" title="Delete"><Trash2 size={16} /></Button>
                                  </div>
                               </td>
                            </tr>
                          ))
                          ) : (
                            <tr><td colSpan={5} className="py-52 text-center">
                                <div className="space-y-4 opacity-20">
                                   <AlertCircle size={48} className="mx-auto" />
                                   <p className="text-[11px] font-black uppercase tracking-[0.4em]">No Simulations Indexed in Factory</p>
                                </div>
                            </td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
