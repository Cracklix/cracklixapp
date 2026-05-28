
"use client";

import { useEffect, useState, Suspense } from 'react';
import { collection, query, limit, getDocs, where, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  Database, 
  Search, 
  ArrowUpRight, 
  Languages, 
  Zap,
  BarChart3,
  Loader2,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileSearch,
  Filter,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function QuestionBankContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'published';
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setQuestions(docs);
    } catch (e: any) {
      console.error("Firestore Load Error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function bulkApprove() {
    if (selectedIds.size === 0) return;
    const batch = writeBatch(db);
    selectedIds.forEach(id => {
      batch.update(doc(db, "questions", id), { status: "published" });
    });
    await batch.commit();
    toast({ title: "Bulk Approval Success", description: `${selectedIds.size} artifacts moved to production bank.` });
    setSelectedIds(new Set());
    loadQuestions();
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === 'published' ? 'draft' : 'published';
    await updateDoc(doc(db, "questions", id), { status: next });
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({ title: "Status Updated", description: `Artifact moved to ${next} storage.` });
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filtered = questions.filter(q => 
    q.question_en?.toLowerCase().includes(search.toLowerCase()) ||
    q.question_pa?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                <Database className="text-primary w-5 h-5" />
              </div>
              <h1 className="font-headline text-4xl font-black tracking-tighter leading-none uppercase">Atomic Bank</h1>
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
                placeholder="Search bank assets..." 
                className="pl-11 h-12 bg-zinc-900 border-white/5 rounded-2xl text-xs font-medium" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full sm:w-56 h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-xs">
                  <SelectValue placeholder="Filter Subject" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white max-h-[400px]">
                  <SelectItem value="All">All Subjects</SelectItem>
                  {SUBJECTS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
        </div>
      </header>

      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-50 flex items-center justify-between bg-primary/10 border border-primary/20 backdrop-blur-xl p-4 rounded-3xl shadow-2xl animate-in slide-in-from-top-4">
            <p className="text-xs font-bold text-primary">{selectedIds.size} Artifacts Selected</p>
            <div className="flex gap-2">
              <Button onClick={bulkApprove} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">Approve All</Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-zinc-500 hover:text-white h-9">Clear</Button>
            </div>
        </div>
      )}

      <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-900/50 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  <tr>
                      <th className="px-8 py-6 border-b border-white/5 w-10">#</th>
                      <th className="px-8 py-6 border-b border-white/5">Classification</th>
                      <th className="px-8 py-6 border-b border-white/5">Question Body</th>
                      <th className="px-8 py-6 border-b border-white/5">Metadata</th>
                      <th className="px-8 py-6 border-b border-white/5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="p-40 text-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-zinc-600 font-black uppercase tracking-widest text-[9px]">Scanning Atomic Vault</p>
                    </td></tr>
                  ) : filtered.length > 0 ? filtered.map(q => (
                    <tr 
                      key={q.id} 
                      onClick={() => toggleSelect(q.id)}
                      className={cn(
                        "hover:bg-white/[0.02] transition-colors group cursor-pointer",
                        selectedIds.has(q.id) && "bg-primary/[0.05]"
                      )}
                    >
                        <td className="px-8 py-6 align-top">
                          <div className={cn(
                            "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                            selectedIds.has(q.id) ? "bg-primary border-primary" : "border-white/10"
                          )}>
                              {selectedIds.has(q.id) && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                        </td>
                        <td className="px-8 py-6 align-top">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black uppercase px-2 py-0.5 mb-1.5 block w-fit">{q.subject}</Badge>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">{q.topic || 'General'}</span>
                        </td>
                        <td className="px-8 py-6 max-w-xl align-top">
                          <p className="text-sm font-bold text-white line-clamp-2 leading-relaxed">{q.question_en}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-1.5 italic font-medium">{q.question_pa}</p>
                        </td>
                        <td className="px-8 py-6 align-top">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                              <Badge variant="outline" className="text-[7px] uppercase tracking-widest font-black bg-zinc-800/50 border-white/5 px-2">{q.difficulty}</Badge>
                              <Badge variant="outline" className="text-[7px] uppercase tracking-widest font-black bg-zinc-800/50 border-white/5 px-2">{q.usageCount || 0} Uses</Badge>
                              {q.qualityScore && <Badge variant="outline" className="text-[7px] uppercase font-black text-emerald-500 border-emerald-500/20 px-2">{q.qualityScore}% Q</Badge>}
                          </div>
                          <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">#{q.id.substring(0, 8)}</p>
                        </td>
                        <td className="px-8 py-6 text-right align-top">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <Button 
                                onClick={(e) => { e.stopPropagation(); toggleStatus(q.id, q.status); }}
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-xl hover:bg-emerald-500/10 text-emerald-500"
                                title={q.status === 'published' ? "Move to Moderation" : "Approve and Publish"}
                              >
                                {q.status === 'published' ? <RefreshCw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              </Button>
                              <Button 
                                onClick={(e) => { e.stopPropagation(); if(confirm('Delete artifact?')) deleteDoc(doc(db, 'questions', q.id)); }}
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-xl hover:bg-destructive/10 text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                          </div>
                        </td>
                    </tr>
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
