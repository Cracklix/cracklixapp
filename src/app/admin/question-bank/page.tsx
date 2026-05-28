
"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  Database, 
  Search, 
  MoreVertical, 
  ArrowUpRight, 
  Languages, 
  Zap,
  BarChart3,
  BookOpen,
  Loader2,
  Trash2,
  Sparkles,
  RefreshCw,
  Copy
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { generateVariants } from '@/ai/flows/ai-similar-question-flow';

export default function QuestionBankPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string>("All");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [subject]);

  async function loadQuestions() {
    setLoading(true);
    try {
      let q = query(collection(db, "questions"), orderBy("createdAt", "desc"), limit(50));
      if (subject !== "All") {
        q = query(collection(db, "questions"), where("subject", "==", subject), limit(100));
      }
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    await deleteDoc(doc(db, "questions", id));
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({ title: "Asset Deleted", variant: "destructive" });
  }

  async function handleGenerateVariants(refQ: any) {
    setGeneratingId(refQ.id);
    try {
      const result = await generateVariants({
        referenceQuestion: refQ,
        count: 2
      });

      const batch = result.variants.map(v => 
        addDoc(collection(db, "questions"), {
          ...v,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          aiGenerated: true,
          source: `VARIANT_OF_${refQ.id}`
        })
      );
      await Promise.all(batch);
      toast({ title: "Expansion Successful", description: "Generated 2 concepts similar to selected asset." });
      loadQuestions();
    } catch (e: any) {
      toast({ title: "Generation Error", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shadow-lg">
                     <Database className="text-primary w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter leading-none">Atomic Bank</h1>
                 </div>
                 <p className="text-zinc-500 font-medium">The central asset repository for the CRACKLIX engine.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600" />
                    <Input placeholder="Search bank assets..." className="pl-12 h-14 bg-zinc-900 border-white/5 rounded-2xl text-sm" />
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
                 <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/5 bg-zinc-900" onClick={loadQuestions}>
                    <RefreshCw className={loading ? "animate-spin" : ""} />
                 </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: "Atomic Items", val: questions.length + "+", icon: Zap, color: "text-primary" },
                 { label: "Bilingual Coverage", val: "100%", icon: Languages, color: "text-emerald-500" },
                 { label: "AI Assisted", val: "42%", icon: Sparkles, color: "text-accent" },
                 { label: "Avg. Quality", val: "94%", icon: BarChart3, color: "text-purple-500" },
               ].map(stat => (
                 <Card key={stat.label} className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8 group hover:bg-zinc-900 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <stat.icon className={`${stat.color} w-8 h-8`} />
                       <ArrowUpRight className="text-zinc-800 group-hover:text-white transition-colors" size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">{stat.label}</p>
                    <h2 className="text-4xl font-black">{stat.val}</h2>
                 </Card>
               ))}
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-zinc-900/50 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                        <tr>
                           <th className="px-10 py-8 border-b border-white/5">Context</th>
                           <th className="px-10 py-8 border-b border-white/5">Question Body</th>
                           <th className="px-10 py-8 border-b border-white/5">Metadata</th>
                           <th className="px-10 py-8 border-b border-white/5">Quality</th>
                           <th className="px-10 py-8 border-b border-white/5 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                          <tr><td colSpan={5} className="p-40 text-center animate-pulse">
                             <div className="space-y-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                                <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Scanning Atomic Vault</p>
                             </div>
                          </td></tr>
                        ) : questions.length > 0 ? questions.map(q => (
                          <tr key={q.id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-10 py-8 align-top">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase px-3 py-1 mb-2 block w-fit">{q.subject}</Badge>
                                {q.aiGenerated && <Badge className="bg-accent/10 text-accent border-none text-[8px] font-black uppercase px-2 py-0.5">AI Gen</Badge>}
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
                             <td className="px-10 py-8 align-top">
                                <div className="flex items-center gap-3">
                                   <div className={`w-2 h-2 rounded-full ${q.qualityScore > 80 ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                   <span className="text-[10px] font-black uppercase tracking-widest">{q.qualityScore || 90}% Score</span>
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right align-top">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="rounded-xl hover:bg-primary/10 text-primary"
                                     disabled={generatingId === q.id}
                                     onClick={() => handleGenerateVariants(q)}
                                   >
                                      {generatingId === q.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                   </Button>
                                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(q.id)}>
                                      <Trash2 className="w-4 h-4" />
                                   </Button>
                                </div>
                             </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="p-40 text-center opacity-30">
                             <Database className="w-16 h-16 mx-auto mb-4" />
                             <p className="text-zinc-600 font-black uppercase tracking-widest">Vault is currently empty.</p>
                          </td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
