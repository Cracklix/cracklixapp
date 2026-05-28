"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Plus, Zap, Loader2, Search, BookOpen, 
  Trash2, Edit3, PlayCircle, Lock, 
  Database, RefreshCw,
  LayoutGrid, XCircle, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  getAllMocks, 
  updateMock, 
  deleteMock,
  cloneMock
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * PRODUCTION MOCK REGISTRY v30.0 (Institutional Standard)
 */
export default function MockDashboardPage() {
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

  const handleAction = async (mockId: string, action: 'delete' | 'publish' | 'tier' | 'clone', value?: any) => {
    try {
      if (action === 'delete') {
        if (!confirm("Confirm complete purging of this simulation?")) return;
        await deleteMock(mockId);
        toast({ title: "Mock Purged" });
      } else if (action === 'publish') {
        const status = value ? 'published' : 'draft';
        await updateMock(mockId, { status });
        toast({ title: `Mock ${status.toUpperCase()}` });
      } else if (action === 'tier') {
        await updateMock(mockId, { accessType: value });
        toast({ title: "Tier Updated" });
      } else if (action === 'clone') {
        const newId = await cloneMock(mockId);
        toast({ title: "Simulation Cloned" });
        router.push(`/admin/mocks/${newId}`);
      }
      await loadMocks();
    } catch (e: any) {
      toast({ title: "Operation Failed", description: e.message, variant: "destructive" });
    }
  };

  const filtered = mocks.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.exam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-10">
            
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div className="space-y-1">
                <h1 className="font-headline text-4xl font-black tracking-tighter uppercase leading-none">Simulation Registry</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-1">Testbook-Style Lifecycle Management</p>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" onClick={loadMocks} className="h-14 rounded-2xl border-white/10 hover:bg-white/5 px-6">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                 </Button>
                 <Button onClick={() => router.push('/admin/mock-generator')} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-[11px] uppercase tracking-widest blue-glow">
                    <Plus className="mr-2 w-4 h-4" /> Create Mock
                 </Button>
              </div>
            </header>

            <div className="bg-zinc-950/40 p-4 rounded-[32px] border border-white/5 flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-4 w-5 h-5 text-zinc-600" />
                <Input 
                  placeholder="Scan by title or board..." 
                  className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl pl-14 font-bold text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] overflow-hidden">
               <Table>
                 <TableHeader className="bg-zinc-900/60 border-b border-white/5">
                   <TableRow className="hover:bg-transparent border-none">
                     <TableHead className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Simulation Signal</TableHead>
                     <TableHead className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center">Artifacts</TableHead>
                     <TableHead className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Tier</TableHead>
                     <TableHead className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Status</TableHead>
                     <TableHead className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filtered.map(m => (
                     <TableRow key={m.id} className="hover:bg-white/[0.01] border-b border-white/5 transition-colors group">
                       <TableCell className="px-10 py-8">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 shrink-0 group-hover:border-primary/40 transition-colors">
                                <BookOpen className="text-zinc-600 group-hover:text-primary transition-colors" size={20} />
                             </div>
                             <div>
                                <p className="font-bold text-lg text-zinc-100 mb-0.5 line-clamp-1">{m.title}</p>
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{m.exam} • {m.category}</p>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell className="px-10 py-8 text-center">
                          <p className="text-base font-black text-white">{m.totalQuestions || 0}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase">{m.attemptCount || 0} Attempts</p>
                       </TableCell>
                       <TableCell className="px-10 py-8">
                          <Select defaultValue={m.accessType} onValueChange={(val) => handleAction(m.id, 'tier', val)}>
                             <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl font-black text-[9px] uppercase px-4 w-36">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="bg-zinc-950 text-white border-white/10">
                                <SelectItem value="free">FREE HUB</SelectItem>
                                <SelectItem value="pass_plus">PASS+ TIER</SelectItem>
                                <SelectItem value="premium">PREMIUM TIER</SelectItem>
                                <SelectItem value="elite">ELITE TIER</SelectItem>
                             </SelectContent>
                          </Select>
                       </TableCell>
                       <TableCell className="px-10 py-8">
                          <Badge className={cn(
                            "px-3 py-1 text-[8px] font-black uppercase border-none rounded-lg",
                            m.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                          )}>
                             {m.status}
                          </Badge>
                       </TableCell>
                       <TableCell className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-3">
                             <Button onClick={() => router.push(`/admin/mocks/${m.id}`)} className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-[9px] uppercase tracking-widest shadow-lg">
                                <Edit3 size={14} className="mr-2" /> OPEN
                             </Button>
                             <Button onClick={() => handleAction(m.id, 'clone')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" title="Clone Mock"><Copy size={18} className="text-zinc-400" /></Button>
                             <Button onClick={() => handleAction(m.id, 'publish', m.status === 'draft')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">{m.status === 'draft' ? <PlayCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-orange-500" />}</Button>
                             <Button onClick={() => handleAction(m.id, 'delete')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-red-500"><Trash2 size={18} /></Button>
                          </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
