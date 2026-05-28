
"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminGuard from '@/components/admin-guard';
import { draftAiContent, ContentAssistantOutput } from '@/ai/flows/ai-content-assistant-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Plus, Copy, Languages, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AiAssistantPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [results, setResult] = useState<ContentAssistantOutput | null>(null);

  async function handleDraft() {
    if (!topic) return;
    setLoading(true);
    try {
      const data = await draftAiContent({ topic, difficulty: difficulty as any, count: 3 });
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function pushToBank(q: any) {
    try {
      await addDoc(collection(db, "questions"), {
        ...q,
        status: "published",
        createdAt: Date.now()
      });
      toast({ title: "Injected to Bank", description: "Bilingual question is now live." });
    } catch (error: any) {
      toast({ title: "Injection Failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <AdminGuard>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-headline text-4xl font-bold">AI Content Factory</h1>
                <p className="text-zinc-500 mt-2">Generate exam-ready bilingual MCQs and deep explanations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8 h-fit sticky top-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="text-primary w-5 h-5" />
                    Generator Parameters
                  </h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Core Topic</label>
                        <Input 
                          placeholder="e.g. Bhakra Nangal Dam" 
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="bg-zinc-800 border-white/5"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Complexity</label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                           <SelectTrigger className="bg-zinc-800 border-white/5">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <Button 
                       onClick={handleDraft} 
                       disabled={loading || !topic}
                       className="w-full h-12 bg-primary hover:bg-primary/90 font-bold"
                     >
                       {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Synthesize Questions"}
                     </Button>
                  </div>
               </Card>

               <div className="md:col-span-2 space-y-6">
                  {loading && (
                    <div className="py-20 text-center animate-pulse space-y-4">
                       <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                       <p className="text-zinc-500 italic">Drafting bilingual assets for {topic}...</p>
                    </div>
                  )}

                  {!loading && results && results.questions.map((q, i) => (
                    <Card key={i} className="rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden">
                       <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Languages className="text-primary w-4 h-4" />
                             <span className="text-xs font-bold text-zinc-400">Question {i+1}</span>
                          </div>
                          <Button 
                            onClick={() => pushToBank(q)}
                            className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase"
                          >
                             <Plus className="w-3 h-3 mr-1" /> Inject to Bank
                          </Button>
                       </CardHeader>
                       <CardContent className="p-8 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <Badge variant="outline" className="border-blue-500/20 text-blue-500">English</Badge>
                                <p className="font-bold text-lg">{q.question_en}</p>
                                <ul className="space-y-2 text-sm text-zinc-500">
                                   {q.options_en.map((o, idx) => (
                                     <li key={idx} className={o === q.correctAnswer ? "text-emerald-500 font-bold" : ""}>• {o}</li>
                                   ))}
                                </ul>
                             </div>
                             <div className="space-y-4">
                                <Badge variant="outline" className="border-primary/20 text-primary">ਪੰਜਾਬੀ</Badge>
                                <p className="font-bold text-lg">{q.question_pa}</p>
                                <ul className="space-y-2 text-sm text-zinc-500">
                                   {q.options_pa.map((o, idx) => (
                                     <li key={idx}>• {o}</li>
                                   ))}
                                </ul>
                             </div>
                          </div>
                          
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                             <p className="text-[10px] font-black uppercase text-zinc-500">Academic Explanation</p>
                             <p className="text-xs leading-relaxed text-zinc-300">{q.explanation_en}</p>
                             <p className="text-xs leading-relaxed text-zinc-400 mt-2 italic">{q.explanation_pa}</p>
                          </div>
                       </CardContent>
                    </Card>
                  ))}

                  {!loading && !results && (
                    <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[48px]">
                       <Sparkles className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                       <p className="text-zinc-600 italic">Configure parameters to start high-volume question production.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
