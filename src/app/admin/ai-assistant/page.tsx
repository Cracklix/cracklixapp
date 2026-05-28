"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { draftAiContent, ContentAssistantOutput } from '@/ai/flows/ai-content-assistant-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Plus, Languages, Database, CheckCircle2, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateQualityScore } from '@/services/ai-duplicate-detector';

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
      toast({ title: "Synthesis Complete", description: "3 bilingual artifacts generated." });
    } catch (error) {
      console.error(error);
      toast({ title: "Synthesis Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function pushToBank(q: any) {
    try {
      const qualityScore = calculateQualityScore(q);
      await addDoc(collection(db, "questions"), {
        ...q,
        status: "draft", // Lands in moderation queue first
        qualityScore,
        source: "AI_STUDIO_V4",
        createdAt: Date.now(),
        serverStamp: serverTimestamp()
      });
      toast({ 
        title: "Pushed to Moderation", 
        description: `Artifact saved with quality score: ${qualityScore}%` 
      });
    } catch (error: any) {
      toast({ title: "Injection Failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-14 h-14 rounded-[28px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                      <Sparkles className="text-primary w-7 h-7" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">AI Studio</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Proprietary LLM-layer for high-yield bilingual MCQ synthesis.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="space-y-8">
                 <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-8 h-fit sticky top-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                      <Database className="text-primary w-5 h-5" />
                      Generator Logic
                    </h3>
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Core Topic / Syllabus Node</label>
                          <Input 
                            placeholder="e.g. Maharaja Ranjit Singh" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-black/40 border-white/5 h-14 rounded-2xl px-6 font-bold"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Complexity Level</label>
                          <Select value={difficulty} onValueChange={setDifficulty}>
                             <SelectTrigger className="bg-black/40 border-white/5 h-14 rounded-2xl font-bold">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                <SelectItem value="easy">Level: Easy</SelectItem>
                                <SelectItem value="medium">Level: Medium</SelectItem>
                                <SelectItem value="hard">Level: Hard</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <Button 
                         onClick={handleDraft} 
                         disabled={loading || !topic}
                         className="w-full h-16 bg-primary hover:bg-primary/90 rounded-[20px] font-black text-lg blue-glow shadow-xl"
                       >
                         {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Synthesize Artifacts"}
                       </Button>
                    </div>
                 </Card>

                 <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-zinc-400">
                       <History className="text-primary w-4 h-4" />
                       Cycle Intelligence
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed italic">
                       "Extracted questions will automatically include Raavi-compliant Punjabi andland in the **Moderation Queue** for final approval."
                    </p>
                 </div>
               </div>

               <div className="md:col-span-2 space-y-8">
                  {loading && (
                    <div className="py-40 text-center animate-pulse space-y-6">
                       <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                       <div className="space-y-2">
                         <p className="text-2xl font-black uppercase tracking-tighter">Drafting Academic Assets</p>
                         <p className="text-zinc-500 font-medium italic">Analyzing Punjab exam patterns for {topic}...</p>
                       </div>
                    </div>
                  )}

                  {!loading && results && results.questions.map((q, i) => (
                    <Card key={i} className="rounded-[48px] bg-zinc-900/30 border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
                       <CardHeader className="p-8 md:p-10 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Languages className="text-primary w-4 h-4" />
                             </div>
                             <div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Extracted Artifact {i+1}</span>
                                <p className="text-sm font-bold text-white">{q.subject}</p>
                             </div>
                          </div>
                          <Button 
                            onClick={() => pushToBank(q)}
                            className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-lg"
                          >
                             <Plus className="w-3 h-3 mr-2" /> Push to Moderation
                          </Button>
                       </CardHeader>
                       <CardContent className="p-10 space-y-12">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                             <div className="space-y-6">
                                <Badge variant="outline" className="border-blue-500/20 text-blue-500 font-black uppercase text-[9px]">English Signal</Badge>
                                <p className="font-bold text-xl leading-relaxed text-white">{q.question_en}</p>
                                <div className="grid gap-3">
                                   {q.options_en.map((o, idx) => (
                                     <div key={idx} className={cn("p-4 rounded-2xl text-sm border", o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
                                       {String.fromCharCode(65+idx)}. {o}
                                     </div>
                                   ))}
                                </div>
                             </div>
                             <div className="space-y-6 border-l border-white/5 pl-16">
                                <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px]">Punjabi Raavi Signal</Badge>
                                <p className="font-medium text-xl leading-relaxed text-zinc-300">{q.question_pa}</p>
                                <div className="grid gap-3">
                                   {q.options_pa.map((o, idx) => (
                                     <div key={idx} className="p-4 rounded-2xl text-sm bg-black/20 border border-white/5 text-zinc-400">{o}</div>
                                   ))}
                                </div>
                             </div>
                          </div>
                          
                          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/10 space-y-3">
                             <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Academic Rationalization</p>
                             <p className="text-sm leading-relaxed text-zinc-300">{q.explanation_en}</p>
                             <p className="text-xs leading-relaxed text-zinc-500 mt-3 italic">{q.explanation_pa}</p>
                          </div>
                       </CardContent>
                    </Card>
                  ))}

                  {!loading && !results && (
                    <div className="py-60 text-center border-2 border-dashed border-white/5 rounded-[64px] bg-zinc-950/20">
                       <Sparkles className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                       <h3 className="text-2xl font-black uppercase text-zinc-600 tracking-tighter">AI Studio Idle</h3>
                       <p className="text-zinc-700 mt-2 font-medium italic">Configure generation parameters to start high-volume asset production.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}