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
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS, Subject, Question, MockTest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, query, where, getDocs, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { generateAutoMock, getMocksByStatus, publishMock, deleteMock } from "@/services/mocks";

export default function MockFactoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  
  // Form State
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

  // Sectional/Chapter State
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  // Registry State
  const [drafts, setDrafts] = useState<MockTest[]>([]);
  const [published, setPublished] = useState<MockTest[]>([]);

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
      const [dData, pData] = await Promise.all([
        getMocksByStatus('draft'),
        getMocksByStatus('published')
      ]);
      setDrafts(dData);
      setPublished(pData);
    } catch (e) {
      console.error(e);
    } finally {
      setRegistryLoading(false);
    }
  }

  async function handleManualMock() {
    if (!title || !exam) {
      toast({ title: "Identity Required", description: "Set a title and target exam." });
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
        totalQuestions: selectedQuestionIds.size
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

  async function handlePublish(id: string) {
    try {
      await publishMock(id);
      toast({ title: "Live Sync Complete", description: "Mock is now accessible to students." });
      loadRegistry();
    } catch (e) {
      toast({ title: "Publish Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Terminate this simulation registry?")) return;
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

  const filteredBank = bankQuestions.filter(q => 
    q.question_en.toLowerCase().includes(manualSearch.toLowerCase()) ||
    q.question_pa?.toLowerCase().includes(manualSearch.toLowerCase())
  );

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
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
                  <Card className="p-8 rounded-[40px] bg-zinc-900/40 border-white/5 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                    <Tabs defaultValue="manual" className="space-y-8">
                       <TabsList className="bg-zinc-950/50 border border-white/5 p-1.5 rounded-2xl h-16 w-fit">
                          <TabsTrigger value="manual" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">Manual Builder</TabsTrigger>
                          <TabsTrigger value="ai" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">AI Factory</TabsTrigger>
                       </TabsList>

                       {/* RESTORED: Manual Builder Flow */}
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
                             <Select value={manualSubject} onValueChange={(val) => { setManualSubject(val); loadBankForPicker(); }}>
                                <SelectTrigger className="w-full md:w-64 h-11 bg-zinc-900 border-white/5 rounded-xl">
                                   <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 text-white max-h-[300px]">
                                   <SelectItem value="All">All Subjects</SelectItem>
                                   {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>

                          <div className="bg-black/40 rounded-[32px] border border-white/5 max-h-[500px] overflow-y-auto no-scrollbar">
                             <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10 text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                                   <tr>
                                      <th className="px-6 py-4">#</th>
                                      <th className="px-6 py-4">Subject</th>
                                      <th className="px-6 py-4">Question Narrative</th>
                                      <th className="px-6 py-4 text-right">Select</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                   {bankLoading ? (
                                      <tr><td colSpan={4} className="p-20 text-center animate-pulse italic text-zinc-600">Scanning Production Bank...</td></tr>
                                   ) : filteredBank.length > 0 ? filteredBank.map((q, i) => (
                                      <tr 
                                        key={q.id} 
                                        onClick={() => toggleSelect(q.id)}
                                        className={cn("hover:bg-white/[0.02] cursor-pointer transition-colors group", selectedQuestionIds.has(q.id) && "bg-primary/5")}
                                      >
                                         <td className="px-6 py-4 text-xs font-bold text-zinc-600">{i+1}</td>
                                         <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black uppercase">{q.subject}</Badge>
                                         </td>
                                         <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-white line-clamp-1">{q.question_en}</p>
                                            <p className="text-[10px] text-zinc-600 font-medium line-clamp-1 italic">{q.question_pa}</p>
                                         </td>
                                         <td className="px-6 py-4 text-right">
                                            <div className={cn(
                                               "w-6 h-6 rounded-lg border flex items-center justify-center ml-auto transition-all",
                                               selectedQuestionIds.has(q.id) ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-white/10"
                                            )}>
                                               {selectedQuestionIds.has(q.id) && <CheckCircle2 size={14} className="text-white" />}
                                            </div>
                                         </td>
                                      </tr>
                                   )) : (
                                      <tr><td colSpan={4} className="p-20 text-center opacity-30 italic">No artifacts found in this sector.</td></tr>
                                   )}
                                </tbody>
                             </table>
                          </div>

                          <div className="flex items-center justify-between bg-primary/5 p-6 rounded-[32px] border border-primary/10">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                                   <ListPlus className="text-white w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-primary uppercase">Manual Selection Active</p>
                                   <p className="text-lg font-black text-white">{selectedQuestionIds.size} Artifacts Staged</p>
                                </div>
                             </div>
                             <Button onClick={handleManualMock} disabled={loading || selectedQuestionIds.size === 0} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-sm uppercase tracking-widest blue-glow">
                                {loading ? <Loader2 className="animate-spin mr-2" /> : "Initialize Manual Mock"}
                             </Button>
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

                  {/* Operational Registry */}
                  <Tabs defaultValue="drafts" className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                          <Database className="text-primary w-5 h-5" />
                          Simulation Registry
                       </h3>
                       <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-xl h-10">
                          <TabsTrigger value="drafts" className="rounded-lg px-6 font-bold text-[10px] uppercase">Drafts ({drafts.length})</TabsTrigger>
                          <TabsTrigger value="published" className="rounded-lg px-6 font-bold text-[10px] uppercase">Published ({published.length})</TabsTrigger>
                       </TabsList>
                    </div>

                    <TabsContent value="drafts" className="space-y-4">
                       {registryLoading ? (
                         [1,2].map(i => <div key={i} className="h-24 rounded-3xl bg-zinc-900/50 animate-pulse border border-white/5" />)
                       ) : drafts.length > 0 ? (
                         drafts.map(m => (
                           <div key={m.id} className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between group">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                                    <FileText className="text-zinc-500 w-6 h-6 group-hover:text-primary transition-colors" />
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-lg">{m.title}</h4>
                                    <div className="flex gap-3 mt-1">
                                       <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10">{m.type}</Badge>
                                       <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{m.totalQuestions} Artifacts • {m.duration} Mins</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex gap-3">
                                 <Button onClick={() => handlePublish(m.id)} className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest shadow-lg">Publish Simulation</Button>
                                 <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="rounded-xl text-zinc-700 hover:text-destructive"><Trash2 size={18} /></Button>
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-30 italic">No draft simulations in the pipeline.</div>
                       )}
                    </TabsContent>

                    <TabsContent value="published" className="space-y-4">
                       {published.map(m => (
                         <div key={m.id} className="p-6 rounded-[32px] bg-zinc-900/40 border border-emerald-500/10 hover:border-emerald-500/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                  <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-lg text-white">{m.title}</h4>
                                  <div className="flex gap-3 mt-1">
                                     <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase">LIVE</Badge>
                                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{m.exam} • {m.totalQuestions} Qs</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-3">
                               <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="rounded-xl text-zinc-700 hover:text-destructive"><Trash2 size={18} /></Button>
                            </div>
                         </div>
                       ))}
                    </TabsContent>
                  </Tabs>
               </div>

               {/* Right Sidebar - Logic Configuration */}
               <div className="lg:col-span-4 space-y-8">
                  <Card className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 space-y-8">
                     <h3 className="font-bold text-lg flex items-center gap-3">
                        <Settings className="text-primary w-5 h-5" />
                        CBT Global Settings
                     </h3>
                     <div className="space-y-8">
                        <div className="space-y-3">
                           <div className="flex justify-between items-center px-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Session Time</label>
                              <span className="text-xs font-black text-white">{duration}m</span>
                           </div>
                           <Input 
                             type="range" 
                             min={10} max={180} step={5}
                             value={duration}
                             onChange={(e) => setDuration(Number(e.target.value))}
                             className="h-1.5 p-0 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                           />
                        </div>

                        <div className="space-y-3">
                           <div className="flex justify-between items-center px-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Negative Factor</label>
                              <span className="text-xs font-black text-destructive">-{penalty}</span>
                           </div>
                           <div className="flex gap-2">
                              {[0, 0.25, 0.33, 0.5].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => setPenalty(v)}
                                  className={cn(
                                    "flex-1 h-10 rounded-xl font-black text-[10px] border transition-all",
                                    penalty === v ? "bg-destructive/10 border-destructive text-destructive" : "border-white/5 text-zinc-600 hover:bg-white/5"
                                  )}
                                >{v}</button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Monetization Logic</label>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setIsPremium(true)}
                                className={cn("flex-1 h-12 rounded-2xl font-black text-[10px] uppercase border transition-all", isPremium ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-white/5 text-zinc-600")}
                              >Premium PASS</button>
                              <button 
                                onClick={() => setIsPremium(false)}
                                className={cn("flex-1 h-12 rounded-2xl font-black text-[10px] uppercase border transition-all", !isPremium ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20" : "border-white/5 text-zinc-600")}
                              >Free Hub</button>
                           </div>
                        </div>
                     </div>
                  </Card>

                  <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-4">
                     <h4 className="font-bold flex items-center gap-2">
                        <ClipboardCheck className="text-primary w-4 h-4" />
                        Quality Protocol
                     </h4>
                     <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                        "Full Mocks automatically balance subject weightage. Sectional and Chapter tests are designed for targetted rapid-repetition drills."
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
