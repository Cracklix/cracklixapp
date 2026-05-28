"use client";

import { useEffect, useState, Suspense } from 'react';
import { collection, query, orderBy, limit, getDocs, where, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
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
  Filter
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
        orderBy("createdAt", "desc"), 
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
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e: any) {
      console.error("Firestore Load Error:", e);
      // We don't throw here to prevent the whole page from crashing
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
    toast({ title: "Status Updated" });
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
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center shadow-lg">
                <Database className="text-primary w-6 h-6" />
              </div>
              <h1 className="font-headline text-5xl font-black tracking-tighter leading-none uppercase">Atomic Bank</h1>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => router.push('/admin/question-bank?view=published')}
                className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all", view === 'published' ? "bg-primary text-white" : "text-zinc-600 hover:text-zinc-400")}
              >Production Bank</button>
              <button 
                onClick={() => router.push('/admin/question-bank?view=draft')}
                className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all", view === 'draft' ? "bg-orange-500 text-white" : "text-zinc-600 hover:text-zinc-400")}
              >Moderation Queue</button>
            </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600" />
              <Input 
                placeholder="Search bank assets..." 
                className="pl-12 h-14 bg-zinc-900 border-white/5 rounded-2xl text-sm" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-64 h-14 bg-zinc-900 border-white/5 rounded-2xl font-bold">
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
        <div className="sticky top-4 z-50 flex items-center justify-between bg-primary/10 border border-primary/20 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl animate-in slide-in-from-top-4">
            <p className="text-sm font-bold text-primary">{selectedIds.size} Artifacts Selected</p>
            <div className="flex gap-4">
              <Button onClick={bulkApprove} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest">Approve All</Button>
              <Button variant="ghost" onClick={() => setSelectedIds(new Set())} className="text-zinc-500 hover:text-white">Clear</Button>
            </div>
        </div>
      )}

      <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-900/50 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  <tr>
                      <th className="px-10 py-8 border-b border-white/5 w-10">#</th>
                      <th className="px-10 py-8 border-b border-white/5">Classification</th>
                      <th className="px-10 py-8 border-b border-white/5">Question Body</th>
                      <th className="px-10 py-8 border-b border-white/5">Metadata</th>
                      <th className="px-10 py-8 border-b border-white/5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="p-40 text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Scanning Atomic Vault</p>
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
                        <td className="px-10 py-8 align-top">
                          <div className={cn(
                            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                            selectedIds.has(q.id) ? "bg-primary border-primary" : "border-white/10"
                          )}>
                              {selectedIds.has(q.id) && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                        </td>
                        <td className="px-10 py-8 align-top">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase px-3 py-1 mb-2 block w-fit">{q.subject}</Badge>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">{q.topic || 'General'}</span>
                        </td>
                        <td className="px-10 py-8 max-w-xl align-top">
                          <p className="text-sm font-bold text-white line-clamp-2 leading-relaxed">{q.question_en}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-2 italic font-medium">{q.question_pa}</p>
                        </td>
                        <td className="px-10 py-8 align-top">
                          <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-black bg-zinc-800/50 border-white/5">{q.difficulty}</Badge>
                              <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-black bg-zinc-800/50 border-white/5">{q.usageCount || 0} Uses</Badge>
                          </div>
                          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">#{q.id.substring(0, 8)}</p>
                        </td>
                        <td className="px-10 py-8 text-right align-top">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <Button 
                                onClick={(e) => { e.stopPropagation(); toggleStatus(q.id, q.status); }}
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl hover:bg-emerald-500/10 text-emerald-500"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                          </div>
                        </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-40 text-center opacity-30">
                        <Database className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-zinc-600 font-black uppercase tracking-widest">No artifacts found in this sector.</p>
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
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          }>
            <QuestionBankContent />
          </Suspense>
        </main>
      </div>
    </AdminProtect>
  );
}
