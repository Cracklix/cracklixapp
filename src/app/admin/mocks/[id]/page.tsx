
"use client";

import { useState, useEffect, use } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  ArrowLeft, Settings, Database, ShieldCheck, Zap, 
  BarChart3, Loader2, Save, Plus, Search, Trash2, 
  Eye, MoreVertical, Copy, Lock, Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getMockDetails, updateMock, subscribeMockQuestions,
  linkGlobalToMock, deleteMockQuestion, updateMockQuestion,
  addQuestionToMock
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
 * HIGH-DENSITY MOCK COMMAND CENTER
 * Optimized for Testbook-grade artifact management.
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
      toast({ title: "Metadata Propagated" });
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

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!mock) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500 font-bold">Artifact Missing</div>;

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white overflow-hidden">
        {/* Panel 1: Slim Tactical Navigation */}
        <aside className="w-56 border-r border-white/5 flex flex-col bg-zinc-950 shrink-0">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => router.push('/admin/mocks')}>
                <ArrowLeft size={14} />
             </Button>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Sim Control</span>
          </div>
          <div className="p-2.5 space-y-1 flex-1">
             {[
               { id: 'questions', label: 'Payload', icon: Database },
               { id: 'metadata', label: 'Calibration', icon: Settings },
               { id: 'analytics', label: 'Metrics', icon: BarChart3 },
               { id: 'settings', label: 'Security', icon: ShieldCheck },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all font-bold text-[11px] uppercase tracking-tight",
                   activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-500 hover:bg-white/5"
                 )}
               >
                 <tab.icon size={15} />
                 {tab.label}
               </button>
             ))}
          </div>
          <div className="p-4 border-t border-white/5">
             <Button onClick={handleUpdateMetadata} disabled={saving} className="w-full h-10 bg-zinc-900 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest">
                {saving ? <Loader2 size={12} className="animate-spin" /> : "Commit Sync"}
             </Button>
          </div>
        </aside>

        {/* Panel 2: Major Artifact Workspace */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050816] flex flex-col">
          <header className="h-14 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl">
             <div className="flex items-center gap-3">
                <h1 className="text-xs font-black uppercase tracking-widest truncate max-w-xs">{mock.title}</h1>
                <Badge className="bg-primary/20 text-primary text-[8px] px-2">{mock.status}</Badge>
             </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                   <Eye size={12} className="mr-1.5" /> Preview
                </Button>
                <div className="h-3 w-px bg-white/10 mx-1" />
                <Button onClick={() => handleEditQuestion({} as any)} className="bg-primary h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest blue-glow">
                   <Plus size={12} className="mr-1.5" /> Inject Artifact
                </Button>
             </div>
          </header>

          <div className="p-8 flex-1">
             <div className="max-w-5xl mx-auto space-y-6">
                {activeTab === 'questions' && (
                  <div className="grid gap-4">
                    {questions.length > 0 ? questions.map((q, idx) => (
                      <Card key={q.id} className="rounded-2xl bg-zinc-900/40 border-white/5 overflow-hidden hover:border-blue-500/20 transition-all">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-zinc-600">{idx + 1}</span>
                              <Badge variant="outline" className="border-none text-[8px] font-black uppercase text-zinc-500 bg-zinc-800/50 px-2">{q.subject}</Badge>
                              <Badge variant="outline" className={cn("border-none text-[8px] font-black uppercase px-2", q.difficulty === 'hard' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                                 {q.difficulty}
                              </Badge>
                           </div>
                           <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-zinc-600 hover:text-white" onClick={() => handleEditQuestion(q)}>
                                 <Settings size={12} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-zinc-600 hover:text-red-500" onClick={() => deleteMockQuestion(mockId, q.id)}>
                                 <Trash2 size={12} />
                              </Button>
                           </div>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Primary Context</p>
                              <p className="font-bold text-sm leading-relaxed text-zinc-100 line-clamp-3">{q.question_en}</p>
                           </div>
                           <div className="space-y-3 border-l border-white/5 pl-8">
                              <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Secondary (Raavi)</p>
                              <p className="font-medium text-sm leading-relaxed text-zinc-400 line-clamp-3 italic">{q.question_pa || "No artifact"}</p>
                           </div>
                        </div>
                      </Card>
                    )) : (
                      <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-zinc-950/20">
                         <Database className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-20" />
                         <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Payload Empty</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <Card className="rounded-[32px] bg-zinc-900/40 border-white/5 p-10 space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Identity Signal</label>
                          <Input value={mock.title} onChange={e => setMock({...mock, title: e.target.value})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-bold text-sm" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Board Class</label>
                          <Input value={mock.exam} onChange={e => setMock({...mock, exam: e.target.value})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-bold text-sm" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Duration (Min)</label>
                          <Input type="number" value={mock.duration} onChange={e => setMock({...mock, duration: parseInt(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black text-xl text-primary" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Penalty Offset</label>
                          <Input type="number" step="0.01" value={mock.negativeMarking} onChange={e => setMock({...mock, negativeMarking: parseFloat(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black text-xl text-red-500" />
                       </div>
                    </div>
                  </Card>
                )}
             </div>
          </div>
        </main>

        {/* Panel 3: Slim Utility Panel */}
        <aside className="w-72 border-l border-white/5 bg-zinc-950 flex flex-col shrink-0">
          <div className="p-5 border-b border-white/5">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Atomic Bank</span>
                <Badge className="bg-emerald-600/10 text-emerald-500 text-[8px] font-black px-2">SYNCED</Badge>
             </div>
             <div className="relative">
                <Search size={12} className="absolute left-3 top-3 text-zinc-600" />
                <Input 
                  placeholder="Search globally..." 
                  value={bankSearch}
                  onChange={e => setBankSearch(e.target.value)}
                  className="pl-9 h-9 bg-black/40 border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest" 
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
             {bankLoading ? (
               <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-zinc-800" size={16} /></div>
             ) : bank.map(bq => (
               <div key={bq.id} className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group" onClick={() => handleLinkFromBank(bq.id)}>
                  <div className="flex justify-between items-start mb-1.5">
                     <Badge variant="outline" className="text-[7px] border-white/5 text-zinc-600 uppercase px-1">{bq.subject}</Badge>
                     <Plus size={10} className="text-zinc-700 group-hover:text-primary" />
                  </div>
                  <p className="text-[9px] font-bold text-zinc-400 line-clamp-2 leading-snug">{bq.question_en}</p>
               </div>
             ))}
          </div>
          <div className="p-5 border-t border-white/5 space-y-2.5">
             <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-600 tracking-widest">
                <span>Load Factor</span>
                <span className="text-white">{questions.length} / {mock.totalQuestions}</span>
             </div>
             <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(questions.length / (mock.totalQuestions || 1)) * 100}%` }} />
             </div>
          </div>
        </aside>

        {/* Global Calibration Modal */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-3xl p-8 rounded-[32px] shadow-2xl">
             <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg"><Zap size={16} /></div>
                   Artifact Calibration
                </DialogTitle>
             </DialogHeader>

             {editingQuestion && (
               <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Primary Payload</label>
                        <Textarea 
                          value={editingQuestion.question_en} 
                          onChange={e => setEditingQuestion({...editingQuestion, question_en: e.target.value})}
                          className="min-h-[100px] bg-white/5 border-white/10 rounded-xl p-4 text-xs"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Secondary Artifact (Raavi)</label>
                        <Textarea 
                          value={editingQuestion.question_pa} 
                          onChange={e => setEditingQuestion({...editingQuestion, question_pa: e.target.value})}
                          className="min-h-[100px] bg-white/5 border-white/10 rounded-xl p-4 text-xs"
                        />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">Options Matrix</label>
                        <div className="grid gap-2">
                           {[0,1,2,3].map(i => (
                             <Input 
                               key={i} 
                               value={editingQuestion.options_en?.[i] || ''} 
                               onChange={e => {
                                 const opts = [...(editingQuestion.options_en || ['', '', '', ''])];
                                 opts[i] = e.target.value;
                                 setEditingQuestion({...editingQuestion, options_en: opts});
                               }}
                               className="bg-white/5 border-white/10 rounded-lg h-9 text-[10px]"
                               placeholder={`Terminal ${String.fromCharCode(65+i)}`}
                             />
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-emerald-500 tracking-widest px-1">Correct Identity</label>
                           <Input 
                             value={editingQuestion.correctAnswer} 
                             onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                             className="bg-zinc-900 border-emerald-500/20 rounded-lg h-10 font-bold text-emerald-500 text-xs"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black uppercase text-zinc-600 px-1">Subject</label>
                              <Select value={editingQuestion.subject} onValueChange={v => setEditingQuestion({...editingQuestion, subject: v as any})}>
                                 <SelectTrigger className="h-9 bg-white/5 border-white/10 text-[9px]"><SelectValue /></SelectTrigger>
                                 <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black uppercase text-zinc-600 px-1">Complexity</label>
                              <Select value={editingQuestion.difficulty} onValueChange={v => setEditingQuestion({...editingQuestion, difficulty: v as any})}>
                                 <SelectTrigger className="h-9 bg-white/5 border-white/10 text-[9px]"><SelectValue /></SelectTrigger>
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

             <DialogFooter className="mt-8 border-t border-white/5 pt-6">
                <Button variant="ghost" onClick={() => setEditorOpen(false)} className="rounded-xl h-12 px-6 font-bold text-zinc-500 text-[10px] uppercase">Discard</Button>
                <Button onClick={handleSaveQuestion} disabled={saving} className="rounded-xl h-12 px-10 bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest blue-glow shadow-xl">
                   {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                   Sync Artifact
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtect>
  );
}
