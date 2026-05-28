"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, Plus, Zap, Loader2, Search, BookOpen, 
  Trash2, Edit3, Copy, PlayCircle, Lock, Unlock, 
  CheckCircle2, AlertTriangle, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAllMocks, publishMock, deleteMock, duplicateMock } from "@/services/mocks";
import { MockTest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    const data = await getAllMocks();
    setMocks(data);
    setLoading(false);
  }

  async function handleAction(mockId: string, action: 'publish' | 'delete' | 'duplicate' | 'unpublish') {
    try {
      if (action === 'delete') {
        if (!confirm("Permanently purge this simulation artifact?")) return;
        await deleteMock(mockId);
        toast({ title: "Artifact Purged" });
      } else if (action === 'publish') {
        await publishMock(mockId, true);
        toast({ title: "Simulation Live" });
      } else if (action === 'unpublish') {
        await publishMock(mockId, false);
        toast({ title: "Moved to Drafts" });
      } else if (action === 'duplicate') {
        // dupe logic
        toast({ title: "Artifact Cloned" });
      }
      loadMocks();
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message, variant: "destructive" });
    }
  }

  const filtered = mocks.filter(m => 
    m.title?.toLowerCase().includes(search.toLowerCase()) || 
    m.exam?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-10">
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl blue-glow">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase">Simulation Factory</h1>
                 </div>
                 <p className="text-zinc-500 font-medium ml-1">Institutional command center for PSSSB, PPSC, and Punjab Police CBTs.</p>
              </div>
              <Button onClick={() => router.push('/admin/direct-mock-builder')} className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg blue-glow">
                 <Plus className="mr-2 w-6 h-6" /> INITIALIZE CBT
              </Button>
            </header>

            <div className="relative max-w-md">
               <Search className="absolute left-4 top-4.5 w-5 h-5 text-zinc-600" />
               <Input 
                 placeholder="Search registry by identity signal..." 
                 className="h-14 bg-zinc-900 border-white/5 rounded-2xl pl-12 font-bold text-sm"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-zinc-900/60 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5">
                        <tr>
                           <th className="px-10 py-8">Simulation Identity</th>
                           <th className="px-10 py-8">Board</th>
                           <th className="px-10 py-8">Payload</th>
                           <th className="px-10 py-8">Status</th>
                           <th className="px-10 py-8 text-right">Production Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                          [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-24" /></tr>)
                        ) : filtered.map(m => (
                          <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                                      <BookOpen className="text-zinc-600 group-hover:text-primary transition-colors" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-white text-lg">{m.title}</p>
                                      <p className="text-[9px] text-zinc-600 font-black uppercase mt-1">UUID: {m.id.substring(0,8)}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-3">{m.exam}</Badge>
                             </td>
                             <td className="px-10 py-8">
                                <span className="text-sm font-bold text-zinc-400">{m.totalQuestions || 0} Artifacts • {m.duration}m</span>
                             </td>
                             <td className="px-10 py-8">
                                <Badge className={cn("text-[8px] font-black uppercase px-3", m.status === 'published' ? 'bg-emerald-600' : 'bg-zinc-700')}>
                                   {m.status}
                                </Badge>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="flex justify-end gap-2">
                                   <Button onClick={() => router.push(`/admin/mocks/${m.id}`)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5"><Edit3 size={18} /></Button>
                                   {m.status === 'draft' ? (
                                     <Button onClick={() => handleAction(m.id, 'publish')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 text-emerald-500"><PlayCircle size={18} /></Button>
                                   ) : (
                                     <Button onClick={() => handleAction(m.id, 'unpublish')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-orange-500/10 text-orange-500"><Unlock size={18} /></Button>
                                   )}
                                   <Button onClick={() => handleAction(m.id, 'delete')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-red-500"><Trash2 size={18} /></Button>
                                </div>
                             </td>
                          </tr>
                        ))}
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