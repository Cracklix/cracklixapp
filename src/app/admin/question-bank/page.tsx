"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  Database, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpRight, 
  CheckCircle2, 
  Languages, 
  Zap,
  BarChart3,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS, Subject } from '@/types';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string>("All");

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
                 <p className="text-zinc-500 font-medium">The central bilingual repository for the CRACKLIX engine.</p>
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
                       <SelectItem value="All">All 15 Subjects</SelectItem>
                       {SUBJECTS.map(s => (
                         <SelectItem key={s} value={s}>{s}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: "Atomic Items", val: "12,450", icon: Zap, color: "text-primary" },
                 { label: "Bilingual Score", val: "100%", icon: Languages, color: "text-emerald-500" },
                 { label: "Subjects Indexed", val: "15/15", icon: BookOpen, color: "text-accent" },
                 { label: "Avg. Quality", val: "94.2%", icon: BarChart3, color: "text-purple-500" },
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
                           <th className="px-10 py-8 border-b border-white/5">ID / Context</th>
                           <th className="px-10 py-8 border-b border-white/5">Question Body (Bilingual)</th>
                           <th className="px-10 py-8 border-b border-white/5">Meta Strategy</th>
                           <th className="px-10 py-8 border-b border-white/5">Audit Status</th>
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
                                <p className="text-xs font-mono text-zinc-600 mb-2">#{q.id.substring(0, 8)}</p>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase px-3 py-1">{q.subject}</Badge>
                             </td>
                             <td className="px-10 py-8 max-w-xl align-top">
                                <p className="text-sm font-bold text-white line-clamp-2 leading-relaxed">{q.question_en}</p>
                                <p className="text-xs text-zinc-500 line-clamp-1 mt-2 italic font-medium">{q.question_pa}</p>
                             </td>
                             <td className="px-10 py-8 align-top">
                                <div className="flex gap-2 mb-3">
                                   <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-black bg-zinc-800/50 border-white/5">{q.difficulty}</Badge>
                                   <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-black bg-zinc-800/50 border-white/5">{q.usageCount || 0} Uses</Badge>
                                </div>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Added: {new Date(q.createdAt).toLocaleDateString()}</p>
                             </td>
                             <td className="px-10 py-8 align-top">
                                <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">INDEXED</span>
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right align-top">
                                <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/5">
                                   <MoreVertical className="w-5 h-5 text-zinc-500" />
                                </Button>
                             </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="p-40 text-center">
                             <div className="space-y-4 opacity-30">
                                <Database className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-zinc-600 font-black uppercase tracking-widest">No atomic assets for this subject.</p>
                             </div>
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
