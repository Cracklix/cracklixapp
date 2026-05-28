
"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, Plus, Zap, Loader2, Search, BookOpen, 
  Trash2, Edit3, Copy, PlayCircle, Lock, Unlock, 
  Database, BarChart3, AlertTriangle, ShieldCheck,
  CheckCircle2, Globe, Clock, Sparkles, Filter,
  ChevronRight, MoreVertical, RefreshCw
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
 * SIMULATION FACTORY (Operations Hub)
 * Institutional registry for PSSSB & Punjab Police CBT oversight.
 * Strictly focused on management, NOT generation.
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
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Quick Action Hub */}
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <div className="space-y-1">
                <h1 className="font-headline text-3xl font-black tracking-tighter uppercase">Simulation Factory</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Operational Oversight Platform</p>
              </div>
              <div className="flex gap-3">
                 <Button onClick={() => router.push('/admin/mock-generator')} variant="outline" className="h-11 px-6 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest">
                    <Sparkles className="mr-2 w-3.5 h-3.5" /> AI Generator
                 </Button>
                 <Button onClick={() => router.push('/admin/mock-generator')} className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest blue-glow">
                    <Plus className="mr-2 w-4 h-4" /> Create Mock
                 </Button>
              </div>
            </div>

            {/* Tactical Registry */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-950/40 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
                 <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-zinc-600" />
                    <Input 
                      placeholder="Filter factory by identity..." 
                      className="h-10 bg-zinc-900 border-white/5 rounded-xl pl-12 font-bold text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right border-r border-white/10 pr-4">
                       <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Live Artifacts</p>
                       <p className="text-lg font-black text-white leading-none">{mocks.filter(m => m.status === 'published').length}</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest py-1.5 px-4 animate-pulse">Sync Active</Badge>
                 </div>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-zinc-900/60 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5">
                          <tr>
                             <th className="px-8 py-5">Identity Signal</th>
                             <th className="px-8 py-5">Classification</th>
                             <th className="px-8 py-5 text-center">Qs / Payload</th>
                             <th className="px-8 py-5">Access Tier</th>
                             <th className="px-8 py-5 text-right">Operational Logic</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {loading ? (
                            [1,2,3,4].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16" /></tr>)
                          ) : filtered.length > 0 ? (
                            filtered.map(m => (
                            <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                               <td className="px-8 py-4">
                                  <div className="flex items-center gap-4">
                                     <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 shadow-lg">
                                        <BookOpen className="text-zinc-500 w-4 h-4 group-hover:text-primary transition-colors" />
                                     </div>
                                     <div>
                                        <p className="font-bold text-zinc-100 text-sm leading-none mb-1.5">{m.title}</p>
                                        <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">ID: {m.id.substring(0,8)}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-4">
                                  <Badge className="bg-primary/20 text-primary text-[7px] font-black uppercase px-2 h-4 mb-1">{m.category || 'FULL'}</Badge>
                                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{m.exam}</p>
                               </td>
                               <td className="px-8 py-4 text-center">
                                  <p className="text-xs font-black text-white">{m.totalQuestions || 0} Qs</p>
                                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{m.duration}m Cluster</p>
                               </td>
                               <td className="px-8 py-4">
                                  <Badge className={cn("text-[8px] font-black uppercase px-3 py-0.5 rounded-lg border-none shadow-lg", m.accessType === 'free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/20 text-primary')}>
                                     {m.accessType === 'free' ? 'FREE HUB' : 'PASS+ ONLY'}
                                  </Badge>
                               </td>
                               <td className="px-8 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                     <Button onClick={() => router.push(`/admin/mocks/${m.id}`)} size="sm" className="h-8 px-4 rounded-xl bg-zinc-900 border border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest">
                                        Calibrate
                                     </Button>
                                     
                                     <div className="h-8 w-px bg-white/5 mx-1" />

                                     <div className="flex items-center gap-1">
                                       <Button onClick={() => handleAction(m.id, 'duplicate')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-600/10 text-zinc-600 hover:text-blue-500" title="Clone Mock"><Copy size={14} /></Button>
                                       
                                       {m.accessType === 'free' ? (
                                          <Button onClick={() => handleAction(m.id, 'lock')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-zinc-600 hover:text-primary" title="Restrict to PASS+"><Lock size={14} /></Button>
                                       ) : (
                                          <Button onClick={() => handleAction(m.id, 'unlock')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500" title="Unlock for Everyone"><Unlock size={14} /></Button>
                                       )}

                                       {m.status === 'draft' ? (
                                         <Button onClick={() => handleAction(m.id, 'publish')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-600/10 text-zinc-600 hover:text-emerald-500" title="Mark Live"><PlayCircle size={14} /></Button>
                                       ) : (
                                         <Button onClick={() => handleAction(m.id, 'unpublish')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-orange-500/10 text-zinc-600 hover:text-orange-500" title="Revert to Staging"><Database size={14} /></Button>
                                       )}
                                       <Button onClick={() => handleAction(m.id, 'delete')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500" title="Purge Artifact"><Trash2 size={14} /></Button>
                                     </div>
                                  </div>
                               </td>
                            </tr>
                          ))
                          ) : (
                            <tr><td colSpan={5} className="py-20 text-center text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">No Simulations Indexed</td></tr>
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
