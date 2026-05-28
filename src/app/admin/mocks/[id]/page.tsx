"use client";

import { useState, useEffect, use, useMemo } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  ArrowLeft, Settings, Database, ShieldCheck, Zap, 
  BarChart3, Loader2, Save, Plus, Search, Trash2, 
  Eye, Lock, Unlock, Sparkles, Filter, ChevronDown, 
  ChevronUp, Languages, CheckCircle2, AlertCircle, Edit3
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
import { MockTest, Question, SUBJECTS, MockAccessType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/**
 * HIGH-DENSITY SIMULATION CALIBRATION CENTER v12
 * Deep question editor + real-time calibration console.
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
  const [bankSubject, setBankSubject] = useState("All");
  const [activeTab, setActiveTab] = useState("questions");
  
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [expandedQs, setExpandedQs] = useState<Set<string>>(new Set());

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
    const unsubQs = subscribeMockQuestions(mockId, (qs) => setQuestions(qs));
    loadBank();

    return () => unsubQs();
  }, [mockId, toast]);

  async function loadBank() {
    setBankLoading(true);
    try {
      const data = await getRecentQuestions(100);
      setBank(data);
    } finally {
      setBankLoading(false);
    }
  }

  const filteredBank = useMemo(() => {
    return bank.filter(q => {
      const matchesSearch = q.en?.question?.toLowerCase().includes(bankSearch.toLowerCase());
      const matchesSubject = bankSubject === "All" || q.subject === bankSubject;
      return matchesSearch && matchesSubject;
    });
  }, [bank, bankSearch, bankSubject]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedQs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedQs(next);
  };

  const handleLinkFromBank = async (q: Question) => {
    try {
      if (questions.some(item => item.id === q.id)) {
        toast({ title: "Signal Detected", description: "This artifact is already part of the simulation.", variant: "destructive" });
        return;
      }
      await linkGlobalToMock(mockId, q.id);
      toast({ title: "Artifact Linked", description: "Full schema porting complete." });
    } catch (e: any) {
      toast({ title: "Link Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    setSaving(true);
    try {
      if (editingQuestion.id) {
        await updateMockQuestion(mockId, editingQuestion.id, editingQuestion);
        toast({ title: "Artifact Calibrated" });
      } else {
        await addQuestionToMock(mockId, editingQuestion);
        toast({ title: "New Artifact Injected" });
      }
      setEditorOpen(false);
    } catch (e: any) {
      toast({ title: "Sync Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMock = async () => {
    if (!mock) return;
    setSaving(true);
    try {
      await updateMock(mockId, mock);
      toast({ title: "Simulation Parameters Synced" });
    } catch (e: any) {
      toast({ title: "Save Failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openNewQuestionEditor = () => {
    setEditingQuestion({
      en: { question: "", options: ["", "", "", ""], explanation: "" },
      pa: { question: "", options: ["", "", "", ""], explanation: "" },
      correctAnswer: "",
      subject: mock?.exam || "General",
      difficulty: "medium",
      marks: 1,
      negativeMarks: 0.25,
      status: "published"
    });
    setEditorOpen(true);
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Accessing Simulation Node</p>
    </div>
  );

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white overflow-hidden">
        {/* Side Tactical Nav */}
        <aside className="w-60 border-r border-white/5 flex flex-col bg-zinc-950 shrink-0">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5" onClick={() => router.push('/admin/mocks')}>
                <ArrowLeft size={16} />
             </Button>
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Calibrator</span>
          </div>
          <div className="p-3 space-y-1 flex-1">
             {[
               { id: 'questions', label: 'Artifacts', icon: Database },
               { id: 'metadata', label: 'Parameters', icon: Settings },
               { id: 'settings', label: 'Access Tier', icon: ShieldCheck },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all font-bold text-[11px] uppercase tracking-tight",
                   activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-400 hover:bg-white/5"
                 )}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>
          <div className="p-5 border-t border-white/5">
             <Button onClick={handleSaveMock} disabled={saving} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl text-[10px] font-black uppercase tracking-widest blue-glow">
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Commit Sync"}
             </Button>
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050816] flex flex-col">
          <header className="h-16 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
             <div className="flex items-center gap-4">
                <h1 className="text-sm font-black uppercase tracking-[0.2em] truncate max-w-sm">{mock?.title}</h1>
                <Badge className="bg-primary/20 text-primary border-none text-[8px] px-3 py-1 uppercase">{mock?.status}</Badge>
             </div>
             <div className="flex items-center gap-3">
                <Button onClick={openNewQuestionEditor} className="bg-emerald-600 h-10 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                   <Plus size={14} className="mr-2" /> New Artifact
                </Button>
             </div>
          </header>

          <div className="p-8 flex-1">
             <div className="max-w-5xl mx-auto space-y-6">
                {activeTab === 'questions' && (
                  <div className="grid gap-6">
                    {questions.length > 0 ? questions.map((q, idx) => {
                      const isExpanded = expandedQs.has(q.id);
                      return (
                      <Card key={q.id} className="rounded-3xl bg-zinc-900/40 border-white/5 overflow-hidden hover:border-primary/20 transition-all group">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01] cursor-pointer" onClick={() => toggleExpand(q.id)}>
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-zinc-600 w-6">#{idx + 1}</span>
                              <Badge variant="outline" className="border-none text-[8px] font-black uppercase text-zinc-500 bg-zinc-800/50 px-3 py-1">{q.subject}</Badge>
                              <Badge variant="outline" className={cn("border-none text-[8px] font-black uppercase px-3 py-1", q.difficulty === 'hard' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                                 {q.difficulty}
                              </Badge>
                           </div>
                           <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5" onClick={(e) => { e.stopPropagation(); setEditingQuestion(q); setEditorOpen(true); }}>
                                 <Edit3 size={12} className="text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500" onClick={(e) => { e.stopPropagation(); if(confirm('Purge this artifact?')) deleteMockQuestion(mockId, q.id); }}>
                                 <Trash2 size={12} />
                              </Button>
                              {isExpanded ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
                           </div>
                        </div>

                        <div className="p-6 space-y-6">
                           <div className="grid md:grid-cols-2 gap-10">
                              <div className="space-y-3">
                                 <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">English Core</p>
                                 <p className="font-bold text-base leading-relaxed text-zinc-100 line-clamp-2 group-hover:line-clamp-none transition-all">{q.en?.question}</p>
                              </div>
                              <div className="space-y-3 border-l border-white/5 pl-10">
                                 <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Raavi Punjabi</p>
                                 <p className="font-medium text-base leading-relaxed text-zinc-400 italic line-clamp-2 group-hover:line-clamp-none">{q.pa?.question || "No signal detected."}</p>
                              </div>
                           </div>

                           {isExpanded && (
                             <div className="pt-6 border-t border-white/5 animate-in slide-in-from-top-2">
                                <div className="grid md:grid-cols-2 gap-10">
                                   <div className="space-y-3">
                                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Response Matrix (EN)</p>
                                      <div className="grid grid-cols-2 gap-2">
                                         {q.en?.options.map((o, i) => (
                                           <div key={i} className={cn("p-2 px-4 rounded-xl text-[11px] border font-medium", o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-black/20 border-white/5 text-zinc-500")}>
                                              {String.fromCharCode(65+i)}. {o}
                                           </div>
                                         ))}
                                      </div>
                                   </div>
                                   <div className="space-y-3 border-l border-white/5 pl-10">
                                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ਵਿਕਲਪ ਮੈਟ੍ਰਿਕਸ (PA)</p>
                                      <div className="grid grid-cols-2 gap-2">
                                         {(q.pa?.options || ["","","",""]).map((o, i) => (
                                           <div key={i} className="p-2 px-4 rounded-xl text-[11px] border bg-black/20 border-white/5 text-zinc-500">
                                              {i + 1}. {o || "Missing"}
                                           </div>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             </div>
                           )}
                        </div>
                      </Card>
                    )}) : (
                      <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[48px] bg-zinc-950/20 space-y-6">
                         <Database className="w-12 h-12 text-zinc-800 mx-auto" />
                         <div className="space-y-2">
                           <h3 className="text-2xl font-black uppercase tracking-tighter">Payload Buffer Empty</h3>
                           <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest">Start linking artifacts or create new ones.</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-10 space-y-10 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Simulation Title</label>
                          <Input value={mock?.title} onChange={e => setMock({...mock!, title: e.target.value})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Recruitment Board</label>
                          <Input value={mock?.exam} onChange={e => setMock({...mock!, exam: e.target.value})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Duration (Min)</label>
                          <Input type="number" value={mock?.duration} onChange={e => setMock({...mock!, duration: parseInt(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black text-xl text-primary" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Penalty Coefficient</label>
                          <Input type="number" step="0.01" value={mock?.negativeMarking} onChange={e => setMock({...mock!, negativeMarking: parseFloat(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black text-xl text-red-500" />
                       </div>
                    </div>
                  </Card>
                )}

                {activeTab === 'settings' && (
                  <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-10 space-y-10 shadow-2xl">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Access Entitlement</label>
                        <Select 
                          value={mock?.accessType} 
                          onValueChange={(val: any) => setMock({...mock!, accessType: val})}
                        >
                          <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-sm uppercase px-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 text-white border-white/10">
                            <SelectItem value="free">FREE HUB</SelectItem>
                            <SelectItem value="pass_plus">PASS+ ONLY</SelectItem>
                            <SelectItem value="premium">PREMIUM ONLY</SelectItem>
                            <SelectItem value="elite">ELITE ONLY</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Simulation Signal</label>
                        <Select 
                          value={mock?.status} 
                          onValueChange={(val: any) => setMock({...mock!, status: val})}
                        >
                          <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-sm uppercase px-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 text-white border-white/10">
                            <SelectItem value="draft">DRAFT / STAGING</SelectItem>
                            <SelectItem value="published">PUBLISHED / LIVE</SelectItem>
                            <SelectItem value="archived">ARCHIVED</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                  </Card>
                )}
             </div>
          </div>
        </main>

        {/* Atomic Bank Utility */}
        <aside className="w-[480px] border-l border-white/5 bg-zinc-950 flex flex-col shrink-0">
          <header className="p-6 border-b border-white/5 space-y-6 bg-zinc-950">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="text-emerald-500 w-4 h-4" />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Atomic Bank</span>
                </div>
                <Badge className="bg-emerald-600/10 text-emerald-500 text-[8px] font-black px-3 py-1">GLOBAL REPOSITORY</Badge>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                   <Search size={14} className="absolute left-4 top-3.5 text-zinc-600" />
                   <Input 
                     placeholder="Search..." 
                     value={bankSearch}
                     onChange={e => setBankSearch(e.target.value)}
                     className="pl-11 h-11 bg-black/40 border-white/5 rounded-xl text-[10px] font-bold uppercase" 
                   />
                </div>
                <Select value={bankSubject} onValueChange={setBankSubject}>
                   <SelectTrigger className="h-11 bg-black/40 border-white/5 rounded-xl text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-zinc-950 border-white/10 text-white">
                      <SelectItem value="All">All Subjects</SelectItem>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#080b1a]">
             {bankLoading ? (
               <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-800" size={20} /></div>
             ) : filteredBank.map(bq => (
               <Card key={bq.id} className="rounded-2xl bg-zinc-900/50 border-white/5 hover:border-blue-500/40 transition-all group overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                     <Badge variant="outline" className="text-[7px] border-white/5 text-zinc-500 uppercase px-2 py-0.5">{bq.subject}</Badge>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary transition-all"
                       onClick={() => handleLinkFromBank(bq)}
                     >
                        <Plus size={14} />
                     </Button>
                  </div>
                  <div className="p-4 space-y-3">
                     <p className="text-[11px] font-bold text-zinc-300 line-clamp-3 leading-relaxed">{bq.en?.question}</p>
                     <div className="flex items-center justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest pt-2 border-t border-white/[0.03]">
                        <span className="flex items-center gap-1.5"><Languages size={10} className="text-orange-500" /> Bilingual</span>
                        <span className={cn(bq.difficulty === 'hard' ? "text-red-500" : "text-emerald-500")}>{bq.difficulty}</span>
                     </div>
                  </div>
               </Card>
             ))}
          </div>
        </aside>

        {/* Deep Editor Modal */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-5xl p-0 rounded-[48px] shadow-2xl overflow-hidden">
             <DialogHeader className="p-10 pb-0">
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center blue-glow"><Zap size={24} className="text-primary" /></div>
                  Artifact Calibration
                </DialogTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Adjusting question sub-layer</p>
             </DialogHeader>

             <Tabs defaultValue="en" className="flex flex-col">
                <div className="px-10 mt-10">
                  <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-12 w-fit">
                    <TabsTrigger value="en" className="rounded-xl px-10 font-black text-[10px] uppercase tracking-widest">English Core</TabsTrigger>
                    <TabsTrigger value="pa" className="rounded-xl px-10 font-black text-[10px] uppercase tracking-widest">Punjabi Raavi</TabsTrigger>
                    <TabsTrigger value="meta" className="rounded-xl px-10 font-black text-[10px] uppercase tracking-widest">Metadata</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                   {editingQuestion && (
                     <>
                       <TabsContent value="en" className="m-0 space-y-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-zinc-500 px-2">Question (EN)</label>
                             <Textarea 
                               value={editingQuestion.en?.question} 
                               onChange={e => setEditingQuestion({...editingQuestion, en: {...editingQuestion.en!, question: e.target.value}})}
                               className="min-h-[160px] bg-zinc-900/50 border-white/10 rounded-3xl p-8 text-lg font-bold leading-relaxed"
                             />
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                             {(editingQuestion.en?.options || ["","","",""]).map((opt, i) => (
                               <div key={i} className="space-y-2">
                                  <label className="text-[9px] font-black text-zinc-600 uppercase px-2">Option {String.fromCharCode(65+i)}</label>
                                  <Input 
                                    value={opt} 
                                    onChange={e => {
                                      const opts = [...(editingQuestion.en?.options || ["","","",""])];
                                      opts[i] = e.target.value;
                                      setEditingQuestion({...editingQuestion, en: {...editingQuestion.en!, options: opts}});
                                    }}
                                    className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl px-6 font-bold"
                                  />
                               </div>
                             ))}
                          </div>
                       </TabsContent>

                       <TabsContent value="pa" className="m-0 space-y-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-zinc-500 px-2">ਪ੍ਰਸ਼ਨ (PA)</label>
                             <Textarea 
                               value={editingQuestion.pa?.question} 
                               onChange={e => setEditingQuestion({...editingQuestion, pa: {...editingQuestion.pa!, question: e.target.value}})}
                               className="min-h-[160px] bg-orange-600/5 border-orange-600/10 rounded-3xl p-8 text-xl font-medium leading-relaxed"
                             />
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                             {[0,1,2,3].map((i) => (
                               <div key={i} className="space-y-2">
                                  <label className="text-[9px] font-black text-zinc-600 uppercase px-2">ਵਿਕਲਪ {i+1}</label>
                                  <Input 
                                    value={editingQuestion.pa?.options[i] || ''} 
                                    onChange={e => {
                                      const opts = [...(editingQuestion.pa?.options || ['', '', '', ''])];
                                      opts[i] = e.target.value;
                                      setEditingQuestion({...editingQuestion, pa: {...editingQuestion.pa!, options: opts}});
                                    }}
                                    className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl px-6 font-medium"
                                  />
                               </div>
                             ))}
                          </div>
                       </TabsContent>

                       <TabsContent value="meta" className="m-0 space-y-10">
                          <div className="grid md:grid-cols-3 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase px-2">Correct Answer</label>
                                <Input 
                                  value={editingQuestion.correctAnswer} 
                                  onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                                  placeholder="Match EN option exactly"
                                  className="h-14 bg-emerald-600/10 border-emerald-500/20 text-emerald-500 font-black rounded-2xl"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase px-2">Complexity</label>
                                <Select value={editingQuestion.difficulty} onValueChange={(v: any) => setEditingQuestion({...editingQuestion, difficulty: v})}>
                                   <SelectTrigger className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                                   <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                      <SelectItem value="easy">Easy</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="hard">Hard</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase px-2">Subject Class</label>
                                <Select value={editingQuestion.subject} onValueChange={(v: any) => setEditingQuestion({...editingQuestion, subject: v})}>
                                   <SelectTrigger className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                                   <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                          </div>
                       </TabsContent>
                     </>
                   )}
                </div>

                <DialogFooter className="p-10 border-t border-white/5 bg-white/[0.01]">
                   <Button variant="ghost" onClick={() => setEditorOpen(false)} className="rounded-xl h-14 px-10 font-bold text-zinc-500 text-[11px] uppercase tracking-widest">Discard</Button>
                   <Button onClick={handleSaveQuestion} disabled={saving} className="h-14 px-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl ml-4">
                      {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                      Sync Artifact
                   </Button>
                </DialogFooter>
             </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtect>
  );
}