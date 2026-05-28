"use client";

import { useState, useEffect, use } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  ArrowLeft, Settings, Database, ShieldCheck, Zap, 
  BarChart3, Loader2, Save, Plus, Search, Trash2, 
  Eye, MoreVertical, Copy, Lock, Unlock, Sparkles,
  MousePointer2, Layers, ChevronRight, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getMockDetails, updateMock, subscribeMockQuestions,
  linkGlobalToMock, deleteMockQuestion, updateMockQuestion,
  addQuestionToMock, autoLinkFromBank
} from "@/services/mocks";
import { getRecentQuestions } from "@/services/questions";
import { MockTest, Question, SUBJECTS } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/**
 * HIGH-DENSITY SIMULATION CALIBRATION CENTER
 * Optimized for Testbook-grade payload management.
 */
export default function MockEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const mockId = unwrappedParams.id;
  const { toast } = useToast();
  const router = useRouter();

  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bank, setBank] = useState<Question[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [activeTab, setActiveTab] = useState("questions");
  const [autoFilling, setAutoFilling] = useState(false);
  
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (!mockId) return;
    
    async function loadMock() {
      try {
        const data = await getMockDetails(mockId);
        setMock(data);
      } catch (e) {
        toast({ title: "Fetch Protocol Failed", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    loadMock();
    const unsubQs = subscribeMockQuestions(mockId, setQuestions);
    loadBank();

    return () => unsubQs();
  }, [mockId, toast]);

  async function loadBank() {
    setBankLoading(true);
    try {
      const data = await getRecentQuestions(50);
      setBank(data);
    } finally {
      setBankLoading(false);
    }
  }

  const handleUpdateMetadata = async () => {
    if (!mock) return;
    setSaving(true);
    try {
      await updateMock(mockId, mock);
      toast({ title: "Signal Propagated", description: "Simulation metadata synchronized." });
    } finally {
      setSaving(false);
    }
  };

  const handleLinkFromBank = async (qId: string) => {
    try {
      await linkGlobalToMock(mockId, qId);
      toast({ title: "Artifact Linked" });
    } catch (e: any) {
      toast({ title: "Link Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleAutoFill = async () => {
    if (!mock) return;
    setAutoFilling(true);
    try {
      const count = await autoLinkFromBank(mockId, mock.exam);
      if (count > 0) {
        toast({ title: "Simulation Synthesized", description: `${count} relevant artifacts ported from bank.` });
      } else {
        toast({ title: "Bank Sector Quiet", description: "No specific artifacts found for this board.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Synthesis Failed", description: e.message, variant: "destructive" });
    } finally {
      setAutoFilling(false);
    }
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion({ ...q });
    setEditorOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    setSaving(true);
    try {
      if (editingQuestion.id) {
        await updateMockQuestion(mockId, editingQuestion.id, editingQuestion);
      } else {
        await addQuestionToMock(mockId, editingQuestion);
      }
      setEditorOpen(false);
      toast({ title: "Artifact Calibrated" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen bg-black flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary w-10 h-10" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Accessing Simulation Node</p></div>;
  if (!mock) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500 font-bold">Simulation Artifact Missing</div>;

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white overflow-hidden">
        {/* Panel 1: Slim Tactical Navigation */}
        <aside className="w-60 border-r border-white/5 flex flex-col bg-zinc-950 shrink-0">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/5" onClick={() => router.push('/admin/mocks')}>
                <ArrowLeft size={16} />
             </Button>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Calibrator</span>
          </div>
          <div className="p-3 space-y-1 flex-1">
             {[
               { id: 'questions', label: 'Artifacts', icon: Database },
               { id: 'metadata', label: 'Calibration', icon: Settings },
               { id: 'analytics', label: 'Performance', icon: BarChart3 },
               { id: 'settings', label: 'Access Tier', icon: ShieldCheck },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-tight",
                   activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-500 hover:bg-white/5"
                 )}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>
          <div className="p-5 border-t border-white/5">
             <Button onClick={handleUpdateMetadata} disabled={saving} className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest blue-glow">
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Commit Sync"}
             </Button>
          </div>
        </aside>

        {/* Panel 2: Major Artifact Workspace */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050816] flex flex-col">
          <header className="h-16 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
             <div className="flex items-center gap-4">
                <h1 className="text-sm font-black uppercase tracking-[0.2em] truncate max-w-sm">{mock.title}</h1>
                <Badge className="bg-primary/20 text-primary border-none text-[8px] px-3 py-0.5 uppercase tracking-widest">{mock.status}</Badge>
             </div>
             <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">
                   <Eye size={14} className="mr-2" /> Live Preview
                </Button>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <Button onClick={() => handleEditQuestion({} as any)} className="bg-primary h-10 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest blue-glow shadow-xl">
                   <Plus size={14} className="mr-2" /> Inject Artifact
                </Button>
             </div>
          </header>

          <div className="p-10 flex-1">
             <div className="max-w-6xl mx-auto space-y-8">
                {activeTab === 'questions' && (
                  <div className="grid gap-6">
                    {questions.length > 0 ? questions.map((q, idx) => (
                      <Card key={q.id} className="rounded-3xl bg-zinc-900/40 border-white/5 overflow-hidden hover:border-blue-500/20 transition-all group">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-zinc-600 w-6">#{idx + 1}</span>
                              <Badge variant="outline" className="border-none text-[8px] font-black uppercase text-zinc-500 bg-zinc-800/50 px-3 py-1">{q.subject}</Badge>
                              <Badge variant="outline" className={cn("border-none text-[8px] font-black uppercase px-3 py-1", q.difficulty === 'hard' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                                 {q.difficulty}
                              </Badge>
                           </div>
                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-600 hover:text-white" onClick={() => handleEditQuestion(q)}>
                                 <Settings size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-600 hover:text-red-500" onClick={() => deleteMockQuestion(mockId, q.id)}>
                                 <Trash2 size={14} />
                              </Button>
                           </div>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-12">
                           <div className="space-y-4">
                              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Primary Narrative (EN)
                              </p>
                              <p className="font-bold text-lg leading-relaxed text-zinc-100 line-clamp-4">{q.question_en}</p>
                           </div>
                           <div className="space-y-4 border-l border-white/5 pl-12">
                              <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Secondary Signal (RAAVI)
                              </p>
                              <p className="font-medium text-lg leading-relaxed text-zinc-400 line-clamp-4 italic">{q.question_pa || "No artifact detected."}</p>
                           </div>
                        </div>
                      </Card>
                    )) : (
                      <div className="py-48 text-center border-2 border-dashed border-white/5 rounded-[64px] bg-zinc-950/20 space-y-10">
                         <div className="w-24 h-24 rounded-[40px] bg-zinc-900 mx-auto flex items-center justify-center shadow-2xl relative">
                            <Database className="w-12 h-12 text-zinc-800" />
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                         </div>
                         <div className="space-y-3">
                           <h3 className="text-3xl font-black uppercase tracking-tighter">Payload Matrix Empty</h3>
                           <p className="text-zinc-600 text-[11px] font-black uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                              Bridge artifacts from the Atomic Bank or activate the AI synthesis engine to populate this simulation.
                           </p>
                         </div>
                         <Button 
                           onClick={handleAutoFill} 
                           disabled={autoFilling}
                           className="h-16 px-12 rounded-[28px] bg-primary hover:bg-primary/90 font-black text-base uppercase tracking-widest blue-glow shadow-2xl transition-transform active:scale-95"
                         >
                            {autoFilling ? <Loader2 className="animate-spin mr-3 shrink-0" /> : <Sparkles className="mr-3 shrink-0" />}
                            Synthesize Simulation
                         </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 space-y-12 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Simulation Identity</label>
                          <Input value={mock.title} onChange={e => setMock({...mock, title: e.target.value})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-lg" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Recruitment Board</label>
                          <Input value={mock.exam} onChange={e => setMock({...mock, exam: e.target.value})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-lg" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Duration Cluster (Min)</label>
                          <Input type="number" value={mock.duration} onChange={e => setMock({...mock, duration: parseInt(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-3xl text-primary" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Penalty Coefficient</label>
                          <Input type="number" step="0.01" value={mock.negativeMarking} onChange={e => setMock({...mock, negativeMarking: parseFloat(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-3xl text-red-500" />
                       </div>
                    </div>
                  </Card>
                )}
             </div>
          </div>
        </main>

        {/* Panel 3: Slim Utility Panel (Atomic Bank) */}
        <aside className="w-80 border-l border-white/5 bg-zinc-950 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5 space-y-6">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600">Atomic Bank</span>
                <Badge className="bg-emerald-600/10 text-emerald-500 text-[8px] font-black px-3 py-1">SYNCED</Badge>
             </div>
             <div className="relative">
                <Search size={14} className="absolute left-4 top-4 text-zinc-600" />
                <Input 
                  placeholder="Scan globally..." 
                  value={bankSearch}
                  onChange={e => setBankSearch(e.target.value)}
                  className="pl-11 h-12 bg-black/40 border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest" 
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
             {bankLoading ? (
               <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-800" size={20} /></div>
             ) : bank.map(bq => (
               <div key={bq.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group" onClick={() => handleLinkFromBank(bq.id)}>
                  <div className="flex justify-between items-start mb-2">
                     <Badge variant="outline" className="text-[7px] border-white/5 text-zinc-600 uppercase px-2 py-0.5">{bq.subject}</Badge>
                     <Plus size={12} className="text-zinc-700 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 line-clamp-3 leading-relaxed group-hover:text-zinc-100">{bq.question_en}</p>
               </div>
             ))}
          </div>
          <div className="p-6 border-t border-white/5 space-y-6">
             <Button 
               variant="outline" 
               className="w-full h-12 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest rounded-xl"
               onClick={handleAutoFill}
               disabled={autoFilling}
             >
                <Layers size={14} className="mr-2" /> Link Relevant
             </Button>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-600 tracking-widest">
                   <span>Payload Load Factor</span>
                   <span className="text-white">{questions.length} / {mock.totalQuestions}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${Math.min((questions.length / (mock.totalQuestions || 1)) * 100, 100)}%` }} />
                </div>
             </div>
          </div>
        </aside>

        {/* Artifact Calibration Modal */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl p-10 rounded-[40px] shadow-2xl">
             <DialogHeader className="mb-10">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl blue-glow"><Zap size={20} /></div>
                   Artifact Calibration Terminal
                </DialogTitle>
             </DialogHeader>

             {editingQuestion && (
               <div className="space-y-10 max-h-[65vh] overflow-y-auto pr-6 no-scrollbar">
                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Primary Narrative (EN)</label>
                        <Textarea 
                          value={editingQuestion.question_en} 
                          onChange={e => setEditingQuestion({...editingQuestion, question_en: e.target.value})}
                          className="min-h-[140px] bg-white/[0.03] border-white/10 rounded-2xl p-6 text-sm leading-relaxed"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Secondary Signal (RAAVI)</label>
                        <Textarea 
                          value={editingQuestion.question_pa} 
                          onChange={e => setEditingQuestion({...editingQuestion, question_pa: e.target.value})}
                          className="min-h-[140px] bg-white/[0.03] border-white/10 rounded-2xl p-6 text-sm leading-relaxed"
                        />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Response Matrix</label>
                        <div className="grid gap-3">
                           {[0,1,2,3].map(i => (
                             <div key={i} className="relative">
                                <span className="absolute left-4 top-3.5 text-[10px] font-black text-zinc-700">{String.fromCharCode(65+i)}</span>
                                <Input 
                                  value={editingQuestion.options_en?.[i] || ''} 
                                  onChange={e => {
                                    const opts = [...(editingQuestion.options_en || ['', '', '', ''])];
                                    opts[i] = e.target.value;
                                    setEditingQuestion({...editingQuestion, options_en: opts});
                                  }}
                                  className="bg-white/[0.03] border-white/10 rounded-xl h-11 pl-10 text-xs font-medium"
                                  placeholder="Define terminal payload..."
                                />
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] px-2">Correct Identity Signal</label>
                           <Input 
                             value={editingQuestion.correctAnswer} 
                             onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                             className="bg-emerald-500/5 border-emerald-500/20 rounded-xl h-12 font-black text-emerald-500 text-sm px-6"
                             placeholder="Exact English match required"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-zinc-600 px-2">Classification</label>
                              <Select value={editingQuestion.subject} onValueChange={v => setEditingQuestion({...editingQuestion, subject: v as any})}>
                                 <SelectTrigger className="h-11 bg-white/[0.03] border-white/10 text-xs font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                 <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-zinc-600 px-2">Complexity</label>
                              <Select value={editingQuestion.difficulty} onValueChange={v => setEditingQuestion({...editingQuestion, difficulty: v as any})}>
                                 <SelectTrigger className="h-11 bg-white/[0.03] border-white/10 text-xs font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                 <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             <DialogFooter className="mt-12 border-t border-white/5 pt-8">
                <Button variant="ghost" onClick={() => setEditorOpen(false)} className="rounded-xl h-14 px-8 font-bold text-zinc-500 text-[11px] uppercase tracking-widest">Discard Logic</Button>
                <Button onClick={handleSaveQuestion} disabled={saving} className="rounded-2xl h-14 px-12 bg-primary hover:bg-primary/90 font-black uppercase text-[11px] tracking-widest blue-glow shadow-2xl ml-4">
                   {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-3 w-5 h-5" />}
                   Sync to Simulation
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtect>
  );
}
