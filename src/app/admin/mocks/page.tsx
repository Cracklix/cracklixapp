
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
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS, Subject, Question } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { parseQuestionsAi } from "@/ai/flows/ai-question-parser-flow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EXAM_PRESETS = {
  "Punjab Police SI": [
    { subject: "Punjab GK", count: 20 },
    { subject: "Quant", count: 20 },
    { subject: "Reasoning", count: 20 },
    { subject: "Computer", count: 10 },
    { subject: "Current Affairs", count: 20 },
    { subject: "English", count: 10 }
  ],
  "PSSSB Clerk": [
    { subject: "Punjabi", count: 15 },
    { subject: "English", count: 15 },
    { subject: "Quant", count: 15 },
    { subject: "Reasoning", count: 15 },
    { subject: "Punjab GK", count: 20 },
    { subject: "Computer", count: 10 },
    { subject: "Current Affairs", count: 10 }
  ],
  "Patwari 2024": [
    { subject: "Agriculture", count: 10 },
    { subject: "Punjab GK", count: 25 },
    { subject: "Quant", count: 25 },
    { subject: "Reasoning", count: 20 },
    { subject: "English", count: 10 },
    { subject: "Punjabi", count: 10 }
  ]
};

export default function MockFactoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState("Punjab Police SI");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(90);
  const [penalty, setPenalty] = useState(0.25);
  const [isPremium, setIsPremium] = useState(true);
  
  // Smart Generator State
  const [blueprints, setBlueprints] = useState<{subject: Subject, count: number}[]>(EXAM_PRESETS["Punjab Police SI"]);

  // Manual Builder State
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");

  // Direct Builder State
  const [pastedContent, setPastedContent] = useState("");

  useEffect(() => {
    loadBank();
  }, [filterSubject]);

  async function loadBank() {
    try {
      let q = query(collection(db, "questions"), where("status", "==", "published"), limit(100));
      if (filterSubject !== "All") {
        q = query(collection(db, "questions"), where("status", "==", "published"), where("subject", "==", filterSubject), limit(100));
      }
      const snap = await getDocs(q);
      setBankQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
    } catch (e) {
      console.error(e);
    }
  }

  const applyPreset = (presetName: keyof typeof EXAM_PRESETS) => {
    setBlueprints(EXAM_PRESETS[presetName]);
    setExam(presetName);
    setTitle(`${presetName} Full Mock - ${new Date().toLocaleDateString()}`);
  };

  async function handleSmartGenerate() {
    if (!title) {
      toast({ title: "Naming Required", description: "Please provide a title for this simulation." });
      return;
    }
    setLoading(true);
    try {
      let allSelectedIds: string[] = [];
      
      for (const blueprint of blueprints) {
        if (blueprint.count <= 0) continue;
        const q = query(
          collection(db, "questions"),
          where("status", "==", "published"),
          where("subject", "==", blueprint.subject),
          limit(blueprint.count)
        );
        const snap = await getDocs(q);
        allSelectedIds.push(...snap.docs.map(d => d.id));
      }

      if (allSelectedIds.length === 0) throw new Error("Atomic Bank is currently empty for these subjects.");

      await addDoc(collection(db, "mocks"), {
        title,
        exam,
        questionIds: allSelectedIds,
        duration,
        negativeMarking: penalty,
        premium: isPremium,
        status: "published",
        createdAt: Date.now(),
        totalQuestions: allSelectedIds.length
      });

      toast({ title: "Simulation Synthesized", description: `${allSelectedIds.length} artifacts extracted and deployed.` });
    } catch (e: any) {
      toast({ title: "Synthesis Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleManualDeploy() {
    if (selectedIds.size === 0 || !title) {
      toast({ title: "Validation Failed", description: "Select questions and provide a title." });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "mocks"), {
        title,
        exam,
        questionIds: Array.from(selectedIds),
        duration,
        negativeMarking: penalty,
        premium: isPremium,
        status: "published",
        createdAt: Date.now(),
        totalQuestions: selectedIds.size
      });
      toast({ title: "Manual Mock Live", description: `${selectedIds.size} custom artifacts linked.` });
      setSelectedIds(new Set());
    } catch (e: any) {
      toast({ title: "Deployment Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectBuild() {
    if (!pastedContent.trim() || !title) return;
    setLoading(true);
    try {
      const result = await parseQuestionsAi({ rawText: pastedContent });
      
      const batch = result.questions.map(q => 
        addDoc(collection(db, "questions"), { 
          ...q, 
          status: "published", 
          source: "DIRECT_MOCK_PASTE", 
          createdAt: Date.now() 
        })
      );
      const docRefs = await Promise.all(batch);
      
      await addDoc(collection(db, "mocks"), {
        title,
        exam,
        questionIds: docRefs.map(r => r.id),
        duration,
        negativeMarking: penalty,
        premium: isPremium,
        status: "published",
        createdAt: Date.now(),
        totalQuestions: result.questions.length
      });

      toast({ title: "Express Mock Live", description: `${result.questions.length} questions parsed and deployed.` });
      setPastedContent("");
    } catch (e: any) {
      toast({ title: "Direct Build Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center blue-glow">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Simulation Factory</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Forge server-synced CBT environments from Atomic Assets or Express Pastes.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {Object.keys(EXAM_PRESETS).map(p => (
                  <Button 
                    key={p} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyPreset(p as any)}
                    className="rounded-xl border-white/5 bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white"
                  >
                    {p} Preset
                  </Button>
                ))}
              </div>
            </header>

            {/* Common Controls */}
            <Card className="p-8 rounded-[32px] bg-zinc-900/40 border-white/5 grid grid-cols-1 md:grid-cols-4 gap-8">
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Simulation Title</p>
                  <Input 
                    placeholder="e.g. Police SI Mega Mock #1" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="bg-black/40 border-white/5 h-12 rounded-xl font-bold"
                  />
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Target Cluster</p>
                  <Input 
                    placeholder="e.g. Punjab Police" 
                    value={exam} 
                    onChange={e => setExam(e.target.value)}
                    className="bg-black/40 border-white/5 h-12 rounded-xl font-bold"
                  />
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Duration (Mins)</p>
                  <Input 
                    type="number" 
                    value={duration} 
                    onChange={e => setDuration(Number(e.target.value))}
                    className="bg-black/40 border-white/5 h-12 rounded-xl font-bold"
                  />
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Access Logic</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsPremium(true)}
                      className={cn("flex-1 rounded-xl h-12 font-black text-[10px] uppercase", isPremium ? "bg-primary text-white border-primary" : "border-white/5 text-zinc-500")}
                    >Premium</Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsPremium(false)}
                      className={cn("flex-1 rounded-xl h-12 font-black text-[10px] uppercase", !isPremium ? "bg-emerald-600 text-white border-emerald-600" : "border-white/5 text-zinc-500")}
                    >Free</Button>
                  </div>
               </div>
            </Card>

            <Tabs defaultValue="smart" className="space-y-10">
               <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-[24px] h-16 w-fit">
                  <TabsTrigger value="smart" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-xs uppercase tracking-[0.2em]">
                    <Sparkles className="w-4 h-4 mr-2" /> Smart Generator
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-xs uppercase tracking-[0.2em]">
                    <LayoutGrid className="w-4 h-4 mr-2" /> Manual Builder
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-xs uppercase tracking-[0.2em]">
                    <Zap className="w-4 h-4 mr-2" /> Direct Builder
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="smart">
                  <div className="grid lg:grid-cols-12 gap-10 items-start">
                     <div className="lg:col-span-8 space-y-8">
                        <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 space-y-10">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                 <Layers className="text-primary w-5 h-5" />
                              </div>
                              <h3 className="text-xl font-bold uppercase tracking-tight">Subject Blueprint</h3>
                           </div>

                           <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest px-4">
                                 <span>Subject Index</span>
                                 <span className="text-right">Weightage (Questions)</span>
                              </div>
                              <div className="space-y-3">
                                 {blueprints.map((bp, i) => (
                                    <div key={i} className="p-6 rounded-[28px] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                       <span className="font-bold text-zinc-300">{bp.subject}</span>
                                       <div className="flex items-center gap-4">
                                          <input 
                                            type="number" 
                                            value={bp.count}
                                            onChange={(e) => {
                                              const next = [...blueprints];
                                              next[i].count = Number(e.target.value);
                                              setBlueprints(next);
                                            }}
                                            className="w-20 bg-black/40 border border-white/10 rounded-lg text-center font-black py-1.5 focus:ring-primary/20 outline-none" 
                                          />
                                       </div>
                                    </div>
                                 ))}
                                 <Button 
                                   variant="ghost" 
                                   onClick={() => setBlueprints([...blueprints, { subject: 'English', count: 10 }])}
                                   className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary"
                                 >+ Add Payload</Button>
                              </div>
                           </div>

                           <Button 
                             onClick={handleSmartGenerate}
                             disabled={loading}
                             className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow shadow-2xl transition-transform active:scale-95"
                           >
                              {loading ? <Loader2 className="animate-spin" /> : "Synthesize Smart Mock"}
                           </Button>
                        </Card>
                     </div>

                     <div className="lg:col-span-4 space-y-8">
                        <Card className="rounded-[40px] bg-emerald-500/10 border-emerald-500/20 p-8 flex flex-col justify-between h-48 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-10">
                              <Database size={100} />
                           </div>
                           <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-1">Atomic Inventory</p>
                           <h2 className="text-4xl font-black">24,500+ <span className="text-sm text-emerald-500/50">QS</span></h2>
                           <div className="pt-4 border-t border-emerald-500/10 flex items-center gap-2 text-[9px] font-black text-emerald-500/60 uppercase">
                              <Zap size={12} /> Sync: 100% Validated
                           </div>
                        </Card>
                        
                        <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 space-y-4">
                           <h4 className="font-bold flex items-center gap-2">
                              <ClipboardCheck className="text-primary w-4 h-4" />
                              Quality Protocol
                           </h4>
                           <p className="text-xs text-zinc-500 leading-relaxed italic">
                              "Smart generation uses randomized selection from approved assets. Ensure subject blueprints match official recruitment board notifications."
                           </p>
                        </div>
                     </div>
                  </div>
               </TabsContent>

               <TabsContent value="manual">
                  <div className="space-y-8">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-900/50 p-8 rounded-[40px] border border-white/5">
                        <div className="flex items-center gap-4 flex-1">
                           <div className="relative flex-1 max-w-md">
                              <Search className="absolute left-4 top-3 h-4 w-4 text-zinc-500" />
                              <Input 
                                placeholder="Search bank..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-black/40 border-white/5 pl-12 rounded-xl"
                              />
                           </div>
                           <Select value={filterSubject} onValueChange={setFilterSubject}>
                              <SelectTrigger className="w-48 bg-black/40 border-white/5 rounded-xl">
                                 <SelectValue placeholder="Subject" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 text-white">
                                 <SelectItem value="All">All Subjects</SelectItem>
                                 {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="flex items-center gap-4">
                           <Badge variant="outline" className="h-12 px-6 rounded-xl border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest">
                             {selectedIds.size} Selected
                           </Badge>
                           <Button 
                             onClick={handleManualDeploy}
                             disabled={loading || selectedIds.size === 0}
                             className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black text-xs uppercase"
                           >Deploy Custom Mock</Button>
                        </div>
                     </div>

                     <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] overflow-hidden">
                        <table className="w-full text-left">
                           <thead className="bg-zinc-900/60 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              <tr>
                                 <th className="p-6 px-10">Select</th>
                                 <th className="p-6">Classification</th>
                                 <th className="p-6">Question Preview</th>
                                 <th className="p-6">Metadata</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {bankQuestions.filter(q => q.question_en.toLowerCase().includes(search.toLowerCase())).map(q => (
                                <tr key={q.id} className="hover:bg-white/[0.01] transition-colors group">
                                   <td className="p-6 px-10">
                                      <button 
                                        onClick={() => toggleSelect(q.id)}
                                        className={cn(
                                          "w-6 h-6 rounded-lg border transition-all flex items-center justify-center",
                                          selectedIds.has(q.id) ? "bg-primary border-primary" : "border-white/10"
                                        )}
                                      >
                                         {selectedIds.has(q.id) && <CheckCircle2 size={14} />}
                                      </button>
                                   </td>
                                   <td className="p-6">
                                      <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase">{q.subject}</Badge>
                                   </td>
                                   <td className="p-6">
                                      <p className="text-sm font-bold line-clamp-1">{q.question_en}</p>
                                      <p className="text-[10px] text-zinc-600 italic mt-1 line-clamp-1">{q.question_pa}</p>
                                   </td>
                                   <td className="p-6">
                                      <div className="flex gap-2">
                                         <Badge className="bg-zinc-800 text-zinc-500 text-[8px] font-black">{q.difficulty}</Badge>
                                         {q.pyq && <Badge className="bg-orange-500/10 text-orange-500 border-none text-[8px] font-black">PYQ</Badge>}
                                      </div>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </TabsContent>

               <TabsContent value="direct">
                  <div className="max-w-4xl mx-auto space-y-8">
                     <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                           <Zap size={200} />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-3xl font-black tracking-tighter uppercase">Direct Test Injector</h3>
                           <p className="text-zinc-500 font-medium">Paste raw MCQs from ChatGPT or Word docs. Our engine handles the bank injection and mock creation in one pass.</p>
                        </div>

                        <div className="space-y-4">
                           <Textarea 
                             placeholder="Paste your questions here... 
Example:
1. What is...?
A. Option 1
B. Option 2..."
                             value={pastedContent}
                             onChange={(e) => setPastedContent(e.target.value)}
                             className="min-h-[400px] bg-black/40 border-white/5 rounded-[32px] p-8 text-sm leading-relaxed"
                           />
                        </div>

                        <Button 
                           onClick={handleDirectBuild}
                           disabled={loading || !pastedContent.trim()}
                           className="w-full h-20 rounded-[32px] bg-emerald-600 hover:bg-emerald-700 text-2xl font-black shadow-2xl transition-transform active:scale-95"
                        >
                           {loading ? <Loader2 className="animate-spin" /> : "Deploy Express Mock"}
                        </Button>
                     </Card>
                  </div>
               </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}

