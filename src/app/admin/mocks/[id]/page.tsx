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
  Clock
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
      const data = await getRecentQuestions(200);
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
      toast({ title: "Registry Synced" });
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

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-12 h-12 text-primary animate-spin" />
       <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Decrypting Editor Node...</p>
    </div>
  );

  if (!mock) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
       <ArrowLeft className="w-12 h-12 text-zinc-800" />
       <p className="text-zinc-600 font-bold">Artifact Not Found</p>
       <Button onClick={() => router.push('/admin/mocks')}>Back to Registry</Button>
    </div>
  );

  const filteredBank = bank.filter(q => 
    q.question_en.toLowerCase().includes(bankSearch.toLowerCase()) ||
    q.subject.toLowerCase().includes(bankSearch.toLowerCase())
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
                      <h1 className="text-xl font-black tracking-tight">{mock.title}</h1>
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">{mock.status}</Badge>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Button onClick={handleUpdateMetadata} disabled={saving} className="h-10 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black text-[10px] uppercase tracking-widest shadow-xl blue-glow">
                   {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                   Sync Metadata
                </Button>
             </div>
          </header>

          <div className="flex-1 overflow-hidden flex">
             <Tabs defaultValue="metadata" className="flex-1 flex overflow-hidden">
                <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-2 shrink-0 bg-zinc-950/40">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-4 mb-4">Command Map</p>
                   <TabsList className="flex flex-col bg-transparent h-auto items-stretch gap-1.5">
                      <TabsTrigger value="metadata" className="justify-start gap-3 h-11 rounded-xl px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                         <Settings size={14} /> Basic Specs
                      </TabsTrigger>
                      <TabsTrigger value="questions" className="justify-start gap-3 h-11 rounded-xl px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                         <Database size={14} /> Question Bank
                      </TabsTrigger>
                      <TabsTrigger value="access" className="justify-start gap-3 h-11 rounded-xl px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                         <ShieldCheck size={14} /> Access Policy
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="justify-start gap-3 h-11 rounded-xl px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                         <BarChart3 size={14} /> Live Metrics
                      </TabsTrigger>
                   </TabsList>
                </aside>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10 bg-[#050816]">
                   <div className="max-w-5xl mx-auto">
                      <TabsContent value="metadata" className="space-y-10 mt-0">
                         <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tight">Identity & Timing</h3>
                            <p className="text-zinc-500 text-xs font-medium">Define the core blueprint for this CBT session.</p>
                         </div>

                         <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Mock Identity</label>
                               <Input 
                                 value={mock.title} 
                                 onChange={e => setMock({...mock, title: e.target.value})}
                                 className="h-12 bg-zinc-900 border-white/5 rounded-xl px-4 font-bold"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Exam Board</label>
                               <Input 
                                 value={mock.exam} 
                                 onChange={e => setMock({...mock, exam: e.target.value})}
                                 className="h-12 bg-zinc-900 border-white/5 rounded-xl px-4 font-bold"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Duration (Mins)</label>
                               <Input 
                                 type="number"
                                 value={mock.duration} 
                                 onChange={e => setMock({...mock, duration: parseInt(e.target.value)})}
                                 className="h-12 bg-zinc-900 border-white/5 rounded-xl px-4 font-black text-lg"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Negative Penalty</label>
                               <Input 
                                 type="number"
                                 step="0.01"
                                 value={mock.negativeMarking} 
                                 onChange={e => setMock({...mock, negativeMarking: parseFloat(e.target.value)})}
                                 className="h-12 bg-zinc-900 border-white/5 rounded-xl px-4 font-black text-lg text-red-500"
                               />
                            </div>
                         </div>
                      </TabsContent>

                      <TabsContent value="questions" className="space-y-10 mt-0">
                         <div className="flex justify-between items-end">
                            <div className="space-y-1">
                               <h3 className="text-2xl font-black tracking-tight">Artifact Payload</h3>
                               <p className="text-zinc-500 text-xs font-medium">{questions.length} Unique assets linked to this logic.</p>
                            </div>
                            <Badge className="bg-emerald-600 text-white font-black text-[9px] uppercase px-4 py-1.5 rounded-lg">
                               Linked: {questions.length} / {mock.totalQuestions}
                            </Badge>
                         </div>

                         <div className="grid lg:grid-cols-12 gap-10">
                            {/* Linked */}
                            <div className="lg:col-span-7 space-y-4">
                               {questions.length > 0 ? (
                                 questions.map((q, i) => (
                                   <Card key={q.id} className="rounded-2xl bg-zinc-900/50 border-white/5 p-5 group hover:border-white/10 transition-all">
                                      <div className="flex items-center justify-between">
                                         <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-[10px] text-zinc-500 shrink-0">
                                               {i + 1}
                                            </div>
                                            <div>
                                               <p className="text-xs font-bold text-white line-clamp-1">{q.question_en}</p>
                                               <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1">{q.subject} • {q.difficulty}</p>
                                            </div>
                                         </div>
                                         <Button variant="ghost" size="icon" className="rounded-xl text-zinc-700 hover:text-red-500" onClick={() => toggleQuestion(q)}>
                                            <Trash2 size={14} />
                                         </Button>
                                      </div>
                                   </Card>
                                 ))
                               ) : (
                                 <div className="py-20 text-center rounded-3xl border-2 border-dashed border-white/5 bg-zinc-950/20">
                                    <FileText className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                    <p className="text-zinc-600 italic text-xs">No artifacts linked. Import from bank.</p>
                                 </div>
                               )}
                            </div>

                            {/* Bank */}
                            <div className="lg:col-span-5">
                               <div className="bg-zinc-900 rounded-[32px] border border-white/5 overflow-hidden flex flex-col h-[500px]">
                                  <div className="p-6 border-b border-white/5">
                                     <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                                        <Input 
                                          placeholder="Find artifacts..." 
                                          value={bankSearch}
                                          onChange={e => setBankSearch(e.target.value)}
                                          className="pl-9 h-10 bg-black/40 border-white/5 rounded-xl text-[10px] font-bold uppercase"
                                        />
                                     </div>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                                     {bankLoading ? (
                                       <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                                     ) : filteredBank.map(q => {
                                       const isUsed = questions.find(item => item.id === q.id);
                                       return (
                                         <div 
                                           key={q.id} 
                                           className={cn(
                                             "p-3.5 rounded-xl border transition-all cursor-pointer group",
                                             isUsed ? "bg-primary/10 border-primary/20" : "bg-black/20 border-white/5 hover:border-white/20"
                                           )}
                                           onClick={() => toggleQuestion(q)}
                                         >
                                            <div className="flex items-center justify-between mb-1.5">
                                               <Badge variant="outline" className="text-[7px] font-black uppercase border-white/10 text-zinc-600">{q.subject}</Badge>
                                               {isUsed ? <CheckCircle2 size={10} className="text-primary" /> : <Plus size={10} className="text-zinc-800 group-hover:text-white" />}
                                            </div>
                                            <p className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-100 line-clamp-2 leading-relaxed">{q.question_en}</p>
                                         </div>
                                       );
                                     })}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </TabsContent>

                      <TabsContent value="access" className="space-y-10 mt-0">
                         <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tight">Access tier policy</h3>
                            <p className="text-zinc-500 text-xs font-medium">Manage subscription gating and visibility rules.</p>
                         </div>

                         <div className="grid md:grid-cols-2 gap-8">
                            <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-8 space-y-6">
                               <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Access Protocol</label>
                                  <Select value={mock.accessType} onValueChange={(v: any) => setMock({...mock, accessType: v})}>
                                     <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold text-xs uppercase tracking-widest">
                                        <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent className="bg-zinc-950 text-white border-white/10">
                                        <SelectItem value="free">Free Hub Access</SelectItem>
                                        <SelectItem value="pass_plus">PASS+ Active Required</SelectItem>
                                        <SelectItem value="premium">Elite Premium Tier</SelectItem>
                                     </SelectContent>
                                  </Select>
                               </div>

                               <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Status Switch</label>
                                  <Select value={mock.status} onValueChange={(v: any) => setMock({...mock, status: v})}>
                                     <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold text-xs uppercase tracking-widest">
                                        <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent className="bg-zinc-950 text-white border-white/10">
                                        <SelectItem value="draft">Draft (Admin Only)</SelectItem>
                                        <SelectItem value="published">Production (Student)</SelectItem>
                                        <SelectItem value="archived">Retired Artifact</SelectItem>
                                     </SelectContent>
                                  </Select>
                               </div>
                            </Card>

                            <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-6">
                               <h4 className="font-bold flex items-center gap-3 text-white text-sm uppercase tracking-widest">
                                  <Zap size={14} className="text-primary" /> System Logic
                               </h4>
                               <ul className="space-y-3 text-[11px] text-zinc-500 font-medium leading-relaxed">
                                  <li>• PASS+ users bypass all gating except "Premium".</li>
                                  <li>• Published mocks are indexed in the global arena.</li>
                                  <li>• Negative marking is enforced by the CBT heart.</li>
                               </ul>
                            </div>
                         </div>
                      </TabsContent>

                      <TabsContent value="analytics" className="space-y-10 mt-0">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8 flex flex-col justify-between h-40">
                               <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Total Attempts</p>
                               <h2 className="text-4xl font-black text-white">{analytics?.totalAttempts || 0}</h2>
                            </Card>
                            <Card className="rounded-[32px] bg-emerald-500/10 border-emerald-500/20 p-8 flex flex-col justify-between h-40">
                               <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Avg. Accuracy</p>
                               <h2 className="text-4xl font-black text-white">{analytics?.avgAccuracy || 0}%</h2>
                            </Card>
                            <Card className="rounded-[32px] bg-primary/10 border-primary/20 p-8 flex flex-col justify-between h-40">
                               <p className="text-[9px] font-black uppercase text-primary tracking-widest">Avg. Score</p>
                               <h2 className="text-4xl font-black text-white">{analytics?.avgScore || 0}</h2>
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
