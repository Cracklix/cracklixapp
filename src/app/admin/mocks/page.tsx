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
  Check
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
  const [usageFilter, setUsageFilter] = useState("All");

  // Sectional/Chapter State
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  // Registry State
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [registrySearch, setRegistrySearch] = useState("");
  const [activeRegistryTab, setActiveRegistryTab] = useState<MockStatus>("published");
  const [mockStats, setMockStats] = useState<Record<string, any>>({});

  useEffect(() => {
    loadRegistry();
    loadBankForPicker();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadTopicsForSubject(selectedSubject);
    }
  }, [selectedSubject]);

  async function loadTopicsForSubject(subj: string) {
    try {
      const q = query(collection(db, "questions"), where("subject", "==", subj), limit(100));
      const snap = await getDocs(q);
      const topics = Array.from(new Set(snap.docs.map(d => d.data().topic).filter(Boolean)));
      setAvailableTopics(topics as string[]);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadBankForPicker() {
    setBankLoading(true);
    try {
      let q = query(collection(db, "questions"), where("status", "==", "published"), limit(200));
      if (manualSubject !== "All") {
        q = query(collection(db, "questions"), where("status", "==", "published"), where("subject", "==", manualSubject), limit(200));
      }
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
      
      // Load stats for each published mock
      const statsMap: any = {};
      for (const m of data) {
        if (m.status === 'published' || m.status === 'live') {
          const stats = await getMockAnalytics(m.id);
          if (stats) statsMap[m.id] = stats;
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
      toast({ title: "Identity Required", description: "Set a title and target examBoard." });
      return;
    }
    if (selectedQuestionIds.size === 0) {
      toast({ title: "Empty Payload", description: "Select at least one question from the bank.", variant: "destructive" });
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
        difficulty: difficulty as any
      };

      await addDoc(collection(db, "mocks"), mockData);
      toast({ title: "Manual Mock Initialized", description: "Questions linked and saved to Drafts." });
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
      toast({ title: "Identification Required", description: "Set a title and target exam board." });
      return;
    }
    
    setLoading(true);
    try {
      await generateAutoMock({
        title,
        exam,
        type,
        subject: selectedSubject,
        topic: selectedTopic,
        count: qCount,
        difficulty,
        duration,
        negativeMarking: penalty,
        isPremium
      });

      toast({ title: "Mock Synthesized", description: "Simulation saved to Drafts for review." });
      setTitle("");
      loadRegistry();
    } catch (e: any) {
      toast({ title: "Synthesis Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, nextStatus: MockStatus) {
    try {
      if (nextStatus === 'published') {
        await publishMock(id);
      } else {
        await updateMock(id, { status: nextStatus });
      }
      toast({ title: "Registry Updated", description: `Simulation moved to ${nextStatus.toUpperCase()}.` });
      loadRegistry();
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateMock(id);
      toast({ title: "Artifact Duplicated", description: "New draft instance created." });
      loadRegistry();
    } catch (e) {
      toast({ title: "Duplication Failed", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Terminate this simulation registry? This action is IRREVERSIBLE.")) return;
    try {
      await deleteMock(id);
      toast({ title: "Signal Purged" });
      loadRegistry();
    } catch (e) {
      toast({ title: "Deletion Error", variant: "destructive" });
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQuestionIds(next);
  };

  const selectAllVisible = () => {
    const next = new Set(selectedQuestionIds);
    filteredBank.forEach(q => next.add(q.id));
    setSelectedQuestionIds(next);
    toast({ title: "Batch Selected", description: `${filteredBank.length} artifacts staged.` });
  };

  const clearSelection = () => {
    setSelectedQuestionIds(new Set());
    toast({ title: "Selection Cleared" });
  };

  const filteredBank = bankQuestions.filter(q => {
    const matchesSearch = q.question_en.toLowerCase().includes(manualSearch.toLowerCase()) ||
                          q.question_pa?.toLowerCase().includes(manualSearch.toLowerCase());
    const matchesUsage = usageFilter === "All" || 
                         (usageFilter === "Unused" && (q.usageCount || 0) === 0) ||
                         (usageFilter === "Used" && (q.usageCount || 0) > 0);
    return matchesSearch && matchesUsage;
  });

  const filteredMocks = mocks.filter(m => 
    m.status === activeRegistryTab && 
    (m.title.toLowerCase().includes(registrySearch.toLowerCase()) || m.exam.toLowerCase().includes(registrySearch.toLowerCase()))
  );

  const getStatusColor = (s: MockStatus) => {
    switch(s) {
      case 'live': return 'bg-red-500 text-white';
      case 'published': return 'bg-emerald-500 text-white';
      case 'draft': return 'bg-orange-500 text-white';
      case 'scheduled': return 'bg-blue-500 text-white';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  const getUsageBadge = (q: Question) => {
    const count = q.usageCount || 0;
    if (count > 0) return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[8px] uppercase font-black">USED {count}X</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] uppercase font-black">UNUSED</Badge>;
  };

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center blue-glow shadow-lg">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Simulation Factory</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Forge server-synced CBT environments using AI Blueprints or Manual Selection.</p>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
               {/* Left Controls - Blueprints & Manual Builder */}
               <div className="lg:col-span-8 space-y-10">
                  <Card className="p-4 md:p-8 rounded-[40px] bg-zinc-900/40 border-white/5 space-y-10 shadow-2xl relative overflow-hidden max-w-full">
                    <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                       <Settings2 size={300} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-4">Simulation Identity</label>
                          <Input 
                            placeholder="e.g. Excise Inspector Mega Mock #1" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-4">Exam Board Cluster</label>
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
                          <TabsTrigger value="manual" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">Manual Builder</TabsTrigger>
                          <TabsTrigger value="ai" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">AI Factory</TabsTrigger>
                       </TabsList>

                       <TabsContent value="manual" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20 p-6 rounded-3xl border border-white/5">
                             <div className="relative flex-1 w-full md:w-auto">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                                <Input 
                                  placeholder="Search bank assets..." 
                                  value={manualSearch}
                                  onChange={(e) => setManualSearch(e.target.value)}
                                  className="pl-10 h-11 bg-zinc-900 border-white/5 rounded-xl"
                                />
                             </div>
                             <div className="flex gap-4 w-full md:w-auto">
                                <Select value={manualSubject} onValueChange={(val) => { setManualSubject(val); loadBankForPicker(); }}>
                                    <SelectTrigger className="w-full md:w-48 h-11 bg-zinc-900 border-white/5 rounded-xl">
                                      <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 text-white max-h-[300px]">
                                      <SelectItem value="All">All Subjects</SelectItem>
                                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={usageFilter} onValueChange={setUsageFilter}>
                                    <SelectTrigger className="w-full md:w-32 h-11 bg-zinc-900 border-white/5 rounded-xl">
                                      <SelectValue placeholder="Usage" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 text-white">
                                      <SelectItem value="All">Usage: All</SelectItem>
                                      <SelectItem value="Unused">Unused Only</SelectItem>
                                      <SelectItem value="Used">Used Only</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                          </div>

                          <div className="flex items-center justify-between px-4">
                             <div className="flex gap-4">
                                <Button variant="ghost" size="sm" onClick={selectAllVisible} className="h-8 rounded-lg text-primary font-black text-[9px] uppercase tracking-widest hover:bg-primary/10">
                                   Select All Visible
                                </Button>
                                <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8 rounded-lg text-zinc-500 font-black text-[9px] uppercase tracking-widest hover:bg-white/5">
                                   Clear All
                                </Button>
                             </div>
                             <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">{filteredBank.length} Results in Current Filter</p>
                          </div>

                          <div className="bg-black/40 rounded-[32px] border border-white/5 max-h-[500px] overflow-y-auto no-scrollbar overflow-x-auto">
                             <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10 text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                                   <tr>
                                      <th className="px-6 py-4">#</th>
                                      <th className="px-6 py-4">Status</th>
                                      <th className="px-6 py-4">Subject</th>
                                      <th className="px-6 py-4">Question Narrative</th>
                                      <th className="px-6 py-4 text-right">Select</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                   {bankLoading ? (
                                      <tr><td colSpan={5} className="p-20 text-center animate-pulse italic text-zinc-600">Scanning Production Bank...</td></tr>
                                   ) : filteredBank.length > 0 ? filteredBank.map((q, i) => (
                                      <tr 
                                        key={q.id} 
                                        onClick={() => toggleSelect(q.id)}
                                        className={cn("hover:bg-white/[0.02] cursor-pointer transition-colors group", selectedQuestionIds.has(q.id) && "bg-primary/5")}
                                      >
                                         <td className="px-6 py-4 text-xs font-bold text-zinc-600">{i+1}</td>
                                         <td className="px-6 py-4">
                                            {getUsageBadge(q)}
                                         </td>
                                         <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black uppercase">{q.subject}</Badge>
                                         </td>
                                         <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-white line-clamp-1 break-words">{q.question_en}</p>
                                            <p className="text-[10px] text-zinc-600 font-medium line-clamp-1 italic break-words">{q.question_pa}</p>
                                         </td>
                                         <td className="px-6 py-4 text-right">
                                            <div className={cn(
                                               "w-6 h-6 rounded-lg border flex items-center justify-center ml-auto transition-all",
                                               selectedQuestionIds.has(q.id) ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-white/10"
                                            )}>
                                               {selectedQuestionIds.has(q.id) && <Check size={14} className="text-white" strokeWidth={4} />}
                                            </div>
                                         </td>
                                      </tr>
                                   )) : (
                                      <tr><td colSpan={5} className="p-20 text-center opacity-30 italic">No artifacts found in this sector.</td></tr>
                                   )}
                                </tbody>
                             </table>
                          </div>

                          <div className="flex flex-col md:flex-row items-center justify-between bg-primary/5 p-6 rounded-[32px] border border-primary/10 gap-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                                   <ListPlus className="text-white w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-primary uppercase">Manual Selection Active</p>
                                   <p className="text-lg font-black text-white">{selectedQuestionIds.size} Artifacts Staged</p>
                                </div>
                             </div>
                             <div className="flex gap-4 w-full md:w-auto">
                                <Button variant="outline" onClick={clearSelection} className="h-14 flex-1 md:flex-none px-8 rounded-2xl border-white/10 font-bold hover:bg-destructive/10 hover:text-destructive">Discard</Button>
                                <Button onClick={handleManualMock} disabled={loading || selectedQuestionIds.size === 0} className="h-14 flex-1 md:flex-none px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-sm uppercase tracking-widest blue-glow">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Initialize Manual Mock"}
                                </Button>
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="ai" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                          <Tabs defaultValue="full" className="space-y-8">
                             <TabsList className="bg-zinc-950/50 border border-white/5 p-1 rounded-2xl h-14 w-fit">
                                <TabsTrigger value="full" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">Full Mock</TabsTrigger>
                                <TabsTrigger value="sectional" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">Sectional</TabsTrigger>
                                <TabsTrigger value="chapter" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">Chapter Test</TabsTrigger>
                             </TabsList>

                             <TabsContent value="full" className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Question Payload</p>
                                      <Input type="number" value={qCount} onChange={(e) => setQCount(Number(e.target.value))} className="bg-transparent border-none p-0 text-3xl font-black focus-visible:ring-0" />
                                   </div>
                                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Difficulty Balanced</p>
                                      <Select value={difficulty} onValueChange={setDifficulty}>
                                         <SelectTrigger className="bg-transparent border-none p-0 text-lg font-bold h-fit shadow-none">
                                            <SelectValue />
                                         </SelectTrigger>
                                         <SelectContent className="bg-zinc-950 text-white">
                                            <SelectItem value="mixed">Mixed Strategy</SelectItem>
                                            <SelectItem value="easy">Easy Base</SelectItem>
                                            <SelectItem value="medium">Medium Standard</SelectItem>
                                            <SelectItem value="hard">Hard Elite</SelectItem>
                                         </SelectContent>
                                      </Select>
                                   </div>
                                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Source Protocol</p>
                                      <p className="text-sm font-bold text-white uppercase">Atomic Bank + PYQ</p>
                                   </div>
                                </div>
                                <Button onClick={() => handleGenerate('full')} disabled={loading} className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow shadow-2xl">
                                   {loading ? <Loader2 className="animate-spin mr-3" /> : <Sparkles className="mr-3" />}
                                   Forge Full Mock
                                </Button>
                             </TabsContent>

                             <TabsContent value="sectional" className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-3">
                                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-4">Subject Extraction</label>
                                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                         <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold">
                                            <SelectValue placeholder="Select Subject" />
                                         </SelectTrigger>
                                         <SelectContent className="bg-zinc-950 text-white max-h-[300px]">
                                            {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                         </SelectContent>
                                      </Select>
                                   </div>
                                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Quantity</p>
                                      <Input type="number" value={qCount} onChange={(e) => setQCount(Number(e.target.value))} className="bg-transparent border-none p-0 text-3xl font-black focus-visible:ring-0" />
                                   </div>
                                </div>
                                <Button onClick={() => handleGenerate('sectional')} disabled={loading || !selectedSubject} className="w-full h-20 rounded-[32px] bg-emerald-600 hover:bg-emerald-700 text-2xl font-black shadow-2xl shadow-emerald-900/20">
                                   {loading ? <Loader2 className="animate-spin mr-3" /> : <Target className="mr-3" />}
                                   Synthesize Sectional Test
                                </Button>
                             </TabsContent>

                             <TabsContent value="chapter" className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-3">
                                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-4">Core Subject</label>
                                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                         <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold">
                                            <SelectValue placeholder="Select Subject" />
                                         </SelectTrigger>
                                         <SelectContent className="bg-zinc-950 text-white">
                                            {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                         </SelectContent>
                                      </Select>
                                   </div>
                                   <div className="space-y-3">
                                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-4">Detected Chapters/Topics</label>
                                      <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject}>
                                         <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold">
                                            <SelectValue placeholder={availableTopics.length > 0 ? "Select Chapter" : "No Topics Detected"} />
                                         </SelectTrigger>
                                         <SelectContent className="bg-zinc-950 text-white">
                                            {availableTopics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                         </SelectContent>
                                      </Select>
                                   </div>
                                </div>
                                <Button onClick={() => handleGenerate('chapter')} disabled={loading || !selectedTopic} className="w-full h-20 rounded-[32px] bg-accent hover:bg-accent/90 text-2xl font-black shadow-2xl shadow-accent/20">
                                   {loading ? <Loader2 className="animate-spin mr-3" /> : <Zap className="mr-3" />}
                                   Generate Chapter Sprint
                                </Button>
                             </TabsContent>
                          </Tabs>
                       </TabsContent>
                    </Tabs>
                  </Card>

                  {/* Simulation Registry CMS */}
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
                       <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar">
                          {[
                            { id: 'draft', label: 'Drafts', icon: FileText },
                            { id: 'scheduled', label: 'Scheduled', icon: Calendar },
                            { id: 'published', label: 'Published', icon: CheckCircle2 },
                            { id: 'live', label: 'Live Events', icon: PlayCircle },
                            { id: 'archived', label: 'Archived', icon: Archive }
                          ].map(t => (
                            <TabsTrigger key={t.id} value={t.id} className="rounded-xl px-6 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">
                               <t.icon className="w-3.5 h-3.5 mr-2" /> {t.label}
                            </TabsTrigger>
                          ))}
                       </TabsList>

                       <div className="grid gap-6">
                          {registryLoading ? (
                            [1,2,3].map(i => <div key={i} className="h-32 rounded-[40px] bg-zinc-900/40 animate-pulse border border-white/5" />)
                          ) : filteredMocks.length > 0 ? filteredMocks.map(m => (
                            <div key={m.id} className="p-8 rounded-[48px] bg-zinc-900/40 border border-white/5 hover:border-primary/20 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden">
                               <div className="flex items-center gap-8 flex-1">
                                  <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg shrink-0", getStatusColor(m.status))}>
                                     {m.status === 'live' ? <PlayCircle className="animate-pulse" /> : <BookOpen />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors truncate max-w-full">{m.title}</h4>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-zinc-500 shrink-0">{m.type}</Badge>
                                     </div>
                                     <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                        <span className="flex items-center gap-2 shrink-0"><Target className="w-3 h-3" /> {m.exam}</span>
                                        <span className="flex items-center gap-2 shrink-0"><ListPlus className="w-3 h-3" /> {m.totalQuestions} Artifacts</span>
                                        <span className="flex items-center gap-2 shrink-0"><Clock className="w-3 h-3" /> {m.duration} Mins</span>
                                     </div>
                                  </div>
                               </div>

                               <div className="flex items-center gap-12 border-l border-white/5 pl-12 hidden lg:flex">
                                  {mockStats[m.id] ? (
                                    <>
                                       <div className="text-center">
                                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Attempts</p>
                                          <p className="text-2xl font-black text-white">{mockStats[m.id].totalAttempts}</p>
                                       </div>
                                       <div className="text-center">
                                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Avg Score</p>
                                          <p className="text-2xl font-black text-primary">{mockStats[m.id].avgScore}</p>
                                       </div>
                                    </>
                                  ) : (
                                    <div className="text-xs text-zinc-600 font-bold uppercase italic">No activity logs</div>
                                  )}
                               </div>

                               <div className="flex items-center gap-3 shrink-0">
                                  <DropdownMenu>
                                     <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white/5">
                                           <MoreVertical size={20} className="text-zinc-500" />
                                        </Button>
                                     </DropdownMenuTrigger>
                                     <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white rounded-2xl w-56 p-2 shadow-2xl" align="end">
                                        <DropdownMenuLabel className="px-4 py-2 text-[10px] uppercase font-black text-zinc-500">Simulation Control</DropdownMenuLabel>
                                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer focus:bg-primary/10" onClick={() => handleUpdateStatus(m.id, 'published')}>
                                           <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500" /> Publish Mock
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer focus:bg-red-500/10" onClick={() => handleUpdateStatus(m.id, 'live')}>
                                           <PlayCircle className="w-4 h-4 mr-3 text-red-500" /> Mark Live Event
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer focus:bg-white/5">
                                           <Edit3 className="w-4 h-4 mr-3 text-zinc-400" /> Edit Metadata
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer focus:bg-white/5" onClick={() => handleDuplicate(m.id)}>
                                           <Copy className="w-4 h-4 mr-3 text-zinc-400" /> Duplicate Simulation
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-orange-500 focus:bg-orange-500/10 focus:text-orange-500" onClick={() => handleUpdateStatus(m.id, 'archived')}>
                                           <Archive className="w-4 h-4 mr-3" /> Archive Entry
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={() => handleDelete(m.id)}>
                                           <Trash2 className="w-4 h-4 mr-3" /> Purge Registry
                                        </DropdownMenuItem>
                                     </DropdownMenuContent>
                                  </DropdownMenu>
                                  
                                  {m.status === 'draft' && (
                                    <Button 
                                      onClick={() => handleUpdateStatus(m.id, 'published')}
                                      className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/20"
                                    >
                                       Publish Mock
                                    </Button>
                                  )}
                               </div>
                            </div>
                          )) : (
                            <div className="py-32 text-center rounded-[64px] border-2 border-dashed border-white/5 bg-zinc-950/20">
                               <Database className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                               <h3 className="text-2xl font-black uppercase text-zinc-600 tracking-tighter">Sector Quiet</h3>
                               <p className="text-zinc-700 mt-2 font-medium italic">No simulations matching the current frequency.</p>
                            </div>
                          )}
                       </div>
                    </Tabs>
                  </div>
               </div>

               {/* Right Sidebar - Global CBT Configuration */}
               <div className="lg:col-span-4 space-y-8">
                  <Card className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 space-y-10 sticky top-8 shadow-2xl max-w-full">
                     <h3 className="font-headline text-2xl font-black flex items-center gap-3">
                        <Settings className="text-primary w-6 h-6" />
                        CBT Global Settings
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
                           <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Monetization Logic</label>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setIsPremium(true)}
                                className={cn(
                                  "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase border transition-all flex flex-col items-center justify-center gap-1", 
                                  isPremium ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-white/5 text-zinc-600"
                                )}
                              >
                                <Crown size={14} />
                                <span>PASS+</span>
                              </button>
                              <button 
                                onClick={() => setIsPremium(false)}
                                className={cn(
                                  "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase border transition-all flex flex-col items-center justify-center gap-1", 
                                  !isPremium ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20" : "border-white/5 text-zinc-600"
                                )}
                              >
                                <Zap size={14} />
                                <span>FREE HUB</span>
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 flex gap-4 items-start">
                        <ClipboardCheck className="text-primary shrink-0" size={20} />
                        <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                           "Protocol: Full Mocks auto-balance subject weightage. Sectional and Chapter tests are tuned for rapid-repetition drills."
                        </p>
                     </div>

                     {selectedQuestionIds.size > 0 && (
                        <div className="p-6 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex gap-4 items-center">
                           <AlertTriangle className="text-emerald-500 shrink-0" size={20} />
                           <p className="text-[11px] text-emerald-500 font-bold uppercase">
                              Check usage status before saving to ensure zero repetition.
                           </p>
                        </div>
                     )}
                  </Card>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}

function Crown(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  )
}
