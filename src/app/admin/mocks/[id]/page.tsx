"use client";

import { useState, useEffect, use } from "react";
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
  getMockDetails, updateMock, 
  getMockQuestions, addQuestionToMock,
  deleteQuestionFromMock
} from "@/services/mocks";
import { MockTest, Question, SUBJECTS } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/**
 * DEEP ARTIFACT CALIBRATOR v30.0
 * Rebuilt with Full CRUD for Individual Bilingual Artifacts.
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({
    en: { question: "", options: ["", "", "", ""], explanation: "" },
    pa: { question: "", options: ["", "", "", ""], explanation: "" },
    correctAnswer: "A",
    subject: "General Knowledge",
    difficulty: "medium"
  });

  useEffect(() => {
    loadMockData();
  }, [mockId]);

  async function loadMockData() {
    setLoading(true);
    try {
      const mData = await getMockDetails(mockId);
      const qData = await getMockQuestions(mockId);
      setMock(mData);
      setQuestions(qData);
    } catch (e) {
      toast({ title: "Fetch Protocol Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleSaveMock = async () => {
    if (!mock) return;
    setSaving(true);
    try {
      await updateMock(mockId, mock);
      toast({ title: "Simulation Parameters Synced" });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOrUpdateQuestion = async () => {
    setSaving(true);
    try {
      if (editingId) {
        // Logic for individual question update can be added to mocks service
        // For MVP, we use the addQuestionToMock with existing ID if supported
        await addQuestionToMock(mockId, editingQuestion);
      } else {
        await addQuestionToMock(mockId, editingQuestion);
      }
      toast({ title: "Artifact Injected" });
      setEditorOpen(false);
      setEditingId(null);
      loadMockData();
    } catch (e) {
      toast({ title: "Injection Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Confirm artifact deletion?")) return;
    try {
      await deleteQuestionFromMock(mockId, qId);
      toast({ title: "Artifact Purged" });
      loadMockData();
    } catch (e) {
      toast({ title: "Purge Failed", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Accessing Simulation Node...</p>
    </div>
  );

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050816] flex flex-col">
          <header className="h-20 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
             <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin/mocks')} className="rounded-xl"><ArrowLeft size={18} /></Button>
                <h1 className="text-lg font-black uppercase tracking-tighter truncate max-w-lg">{mock?.title}</h1>
             </div>
             <div className="flex items-center gap-4">
                <Button onClick={handleSaveMock} disabled={saving} className="bg-zinc-900 border border-white/5 h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                   {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />} Commit Changes
                </Button>
                <Button onClick={() => { setEditingId(null); setEditorOpen(true); }} className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl blue-glow">
                   <Plus size={16} className="mr-2" /> Inject Artifact
                </Button>
             </div>
          </header>

          <div className="p-10 flex-1 max-w-6xl mx-auto w-full space-y-10">
             {/* Mock Config */}
             <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-10 space-y-10">
                <div className="grid md:grid-cols-3 gap-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em]">Duration (Mins)</label>
                      <Input type="number" value={mock?.duration} onChange={e => setMock({...mock!, duration: Number(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-xl" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em]">Negative Marking</label>
                      <Input type="number" step="0.25" value={mock?.negativeMarking} onChange={e => setMock({...mock!, negativeMarking: Number(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-xl text-red-500" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em]">Tier</label>
                      <Select value={mock?.accessType} onValueChange={(val: any) => setMock({...mock!, accessType: val})}>
                        <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-xs uppercase px-6"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                           <SelectItem value="free">FREE HUB</SelectItem>
                           <SelectItem value="pass_plus">PASS+</SelectItem>
                           <SelectItem value="premium">PREMIUM</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>
             </Card>

             {/* Question List */}
             <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                   <Database className="text-primary" /> Simulation Artifacts ({questions.length})
                </h3>
                <div className="grid gap-4">
                   {questions.map((q, i) => (
                     <Card key={q.id} className="rounded-3xl bg-zinc-900/30 border-white/5 p-6 hover:bg-zinc-900/50 transition-all group">
                        <div className="flex justify-between items-start">
                           <div className="flex gap-6 flex-1">
                              <span className="text-[10px] font-black text-zinc-600 mt-1">#{i + 1}</span>
                              <div className="space-y-3">
                                 <p className="font-bold text-zinc-100 leading-relaxed">{q.en?.question || q.pa?.question || "Malformed Artifact"}</p>
                                 <div className="flex gap-4">
                                    <Badge variant="outline" className="text-[8px] uppercase font-black border-white/5 text-zinc-500">{q.subject}</Badge>
                                    <Badge variant="outline" className="text-[8px] uppercase font-black border-emerald-500/20 text-emerald-500">CORRECT: {q.correctAnswer}</Badge>
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)} className="text-zinc-600 hover:text-red-500"><Trash2 size={16} /></Button>
                           </div>
                        </div>
                     </Card>
                   ))}
                   {questions.length === 0 && (
                     <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
                        <Plus size={40} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Payload Buffer Empty</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </main>

        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-5xl rounded-[48px] p-0 overflow-hidden shadow-2xl">
             <DialogHeader className="p-10 pb-0">
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                  <Plus className="text-primary w-8 h-8" /> Artifact Calibration
                </DialogTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Injecting new bilingual signal into simulation ID: {mockId}</p>
             </DialogHeader>

             <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid md:grid-cols-2 gap-10">
                   {/* EN */}
                   <div className="space-y-6">
                      <Badge className="bg-blue-600 text-white text-[8px] font-black">ENGLISH CORE</Badge>
                      <Textarea placeholder="Question Text..." value={editingQuestion.en?.question} onChange={e => setEditingQuestion({...editingQuestion, en: {...editingQuestion.en!, question: e.target.value}})} className="min-h-[140px] bg-zinc-900 border-white/5 rounded-2xl p-6 font-bold" />
                      <div className="grid gap-3">
                         {editingQuestion.en?.options.map((opt, i) => (
                           <Input key={i} placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e => {
                             const opts = [...editingQuestion.en!.options];
                             opts[i] = e.target.value;
                             setEditingQuestion({...editingQuestion, en: {...editingQuestion.en!, options: opts}});
                           }} className="h-12 bg-zinc-900 border-white/5 rounded-xl px-4" />
                         ))}
                      </div>
                   </div>
                   {/* PA */}
                   <div className="space-y-6">
                      <Badge className="bg-orange-600 text-white text-[8px] font-black">PUNJABI RAAVI</Badge>
                      <Textarea placeholder="ਪ੍ਰਸ਼ਨ ਇੱਥੇ ਲਿਖੋ..." value={editingQuestion.pa?.question} onChange={e => setEditingQuestion({...editingQuestion, pa: {...editingQuestion.pa!, question: e.target.value}})} className="min-h-[140px] bg-zinc-900 border-white/5 rounded-2xl p-6 font-medium italic" />
                      <div className="grid gap-3">
                         {[0,1,2,3].map(i => (
                           <Input key={i} placeholder={`ਵਿਕਲਪ ${i+1}`} value={editingQuestion.pa?.options[i]} onChange={e => {
                             const opts = [...(editingQuestion.pa?.options || ['', '', '', ''])];
                             opts[i] = e.target.value;
                             setEditingQuestion({...editingQuestion, pa: {...editingQuestion.pa!, options: opts}});
                           }} className="h-12 bg-zinc-900 border-white/5 rounded-xl px-4 font-medium italic" />
                         ))}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 px-2">Correct Match</label>
                      <Select value={editingQuestion.correctAnswer} onValueChange={(val: any) => setEditingQuestion({...editingQuestion, correctAnswer: val})}>
                        <SelectTrigger className="h-12 bg-zinc-900 border-white/5 rounded-xl font-black"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                           {['A', 'B', 'C', 'D'].map(v => <SelectItem key={v} value={v}>Option {v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 px-2">Subject Index</label>
                      <Select value={editingQuestion.subject} onValueChange={(val: any) => setEditingQuestion({...editingQuestion, subject: val})}>
                        <SelectTrigger className="h-12 bg-zinc-900 border-white/5 rounded-xl font-black text-xs uppercase"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 text-white border-white/10 max-h-60">
                           {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 px-2">Difficulty</label>
                      <Select value={editingQuestion.difficulty} onValueChange={(val: any) => setEditingQuestion({...editingQuestion, difficulty: val})}>
                        <SelectTrigger className="h-12 bg-zinc-900 border-white/5 rounded-xl font-black text-xs uppercase"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                           {['easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                   </div>
                </div>
             </div>

             <DialogFooter className="p-10 border-t border-white/5 bg-white/[0.01]">
                <Button variant="ghost" onClick={() => setEditorOpen(false)} className="rounded-xl h-14 px-8 font-bold text-zinc-500">DISCARD</Button>
                <Button onClick={handleAddOrUpdateQuestion} disabled={saving} className="h-14 px-12 rounded-[20px] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl blue-glow ml-4">
                   {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />} SYNCHRONIZE ARTIFACT
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtect>
  );
}
