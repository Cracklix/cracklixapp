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
  BookOpen,
  CheckCircle2,
  Trash2,
  Edit3,
  Copy,
  PlayCircle,
  BrainCircuit,
  Layers,
  FileText,
  LayoutGrid,
  Lock,
  Unlock,
  Eye,
  BarChart3,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getAllMocks, 
  publishMock, 
  deleteMock, 
  duplicateMock, 
  getMockAnalytics,
  setMockLive,
  updateMock
} from "@/services/mocks";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAIMock } from "@/services/ai-mock-generator";

/**
 * PRODUCTION SIMULATION FACTORY & REGISTRY
 * Rebuilt for end-to-end institutional mock management.
 */
export default function SimulationFactoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<MockStatus | "all">("all");
  const [mockStats, setMockStats] = useState<Record<string, any>>({});
  
  // Creation States
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createMode, setCreateMode] = useState<'manual' | 'ai' | 'sectional' | 'chapter' | 'quiz'>('manual');
  const [formData, setFormData] = useState({
    title: "",
    exam: "PSSSB",
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
      
      // Load quick metrics for the table
      const statsMap: any = {};
      for (const m of data) {
        if (m.status !== 'draft') {
          try {
            const stats = await getMockAnalytics(m.id);
            statsMap[m.id] = stats;
          } catch (e) {
            statsMap[m.id] = { totalAttempts: 0 };
          }
        }
      }
      setMockStats(statsMap);
    } catch (e: any) {
      toast({ title: "Registry Error", description: e.message || "Failed to fetch simulation index.", variant: "destructive" });
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
        toast({ title: "Simulation Initialized", description: "Draft record created successfully." });
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

  async function handleAction(mockId: string, action: string) {
    try {
      switch(action) {
        case 'publish':
          await publishMock(mockId);
          toast({ title: "Signal Propagated", description: "Mock is now visible to student dashboard." });
          break;
        case 'live':
          setMockLive(mockId, true);
          toast({ title: "Promoted to Live", description: "Simulation is now in active Arena state." });
          break;
        case 'duplicate':
          const newMock = await duplicateMock(mockId);
          toast({ title: "Artifact Cloned", description: "Created a new draft from source template." });
          if (newMock) router.push(`/admin/mocks/${newMock.id}`);
          break;
        case 'toggle_access':
          const currentMock = mocks.find(m => m.id === mockId);
          if (!currentMock) return;
          const nextAccess = currentMock.accessType === 'free' ? 'pass_plus' : 'free';
          updateMock(mockId, { accessType: nextAccess });
          toast({ title: "Policy Updated", description: `Simulation access is now ${nextAccess.toUpperCase()}.` });
          break;
        case 'delete':
          if (confirm('Permanently purge this simulation artifact from the registry?')) {
            deleteMock(mockId);
            setMocks(prev => prev.filter(m => m.id !== mockId));
            toast({ title: "Artifact Purged", description: "Record removed from local state and cloud." });
          }
          break;
      }
      // Reload registry after a short delay for background sync
      setTimeout(loadRegistry, 500);
    } catch (e: any) {
      toast({ title: "Action Protocol Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  }

  const filtered = mocks.filter(m => {
    const matchesSearch = (m.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
                          (m.exam?.toLowerCase() || "").includes(search.toLowerCase());
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
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl blue-glow">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Simulation Factory</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Universal Command Center for PSSSB, PPSC, and National CBT environments.</p>
              </div>
            </header>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {[
                 { mode: 'manual', label: 'Full Mock', icon: LayoutGrid, color: 'bg-blue-600' },
                 { mode: 'sectional', label: 'Sectional', icon: Layers, color: 'bg-emerald-600' },
                 { mode: 'quiz', label: 'Quick Quiz', icon: Zap, color: 'bg-orange-600' },
                 { mode: 'ai', label: 'AI Synthesis', icon: BrainCircuit, color: 'bg-primary' },
                 { mode: 'direct', label: 'Direct Inject', icon: FileText, color: 'bg-zinc-800' },
               ].map((btn) => (
                 <button 
                   key={btn.mode}
                   onClick={() => {
                     if (btn.mode === 'direct') router.push('/admin/direct-mock-builder');
                     else { setCreateMode(btn.mode as any); setShowCreateDialog(true); }
                   }}
                   className="h-24 rounded-[28px] bg-zinc-900 border border-white/5 hover:border-primary/20 flex flex-col items-center justify-center gap-2 group transition-all"
                 >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", btn.color)}>
                       <btn.icon size={16} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{btn.label}</span>
                 </button>
               ))}
            </div>

            {/* Registry Filter Terminal */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
               <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="w-full md:w-auto">
                  <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14">
                     <TabsTrigger value="all" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">All Artifacts</TabsTrigger>
                     <TabsTrigger value="draft" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">Drafts</TabsTrigger>
                     <TabsTrigger value="published" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">Production</TabsTrigger>
                     <TabsTrigger value="live" className="rounded-xl px-6 h-full font-bold text-[10px] uppercase">Live Arena</TabsTrigger>
                  </TabsList>
               </Tabs>

               <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                  <Input 
                    placeholder="Search registry identities..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 h-14 bg-zinc-900 border-white/5 rounded-2xl text-[10px] uppercase font-black"
                  />
               </div>
            </div>

            {/* Institutional Registry Table */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-zinc-900/60 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5">
                        <tr>
                           <th className="px-8 py-6">Mock Identity</th>
                           <th className="px-8 py-6">Recruitment Board</th>
                           <th className="px-8 py-6">Access Protocol</th>
                           <th className="px-8 py-6">Payload</th>
                           <th className="px-8 py-6">Registry Status</th>
                           <th className="px-8 py-6">Engagements</th>
                           <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                          [1,2,3,4].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="h-20" /></tr>)
                        ) : filtered.length > 0 ? filtered.map((m) => (
                           <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-8 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5">
                                       <BookOpen size={18} className="text-zinc-600 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                       <p className="font-bold text-white text-sm">{m.title}</p>
                                       <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">UUID: {m.id.substring(0,8)}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-8">
                                 <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-3">{m.exam}</Badge>
                              </td>
                              <td className="px-8 py-8">
                                 {m.accessType === 'free' ? (
                                   <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase px-3">Free Hub</Badge>
                                 ) : (
                                   <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-3">PASS+ Required</Badge>
                                 )}
                              </td>
                              <td className="px-8 py-8">
                                 <span className="text-[11px] font-bold text-zinc-400">{m.totalQuestions || 0} Artifacts • {m.duration}m</span>
                              </td>
                              <td className="px-8 py-8">
                                 <Badge className={cn(
                                   "text-[8px] font-black uppercase border-none px-3",
                                   m.status === 'live' ? "bg-red-600 animate-pulse" : m.status === 'published' ? "bg-emerald-600" : "bg-zinc-700"
                                 )}>
                                    {m.status}
                                 </Badge>
                              </td>
                              <td className="px-8 py-8 font-black text-white text-sm">
                                 {mockStats[m.id]?.totalAttempts || 0}
                              </td>
                              <td className="px-8 py-8 text-right">
                                 <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5" onClick={() => router.push(`/admin/mocks/${m.id}`)}>
                                       <Edit3 size={16} className="text-zinc-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5" onClick={() => handleAction(m.id, 'toggle_access')}>
                                       {m.accessType === 'free' ? <Lock size={16} className="text-amber-500" /> : <Unlock size={16} className="text-emerald-500" />}
                                    </Button>
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5">
                                             <MoreVertical size={16} className="text-zinc-500" />
                                          </Button>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white rounded-2xl w-56 p-2 shadow-2xl" align="end">
                                          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold" onClick={() => router.push(`/admin/mocks/${m.id}`)}>
                                             <Eye className="w-3.5 h-3.5 mr-2.5 text-primary" /> Preview CBT Stage
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold" onClick={() => handleAction(m.id, 'duplicate')}>
                                             <Copy className="w-3.5 h-3.5 mr-2.5 text-zinc-500" /> Clone Artifact
                                          </DropdownMenuItem>
                                          
                                          <DropdownMenuSeparator className="bg-white/5" />
                                          <DropdownMenuLabel className="px-2 py-1 text-[8px] uppercase font-black text-zinc-600">Operations Control</DropdownMenuLabel>
                                          
                                          {m.status === 'draft' && (
                                             <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-emerald-500" onClick={() => handleAction(m.id, 'publish')}>
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-2.5" /> Commit to Production
                                             </DropdownMenuItem>
                                          )}
                                          {m.status === 'published' && (
                                             <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-red-500" onClick={() => handleAction(m.id, 'live')}>
                                                <PlayCircle className="w-3.5 h-3.5 mr-2.5" /> Initialize Live Arena
                                             </DropdownMenuItem>
                                          )}
                                          
                                          <DropdownMenuSeparator className="bg-white/5" />
                                          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-xs font-bold text-red-600 focus:bg-red-600/10 focus:text-red-600" onClick={() => handleAction(m.id, 'delete')}>
                                             <Trash2 className="w-3.5 h-3.5 mr-2.5" /> Purge from Registry
                                          </DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </div>
                              </td>
                           </tr>
                        )) : (
                           <tr><td colSpan={7} className="px-8 py-32 text-center text-zinc-700 italic font-bold uppercase text-xs">Awaiting Simulation Ingress.</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>

          {/* Institutional Creation Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="bg-zinc-950 border-white/10 rounded-[40px] p-10 text-white max-w-2xl">
               <DialogHeader className="mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                        {createMode === 'ai' ? <BrainCircuit className="text-white" /> : <Rocket className="text-white" />}
                     </div>
                     <div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                           {createMode === 'ai' ? 'AI Smart Synthesis' : 'Initialize CBT Arena'}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Configure structural metadata for next recruitment cycle.</DialogDescription>
                     </div>
                  </div>
               </DialogHeader>

               <div className="space-y-8">
                  {createMode !== 'ai' && (
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Registry Identity</label>
                       <Input 
                         placeholder="e.g. Punjab Police SI Full Mock #12 (2024 Cycle)" 
                         value={formData.title}
                         onChange={e => setFormData({...formData, title: e.target.value})}
                         className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold px-6"
                       />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Recruitment Board</label>
                        <Select value={formData.exam} onValueChange={v => setFormData({...formData, exam: v})}>
                           <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              <SelectItem value="PSSSB">PSSSB (Clerk/Patwari)</SelectItem>
                              <SelectItem value="Punjab Police">Punjab Police (SI/Constable)</SelectItem>
                              <SelectItem value="PPSC">PPSC (PCS/Admin)</SelectItem>
                              <SelectItem value="CTET">Central Teaching (CTET)</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Initial Access Policy</label>
                        <Select value={formData.accessType} onValueChange={v => setFormData({...formData, accessType: v})}>
                           <SelectTrigger className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              <SelectItem value="pass_plus">PASS+ Active Lock</SelectItem>
                              <SelectItem value="free">Universal Free Hub</SelectItem>
                              <SelectItem value="premium">Elite Premium Port</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Duration Allocation (Mins)</label>
                        <Input 
                          type="number" 
                          value={formData.duration}
                          onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                          className="h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold px-6"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Negative Penalty Logic</label>
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
                    className="w-full h-20 rounded-3xl bg-primary hover:bg-primary/90 text-xl font-black blue-glow shadow-2xl transition-transform active:scale-95"
                  >
                     {creating ? <Loader2 className="animate-spin mr-3" /> : <PlayCircle className="mr-3" />}
                     {createMode === 'ai' ? 'FORGE SMART SIMULATION' : 'INITIALIZE REGISTRY RECORD'}
                  </Button>
               </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AdminProtect>
  );
}
