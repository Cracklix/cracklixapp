
"use client";

import { useState, useEffect, use } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  ArrowLeft, 
  Settings, 
  Database, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Loader2, 
  Save, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  FileText,
  Clock,
  Filter,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getMockDetails, 
  updateMock, 
  getMockQuestions, 
  linkQuestionToMock, 
  unlinkQuestionFromMock,
  getMockAnalytics
} from "@/services/mocks";
import { getRecentQuestions } from "@/services/questions";
import { MockTest, Question } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * PRODUCTION MOCK COMMAND CENTER
 * Fully functional editor for simulations, linked questions, and access policies.
 */
export default function MockEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const mockId = unwrappedParams.id;
  const { toast } = useToast();
  const router = useRouter();

  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bank, setBank] = useState<Question[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [bankSubject, setBankSubject] = useState("All");

  useEffect(() => {
    async function load() {
      if (!mockId) return;
      try {
        setLoading(true);
        const [m, q, a] = await Promise.all([
          getMockDetails(mockId),
          getMockQuestions(mockId),
          getMockAnalytics(mockId)
        ]);
        setMock(m);
        setQuestions(q);
        setAnalytics(a);
      } catch (e) {
        toast({ title: "Portal Busy", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
    loadBank();
  }, [mockId, toast]);

  async function loadBank() {
    setBankLoading(true);
    try {
      const data = await getRecentQuestions(500);
      setBank(data);
    } finally {
      setBankLoading(false);
    }
  }

  async function handleUpdateMetadata() {
    if (!mock) return;
    setSaving(true);
    try {
      await updateMock(mockId, mock);
      toast({ title: "Registry Synced", description: "Metadata updated successfully." });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleQuestion(q: Question) {
    if (!mock) return;
    const isLinked = questions.find(item => item.id === q.id);
    
    try {
      if (isLinked) {
        await unlinkQuestionFromMock(mockId, q.id);
        setQuestions(prev => prev.filter(item => item.id !== q.id));
        toast({ title: "Artifact Unlinked" });
      } else {
        await linkQuestionToMock(mockId, q.id);
        setQuestions(prev => [...prev, q]);
        toast({ title: "Artifact Linked" });
      }
    } catch (e) {
      toast({ title: "Sync Error", variant: "destructive" });
    }
  }

  const filteredBank = bank.filter(q => {
    const matchesSearch = q.question_en.toLowerCase().includes(bankSearch.toLowerCase()) || 
                          q.id.toLowerCase().includes(bankSearch.toLowerCase());
    const matchesSubject = bankSubject === "All" || q.subject === bankSubject;
    return matchesSearch && matchesSubject;
  });

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-12 h-12 text-primary animate-spin" />
       <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Establishing Command Node...</p>
    </div>
  );

  if (!mock) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
       <ArrowLeft className="w-12 h-12 text-zinc-800" />
       <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Artifact Signal Lost</p>
       <Button onClick={() => router.push('/admin/mocks')} className="rounded-xl font-bold bg-zinc-900 border border-white/5">Return to Factory</Button>
    </div>
  );

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-zinc-950/80 backdrop-blur-xl">
             <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={() => router.push('/admin/mocks')}>
                   <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                   <div className="flex items-center gap-3">
                      <h1 className="text-xl font-black tracking-tight uppercase">{mock.title}</h1>
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-3 py-1">{mock.status}</Badge>
                   </div>
                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Registry: {mock.exam} • {mock.accessType}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Button onClick={handleUpdateMetadata} disabled={saving} className="h-12 rounded-[18px] bg-primary hover:bg-primary/90 px-10 font-black text-[11px] uppercase tracking-widest shadow-xl blue-glow">
                   {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                   Synchronize Registry
                </Button>
             </div>
          </header>

          <div className="flex-1 overflow-hidden flex">
             <Tabs defaultValue="metadata" className="flex-1 flex overflow-hidden">
                <aside className="w-72 border-r border-white/5 p-6 flex flex-col gap-2 shrink-0 bg-zinc-950/40">
                   <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] px-4 mb-6">Operations Matrix</p>
                   <TabsList className="flex flex-col bg-transparent h-auto items-stretch gap-2">
                      <TabsTrigger value="metadata" className="justify-start gap-4 h-14 rounded-2xl px-6 font-bold text-zinc-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                         <Settings size={18} /> Basic Calibration
                      </TabsTrigger>
                      <TabsTrigger value="questions" className="justify-start gap-4 h-14 rounded-2xl px-6 font-bold text-zinc-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                         <Database size={18} /> Artifact Linking
                      </TabsTrigger>
                      <TabsTrigger value="access" className="justify-start gap-4 h-14 rounded-2xl px-6 font-bold text-zinc-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                         <ShieldCheck size={18} /> Access Policy
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="justify-start gap-4 h-14 rounded-2xl px-6 font-bold text-zinc-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                         <BarChart3 size={18} /> Performance Audit
                      </TabsTrigger>
                   </TabsList>
                </aside>

                <div className="flex-1 overflow-y-auto no-scrollbar p-12 bg-[#050816]">
                   <div className="max-w-5xl mx-auto">
                      <TabsContent value="metadata" className="space-y-12 mt-0 animate-in fade-in slide-in-from-bottom-4">
                         <div className="space-y-1">
                            <h3 className="text-3xl font-black tracking-tighter uppercase">Identity & Duration</h3>
                            <p className="text-zinc-500 text-sm font-medium">Define the core blueprint for this CBT session.</p>
                         </div>

                         <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Mock Identity</label>
                               <Input 
                                 value={mock.title} 
                                 onChange={e => setMock({...mock, title: e.target.value})}
                                 className="h-14 bg-zinc-900 border-white/5 rounded-2xl px-6 font-bold"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Recruitment Board</label>
                               <Input 
                                 value={mock.exam} 
                                 onChange={e => setMock({...mock, exam: e.target.value})}
                                 className="h-14 bg-zinc-900 border-white/5 rounded-2xl px-6 font-bold"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Session Duration (Mins)</label>
                               <Input 
                                 type="number"
                                 value={mock.duration} 
                                 onChange={e => setMock({...mock, duration: parseInt(e.target.value)})}
                                 className="h-14 bg-zinc-900 border-white/5 rounded-2xl px-6 font-black text-2xl text-primary"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Negative Penalty Score</label>
                               <Input 
                                 type="number"
                                 step="0.01"
                                 value={mock.negativeMarking} 
                                 onChange={e => setMock({...mock, negativeMarking: parseFloat(e.target.value)})}
                                 className="h-14 bg-zinc-900 border-white/5 rounded-2xl px-6 font-black text-2xl text-red-500"
                               />
                            </div>
                         </div>
                      </TabsContent>

                      <TabsContent value="questions" className="space-y-12 mt-0 animate-in fade-in slide-in-from-bottom-4">
                         <div className="flex justify-between items-end">
                            <div className="space-y-1">
                               <h3 className="text-3xl font-black tracking-tighter uppercase">Payload Management</h3>
                               <p className="text-zinc-500 text-sm font-medium">{questions.length} Artifacts currently linked to this CBT engine.</p>
                            </div>
                            <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase px-6 py-2 rounded-xl shadow-xl">
                               Payload: {questions.length} Artifacts
                            </Badge>
                         </div>

                         <div className="grid lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-7 space-y-4">
                               {questions.length > 0 ? (
                                 questions.map((q, i) => (
                                   <Card key={q.id} className="rounded-3xl bg-zinc-900/40 border-white/5 p-6 group hover:border-white/10 transition-all">
                                      <div className="flex items-center justify-between">
                                         <div className="flex gap-5">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-[10px] text-zinc-500 shrink-0">
                                               {i + 1}
                                            </div>
                                            <div>
                                               <p className="text-sm font-bold text-white line-clamp-1">{q.question_en}</p>
                                               <div className="flex items-center gap-3 mt-1.5">
                                                  <Badge variant="outline" className="text-[7px] border-white/10 text-zinc-600 font-black uppercase px-2">{q.subject}</Badge>
                                                  <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">{q.difficulty}</span>
                                               </div>
                                            </div>
                                         </div>
                                         <Button variant="ghost" size="icon" className="rounded-xl text-zinc-700 hover:text-red-500 hover:bg-red-500/10" onClick={() => toggleQuestion(q)}>
                                            <Trash2 size={18} />
                                         </Button>
                                      </div>
                                   </Card>
                                 ))
                               ) : (
                                 <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-zinc-950/20">
                                    <FileText className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                                    <p className="text-zinc-700 font-bold uppercase text-[10px] tracking-[0.3em]">Payload Empty</p>
                                    <p className="text-zinc-600 mt-2 text-xs italic">Use the library to link artifacts.</p>
                                 </div>
                               )}
                            </div>

                            <div className="lg:col-span-5">
                               <div className="bg-zinc-900/60 rounded-[40px] border border-white/5 overflow-hidden flex flex-col h-[650px] sticky top-12">
                                  <div className="p-8 border-b border-white/5 space-y-6">
                                     <div className="relative">
                                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                                        <Input 
                                          placeholder="Find artifacts..." 
                                          value={bankSearch}
                                          onChange={e => setBankSearch(e.target.value)}
                                          className="pl-12 h-12 bg-black/40 border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                                        />
                                     </div>
                                     <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {["All", "Punjab GK", "Quant", "Reasoning", "Computer"].map(s => (
                                          <button 
                                            key={s} 
                                            onClick={() => setBankSubject(s)}
                                            className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase border transition-all whitespace-nowrap", bankSubject === s ? "bg-primary text-white border-primary" : "border-white/5 text-zinc-600 hover:text-zinc-400")}
                                          >
                                            {s}
                                          </button>
                                        ))}
                                     </div>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                                     {bankLoading ? (
                                       <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                                     ) : filteredBank.map(q => {
                                       const isUsed = questions.find(item => item.id === q.id);
                                       return (
                                         <div 
                                           key={q.id} 
                                           className={cn(
                                             "p-5 rounded-2xl border transition-all cursor-pointer group",
                                             isUsed ? "bg-primary/10 border-primary/20" : "bg-black/30 border-white/5 hover:border-white/20"
                                           )}
                                           onClick={() => toggleQuestion(q)}
                                         >
                                            <div className="flex items-center justify-between mb-2">
                                               <Badge variant="outline" className="text-[7px] font-black uppercase border-white/10 text-zinc-600 px-2">{q.subject}</Badge>
                                               {isUsed ? <CheckCircle2 size={12} className="text-primary" /> : <Plus size={12} className="text-zinc-800 group-hover:text-white" />}
                                            </div>
                                            <p className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-100 line-clamp-2 leading-relaxed">{q.question_en}</p>
                                         </div>
                                       );
                                     })}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </TabsContent>

                      <TabsContent value="access" className="space-y-12 mt-0 animate-in fade-in slide-in-from-bottom-4">
                         <div className="space-y-1">
                            <h3 className="text-3xl font-black tracking-tighter uppercase">Access Gating</h3>
                            <p className="text-zinc-500 text-sm font-medium">Manage monetization rules and subscription-level visibility.</p>
                         </div>

                         <div className="grid md:grid-cols-2 gap-10">
                            <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 space-y-10">
                               <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Access Tier Protocol</label>
                                  <Select value={mock.accessType} onValueChange={(v: any) => setMock({...mock, accessType: v})}>
                                     <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] px-6">
                                        <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent className="bg-zinc-950 text-white border-white/10">
                                        <SelectItem value="free">Free Hub (Universal)</SelectItem>
                                        <SelectItem value="pass_plus">PASS+ Membership Active</SelectItem>
                                        <SelectItem value="premium">Elite Premium (Ala-carte)</SelectItem>
                                     </SelectContent>
                                  </Select>
                               </div>

                               <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Registry Signal</label>
                                  <Select value={mock.status} onValueChange={(v: any) => setMock({...mock, status: v})}>
                                     <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] px-6">
                                        <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent className="bg-zinc-950 text-white border-white/10">
                                        <SelectItem value="draft">Internal Draft Only</SelectItem>
                                        <SelectItem value="published">Production Release</SelectItem>
                                        <SelectItem value="archived">Retired Artifact</SelectItem>
                                     </SelectContent>
                                  </Select>
                               </div>
                            </Card>

                            <div className="p-10 rounded-[48px] bg-primary/5 border border-primary/20 space-y-8">
                               <h4 className="font-black text-sm uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                  <ShieldCheck size={20} /> Entitlement Logic
                               </h4>
                               <ul className="space-y-5 text-xs text-zinc-400 font-medium leading-relaxed">
                                  <li className="flex gap-4 items-start">
                                     <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                     <span>PASS+ aspirants bypass gating for all "Production" simulations.</span>
                                  </li>
                                  <li className="flex gap-4 items-start">
                                     <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                     <span>Mocks marked "Live" are pinned to the student dashboard heartbeat.</span>
                                  </li>
                                  <li className="flex gap-4 items-start">
                                     <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                     <span>Negative marking is mathematically enforced by the CBT Heart.</span>
                                  </li>
                               </ul>
                            </div>
                         </div>
                      </TabsContent>

                      <TabsContent value="analytics" className="space-y-12 mt-0 animate-in fade-in slide-in-from-bottom-4">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-10 flex flex-col justify-between h-48 group hover:bg-zinc-900 transition-all">
                               <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Total Engagements</p>
                               <h2 className="text-6xl font-black text-white group-hover:text-primary transition-colors">{analytics?.totalAttempts || 0}</h2>
                            </Card>
                            <Card className="rounded-[40px] bg-emerald-500/10 border-emerald-500/20 p-10 flex flex-col justify-between h-48">
                               <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.3em]">Mean Accuracy</p>
                               <h2 className="text-6xl font-black text-white">{analytics?.avgAccuracy || 0}<span className="text-2xl text-emerald-500">%</span></h2>
                            </Card>
                            <Card className="rounded-[40px] bg-primary/10 border-primary/20 p-10 flex flex-col justify-between h-48 relative overflow-hidden">
                               <div className="absolute top-0 right-0 p-6 opacity-5">
                                  <Zap size={100} />
                               </div>
                               <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">High Score</p>
                               <h2 className="text-6xl font-black text-white">{analytics?.highScore || 0}</h2>
                            </Card>
                         </div>
                      </TabsContent>
                   </div>
                </div>
             </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}

