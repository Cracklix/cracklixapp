
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
  PlayCircle,
  BrainCircuit,
  Layers,
  FileText,
  LayoutGrid,
  Filter,
  BarChart3,
  ChevronRight,
  ShieldCheck
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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MockTest, MockStatus, SUBJECTS } from "@/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAIMock } from "@/services/ai-mock-generator";

/**
 * PRODUCTION SIMULATION FACTORY & REGISTRY
 * Rebuilt for multi-modal generation and real-time management.
 */
export default function SimulationFactoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<MockStatus | "all">("published");
  const [mockStats, setMockStats] = useState<Record<string, any>>({});
  
  // Creation States
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createMode, setCreateMode] = useState<'manual' | 'ai' | 'sectional' | 'chapter' | 'quiz'>('manual');
  const [formData, setFormData] = useState({
    title: "",
    exam: "Punjab Police SI",
    duration: 100,
    negativeMarking: 0.25,
    accessType: 'pass_plus' as any,
    subject: "Punjab GK",
    count: 100
  });

  useEffect(() => {
    loadRegistry();
  }, []);

  async function loadRegistry() {
    setLoading(true);
    try {
      const data = await getAllMocks();
      setMocks(data);
      
      // Load performance stats asynchronously
      const statsMap: any = {};
      for (const m of data) {
        if (m.status !== 'draft') {
          const stats = await getMockAnalytics(m.id);
          statsMap[m.id] = stats;
        }
      }
      setMockStats(statsMap);
    } catch (e) {
      toast({ title: "Registry Error", description: "Failed to fetch simulation index.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMock() {
    if (!formData.title && createMode !== 'ai') {
      toast({ title: "Identity Required", description: "Please provide a title for the simulation." });
      return;
    }

    setCreating(true);
    try {
      let mockId = "";
      
      if (createMode === 'ai') {
        const result = await generateAIMock({ 
          exam: formData.exam, 
          totalQuestions: formData.count 
        });
        mockId = result.mockId;
        toast({ title: "AI Synthesis Complete", description: `Successfully forged ${result.questions.length} questions.` });
      } else {
        const payload = {
          title: formData.title,
          exam: formData.exam,
          duration: Number(formData.duration),
          negativeMarking: Number(formData.negativeMarking),
          accessType: formData.accessType,
          status: 'draft',
          totalQuestions: 0,
          questionIds: [],
          type: createMode === 'sectional' ? 'sectional' : createMode === 'quiz' ? 'chapter' : 'full',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const docRef = await addDoc(collection(db, "mocks"), payload);
        mockId = docRef.id;
        toast({ title: "Simulation Template Initialized", description: "Artifact saved to Drafts." });
      }

      setShowCreateDialog(false);
      loadRegistry();
      router.push(`/admin/mocks/${mockId}`);
    } catch (e: any) {
      toast({ title: "Creation Failed", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function handleAction(id: string, action: string) {
    try {
      switch(action) {
        case 'publish':
          await publishMock(id);
          toast({ title: "Signal Published", description: "Simulation is now live for students." });
          break;
        case 'live':
          await setMockLive(id, true);
          toast({ title: "Arena Signal: LIVE", description: "Mock promoted to High-Priority Live Event." });
          break;
        case 'stop-live':
          await setMockLive(id, false);
          toast({ title: "Live Signal Terminated" });
          break;
        case 'duplicate':
          await duplicateMock(id);
          toast({ title: "Simulation Cloned", description: "Created a new draft artifact from source." });
          break;
        case 'delete':
          if (confirm('Permanently purge this artifact from the repository?')) {
            await deleteMock(id);
            toast({ title: "Registry Purged" });
          }
          break;
      }
      loadRegistry();
    } catch (e) {
      toast({ title: "Action Failure", description: "Infrastructure synchronization error.", variant: "destructive" });
    }
  }

  const filtered = mocks.filter(m => {
    const matchesSearch = m.title?.toLowerCase().includes(search.toLowerCase()) || 
                          m.exam?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || m.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl blue-glow">
                      <Rocket className="text-white w-7 h-7" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Simulation Factory</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Central management for PSSSB and PPSC CBT environments.</p>
              </div>
            </header>

            {/* Factory Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
               {[
                 { mode: 'manual', label: 'Full Mock', icon: LayoutGrid, color: 'bg-blue-600' },
                 { mode: 'sectional', label: 'Sectional', icon: Layers, color: 'bg-emerald-600' },
                 { mode: 'quiz', label: 'Quick Quiz', icon: Zap, color: 'bg-orange-600' },
                 { mode: 'ai', label: 'AI Generate', icon: BrainCircuit, color: 'bg-primary' },
                 { mode: 'direct', label: 'Direct Inject', icon: FileText, color: 'bg-zinc-800' },
               ].map((btn) => (
                 <Button 
                   key={btn.mode}
                   onClick={() => {
                     if (btn.mode === 'direct') router.push('/admin/direct-mock-builder');
                     else { setCreateMode(btn.mode as any); setShowCreateDialog(true); }
                   }}
                   className="h-24 rounded-[28px] bg-zinc-900 border border-white/5 hover:border-white/20 flex flex-col items-center justify-center gap-2 group transition-all"
                 >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", btn.color)}>
                       <btn.icon size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{btn.label}</span>
                 </Button>
               ))}
            </div>

            {/* Registry Filters */}
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
                    placeholder="Search by identity signal..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 h-12 bg-zinc-900 border-white/5 rounded-2xl text-[10px] uppercase font-black tracking-widest"
                  />
               </div>
            </div>

            {/* Registry Table */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                     <thead className="bg-zinc-900/60 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5">
                        <tr>
                           <th className="px-8 py-6">Simulation Name</th>
                           <th className="px-8 py-6">Board</th>
                           <th className="px-8 py-6">Payload</th>
                           <th className="px-8 py-6">Access</th>
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
                                       <div className="flex items-center gap-2 mt-1">
                                          <div className={cn("w-1 h-1 rounded-full", m.status === 'live' ? "bg-red-500 animate-pulse" : m.status === 'published' ? "bg-emerald-500" : "bg-zinc-600")} />
                                          <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{m.status}</span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-8">
                                 <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">{m.exam}</Badge>
                              </td>
                              <td className="px-8 py-8 text-[11px] font-bold text-zinc-400">
                                 {m.totalQuestions || 0} Qs • {m.duration}m
                              </td>
                              <td className="px-8 py-8">
                                 <Badge className={cn("text-[8px] font-black uppercase border-none", m.accessType === 'free' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                                    {m.accessType}
                                 </Badge>
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
                                             <Zap className="w-3.5 h-3.5 mr-2.5" /> Stop Live Arena
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

          {/* Creation Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="bg-zinc-950 border-white/10 rounded-[40px] p-8 md:p-12 text-white max-w-2xl">
               <DialogHeader className="mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                        {createMode === 'ai' ? <BrainCircuit /> : <Rocket />}
                     </div>
                     <div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                           {createMode === 'ai' ? 'AI Synthesis' : createMode === 'sectional' ? 'Sectional Init' : 'Mock Initialization'}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Configure generation parameters</DialogDescription>
                     </div>
                  </div>
               </DialogHeader>

               <div className="space-y-8">
                  {createMode !== 'ai' && (
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Simulation Title</label>
                       <Input 
                         placeholder="e.g. Punjab Police SI Full Test #42" 
                         value={formData.title}
                         onChange={e => setFormData({...formData, title: e.target.value})}
                         className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold px-6"
                       />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Exam Board</label>
                        <Select value={formData.exam} onValueChange={v => setFormData({...formData, exam: v})}>
                           <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              <SelectItem value="Punjab Police SI">Punjab Police SI</SelectItem>
                              <SelectItem value="PSSSB Clerk">PSSSB Clerk</SelectItem>
                              <SelectItem value="PPSC PCS">PPSC PCS</SelectItem>
                              <SelectItem value="Patwari">Patwari</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Access Policy</label>
                        <Select value={formData.accessType} onValueChange={v => setFormData({...formData, accessType: v})}>
                           <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              <SelectItem value="pass_plus">PASS+ Active</SelectItem>
                              <SelectItem value="free">Free Hub</SelectItem>
                              <SelectItem value="premium">Elite Premium</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  {createMode === 'ai' && (
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Question Volume</label>
                          <Input 
                            type="number" 
                            value={formData.count}
                            onChange={e => setFormData({...formData, count: Number(e.target.value)})}
                            className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-black text-xl px-6"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Pattern Match</label>
                          <div className="h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-2">
                             <CheckCircle2 size={14} className="text-emerald-500" />
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">PYQ Weighted</span>
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Duration (Mins)</label>
                        <Input 
                          type="number" 
                          value={formData.duration}
                          onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                          className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold px-6"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Neg. Marking</label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={formData.negativeMarking}
                          onChange={e => setFormData({...formData, negativeMarking: Number(e.target.value)})}
                          className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold px-6 text-red-500"
                        />
                     </div>
                  </div>
               </div>

               <DialogFooter className="mt-12 flex flex-col gap-4">
                  <Button 
                    onClick={handleCreateMock} 
                    disabled={creating}
                    className="w-full h-18 rounded-3xl bg-primary hover:bg-primary/90 text-xl font-black blue-glow shadow-2xl transition-transform active:scale-95"
                  >
                     {creating ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-3" />}
                     {createMode === 'ai' ? 'SYNTHESIZE MOCK' : 'INITIALIZE SIMULATION'}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="w-full text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Discard Setup</Button>
               </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AdminProtect>
  );
}
