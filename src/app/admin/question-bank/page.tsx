"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { collection, query, limit, getDocs, where, deleteDoc, doc, updateDoc, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  Database, 
  Search, 
  Languages, 
  Zap,
  BarChart3,
  Loader2,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Settings,
  Copy,
  Eye,
  Edit3,
  AlertTriangle,
  Globe,
  Tag,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SUBJECT_LIST, Question } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function QuestionBankContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'published';
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [view, subject]);

  async function loadQuestions() {
    setLoading(true);
    try {
      let q = query(
        collection(db, "questions"), 
        where("status", "==", view),
        limit(100)
      );
      
      if (subject !== "All") {
        q = query(
          collection(db, "questions"), 
          where("status", "==", view),
          where("subject", "==", subject), 
          limit(100)
        );
      }
      
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
      docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setQuestions(docs);
    } catch (e: any) {
      console.error("Firestore Load Error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (q: Question) => {
    // Deep clone to avoid immediate state mutation
    const qClone = JSON.parse(JSON.stringify(q));
    // Ensure pa object exists for editing
    if (!qClone.pa) {
      qClone.pa = { question: "", options: ["", "", "", ""], explanation: "" };
    }
    setEditingQuestion(qClone);
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingQuestion) return;
    setIsSaving(true);
    try {
      const { id, ...data } = editingQuestion;
      await updateDoc(doc(db, "questions", id), {
        ...data,
        updatedAt: Date.now()
      });
      toast({ title: "Artifact Calibrated", description: "Bilingual repository updated." });
      setIsEditOpen(false);
      loadQuestions();
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClone = async (q: Question) => {
    const { id, ...data } = q;
    try {
      await addDoc(collection(db, "questions"), {
        ...data,
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      toast({ title: "Artifact Cloned", description: "Check moderation queue." });
      if (view === 'draft') loadQuestions();
    } catch (e) {
      toast({ title: "Cloning Failed", variant: "destructive" });
    }
  };

  async function bulkApprove() {
    if (selectedIds.size === 0) return;
    const batch = writeBatch(db);
    selectedIds.forEach(id => {
      batch.update(doc(db, "questions", id), { status: "published", updatedAt: Date.now() });
    });
    await batch.commit();
    toast({ title: "Bulk Approval Success", description: `${selectedIds.size} artifacts moved to production.` });
    setSelectedIds(new Set());
    loadQuestions();
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === 'published' ? 'draft' : 'published';
    await updateDoc(doc(db, "questions", id), { status: next, updatedAt: Date.now() });
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({ title: "Status Updated", description: `Artifact moved to ${next}.` });
  }

  const filtered = questions.filter(q => 
    q.en?.question?.toLowerCase().includes(search.toLowerCase()) ||
    q.pa?.question?.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center blue-glow">
                <Database className="text-primary w-5 h-5" />
              </div>
              <h1 className="font-headline text-3xl font-black tracking-tighter leading-none uppercase">Atomic Bank</h1>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push('/admin/question-bank?view=published')}
                className={cn("text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all", view === 'published' ? "bg-primary text-white shadow-lg" : "text-zinc-500 hover:text-zinc-400 bg-zinc-900/50")}
              >Production Bank</button>
              <button 
                onClick={() => router.push('/admin/question-bank?view=draft')}
                className={cn("text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all", view === 'draft' ? "bg-orange-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-400 bg-zinc-900/50")}
              >Moderation Queue</button>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-3 w-4 h-4 text-zinc-600" />
              <Input 
                placeholder="Scan global repository..." 
                className="pl-11 h-12 bg-zinc-900 border-white/5 rounded-2xl text-[11px] font-bold uppercase tracking-wider" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full sm:w-56 h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs">
                  <SelectValue placeholder="Filter Classification" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white max-h-[400px]">
                  <SelectItem value="All">Global Overview</SelectItem>
                  {SUBJECT_LIST.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
        </div>
      </header>

      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-50 flex items-center justify-between bg-primary/10 border border-primary/20 backdrop-blur-xl p-4 rounded-3xl shadow-2xl animate-in slide-in-from-top-4">
            <p className="text-xs font-bold text-primary px-4">{selectedIds.size} Artifacts Identified</p>
            <div className="flex gap-2">
              <Button onClick={bulkApprove} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">Bulk Approve</Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-zinc-500 hover:text-white h-9">Reset Selection</Button>
            </div>
        </div>
      )}

      <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-900/50 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
                  <tr>
                      <th className="px-8 py-6 w-10">#</th>
                      <th className="px-8 py-6">Classification</th>
                      <th className="px-8 py-6">Bilingual Payload Preview</th>
                      <th className="px-8 py-6">Signal Metrics</th>
                      <th className="px-8 py-6 text-right">Tactical Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="p-40 text-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-zinc-600 font-black uppercase tracking-widest text-[9px]">Scanning Atomic Vault</p>
                    </td></tr>
                  ) : filtered.length > 0 ? filtered.map(q => (
                    <React.Fragment key={q.id}>
                      <tr 
                        onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                        className={cn(
                          "hover:bg-white/[0.02] transition-colors group cursor-pointer",
                          selectedIds.has(q.id) && "bg-primary/[0.05]",
                          expandedId === q.id && "bg-white/[0.01]"
                        )}
                      >
                          <td className="px-8 py-6 align-top">
                            <div 
                              onClick={(e) => { e.stopPropagation(); const next = new Set(selectedIds); if(next.has(q.id)) next.delete(q.id); else next.add(q.id); setSelectedIds(next); }}
                              className={cn(
                              "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                              selectedIds.has(q.id) ? "bg-primary border-primary" : "border-white/10"
                            )}>
                                {selectedIds.has(q.id) && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                          </td>
                          <td className="px-8 py-6 align-top">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black uppercase px-2 py-0.5 mb-1.5 block w-fit">{q.subject}</Badge>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">{q.topic || 'General Sector'}</span>
                          </td>
                          <td className="px-8 py-6 max-w-2xl align-top">
                            <div className="flex items-center gap-2 mb-1.5">
                               <p className="text-sm font-bold text-white line-clamp-1 leading-relaxed">{q.en?.question}</p>
                               {expandedId !== q.id ? <ChevronDown size={14} className="text-zinc-700" /> : <ChevronUp size={14} className="text-primary" />}
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-1 italic font-medium">{q.pa?.question || "Raavi signal missing."}</p>
                          </td>
                          <td className="px-8 py-6 align-top">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                <Badge variant="outline" className={cn("text-[7px] uppercase font-black px-2", q.difficulty === 'hard' ? "bg-red-500/10 text-red-500" : "bg-zinc-800/50 text-zinc-500")}>{q.difficulty}</Badge>
                                <Badge variant="outline" className="text-[7px] uppercase font-black bg-zinc-800/50 border-white/5 px-2">{q.usageCount || 0} Uses</Badge>
                                {q.qualityScore && <Badge variant="outline" className="text-[7px] uppercase font-black text-emerald-500 border-emerald-500/20 px-2">{q.qualityScore}% Q</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                               <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">#{q.id.substring(0, 8)}</p>
                               {!q.pa?.question && <Badge className="bg-orange-500/10 text-orange-500 border-none text-[6px] h-3 uppercase">NO PA</Badge>}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right align-top">
                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                <Button 
                                  onClick={(e) => { e.stopPropagation(); handleEdit(q); }}
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-xl hover:bg-primary/10 text-primary"
                                  title="Edit Artifact"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  onClick={(e) => { e.stopPropagation(); handleClone(q); }}
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-xl hover:bg-blue-600/10 text-blue-500"
                                  title="Clone Artifact"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  onClick={(e) => { e.stopPropagation(); toggleStatus(q.id, q.status); }}
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-xl hover:bg-emerald-500/10 text-emerald-500"
                                  title={q.status === 'published' ? "Move to Staging" : "Approve Artifact"}
                                >
                                  {q.status === 'published' ? <RefreshCw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                </Button>
                                <Button 
                                  onClick={(e) => { e.stopPropagation(); if(confirm('Purge this academic asset?')) deleteDoc(doc(db, 'questions', q.id)); }}
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-xl hover:bg-destructive/10 text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                          </td>
                      </tr>
                      {expandedId === q.id && (
                        <tr className="bg-white/[0.02]">
                           <td colSpan={5} className="p-10 border-b border-white/5">
                              <div className="grid grid-cols-2 gap-16">
                                 <div className="space-y-6">
                                    <Badge className="bg-blue-600 text-white border-none text-[8px] font-black uppercase">Primary Payload (EN)</Badge>
                                    <p className="text-xl font-bold leading-relaxed">{q.en?.question}</p>
                                    <div className="grid gap-3">
                                       {q.en?.options.map((opt, i) => (
                                         <div key={i} className={cn("p-4 rounded-2xl text-sm border", opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
                                            {String.fromCharCode(65+i)}. {opt}
                                         </div>
                                       ))}
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                                       <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-2">Rationalization</p>
                                       <p className="text-sm text-zinc-300 leading-relaxed italic">{q.en?.explanation || "No explanation provided."}</p>
                                    </div>
                                 </div>
                                 <div className="space-y-6 border-l border-white/5 pl-16">
                                    <Badge className="bg-orange-600 text-white border-none text-[8px] font-black uppercase">Raavi Translation (PA)</Badge>
                                    <p className="text-xl font-medium text-zinc-300 leading-relaxed">{q.pa?.question || "Artifact un-translated."}</p>
                                    <div className="grid gap-3">
                                       {q.pa?.options.map((opt, i) => (
                                         <div key={i} className="p-4 rounded-2xl text-sm bg-black/40 border border-white/5 text-zinc-500">
                                            {opt || "Missing signal."}
                                         </div>
                                       ))}
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                                       <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-2">ਵਿਆਖਿਆ</p>
                                       <p className="text-sm text-zinc-400 leading-relaxed">{q.pa?.explanation || "No Raavi explanation detected."}</p>
                                    </div>
                                 </div>
                              </div>
                           </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr><td colSpan={5} className="p-40 text-center opacity-30">
                        <Database className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No artifacts found in this sector.</p>
                    </td></tr>
                  )}
                </tbody>
            </table>
          </div>
      </div>

      {/* Artifact Calibration Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-5xl rounded-[48px] p-0 overflow-hidden shadow-2xl">
           <DialogHeader className="p-10 pb-0 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center blue-glow"><Edit3 size={24} className="text-primary" /></div>
                  Calibration Terminal
                </DialogTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Adjusting artifact ID: {editingQuestion?.id}</p>
              </div>
           </DialogHeader>

           <Tabs defaultValue="en" className="flex flex-col">
              <div className="px-10 mt-10">
                <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-12 w-fit">
                   <TabsTrigger value="en" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">English Core</TabsTrigger>
                   <TabsTrigger value="pa" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-orange-600">Punjabi Raavi</TabsTrigger>
                   <TabsTrigger value="meta" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800">Metadata</TabsTrigger>
                   <TabsTrigger value="stats" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800">Analytics</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                 {editingQuestion && (
                   <>
                     <TabsContent value="en" className="m-0 space-y-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Question Narrative (EN)</label>
                           <Textarea 
                             value={editingQuestion.en.question} 
                             onChange={e => setEditingQuestion({...editingQuestion, en: {...editingQuestion.en, question: e.target.value}})}
                             className="min-h-[160px] bg-zinc-900/50 border-white/10 rounded-3xl p-8 text-lg font-bold leading-relaxed"
                           />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                           {editingQuestion.en.options.map((opt, i) => (
                             <div key={i} className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase px-2">Option {String.fromCharCode(65+i)}</label>
                                <Input 
                                  value={opt} 
                                  onChange={e => {
                                    const opts = [...editingQuestion.en.options];
                                    opts[i] = e.target.value;
                                    setEditingQuestion({...editingQuestion, en: {...editingQuestion.en, options: opts}});
                                  }}
                                  className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl px-6 font-bold"
                                />
                             </div>
                           ))}
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-zinc-500 px-2">Logical Explanation (EN)</label>
                           <Textarea 
                             value={editingQuestion.en.explanation} 
                             onChange={e => setEditingQuestion({...editingQuestion, en: {...editingQuestion.en, explanation: e.target.value}})}
                             className="min-h-[120px] bg-zinc-900/50 border-white/10 rounded-3xl p-6 text-sm"
                           />
                        </div>
                     </TabsContent>

                     <TabsContent value="pa" className="m-0 space-y-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">ਪ੍ਰਸ਼ਨ (Raavi Punjabi)</label>
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
                                  value={editingQuestion.pa?.options?.[i] || ''} 
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
                                className="h-14 bg-emerald-600/10 border-emerald-500/20 text-emerald-500 font-black rounded-2xl"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-500 uppercase px-2">Classification</label>
                              <Select value={editingQuestion.subject} onValueChange={(v: any) => setEditingQuestion({...editingQuestion, subject: v})}>
                                 <SelectTrigger className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                                 <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                              </Select>
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
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-500 uppercase px-2">Exam Targeting</label>
                              <Input 
                                value={editingQuestion.exam} 
                                onChange={e => setEditingQuestion({...editingQuestion, exam: e.target.value})}
                                className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl px-6 font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-500 uppercase px-2">Year Cycle</label>
                              <Input 
                                type="number"
                                value={editingQuestion.year} 
                                onChange={e => setEditingQuestion({...editingQuestion, year: Number(e.target.value)})}
                                className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl px-6 font-black"
                              />
                           </div>
                        </div>
                     </TabsContent>

                     <TabsContent value="stats" className="m-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl text-center space-y-2">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Global Usage</p>
                              <h3 className="text-3xl font-black text-white">{editingQuestion.usageCount || 0}</h3>
                           </div>
                           <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl text-center space-y-2">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Success Rate</p>
                              <h3 className="text-3xl font-black text-emerald-500">{editingQuestion.correctPercentage || 0}%</h3>
                           </div>
                           <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl text-center space-y-2">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Avg Time</p>
                              <h3 className="text-3xl font-black text-blue-500">{editingQuestion.avgTimeSeconds || 0}s</h3>
                           </div>
                           <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl text-center space-y-2">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Reports</p>
                              <h3 className="text-3xl font-black text-red-500">0</h3>
                           </div>
                        </div>
                     </TabsContent>
                   </>
                 )}
              </div>

              <DialogFooter className="p-10 border-t border-white/5 bg-white/[0.01]">
                 <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl h-14 px-8 font-bold text-zinc-500 text-[11px] uppercase tracking-widest">Discard Changes</Button>
                 <Button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   className="h-14 px-12 rounded-[20px] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl blue-glow ml-4"
                 >
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 w-4 h-4" />}
                    Synchronize Artifact
                 </Button>
              </DialogFooter>
           </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function QuestionBankPage() {
  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto no-scrollbar">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          }>
            <QuestionBankContent />
          </Suspense>
        </main>
      </div>
    </AdminProtect>
  );
}
