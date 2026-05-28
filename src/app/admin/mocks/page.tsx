"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Plus, Zap, Loader2, Search, BookOpen, 
  Trash2, Edit3, PlayCircle, Lock, Unlock, 
  Database, BarChart3, RefreshCw, AlertCircle,
  MoreVertical, ShieldCheck, Crown, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  getAllMocks, 
  publishMock, 
  deleteMock, 
  updateMockAccess
} from "@/services/mocks";
import { MockTest, PassTier } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * PRODUCTION SIMULATION MANAGER v15.0
 * Features: Real-time CRUD action matrix, access tier calibration, deep-linking.
 */
export default function SimulationFactoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleAction = async (mockId: string, action: 'delete' | 'publish' | 'unpublish' | 'tier', value?: any) => {
    setProcessingId(`${mockId}-${action}`);
    try {
      if (action === 'delete') {
        await deleteMock(mockId);
        toast({ title: "Artifact Purged", description: "Simulation and linked questions removed." });
      } else if (action === 'publish') {
        await publishMock(mockId, true);
        toast({ title: "Signal Live", description: "Simulation is now visible to students." });
      } else if (action === 'unpublish') {
        await publishMock(mockId, false);
        toast({ title: "Signal Restricted", description: "Simulation moved to draft state." });
      } else if (action === 'tier') {
        await updateMockAccess(mockId, value);
        toast({ title: "Tier Synchronized", description: `Access set to ${value.toUpperCase()}` });
      }
      
      await loadMocks();
    } catch (e: any) {
      toast({ title: "Operation Failed", description: e.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
      setDeleteConfirmId(null);
    }
  };

  const filtered = mocks.filter(m => 
    m.title?.toLowerCase().includes(search.toLowerCase()) || 
    m.exam?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[
                 { label: "Atomic Bank", val: mocks.length, icon: Database, color: "text-blue-500", bg: "bg-blue-500/10" },
                 { label: "Live Signals", val: mocks.filter(m => m.status === 'published').length, icon: PlayCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                 { label: "Draft Buffer", val: mocks.filter(m => m.status === 'draft').length, icon: RefreshCw, color: "text-orange-500", bg: "bg-orange-500/10" },
                 { label: "Total Attempts", val: mocks.reduce((acc, m) => acc + (m.attemptCount || 0), 0), icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
               ].map((kpi, i) => (
                 <div key={i} className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 space-y-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bg, kpi.color)}>
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
                <h1 className="font-headline text-4xl font-black tracking-tighter uppercase leading-none">Simulation Manager</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-1">Enterprise Mock Lifecycle OS v15.0</p>
              </div>
              <Button onClick={() => router.push('/admin/ai-mock-studio')} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-[11px] uppercase tracking-widest blue-glow">
                 <Plus className="mr-2 w-4 h-4" /> Forge New Mock
              </Button>
            </header>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-950/40 p-4 rounded-[32px] border border-white/5">
                 <div className="relative w-full md:w-[450px]">
                    <Search className="absolute left-5 top-4 w-5 h-5 text-zinc-600" />
                    <Input 
                      placeholder="Audit artifacts by title or board..." 
                      className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl pl-14 font-bold text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <Button variant="ghost" size="sm" onClick={loadMocks} className="text-zinc-500 hover:text-white"><RefreshCw size={14} className="mr-2" /> Force Signal Sync</Button>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-zinc-900/60 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5">
                       <tr>
                          <th className="px-10 py-8">Simulation Identity</th>
                          <th className="px-10 py-8">Recruitment Board</th>
                          <th className="px-10 py-8 text-center">Artifact Payload</th>
                          <th className="px-10 py-8">Access Level</th>
                          <th className="px-10 py-8 text-right">Operational Matrix</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {loading ? (
                         [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-28" /></tr>)
                       ) : filtered.length > 0 ? (
                         filtered.map(m => (
                         <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-6">
                                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 relative shrink-0">
                                     <BookOpen className="text-zinc-500 w-6 h-6 group-hover:text-primary transition-colors" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="font-bold text-zinc-100 text-base mb-1 truncate">{m.title}</p>
                                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">UID: {m.id.substring(0,10)} • {new Date(m.createdAt).toLocaleDateString()}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase mb-2">{m.exam}</Badge>
                               <div className="flex gap-2">
                                  {m.status === 'published' ? (
                                    <Badge className="bg-emerald-600 text-white border-none text-[7px] font-black uppercase">LIVE</Badge>
                                  ) : (
                                    <Badge className="bg-zinc-800 text-zinc-500 border-none text-[7px] font-black uppercase">DRAFT</Badge>
                                  )}
                               </div>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <p className="text-base font-black text-white">{m.totalQuestions || 0} Artifacts</p>
                               <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">{m.attemptCount || 0} Sessions</p>
                            </td>
                            <td className="px-10 py-8">
                               <Select 
                                 defaultValue={m.accessType} 
                                 onValueChange={(val) => handleAction(m.id, 'tier', val)}
                               >
                                 <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl font-black text-[9px] uppercase px-4 w-36">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-950 text-white border-white/10">
                                   <SelectItem value="free" className="text-[10px] font-bold">FREE HUB</SelectItem>
                                   <SelectItem value="pass_plus" className="text-[10px] font-bold">PASS+ TIER</SelectItem>
                                   <SelectItem value="premium" className="text-[10px] font-bold">PREMIUM TIER</SelectItem>
                                   <SelectItem value="elite" className="text-[10px] font-bold">ELITE TIER</SelectItem>
                                 </SelectContent>
                               </Select>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <div className="flex justify-end gap-3">
                                  <Button 
                                    onClick={() => router.push(`/admin/mocks/${m.id}`)} 
                                    className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-[9px] uppercase tracking-widest shadow-lg"
                                  >
                                    <Edit3 size={12} className="mr-2" /> CALIBRATE
                                  </Button>
                                  
                                  {m.status === 'draft' ? (
                                    <Button 
                                      onClick={() => handleAction(m.id, 'publish')} 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-10 w-10 rounded-xl hover:bg-emerald-600/10 text-emerald-500" 
                                      disabled={processingId === `${m.id}-publish`}
                                    >
                                      {processingId === `${m.id}-publish` ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={18} />}
                                    </Button>
                                  ) : (
                                    <Button 
                                      onClick={() => handleAction(m.id, 'unpublish')} 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-10 w-10 rounded-xl hover:bg-orange-500/10 text-orange-500" 
                                      disabled={processingId === `${m.id}-unpublish`}
                                    >
                                      {processingId === `${m.id}-unpublish` ? <Loader2 size={16} className="animate-spin" /> : <Lock size={18} />}
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    onClick={() => setDeleteConfirmId(m.id)} 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-red-500"
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                               </div>
                            </td>
                         </tr>
                       ))
                       ) : (
                         <tr><td colSpan={5} className="py-40 text-center opacity-20">
                             <AlertCircle size={40} className="mx-auto mb-4" />
                             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Repository Empty</p>
                         </td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 text-white rounded-[40px] p-12 max-w-xl">
          <AlertDialogHeader className="space-y-6">
            <div className="w-20 h-20 rounded-[28px] bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
               <Trash2 className="text-red-500 w-10 h-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tighter text-center">PURGE SIMULATION?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-center text-lg">
              This will permanently erase the simulation identity and all linked artifacts. This operation is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 gap-4">
            <AlertDialogCancel className="h-16 rounded-2xl bg-zinc-900 border-white/5 text-white font-black text-xs uppercase tracking-widest flex-1">CANCEL</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirmId && handleAction(deleteConfirmId, 'delete')}
              className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 font-black text-xs uppercase tracking-widest flex-1"
            >
              CONFIRM PURGE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminProtect>
  );
}
