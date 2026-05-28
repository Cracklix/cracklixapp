"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, 
  Plus, 
  Zap, 
  Loader2, 
  Search, 
  MoreHorizontal,
  BookOpen,
  Database,
  CheckCircle2,
  Trash2,
  Edit3,
  Copy,
  Archive,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getAllMocks, 
  publishMock, 
  deleteMock, 
  duplicateMock, 
  getMockAnalytics,
  setMockLive
} from "@/services/mocks";
import { MockTest, MockStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MockRegistryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<MockStatus | "all">("published");
  const [mockStats, setMockStats] = useState<Record<string, any>>({});

  useEffect(() => {
    loadRegistry();
  }, []);

  async function loadRegistry() {
    setLoading(true);
    try {
      const data = await getAllMocks();
      setMocks(data);
      
      // Background load stats for each row to improve info density
      const statsMap: any = {};
      for (const m of data) {
        if (m.status !== 'draft') {
          const stats = await getMockAnalytics(m.id);
          statsMap[m.id] = stats;
        }
      }
      setMockStats(statsMap);
    } catch (e) {
      toast({ title: "Registry Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: string) {
    try {
      switch(action) {
        case 'publish':
          await publishMock(id);
          toast({ title: "Mock Published" });
          break;
        case 'live':
          await setMockLive(id, true);
          toast({ title: "Signal Live" });
          break;
        case 'stop-live':
          await setMockLive(id, false);
          toast({ title: "Live Stopped" });
          break;
        case 'duplicate':
          await duplicateMock(id);
          toast({ title: "Mock Cloned" });
          break;
        case 'delete':
          if (confirm('Permanently purge this artifact?')) {
            await deleteMock(id);
            toast({ title: "Mock Purged" });
          }
          break;
      }
      loadRegistry();
    } catch (e) {
      toast({ title: "Action Failed", variant: "destructive" });
    }
  }

  const filtered = mocks.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.exam.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || m.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl blue-glow">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Registry</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Central CMS for managing CBT simulations.</p>
              </div>
              <div className="flex gap-4">
                 <Button onClick={() => router.push('/admin/mocks/new')} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest blue-glow">
                    <Plus className="w-4 h-4 mr-2" /> Initialize New Mock
                 </Button>
              </div>
            </header>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
               <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="w-full md:w-auto">
                  <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14 w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
                     <TabsTrigger value="all" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">All</TabsTrigger>
                     <TabsTrigger value="draft" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">Drafts</TabsTrigger>
                     <TabsTrigger value="published" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">Published</TabsTrigger>
                     <TabsTrigger value="live" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">Live Arena</TabsTrigger>
                  </TabsList>
               </Tabs>

               <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search by identity..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 h-12 bg-zinc-900 border-white/5 rounded-2xl text-[10px] uppercase font-black tracking-widest"
                  />
               </div>
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                     <thead className="bg-zinc-900/60 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5">
                        <tr>
                           <th className="px-8 py-6">Mock Identity</th>
                           <th className="px-8 py-6">Board</th>
                           <th className="px-8 py-6">Payload</th>
                           <th className="px-8 py-6">Status</th>
                           <th className="px-8 py-6">Attempts</th>
                           <th className="px-8 py-6">Accuracy</th>
                           <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-sm">
                        {loading ? (
                          [1,2,3,4].map(i => (
                            <tr key={i} className="animate-pulse">
                               <td colSpan={7} className="px-8 py-10" />
                            </tr>
                          ))
                        ) : filtered.length > 0 ? filtered.map((m) => (
                           <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-8 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                                       <BookOpen size={18} className="text-zinc-600 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                       <p className="font-bold text-white group-hover:text-primary transition-colors">{m.title}</p>
                                       <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 tracking-widest">ID: {m.id.substring(0, 8)}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-8">
                                 <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">{m.exam}</Badge>
                              </td>
                              <td className="px-8 py-8 text-[11px] font-bold text-zinc-400">
                                 {m.totalQuestions} Qs • {m.duration}m
                              </td>
                              <td className="px-8 py-8">
                                 <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", m.status === 'live' ? "bg-red-500 animate-pulse" : m.status === 'published' ? "bg-emerald-500" : "bg-zinc-600")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{m.status}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-8 font-black text-white">
                                 {mockStats[m.id]?.totalAttempts || 0}
                              </td>
                              <td className="px-8 py-8">
                                 <span className="font-black text-zinc-300">{mockStats[m.id]?.avgAccuracy || 0}%</span>
                              </td>
                              <td className="px-8 py-8 text-right">
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                                          <MoreHorizontal size={18} className="text-zinc-600" />
                                       </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white rounded-2xl w-56 p-2 shadow-2xl" align="end">
                                       <DropdownMenuLabel className="px-4 py-2 text-[9px] uppercase font-black text-zinc-500 tracking-widest">Orchestration</DropdownMenuLabel>
                                       <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold" onClick={() => router.push(`/admin/mocks/${m.id}`)}>
                                          <Edit3 className="w-3.5 h-3.5 mr-2.5 text-primary" /> Open Editor Dashboard
                                       </DropdownMenuItem>
                                       <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold" onClick={() => handleAction(m.id, 'duplicate')}>
                                          <Copy className="w-3.5 h-3.5 mr-2.5 text-zinc-500" /> Clone Simulation
                                       </DropdownMenuItem>
                                       
                                       <DropdownMenuSeparator className="bg-white/5" />

                                       {m.status === 'draft' && (
                                          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-emerald-500 focus:text-emerald-500" onClick={() => handleAction(m.id, 'publish')}>
                                             <CheckCircle2 className="w-3.5 h-3.5 mr-2.5" /> Push to Production
                                          </DropdownMenuItem>
                                       )}

                                       {m.status === 'published' && (
                                          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-red-500 focus:text-red-500" onClick={() => handleAction(m.id, 'live')}>
                                             <PlayCircle className="w-3.5 h-3.5 mr-2.5" /> Mark Live Event
                                          </DropdownMenuItem>
                                       )}

                                       {m.status === 'live' && (
                                          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-orange-500 focus:text-orange-500" onClick={() => handleAction(m.id, 'stop-live')}>
                                             <Zap className="w-3.5 h-3.5 mr-2.5" /> Stop Live Stream
                                          </DropdownMenuItem>
                                       )}

                                       <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-zinc-600" onClick={() => handleAction(m.id, 'archive')}>
                                          <Archive className="w-3.5 h-3.5 mr-2.5" /> Move to Archive
                                       </DropdownMenuItem>

                                       <DropdownMenuSeparator className="bg-white/5" />
                                       <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-red-600 focus:text-red-600" onClick={() => handleAction(m.id, 'delete')}>
                                          <Trash2 className="w-3.5 h-3.5 mr-2.5" /> Hard Purge Artifact
                                       </DropdownMenuItem>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={7} className="px-8 py-32 text-center text-zinc-700 italic font-medium uppercase tracking-[0.2em] text-xs">
                                 No simulations indexed in this sector.
                              </td>
                           </tr>
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
