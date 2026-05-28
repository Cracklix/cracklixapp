
"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, Plus, Zap, Loader2, Search, BookOpen, 
  Trash2, Edit3, Copy, PlayCircle, Lock, Unlock, 
  Database, BarChart3, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  getAllMocks, 
  publishMock, 
  deleteMock, 
  duplicateMock, 
  updateMock
} from "@/services/mocks";
import { MockTest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * HIGH-DENSITY SIMULATION REGISTRY
 * Replaces oversized cinematic layouts with production-grade density.
 */
export default function SimulationFactoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      } else if (action === 'lock') {
        await updateMock(mockId, { accessType: 'pass_plus' });
      } else if (action === 'unlock') {
        await updateMock(mockId, { accessType: 'free' });
      }
      toast({ title: "Signal Synchronized", description: `Operation ${action} completed successfully.` });
      loadMocks();
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message, variant: "destructive" });
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
            <header className="flex justify-between items-end border-b border-white/5 pb-6">
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center blue-glow">
                      <Rocket className="text-white w-5 h-5" />
                   </div>
                   <h1 className="font-headline text-3xl font-black tracking-tighter uppercase">Simulation Factory</h1>
                 </div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest ml-1">Registry oversight for PSSSB & Punjab Police CBTs.</p>
              </div>
              <Button onClick={() => router.push('/admin/direct-mock-builder')} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest blue-glow">
                 <Plus className="mr-2 w-4 h-4" /> Initialize Simulation
              </Button>
            </header>

            <div className="relative max-w-sm">
               <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
               <Input 
                 placeholder="Search registry artifacts..." 
                 className="h-11 bg-zinc-900 border-white/5 rounded-xl pl-11 font-bold text-xs"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-zinc-900/60 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5">
                        <tr>
                           <th className="px-8 py-4">Simulation Identity</th>
                           <th className="px-8 py-4">Board Mapping</th>
                           <th className="px-8 py-4">Payload</th>
                           <th className="px-8 py-4">Security Level</th>
                           <th className="px-8 py-4 text-right">Rapid Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                          [1,2,3,4].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16" /></tr>)
                        ) : filtered.length > 0 ? (
                          filtered.map(m => (
                          <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                             <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
                                      <BookOpen className="text-zinc-500 w-4 h-4 group-hover:text-primary transition-colors" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-zinc-100 text-sm">{m.title}</p>
                                      <p className="text-[8px] text-zinc-600 font-black uppercase">UUID: {m.id.substring(0,8)}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-4">
                                <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-2">{m.exam}</Badge>
                             </td>
                             <td className="px-8 py-4 text-xs font-bold text-zinc-500">
                                {m.totalQuestions || 0} Qs • {m.duration}m
                             </td>
                             <td className="px-8 py-4">
                                <Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5", m.accessType === 'free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary')}>
                                   {m.accessType === 'free' ? 'FREE HUB' : 'PASS+ ONLY'}
                                </Badge>
                             </td>
                             <td className="px-8 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button onClick={() => router.push(`/admin/mocks/${m.id}`)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5"><Edit3 size={14} /></Button>
                                   <Button onClick={() => handleAction(m.id, 'duplicate')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-500/10 text-blue-500"><Copy size={14} /></Button>
                                   
                                   {m.accessType === 'free' ? (
                                      <Button onClick={() => handleAction(m.id, 'lock')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"><Lock size={14} /></Button>
                                   ) : (
                                      <Button onClick={() => handleAction(m.id, 'unlock')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-emerald-500"><Unlock size={14} /></Button>
                                   )}

                                   {m.status === 'draft' ? (
                                     <Button onClick={() => handleAction(m.id, 'publish')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-emerald-500"><PlayCircle size={14} /></Button>
                                   ) : (
                                     <Button onClick={() => handleAction(m.id, 'unpublish')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-orange-500/10 text-orange-500"><Database size={14} /></Button>
                                   )}
                                   <Button onClick={() => handleAction(m.id, 'delete')} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></Button>
                                </div>
                             </td>
                          </tr>
                        ))
                        ) : (
                          <tr><td colSpan={5} className="py-20 text-center text-zinc-700 text-xs font-black uppercase tracking-widest">No Simulations Indexed</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
