"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, Plus, Zap, Loader2, Search, BookOpen, 
  Trash2, Edit3, Copy, PlayCircle, Lock, Unlock, 
  Database, BarChart3, AlertTriangle, ShieldCheck,
  CheckCircle2, Globe, Clock, Sparkles
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
  getMockAnalytics
} from "@/services/mocks";
import { MockTest, MockStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * HIGH-DENSITY SIMULATION REGISTRY (Testbook Grade)
 * Operational dashboard for PSSSB & Punjab Police CBT oversight.
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
        if (!confirm("Permanently purge this simulation artifact? This cannot be undone.")) return;
        await deleteMock(mockId);
      } else if (action === 'publish') {
        await publishMock(mockId, true);
      } else if (action === 'unpublish') {
        await publishMock(mockId, false);
      } else if (action === 'duplicate') {
        await duplicateMock(mockId);
        toast({ title: "Simulation Cloned", description: "Artifact payload deep-copied successfully." });
      } else if (action === 'lock') {
        await updateMock(mockId, { accessType: 'pass_plus' });
      } else if (action === 'unlock') {
        await updateMock(mockId, { accessType: 'free' });
      }
      
      toast({ title: "Signal Synchronized", description: `Operation ${action} verified.` });
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

  const stats = {
    total: mocks.length,
    live: mocks.filter(m => m.status === 'published').length,
    draft: mocks.filter(m => m.status === 'draft').length,
    pass: mocks.filter(m => m.accessType === 'pass_plus').length,
    free: mocks.filter(m => m.accessType === 'free').length,
  };

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-10">
            {/* Header: Global Pulse */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center blue-glow shadow-2xl">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-4xl font-black tracking-tighter uppercase">Mock Operations</h1>
                 </div>
                 <p className="text-zinc-500 text-sm font-medium tracking-tight ml-1">Central command for Punjab recruitment board simulations.</p>
              </div>
              <div className="flex gap-4">
                 <Button onClick={() => router.push('/admin/direct-mock-builder')} variant="outline" className="h-14 px-8 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 font-black text-xs uppercase tracking-widest">
                    <Sparkles className="mr-2 w-4 h-4" /> AI Mock Generator
                 </Button>
                 <Button onClick={() => router.push('/admin/direct-mock-builder')} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest blue-glow shadow-xl">
                    <Plus className="mr-2 w-5 h-5" /> Create Mock
                 </Button>
              </div>
            </header>

            {/* KPI Pulse Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {[
                 { label: "Total Artifacts", val: stats.total, icon: Database, color: "text-zinc-400" },
                 { label: "Live Simulations", val: stats.live, icon: CheckCircle2, color: "text-emerald-500" },
                 { label: "Pending Staging", val: stats.draft, icon: Clock, color: "text-orange-500" },
                 { label: "Pass Exclusive", val: stats.pass, icon: Lock, color: "text-primary" },
                 { label: "Open Access", val: stats.free, icon: Globe, color: "text-accent" },
               ].map(kpi => (
                 <div key={kpi.label} className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl group hover:bg-zinc-900 transition-all">
                    <div className={cn("w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-110", kpi.color)}>
                       <kpi.icon size={16} />
                    </div>
                    <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">{kpi.label}</p>
                    <h3 className="text-2xl font-black">{kpi.val}</h3>
                 </div>
               ))}
            </div>

            {/* Tactical Registry */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                    <Input 
                      placeholder="Audit registry by identity signal..." 
                      className="h-12 bg-zinc-900 border-white/5 rounded-2xl pl-12 font-bold text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest py-1.5 px-4 animate-pulse">Sync Active</Badge>
                 </div>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-zinc-900/60 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5">
                          <tr>
                             <th className="px-8 py-6">Identity Signal</th>
                             <th className="px-8 py-6">Board / Class</th>
                             <th className="px-8 py-6 text-center">Payload</th>
                             <th className="px-8 py-6">Access Rank</th>
                             <th className="px-8 py-6 text-right">Operational Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {loading ? (
                            [1,2,3,4].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-20" /></tr>)
                          ) : filtered.length > 0 ? (
                            filtered.map(m => (
                            <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 shadow-lg">
                                        <BookOpen className="text-zinc-500 w-5 h-5 group-hover:text-primary transition-colors" />
                                     </div>
                                     <div>
                                        <p className="font-bold text-zinc-100 text-base leading-none mb-1.5">{m.title}</p>
                                        <div className="flex items-center gap-2">
                                          <Badge className="bg-primary/20 text-primary text-[7px] font-black uppercase px-2 h-4">{m.category || 'FULL'}</Badge>
                                          <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">ID: {m.id.substring(0,8)}</span>
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-xs font-black uppercase text-zinc-400">{m.exam}</p>
                                  <p className="text-[10px] text-zinc-600 font-medium">Recruitment Cycle 2024</p>
                               </td>
                               <td className="px-8 py-6 text-center">
                                  <p className="text-sm font-black text-white">{m.totalQuestions || 0} Qs</p>
                                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{m.duration}m Engine</p>
                               </td>
                               <td className="px-8 py-6">
                                  <Badge className={cn("text-[9px] font-black uppercase px-4 py-1 rounded-lg border-none shadow-lg", m.accessType === 'free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/20 text-primary')}>
                                     {m.accessType === 'free' ? 'FREE HUB' : 'PASS+ ONLY'}
                                  </Badge>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex justify-end gap-2">
                                     <Button onClick={() => router.push(`/admin/mocks/${m.id}`)} size="sm" className="h-9 px-5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest">
                                        Edit
                                     </Button>
                                     <Button onClick={() => router.push(`/admin/mocks/${m.id}`)} size="sm" variant="ghost" className="h-9 px-4 rounded-xl text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest">
                                        Questions
                                     </Button>
                                     
                                     <div className="h-9 w-px bg-white/5 mx-1" />

                                     <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                       <Button onClick={() => handleAction(m.id, 'duplicate')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-600/10 text-blue-500" title="Clone Mock"><Copy size={16} /></Button>
                                       
                                       {m.accessType === 'free' ? (
                                          <Button onClick={() => handleAction(m.id, 'lock')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary" title="Restrict to PASS+"><Lock size={16} /></Button>
                                       ) : (
                                          <Button onClick={() => handleAction(m.id, 'unlock')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 text-emerald-500" title="Unlock for Everyone"><Unlock size={16} /></Button>
                                       )}

                                       {m.status === 'draft' ? (
                                         <Button onClick={() => handleAction(m.id, 'publish')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-emerald-600/10 text-emerald-500" title="Mark Live"><PlayCircle size={16} /></Button>
                                       ) : (
                                         <Button onClick={() => handleAction(m.id, 'unpublish')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-orange-500/10 text-orange-500" title="Revert to Staging"><Database size={16} /></Button>
                                       )}
                                       <Button onClick={() => handleAction(m.id, 'delete')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-red-500" title="Purge Artifact"><Trash2 size={16} /></Button>
                                     </div>
                                  </div>
                               </td>
                            </tr>
                          ))
                          ) : (
                            <tr><td colSpan={5} className="py-32 text-center text-zinc-700 text-xs font-black uppercase tracking-[0.4em]">No Simulations Indexed in This Sector</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>

            {/* Support Signal Footer */}
            <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 flex gap-8 items-center">
               <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-2xl">
                  <AlertTriangle className="text-primary w-7 h-7" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">Deployment Protocol</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-4xl italic">
                    "All simulations marked as <span className="text-emerald-500 font-bold uppercase">Live</span> are instantly visible to the 15k+ aspirant base. Verified question-to-answer mapping is mandatory before production release."
                  </p>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
