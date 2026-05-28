
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
  BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("All");

  useEffect(() => {
    loadQuestions();
  }, [subject]);

  async function loadQuestions() {
    setLoading(true);
    try {
      let q = query(collection(db, "questions"), orderBy("createdAt", "desc"), limit(50));
      if (subject !== "All") {
        q = query(collection(db, "questions"), where("subject", "==", subject), limit(50));
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
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                     <Database className="text-primary w-5 h-5" />
                   </div>
                   <h1 className="font-headline text-4xl font-bold">Central Repository</h1>
                 </div>
                 <p className="text-zinc-500 font-medium">Global database of atomic bilingual assets for the Cracklix engine.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                    <Input placeholder="Search bank indexing..." className="pl-10 h-12 bg-zinc-900 border-white/5 rounded-2xl" />
                 </div>
                 <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="w-44 h-12 bg-zinc-900 border-white/5 rounded-2xl">
                       <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="All">All Subjects</SelectItem>
                       <SelectItem value="Punjab GK">Punjab GK</SelectItem>
                       <SelectItem value="Quant">Quant</SelectItem>
                       <SelectItem value="Reasoning">Reasoning</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: "Atomic Items", val: "12,450", icon: Zap, color: "text-primary" },
                 { label: "Bilingual Coverage", val: "100%", icon: Languages, color: "text-emerald-500" },
                 { label: "Avg. Quality", val: "94.2%", icon: BarChart3, color: "text-accent" },
               ].map(stat => (
                 <Card key={stat.label} className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8">
                    <stat.icon className={`${stat.color} w-6 h-6 mb-4`} />
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1">{stat.label}</p>
                    <h2 className="text-3xl font-black">{stat.val}</h2>
                 </Card>
               ))}
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-zinc-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        <tr>
                           <th className="px-8 py-6">ID / Context</th>
                           <th className="px-8 py-6">Question Preview</th>
                           <th className="px-8 py-6">Metadata</th>
                           <th className="px-8 py-6">Status</th>
                           <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                          <tr><td colSpan={5} className="p-20 text-center animate-pulse">Scanning central vault...</td></tr>
                        ) : questions.map(q => (
                          <tr key={q.id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-8 py-6">
                                <p className="text-xs font-mono text-zinc-600">#{q.id.substring(0, 8)}</p>
                                <p className="text-[10px] font-bold text-primary uppercase mt-1">{q.subject}</p>
                             </td>
                             <td className="px-8 py-6 max-w-md">
                                <p className="text-sm font-bold text-white line-clamp-1">{q.question_en}</p>
                                <p className="text-xs text-zinc-500 line-clamp-1 mt-1 italic">{q.question_pa}</p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex gap-2">
                                   <Badge variant="outline" className="text-[8px] uppercase tracking-widest">{q.difficulty}</Badge>
                                   <Badge variant="outline" className="text-[8px] uppercase tracking-widest">{q.usageCount || 0} Uses</Badge>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase">INDEXED</Badge>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                   <MoreVertical className="w-4 h-4" />
                                </Button>
                             </td>
                          </tr>
                        ))}
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
