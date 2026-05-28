"use client";

import { useState, useEffect, use } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  ArrowLeft, Settings, Database, ShieldCheck, Zap, 
  BarChart3, Loader2, Save, Plus, Search, Trash2, 
  CheckCircle2, FileText, Clock, LayoutGrid, Languages, 
  Sparkles, Eye, List, MoreVertical, GripVertical, Copy, 
  Lock, Unlock, ChevronRight
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
 * INSTITUTIONAL MOCK COMMAND CENTER
 * 3-Panel Professional EdTech Layout
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
  
  // Question Editor State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (!mockId) return;
    
    async function loadMock() {
      try {
        const data = await getMockDetails(mockId);
        setMock(data);
      } catch (e) {
        toast({ title: "Registry Signals Lost", variant: "destructive" });
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
      toast({ title: "Mock Synchronized" });
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
      toast({ title: "Question Artifact Saved" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!mock) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500 font-bold">Mock Not Found</div>;

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white overflow-hidden">
        {/* Panel 1: Tactical Sidebar (Left) */}
        <aside className="w-60 border-r border-white/5 flex flex-col bg-zinc-950 shrink-0">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => router.push('/admin/mocks')}>
                <ArrowLeft size={16} />
             </Button>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Command</span>
          </div>
          <div className="p-4 space-y-2 flex-1">
             {[
               { id: 'questions', label: 'Artifacts', icon: Database },
               { id: 'metadata', label: 'Calibration', icon: Settings },
               { id: 'analytics', label: 'Performance', icon: BarChart3 },
               { id: 'settings', label: 'Gating', icon: ShieldCheck },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-xs",
                   activeTab === tab.id ? "bg-primary text-white blue-glow" : "text-zinc-500 hover:bg-white/5"
                 )}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>
          <div className="p-4 border-t border-white/5">
             <Button onClick={handleUpdateMetadata} disabled={saving} className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black">
                {saving ? <Loader2 size={12} className="animate-spin" /> : "Commit All"}
             </Button>
          </div>
        </aside>

        {/* Panel 2: Center Workspace */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050816] flex flex-col">
          <header className="h-16 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl">
             <div className="flex items-center gap-4">
                <h1 className="text-sm font-black uppercase tracking-widest truncate max-w-md">{mock.title}</h1>
                <Badge variant="outline" className="border-primary/20 text-primary text-[8px] px-2">{mock.status}</Badge>
             </div>
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                   <Eye size={14} className="mr-2" /> Live Preview
                </Button>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <Button onClick={() => handleEditQuestion({} as any)} className="bg-primary h-9 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest blue-glow">
                   <Plus size={14} className="mr-2" /> Inject Question
                </Button>
             </div>
          </header>

          <div className="p-10 flex-1">
             <div className="max-w-4xl mx-auto space-y-8">
                {activeTab === 'questions' && (
                  <div className="space-y-6">
                    {questions.length > 0 ? questions.map((q, idx) => (
                      <Card key={q.id} className="rounded-[32px] bg-zinc-900/40 border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500">
                                 {idx + 1}
                              </div>
                              <Badge variant="outline" className="border-none text-[8px] font-black uppercase text-zinc-500 bg-zinc-800/50 px-3">{q.subject}</Badge>
                              <Badge variant="outline" className={cn("border-none text-[8px] font-black uppercase px-3", q.difficulty === 'hard' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                                 {q.difficulty}
                              </Badge>
                           </div>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white" onClick={() => handleEditQuestion(q)}>
                                 <Settings size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-red-500" onClick={() => deleteMockQuestion(mockId, q.id)}>
                                 <Trash2 size={14} />
                              </Button>
                           </div>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-12">
                           <div className="space-y-4">
                              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">English Payload</p>
                              <p className="font-bold text-lg leading-relaxed text-zinc-100">{q.question_en}</p>
                              <div className="space-y-2">
                                 {q.options_en.map((opt, i) => (
                                   <div key={i} className={cn("p-3 rounded-xl border text-xs font-medium", opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-black/20 border-white/5 text-zinc-500")}>
                                      {opt}
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-4 border-l border-white/5 pl-12">
                              <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Punjabi Signal (Raavi)</p>
                              <p className="font-medium text-lg leading-relaxed text-zinc-300">{q.question_pa || "No translation artifact"}</p>
                              <div className="space-y-2">
                                 {q.options_pa?.map((opt, i) => (
                                   <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-zinc-500">{opt}</div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      </Card>
                    )) : (
                      <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[48px] bg-zinc-950/20">
                         <Database className="w-16 h-16 text-zinc-800 mx-auto mb-6 opacity-30" />
                         <h3 className="text-xl font-black uppercase text-zinc-600 tracking-tighter">Payload Empty</h3>
                         <p className="text-zinc-700 mt-2 text-sm italic">Link artifacts from the Atomic Bank to build the syllabus.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 space-y-12">
                    <div className="grid md:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Simulation Identity</label>
                          <Input value={mock.title} onChange={e => setMock({...mock, title: e.target.value})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Recruitment Board</label>
                          <Input value={mock.exam} onChange={e => setMock({...mock, exam: e.target.value})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Duration (Minutes)</label>
                          <Input type="number" value={mock.duration} onChange={e => setMock({...mock, duration: parseInt(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-2xl text-primary" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Penalty Logic (Negative)</label>
                          <Input type="number" step="0.01" value={mock.negativeMarking} onChange={e => setMock({...mock, negativeMarking: parseFloat(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-2xl text-red-500" />
                       </div>
                    </div>
                  </Card>
                )}
             </div>
          </div>
        </main>

        {/* Panel 3: Utility Panel (Right) */}
        <aside className="w-80 border-l border-white/5 bg-zinc-950 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5">
             <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Atomic Bank</span>
                <Badge className="bg-emerald-600 text-white text-[8px] font-black">SYNCED</Badge>
             </div>
             <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-zinc-600" />
                <Input 
                  placeholder="Search globally..." 
                  value={bankSearch}
                  onChange={e => setBankSearch(e.target.value)}
                  className="pl-10 h-10 bg-black/40 border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest" 
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
             {bankLoading ? (
               <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-800" /></div>
             ) : bank.map(bq => (
               <div key={bq.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => handleLinkFromBank(bq.id)}>
                  <div className="flex justify-between items-start mb-2">
                     <Badge variant="outline" className="text-[7px] border-white/10 text-zinc-600 uppercase">{bq.subject}</Badge>
                     <Plus size={12} className="text-zinc-700 group-hover:text-primary" />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 line-clamp-2 leading-relaxed">{bq.question_en}</p>
               </div>
             ))}
          </div>
          <div className="p-6 border-t border-white/5 space-y-4">
             <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-600 tracking-widest">
                <span>Payload Analysis</span>
                <span className="text-white">{questions.length} / {mock.totalQuestions}</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(questions.length / (mock.totalQuestions || 1)) * 100}%` }} />
             </div>
          </div>
        </aside>

        {/* Global Question Editor Modal */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl p-10 rounded-[40px] shadow-2xl">
             <DialogHeader className="mb-8">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg"><Zap size={20} /></div>
                   Artifact Calibration
                </DialogTitle>
             </DialogHeader>

             {editingQuestion && (
               <div className="space-y-10 max-h-[60vh] overflow-y-auto pr-6 no-scrollbar">
                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">English Question</label>
                        <Textarea 
                          value={editingQuestion.question_en} 
                          onChange={e => setEditingQuestion({...editingQuestion, question_en: e.target.value})}
                          className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-6 text-sm"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Punjabi (Raavi)</label>
                        <Textarea 
                          value={editingQuestion.question_pa} 
                          onChange={e => setEditingQuestion({...editingQuestion, question_pa: e.target.value})}
                          className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-6 text-sm"
                        />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Options (English)</label>
                        <div className="grid gap-3">
                           {[0,1,2,3].map(i => (
                             <Input 
                               key={i} 
                               value={editingQuestion.options_en?.[i] || ''} 
                               onChange={e => {
                                 const opts = [...(editingQuestion.options_en || ['', '', '', ''])];
                                 opts[i] = e.target.value;
                                 setEditingQuestion({...editingQuestion, options_en: opts});
                               }}
                               className="bg-white/5 border-white/10 rounded-xl h-12"
                               placeholder={`Option ${String.fromCharCode(65+i)}`}
                             />
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Correct Answer (Match English)</label>
                        <Input 
                          value={editingQuestion.correctAnswer} 
                          onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                          className="bg-zinc-900 border-emerald-500/20 rounded-xl h-14 font-bold text-emerald-500"
                        />
                        <div className="grid grid-cols-2 gap-4 pt-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-600 px-2">Subject</label>
                              <Select value={editingQuestion.subject} onValueChange={v => setEditingQuestion({...editingQuestion, subject: v as any})}>
                                 <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                                 <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-600 px-2">Level</label>
                              <Select value={editingQuestion.difficulty} onValueChange={v => setEditingQuestion({...editingQuestion, difficulty: v as any})}>
                                 <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
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

             <DialogFooter className="mt-12">
                <Button variant="ghost" onClick={() => setEditorOpen(false)} className="rounded-xl h-14 px-8 font-bold text-zinc-500">Discard</Button>
                <Button onClick={handleSaveQuestion} disabled={saving} className="rounded-2xl h-14 px-12 bg-primary hover:bg-primary/90 font-black uppercase text-xs tracking-widest blue-glow shadow-2xl">
                   {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
                   Commit Artifact
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtect>
  );
}