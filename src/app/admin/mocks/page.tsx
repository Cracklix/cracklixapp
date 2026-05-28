"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, 
  Sparkles, 
  Plus, 
  Zap, 
  Loader2, 
  Settings, 
  Layers, 
  ClipboardCheck,
  ChevronRight,
  Database,
  Trash2,
  CheckCircle2,
  Filter,
  Search,
  LayoutGrid,
  History,
  FileText,
  Clock,
  ExternalLink,
  MoreVertical,
  BookOpen,
  Target,
  ListPlus,
  XCircle,
  BarChart3,
  Calendar,
  Archive,
  PlayCircle,
  Edit3,
  Copy,
  Eye,
  Settings2,
  AlertTriangle,
  RotateCcw,
  Check,
  Languages,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS, Subject, Question, MockTest, MockStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, query, where, getDocs, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  generateAutoMock, 
  getAllMocks, 
  publishMock, 
  deleteMock, 
  updateMock, 
  duplicateMock,
  getMockAnalytics 
} from "@/services/mocks";
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

export default function MockFactoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  
  // Creation Form State
  const [title, setTitle] = useState("");
  const [exam, setExam] = useState("Punjab Police SI");
  const [duration, setDuration] = useState(120);
  const [penalty, setPenalty] = useState(0.25);
  const [isPremium, setIsPremium] = useState(true);
  const [difficulty, setDifficulty] = useState("mixed");
  const [qCount, setQCount] = useState(100);

  // Manual Picker State
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [manualSubject, setManualSubject] = useState("All");
  const [manualSearch, setManualSearch] = useState("");
  const [usageFilter, setUsageFilter] = useState("Unused");

  // Registry State
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [registrySearch, setRegistrySearch] = useState("");
  const [activeRegistryTab, setActiveRegistryTab] = useState<MockStatus>("published");
  const [mockStats, setMockStats] = useState<Record<string, any>>({});

  // Editor Modal State
  const [editingMock, setEditingMock] = useState<MockTest | null>(null);

  useEffect(() => {
    loadRegistry();
    loadBankForPicker();
  }, []);

  async function loadBankForPicker() {
    setBankLoading(true);
    try {
      let q = query(collection(db, "questions"), where("status", "==", "published"), limit(1000));
      const snap = await getDocs(q);
      setBankQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
    } catch (e) {
      console.error(e);
    } finally {
      setBankLoading(false);
    }
  }

  async function loadRegistry() {
    setRegistryLoading(true);
    try {
      const data = await getAllMocks();
      setMocks(data);
      
      const statsMap: any = {};
      for (const m of data) {
        if (m.status === 'published' || m.status === 'live') {
          const stats = await getMockAnalytics(m.id);
          statsMap[m.id] = stats;
        }
      }
      setMockStats(statsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setRegistryLoading(false);
    }
  }

  async function handleManualMock() {
    if (!title || !exam) {
      toast({ title: "Validation Error", description: "Identity and target exam are mandatory." });
      return;
    }
    if (selectedQuestionIds.size === 0) {
      toast({ title: "Empty Payload", description: "Select questions from the bank.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const mockData = {
        title,
        exam,
        type: 'manual',
        questionIds: Array.from(selectedQuestionIds),
        duration,
        negativeMarking: penalty,
        premium: isPremium,
        status: "draft",
        createdAt: Date.now(),
        totalQuestions: selectedQuestionIds.size,
        difficulty: difficulty as any,
        accessType: isPremium ? 'pass_plus' : 'free'
      };

      await addDoc(collection(db, "mocks"), mockData);
      toast({ title: "Simulation Staged", description: "Linked artifacts saved as Draft." });
      setTitle("");
      setSelectedQuestionIds(new Set());
      loadRegistry();
    } catch (e: any) {
      toast({ title: "Initialization Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(type: 'full' | 'sectional' | 'chapter') {
    if (!title || !exam) {
      toast({ title: "Validation Error", description: "Required fields missing." });
      return;
    }
    
    setLoading(true);
    try {
      await generateAutoMock({
        title,
        exam,
        type,
        count: qCount,
        difficulty,
        duration,
        negativeMarking: penalty,
        isPremium
      });

      toast({ title: "AI Forge Success", description: "Simulation synthesized and saved to Drafts." });
      setTitle("");
      loadRegistry();
    } catch (e: any) {
      toast({ title: "Synthesis Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: 'publish' | 'live' | 'archive' | 'delete' | 'duplicate') {
    try {
      switch(action) {
        case 'publish':
          await publishMock(id);
          toast({ title: "Signal Propagated", description: "Mock is now visible to students." });
          break;
        case 'live':
          await updateMock(id, { status: 'live', liveAt: Date.now() });
          toast({ title: "Marked Live", description: "Session pinned to live arena." });
          break;
        case 'archive':
          await updateMock(id, { status: 'archived' });
          toast({ title: "Archived", description: "Signal moved to secondary storage." });
          break;
        case 'duplicate':
          await duplicateMock(id);
          toast({ title: "Artifact Cloned", description: "New draft instance created." });
          break;
        case 'delete':
          if(confirm('Hard purge this simulation record?')) {
            await deleteMock(id);
            toast({ title: "Purged", variant: "destructive" });
          }
          break;
      }
      loadRegistry();
    } catch (e) {
      toast({ title: "Action Failed", variant: "destructive" });
    }
  }

  async function saveMetadataUpdate() {
    if (!editingMock) return;
    setLoading(true);
    try {
      await updateMock(editingMock.id, editingMock);
      toast({ title: "Registry Updated" });
      setEditingMock(null);
      loadRegistry();
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filteredBank = bankQuestions.filter(q => {
    const matchesSearch = q.question_en.toLowerCase().includes(manualSearch.toLowerCase()) ||
                          q.question_pa?.toLowerCase().includes(manualSearch.toLowerCase());
    const matchesSubject = manualSubject === "All" || q.subject === manualSubject;
    const matchesUsage = usageFilter === "All" || 
                         (usageFilter === "Unused" && (q.usageCount || 0) === 0) ||
                         (usageFilter === "Used" && (q.usageCount || 0) > 0);
    return matchesSearch && matchesSubject && matchesUsage;
  });

  const filteredMocks = mocks.filter(m => 
    m.status === activeRegistryTab && 
    (m.title.toLowerCase().includes(registrySearch.toLowerCase()) || m.exam.toLowerCase().includes(registrySearch.toLowerCase()))
  );

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center blue-glow shadow-lg">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Simulation Factory</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Enterprise CMS for forging server-synced CBT environments.</p>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" className="h-14 rounded-2xl border-white/10" onClick={loadRegistry}>
                    <RotateCcw className={cn("w-4 h-4 mr-2", registryLoading && "animate-spin")} /> Refresh Signal
                 </Button>
              </div>
            </header>

            {/* Simulation Generator Hub */}
            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-10">
                  <Card className="p-8 rounded-[48px] bg-zinc-900/40 border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                       <Settings2 size={300} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-4">Test Identity</label>
                          <Input 
                            placeholder="e.g. Excise Inspector Mega Mock #1" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-4">Exam Cluster</label>
                          <Input 
                            placeholder="e.g. PSSSB" 
                            value={exam}
                            onChange={(e) => setExam(e.target.value)}
                            className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                          />
                       </div>
                    </div>

                    <Tabs defaultValue="manual" className="space-y-8 relative z-10">
                       <TabsList className="bg-zinc-950/50 border border-white/5 p-1.5 rounded-2xl h-16 w-fit">
                          <TabsTrigger value="manual" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">Manual Port</TabsTrigger>
                          <TabsTrigger value="ai" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">AI Synthesize</TabsTrigger>
                       </TabsList>

                       <TabsContent value="manual" className="space-y-8">
                          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20 p-6 rounded-3xl border border-white/5">
                             <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                                <Input 
                                  placeholder="Search artifacts..." 
                                  value={manualSearch}
                                  onChange={(e) => setManualSearch(e.target.value)}
                                  className="pl-10 h-11 bg-zinc-900 border-white/5 rounded-xl"
                                />
                             </div>
                             <div className="flex gap-4 w-full md:w-auto">
                                <Select value={manualSubject} onValueChange={setManualSubject}>
                                    <SelectTrigger className="flex-1 md:w-48 h-11 bg-zinc-900 border-white/5 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 text-white">
                                      <SelectItem value="All">All Subjects</SelectItem>
                                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={usageFilter} onValueChange={setUsageFilter}>
                                    <SelectTrigger className="w-36 h-11 bg-zinc-900 border-white/5 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 text-white">
                                      <SelectItem value="Unused">Unused</SelectItem>
                                      <SelectItem value="Used">Used</SelectItem>
                                      <SelectItem value="All">All</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                          </div>

                          <div className="bg-black/40 rounded-[32px] border border-white/5 max-h-[500px] overflow-y-auto no-scrollbar">
                             <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10 text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                                   <tr>
                                      <th className="px-6 py-4">State</th>
                                      <th className="px-6 py-4">Classification</th>
                                      <th className="px-6 py-4">Body Narrative</th>
                                      <th className="px-6 py-4 text-right">Link</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                   {bankLoading ? (
                                      <tr><td colSpan={4} className="p-20 text-center animate-pulse italic text-zinc-600">Scanning Atomic Vault...</td></tr>
                                   ) : filteredBank.length > 0 ? filteredBank.map((q) => {
                                      const isUsed = (q.usageCount || 0) > 0;
                                      const isSelected = selectedQuestionIds.has(q.id);
                                      return (
                                        <tr 
                                          key={q.id} 
                                          onClick={() => {
                                            if (isUsed) return;
                                            const next = new Set(selectedQuestionIds);
                                            if (next.has(q.id)) next.delete(q.id);
                                            else next.add(q.id);
                                            setSelectedQuestionIds(next);
                                          }}
                                          className={cn(
                                            "hover:bg-white/[0.02] cursor-pointer transition-colors", 
                                            isSelected && "bg-primary/5",
                                            isUsed && "opacity-60 grayscale cursor-not-allowed"
                                          )}
                                        >
                                           <td className="px-6 py-4">
                                              {isUsed ? (
                                                <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-black uppercase">Used</Badge>
                                              ) : (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Fresh</Badge>
                                              )}
                                           </td>
                                           <td className="px-6 py-4">
                                              <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10">{q.subject}</Badge>
                                           </td>
                                           <td className="px-6 py-4">
                                              <p className="text-xs font-bold text-white line-clamp-1">{q.question_en}</p>
                                           </td>
                                           <td className="px-6 py-4 text-right">
                                              <div className={cn(
                                                 "w-5 h-5 rounded-lg border flex items-center justify-center ml-auto transition-all",
                                                 isSelected ? "bg-primary border-primary" : "border-white/10"
                                              )}>
                                                 {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                                              </div>
                                           </td>
                                        </tr>
                                      );
                                   }) : (
                                      <tr><td colSpan={4} className="p-20 text-center opacity-30 italic">Sector quiet. No artifacts found.</td></tr>
                                   )}
                                </tbody>
                             </table>
                          </div>

                          <div className="flex flex-wrap items-center justify-between bg-primary/5 p-5 rounded-[28px] border border-primary/10 gap-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                                   <ListPlus className="text-white w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-primary uppercase">Staging Area</p>
                                   <p className="text-sm font-black text-white">{selectedQuestionIds.size} Artifacts</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={() => setSelectedQuestionIds(new Set())} className="h-10 text-xs font-bold text-zinc-500 hover:text-white">Discard</Button>
                                <Button 
                                  onClick={handleManualMock} 
                                  disabled={loading || selectedQuestionIds.size === 0} 
                                  className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest blue-glow"
                                >
                                    Initialize Mock
                                </Button>
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="ai" className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Question Count</p>
                                <Input type="number" value={qCount} onChange={(e) => setQCount(Number(e.target.value))} className="bg-transparent border-none p-0 text-3xl font-black focus-visible:ring-0" />
                             </div>
                             <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Balancing</p>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                   <SelectTrigger className="bg-transparent border-none p-0 text-lg font-bold h-fit shadow-none">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="bg-zinc-950 text-white">
                                      <SelectItem value="mixed">Mixed (Weighted)</SelectItem>
                                      <SelectItem value="easy">Easy Base</SelectItem>
                                      <SelectItem value="medium">Medium Standard</SelectItem>
                                      <SelectItem value="hard">Hard Elite</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Quarantine Guard</p>
                                <p className="text-sm font-bold text-emerald-500 uppercase flex items-center gap-2"><Check size={12} /> Active</p>
                             </div>
                          </div>
                          <Button onClick={() => handleGenerate('full')} disabled={loading} className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow shadow-2xl">
                             {loading ? <Loader2 className="animate-spin mr-3" /> : <Sparkles className="mr-3" />}
                             Forge Unique Simulation
                          </Button>
                       </TabsContent>
                    </Tabs>
                  </Card>
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <Card className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 space-y-10 sticky top-8 shadow-2xl overflow-hidden">
                     <h3 className="font-headline text-2xl font-black flex items-center gap-3">
                        <Settings className="text-primary w-6 h-6" />
                        CBT Blueprint
                     </h3>
                     
                     <div className="space-y-10">
                        <div className="space-y-4">
                           <div className="flex justify-between items-center px-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Session Time</label>
                              <Badge variant="outline" className="border-primary/20 text-primary font-mono text-sm px-3">{duration}m</Badge>
                           </div>
                           <Input 
                             type="range" 
                             min={10} max={180} step={5}
                             value={duration}
                             onChange={(e) => setDuration(Number(e.target.value))}
                             className="h-2 p-0 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary"
                           />
                        </div>

                        <div className="space-y-4">
                           <div className="flex justify-between items-center px-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Negative Factor</label>
                              <Badge variant="outline" className="border-red-500/20 text-red-500 font-mono text-sm px-3">-{penalty}</Badge>
                           </div>
                           <div className="grid grid-cols-4 gap-2">
                              {[0, 0.25, 0.33, 0.5].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => setPenalty(v)}
                                  className={cn(
                                    "h-12 rounded-xl font-black text-[10px] border transition-all",
                                    penalty === v ? "bg-red-500/10 border-red-500 text-red-500" : "border-white/5 text-zinc-600 hover:bg-white/5"
                                  )}
                                >{v}</button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Monetization</label>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setIsPremium(true)}
                                className={cn(
                                  "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase border transition-all flex flex-col items-center justify-center gap-1", 
                                  isPremium ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-white/5 text-zinc-600"
                                )}
                              >
                                <Zap size={14} />
                                <span>PASS+</span>
                              </button>
                              <button 
                                onClick={() => setIsPremium(false)}
                                className={cn(
                                  "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase border transition-all flex flex-col items-center justify-center gap-1", 
                                  !isPremium ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20" : "border-white/5 text-zinc-600"
                                )}
                              >
                                <Eye size={14} />
                                <span>FREE HUB</span>
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 flex gap-4 items-start">
                        <ClipboardCheck className="text-primary shrink-0" size={20} />
                        <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                           "All generated simulations are saved as **Drafts**. Verify the question payload before pushing to the student registry."
                        </p>
                     </div>
                  </Card>
               </div>
            </div>

            {/* Simulation Registry - THE REBUILD */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Database className="text-primary w-8 h-8" />
                    Simulation Registry
                 </h3>
                 <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                    <Input 
                      placeholder="Find simulation..." 
                      value={registrySearch}
                      onChange={e => setRegistrySearch(e.target.value)}
                      className="pl-10 h-12 bg-zinc-900/50 border-white/5 rounded-2xl text-xs font-bold"
                    />
                 </div>
              </div>

              <Tabs value={activeRegistryTab} onValueChange={v => setActiveRegistryTab(v as any)} className="space-y-8">
                 <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar">
                    {[
                      { id: 'draft', label: 'Drafts', icon: FileText },
                      { id: 'scheduled', label: 'Scheduled', icon: Calendar },
                      { id: 'published', label: 'Published', icon: CheckCircle2 },
                      { id: 'live', label: 'Live Arena', icon: PlayCircle },
                      { id: 'archived', label: 'Archived', icon: Archive }
                    ].map(t => (
                      <TabsTrigger key={t.id} value={t.id} className="rounded-xl px-6 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary shrink-0">
                         <t.icon className="w-3.5 h-3.5 mr-2" /> {t.label}
                      </TabsTrigger>
                    ))}
                 </TabsList>

                 <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] overflow-hidden">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-900/60 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                             <tr>
                                <th className="px-8 py-6">Mock Identity</th>
                                <th className="px-8 py-6">Board</th>
                                <th className="px-8 py-6">CBT Specs</th>
                                <th className="px-8 py-6">Access</th>
                                <th className="px-8 py-6">Attempts</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {registryLoading ? (
                               <tr><td colSpan={6} className="p-32 text-center animate-pulse italic text-zinc-600">Syncing with Registry Node...</td></tr>
                             ) : filteredMocks.length > 0 ? filteredMocks.map(m => (
                               <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                                  <td className="px-8 py-8">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                                           <BookOpen size={18} className="text-zinc-600 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                           <p className="font-bold text-white group-hover:text-primary transition-colors">{m.title}</p>
                                           <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">ID: {m.id.substring(0, 8)}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-8">
                                     <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase">{m.exam}</Badge>
                                  </td>
                                  <td className="px-8 py-8">
                                     <div className="flex gap-4 text-[10px] font-bold text-zinc-500 uppercase">
                                        <span className="flex items-center gap-1.5"><ListPlus size={12} /> {m.totalQuestions}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {m.duration}m</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-8">
                                     {m.accessType === 'pass_plus' ? (
                                       <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase">PASS+</Badge>
                                     ) : (
                                       <Badge className="bg-emerald-600 text-white border-none text-[8px] font-black uppercase">Free</Badge>
                                     )}
                                  </td>
                                  <td className="px-8 py-8">
                                     <p className="text-lg font-black text-white">{mockStats[m.id]?.totalAttempts || 0}</p>
                                  </td>
                                  <td className="px-8 py-8 text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                                              <MoreHorizontal size={20} className="text-zinc-600" />
                                           </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white rounded-2xl w-56 p-2" align="end">
                                           <DropdownMenuLabel className="px-4 py-2 text-[10px] uppercase font-black text-zinc-500">Simulation Management</DropdownMenuLabel>
                                           <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => setEditingMock(m)}>
                                              <Edit3 className="w-4 h-4 mr-3 text-primary" /> Edit Metadata
                                           </DropdownMenuItem>
                                           <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => handleAction(m.id, 'duplicate')}>
                                              <Copy className="w-4 h-4 mr-3 text-zinc-400" /> Duplicate Simulation
                                           </DropdownMenuItem>
                                           
                                           <DropdownMenuSeparator className="bg-white/5" />
                                           
                                           {m.status === 'draft' && (
                                              <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10" onClick={() => handleAction(m.id, 'publish')}>
                                                 <CheckCircle2 className="w-4 h-4 mr-3" /> Publish Simulation
                                              </DropdownMenuItem>
                                           )}

                                           {m.status === 'published' && (
                                              <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10" onClick={() => handleAction(m.id, 'live')}>
                                                 <PlayCircle className="w-4 h-4 mr-3" /> Mark Live Event
                                              </DropdownMenuItem>
                                           )}

                                           <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-zinc-500" onClick={() => handleAction(m.id, 'archive')}>
                                              <Archive className="w-4 h-4 mr-3" /> Archive Record
                                           </DropdownMenuItem>
                                           
                                           <DropdownMenuSeparator className="bg-white/5" />
                                           
                                           <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-600/10" onClick={() => handleAction(m.id, 'delete')}>
                                              <Trash2 className="w-4 h-4 mr-3" /> Hard Purge
                                           </DropdownMenuItem>
                                        </DropdownMenuContent>
                                     </DropdownMenu>
                                  </td>
                               </tr>
                             )) : (
                               <tr><td colSpan={6} className="p-32 text-center text-zinc-600 italic">Sector quiet. No simulations matching this status.</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </Tabs>
            </div>
          </div>

          {/* Metadata Editor Modal */}
          <Dialog open={!!editingMock} onOpenChange={() => setEditingMock(null)}>
            <DialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Mock Metadata Editor</DialogTitle>
                <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">Editing Simulation Node: {editingMock?.id}</DialogDescription>
              </DialogHeader>
              
              <div className="py-8 grid grid-cols-2 gap-8">
                 <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 px-2">Mock Title</label>
                    <Input 
                      value={editingMock?.title || ""}
                      onChange={e => setEditingMock(prev => prev ? {...prev, title: e.target.value} : null)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl px-4"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 px-2">Exam Board</label>
                    <Input 
                      value={editingMock?.exam || ""}
                      onChange={e => setEditingMock(prev => prev ? {...prev, exam: e.target.value} : null)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl px-4"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 px-2">Session Duration (Mins)</label>
                    <Input 
                      type="number"
                      value={editingMock?.duration || 0}
                      onChange={e => setEditingMock(prev => prev ? {...prev, duration: Number(e.target.value)} : null)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl px-4"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 px-2">Negative Factor</label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={editingMock?.negativeMarking || 0}
                      onChange={e => setEditingMock(prev => prev ? {...prev, negativeMarking: Number(e.target.value)} : null)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl px-4"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 px-2">Access Policy</label>
                    <Select value={editingMock?.accessType || 'free'} onValueChange={v => setEditingMock(prev => prev ? {...prev, accessType: v as any} : null)}>
                       <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl px-4 text-white">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-zinc-900 text-white border-white/10">
                          <SelectItem value="free">Free Access</SelectItem>
                          <SelectItem value="pass_plus">PASS+ Active</SelectItem>
                          <SelectItem value="premium">Premium Only</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <DialogFooter className="gap-4">
                 <Button variant="ghost" onClick={() => setEditingMock(null)} className="h-12 rounded-xl">Cancel</Button>
                 <Button onClick={saveMetadataUpdate} disabled={loading} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black">
                    {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                 </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AdminProtect>
  );
}
