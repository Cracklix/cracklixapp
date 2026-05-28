"use client";

import { useState, useEffect, use, useMemo } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  ArrowLeft, Settings, Database, ShieldCheck, Zap, 
  Loader2, Save, Plus, Search, Trash2, 
  ChevronDown, ChevronUp, Edit3, Target, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getMockDetails, updateMock, subscribeMockQuestions,
  deleteMockQuestion, updateMockQuestion,
  addQuestionToMock
} from "@/services/mocks";
import { MockTest, Question, SUBJECTS, MockAccessType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/**
 * DEEP ARTIFACT CALIBRATOR v12.5
 * Full CRUD for individual questions, marking schemes, and access tiers.
 */
export default function MockEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const mockId = unwrappedParams.id;
  const { toast } = useToast();
  const router = useRouter();

  const [mock, setMock] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

    return () => unsubQs();
  }, [mockId, toast]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedQs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedQs(next);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    setSaving(true);
    try {
      if (editingQuestion.id) {
        await updateMockQuestion(mockId, editingQuestion.id, editingQuestion);
        toast({ title: "Artifact Calibrated", description: "Signal updated in registry." });
      } else {
        await addQuestionToMock(mockId, editingQuestion);
        toast({ title: "Artifact Injected", description: "New signal added to simulation payload." });
      }
      setEditorOpen(false);
    } catch (e: any) {
      toast({ title: "Sync Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMockParameters = async () => {
    if (!mock) return;
    setSaving(true);
    try {
      await updateMock(mockId, mock);
      toast({ title: "Parameters Synced", description: "Simulation metadata updated." });
    } catch (e: any) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openNewArtifactEditor = () => {
    setEditingQuestion({
      en: { question: "", options: ["", "", "", ""], explanation: "" },
      pa: { question: "", options: ["", "", "", ""], explanation: "" },
      correctAnswer: "",
      subject: mock?.exam || "General Proficiency",
      difficulty: "medium",
      marks: 1,
      negativeMarks: mock?.negativeMarking || 0.25,
      status: "published"
    });
    setEditorOpen(true);
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Accessing Simulation Node...</p>
    </div>
  );

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-white/5 flex flex-col bg-zinc-950 shrink-0">
          <div className="p-8 border-b border-white/5 flex items-center gap-4">
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={() => router.push('/admin/mocks')}>
                <ArrowLeft size={18} />
             </Button>
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Editor OS</span>
          </div>
          <div className="p-4 space-y-2 flex-1">
             {[
               { id: 'questions', label: 'Artifacts', icon: Database },
               { id: 'metadata', label: 'Parameters', icon: Settings },
               { id: 'access', label: 'Entitlements', icon: ShieldCheck },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest",
                   activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-500 hover:bg-white/5"
                 )}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>
          <div className="p-6 border-t border-white/5">
             <Button onClick={handleSaveMockParameters} disabled={saving} className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl text-[10px] font-black uppercase tracking-widest blue-glow shadow-xl">
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Commit Sync"}
             </Button>
          </div>
        </aside>

        {/* Main Editor Canvas */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050816] flex flex-col">
          <header className="h-20 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
             <div className="flex items-center gap-5">
                <h1 className="text-lg font-black uppercase tracking-tighter truncate max-w-lg">{mock?.title}</h1>
                <Badge className="bg-primary/20 text-primary border-none text-[8px] px-3 py-1 font-black uppercase tracking-widest">{mock?.status}</Badge>
             </div>
             <div className="flex items-center gap-4">
                <Button onClick={openNewArtifactEditor} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl blue-glow">
                   <Plus size={16} className="mr-2" /> Inject Artifact
                </Button>
             </div>
          </header>

          <div className="p-10 flex-1">
             <div className="max-w-6xl mx-auto space-y-10">
                {activeTab === 'questions' && (
                  <div className="grid gap-6">
                    {questions.length > 0 ? questions.map((q, idx) => {
                      const isExpanded = expandedQs.has(q.id);
                      return (
                      <Card key={q.id} className="rounded-[40px] bg-zinc-900/30 border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="p-6 px-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01] cursor-pointer" onClick={() => toggleExpand(q.id)}>
                           <div className="flex items-center gap-6">
                              <span className="text-[10px] font-black text-zinc-600 w-8">#{idx + 1}</span>
                              <Badge variant="outline" className="border-none text-[8px] font-black uppercase text-zinc-500 bg-zinc-800/50 px-4 py-1 tracking-widest">{q.subject}</Badge>
                              <Badge variant="outline" className={cn("border-none text-[8px] font-black uppercase px-4 py-1 tracking-widest", q.difficulty === 'hard' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                                 {q.difficulty}
                              </Badge>
                           </div>
                           <div className="flex items-center gap-3">
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={(e) => { e.stopPropagation(); setEditingQuestion(q); setEditorOpen(true); }}>
                                 <Edit3 size={16} className="text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-500" onClick={(e) => { e.stopPropagation(); if(confirm('Purge this artifact signal?')) deleteMockQuestion(mockId, q.id); }}>
                                 <Trash2 size={16} />
                              </Button>
                              {isExpanded ? <ChevronUp size={18} className="text-zinc-600" /> : <ChevronDown size={18} className="text-zinc-600" />}
                           </div>
                        </div>

                        <div className="p-10 space-y-8">
                           <div className="grid md:grid-cols-2 gap-16">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-2 mb-2">
                                    <Languages className="w-4 h-4 text-blue-500" />
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Primary Payload (EN)</p>
                                 </div>
                                 <p className="font-bold text-xl leading-relaxed text-zinc-100">{q.en?.question}</p>
                              </div>
                              <div className="space-y-4 border-l border-white/5 pl-16">
                                 <div className="flex items-center gap-2 mb-2">
                                    <Languages className="w-4 h-4 text-orange-500" />
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Raavi Signal (PA)</p>
                                 </div>
                                 <p className="font-medium text-xl leading-relaxed text-zinc-400 italic">{q.pa?.question || "No native signal detected."}</p>
                              </div>
                           </div>

                           {isExpanded && (
                             <div className="pt-10 border-t border-white/5 space-y-10">
                                <div className="grid md:grid-cols-2 gap-16">
                                   <div className="space-y-5">
                                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Response Matrix (EN)</p>
                                      <div className="grid gap-3">
                                         {q.en?.options.map((opt, i) => (
                                           <div key={i} className={cn("p-5 rounded-2xl text-sm border font-medium", opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
                                              {String.fromCharCode(65+i)}. {opt}
                                           </div>
                                         ))}
                                      </div>
                                   </div>
                                   <div className="space-y-5 border-l border-white/5 pl-16">
                                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ਵਿਕਲਪ ਮੈਟ੍ਰਿਕਸ (PA)</p>
                                      <div className="grid gap-3">
                                         {(q.pa?.options || ["","","",""]).map((opt, i) => (
                                           <div key={i} className="p-5 rounded-2xl text-sm bg-black/40 border border-white/5 text-zinc-500 italic">
                                              {i + 1}. {opt || "Signal Missing"}
                                           </div>
                                         ))}
                                      </div>
                                   </div>
                                </div>

                                <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/10">
                                   <div className="flex items-center gap-3 mb-4">
                                      <Target className="w-4 h-4 text-primary" />
                                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Rationalization Engine</p>
                                   </div>
                                   <p className="text-sm leading-relaxed text-zinc-400">{q.en?.explanation || "Logical analysis pending."}</p>
                                </div>
                             </div>
                           )}
                        </div>
                      </Card>
                    )}) : (
                      <div className="py-60 text-center border-2 border-dashed border-white/5 rounded-[64px] bg-zinc-950/20 space-y-8">
                         <Database className="w-16 h-16 text-zinc-800 mx-auto" />
                         <div className="space-y-3">
                           <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-700">Payload Buffer Empty</h3>
                           <p className="text-zinc-800 text-[11px] font-bold uppercase tracking-[0.4em]">Start injecting artifacts or link from global bank.</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 space-y-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none rotate-12"><Settings size={300} /></div>
                    <div className="grid md:grid-cols-2 gap-10 relative z-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Simulation Identity</label>
                          <Input value={mock?.title} onChange={e => setMock({...mock!, title: e.target.value})} className="h-16 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-lg" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Recruitment Board</label>
                          <Input value={mock?.exam} onChange={e => setMock({...mock!, exam: e.target.value})} className="h-16 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-lg uppercase" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Session Duration (Min)</label>
                          <Input type="number" value={mock?.duration} onChange={e => setMock({...mock!, duration: parseInt(e.target.value)})} className="h-16 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-2xl text-blue-500" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Penalty Coefficient</label>
                          <Input type="number" step="0.01" value={mock?.negativeMarking} onChange={e => setMock({...mock!, negativeMarking: parseFloat(e.target.value)})} className="h-16 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-2xl text-red-500" />
                       </div>
                    </div>
                  </Card>
                )}

                {activeTab === 'access' && (
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 space-y-12 shadow-2xl relative overflow-hidden">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Entitlement Tier</label>
                        <Select 
                          value={mock?.accessType} 
                          onValueChange={(val: any) => setMock({...mock!, accessType: val})}
                        >
                          <SelectTrigger className="h-16 bg-black/40 border-white/5 rounded-2xl font-black text-sm uppercase px-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 text-white border-white/10">
                            <SelectItem value="free">FREE ACCESS HUB</SelectItem>
                            <SelectItem value="pass_plus">PASS+ UNLOCKED</SelectItem>
                            <SelectItem value="premium">PREMIUM ONLY</SelectItem>
                            <SelectItem value="elite">ELITE MASTER TIER</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Simulation Lifecycle Signal</label>
                        <Select 
                          value={mock?.status} 
                          onValueChange={(val: any) => setMock({...mock!, status: val})}
                        >
                          <SelectTrigger className="h-16 bg-black/40 border-white/5 rounded-2xl font-black text-sm uppercase px-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 text-white border-white/10">
                            <SelectItem value="draft">STAGING / DRAFT</SelectItem>
                            <SelectItem value="published">LIVE / PRODUCTION</SelectItem>
                            <SelectItem value="archived">ARCHIVED SIGNAL</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                  </Card>
                )}
             </div>
          </div>
        </main>

        {/* Modal Editor for Questions */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-6xl p-0 rounded-[56px] shadow-[0_0_80px_-20px_rgba(37,99,235,0.4)] overflow-hidden">
             <DialogHeader className="p-12 pb-0">
                <DialogTitle className="text-4xl font-black uppercase tracking-tighter flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center blue-glow"><Zap size={32} className="text-primary" /></div>
                  Artifact Calibration
                </DialogTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">Refining simulated signal ID: {editingQuestion?.id || 'NEW'}</p>
             </DialogHeader>

             <Tabs defaultValue="en" className="flex flex-col">
                <div className="px-12 mt-10">
                  <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-2xl h-14 w-fit">
                    <TabsTrigger value="en" className="rounded-xl px-12 font-black text-[10px] uppercase tracking-widest">English Core</TabsTrigger>
                    <TabsTrigger value="pa" className="rounded-xl px-12 font-black text-[10px] uppercase tracking-widest">Punjabi Raavi</TabsTrigger>
                    <TabsTrigger value="meta" className="rounded-xl px-12 font-black text-[10px] uppercase tracking-widest">Logic & Metadata</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-12 max-h-[55vh] overflow-y-auto no-scrollbar">
                   {editingQuestion && (
                     <>
                       <TabsContent value="en" className="m-0 space-y-10">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Question Narrative (EN)</label>
                             <Textarea 
                               value={editingQuestion.en?.question} 
                               onChange={e => setEditingQuestion({...editingQuestion, en: {...editingQuestion.en!, question: e.target.value}})}
                               className="min-h-[180px] bg-zinc-900/50 border-white/10 rounded-[32px] p-8 text-xl font-bold leading-relaxed focus:ring-primary/20"
                             />
                          </div>
                          <div className="grid md:grid-cols-2 gap-8">
                             {(editingQuestion.en?.options || ["","","",""]).map((opt, i) => (
                               <div key={i} className="space-y-3">
                                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Terminal Option {String.fromCharCode(65+i)}</label>
                                  <Input 
                                    value={opt} 
                                    onChange={e => {
                                      const opts = [...(editingQuestion.en?.options || ["","","",""])];
                                      opts[i] = e.target.value;
                                      setEditingQuestion({...editingQuestion, en: {...editingQuestion.en!, options: opts}});
                                    }}
                                    className="h-16 bg-zinc-900/50 border-white/5 rounded-2xl px-6 font-bold text-lg"
                                  />
                               </div>
                             ))}
                          </div>
                       </TabsContent>

                       <TabsContent value="pa" className="m-0 space-y-10">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">ਪ੍ਰਸ਼ਨ ਸਿਗਨਲ (PA)</label>
                             <Textarea 
                               value={editingQuestion.pa?.question} 
                               onChange={e => setEditingQuestion({...editingQuestion, pa: {...editingQuestion.pa!, question: e.target.value}})}
                               className="min-h-[180px] bg-orange-600/5 border-orange-600/10 rounded-[32px] p-8 text-2xl font-medium leading-relaxed italic"
                             />
                          </div>
                          <div className="grid md:grid-cols-2 gap-8">
                             {[0,1,2,3].map((i) => (
                               <div key={i} className="space-y-3">
                                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">ਵਿਕਲਪ {i+1} (Punjabi)</label>
                                  <Input 
                                    value={editingQuestion.pa?.options?.[i] || ''} 
                                    onChange={e => {
                                      const opts = [...(editingQuestion.pa?.options || ['', '', '', ''])];
                                      opts[i] = e.target.value;
                                      setEditingQuestion({...editingQuestion, pa: {...editingQuestion.pa!, options: opts}});
                                    }}
                                    className="h-16 bg-zinc-900/50 border-white/5 rounded-2xl px-6 font-medium text-lg italic"
                                  />
                               </div>
                             ))}
                          </div>
                       </TabsContent>

                       <TabsContent value="meta" className="m-0 space-y-12">
                          <div className="grid md:grid-cols-3 gap-10">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Target Answer</label>
                                <Input 
                                  value={editingQuestion.correctAnswer} 
                                  onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                                  placeholder="MATCH ENGLISH OPTION EXACTLY"
                                  className="h-16 bg-emerald-600/10 border-emerald-500/20 text-emerald-500 font-black rounded-2xl text-center uppercase tracking-widest"
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Complexity Rank</label>
                                <Select value={editingQuestion.difficulty} onValueChange={(v: any) => setEditingQuestion({...editingQuestion, difficulty: v})}>
                                   <SelectTrigger className="h-16 bg-zinc-900/50 border-white/5 rounded-2xl font-black uppercase text-xs"><SelectValue /></SelectTrigger>
                                   <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                      <SelectItem value="easy">LEVEL: EASY</SelectItem>
                                      <SelectItem value="medium">LEVEL: MEDIUM</SelectItem>
                                      <SelectItem value="hard">LEVEL: HARD</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Subject Classification</label>
                                <Select value={editingQuestion.subject} onValueChange={(v: any) => setEditingQuestion({...editingQuestion, subject: v})}>
                                   <SelectTrigger className="h-16 bg-zinc-900/50 border-white/5 rounded-2xl font-black uppercase text-xs"><SelectValue /></SelectTrigger>
                                   <SelectContent className="bg-zinc-950 border-white/10 text-white max-h-80">
                                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Rationalization (Logic)</label>
                             <Textarea 
                               value={editingQuestion.en?.explanation} 
                               onChange={e => setEditingQuestion({...editingQuestion, en: {...editingQuestion.en!, explanation: e.target.value}})}
                               className="min-h-[120px] bg-zinc-900/50 border-white/10 rounded-2xl p-6 text-sm italic text-zinc-400"
                               placeholder="Step-by-step logical breakdown for solution audits..."
                             />
                          </div>
                       </TabsContent>
                     </>
                   )}
                </div>

                <DialogFooter className="p-12 border-t border-white/5 bg-white/[0.01]">
                   <Button variant="ghost" onClick={() => setEditorOpen(false)} className="rounded-2xl h-16 px-12 font-bold text-zinc-500 text-[11px] uppercase tracking-[0.3em]">DISCARD SIGNAL</Button>
                   <Button onClick={handleSaveQuestion} disabled={saving} className="h-16 px-20 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl blue-glow ml-6">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save className="mr-3 w-5 h-5" />}
                      SYNC ARTIFACT
                   </Button>
                </DialogFooter>
             </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtect>
  );
}