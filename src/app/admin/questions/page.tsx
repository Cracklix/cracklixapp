"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import QuestionForm from '@/components/admin/question-form';
import { parseQuestionsAi } from '@/ai/flows/ai-question-parser-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Database, FileText, CheckCircle2, AlertCircle, Plus, Trash2, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SUBJECTS, Subject } from '@/types';

export default function QuestionsAdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ai");
  const [parsing, setParsing] = useState(false);
  const [rawText, setRawText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleAiParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const result = await parseQuestionsAi({ rawText });
      setParsedQuestions(result.questions);
      toast({ title: "AI Analysis Complete", description: `Extracted ${result.questions.length} structured questions.` });
    } catch (err) {
      toast({ title: "Parsing Failed", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  }

  async function saveAllToBank() {
    if (parsedQuestions.length === 0) return;
    setSaving(true);
    try {
      const batch = parsedQuestions.map(q => 
        addDoc(collection(db, "questions"), {
          ...q,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          serverStamp: serverTimestamp()
        })
      );
      await Promise.all(batch);
      toast({ title: "Question Bank Updated", description: `${parsedQuestions.length} items successfully indexed.` });
      setParsedQuestions([]);
      setRawText("");
    } catch (err) {
      toast({ title: "Saving Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const removeParsed = (idx: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black">Question Bank Core v4.2</Badge>
                </div>
                <h1 className="font-headline text-5xl font-black tracking-tighter">Ingestion Hub</h1>
                <p className="text-zinc-500 mt-2 font-medium">Bulk AI ingestion or manual injection pipeline for 15 core subjects.</p>
              </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14">
                <TabsTrigger value="ai" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Power Ingest (AI OCR)
                </TabsTrigger>
                <TabsTrigger value="manual" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Form
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <QuestionForm />
              </TabsContent>

              <TabsContent value="ai" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4">
                    <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-10 h-fit sticky top-8">
                      <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Database className="text-primary w-6 h-6" />
                        Extraction Parameters
                      </h3>
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Raw Source Text</label>
                          <Textarea 
                            placeholder="Paste text from PDF or OCR output here. Gemini will handle the formatting and bilingual splitting."
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            className="min-h-[400px] bg-zinc-800/30 border-white/5 rounded-3xl p-6 text-sm leading-relaxed"
                          />
                        </div>
                        <Button 
                          onClick={handleAiParse}
                          disabled={parsing || !rawText.trim()}
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl blue-glow"
                        >
                          {parsing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 w-5 h-5" />}
                          {parsing ? "Synthesizing..." : "Execute AI Extraction"}
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                     {parsing && (
                       <div className="py-60 text-center animate-pulse space-y-6">
                          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                          <div className="space-y-2">
                             <p className="text-white text-2xl font-black uppercase tracking-tighter">Synthesizing Bilingual Structures</p>
                             <p className="text-zinc-500 font-medium italic">Our AI is splitting languages, detecting subjects, and formatting Raavi text...</p>
                          </div>
                       </div>
                     )}

                     {!parsing && parsedQuestions.length > 0 ? (
                       <div className="space-y-8">
                          <div className="flex justify-between items-center bg-zinc-900/50 border border-white/5 p-6 px-10 rounded-[32px]">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                  <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-xl">Extracted Artifacts</h4>
                                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{parsedQuestions.length} Questions Ready for Bank</p>
                               </div>
                            </div>
                            <Button onClick={saveAllToBank} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                              {saving ? <Loader2 className="animate-spin mr-2" /> : <Database className="mr-2 w-4 h-4" />}
                              Commit to Question Bank
                            </Button>
                          </div>

                          <div className="grid gap-6">
                            {parsedQuestions.map((q, i) => (
                              <Card key={i} className="rounded-[40px] bg-zinc-900/30 border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                    <div className="flex items-center gap-4">
                                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-4 py-1 uppercase text-[10px]">{q.subject}</Badge>
                                      <Badge variant="outline" className="text-zinc-500 font-black px-3 py-1 uppercase text-[10px]">{q.difficulty}</Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeParsed(i)} className="text-zinc-700 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                                      <Trash2 size={20} />
                                    </Button>
                                </div>
                                <div className="p-10 grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                      <div className="flex items-center gap-2 mb-2">
                                         <Languages className="w-3 h-3 text-blue-500" />
                                         <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">English Context</span>
                                      </div>
                                      <p className="font-bold text-lg leading-relaxed text-white">{q.question_en}</p>
                                      <div className="grid grid-cols-1 gap-3">
                                          {q.options_en.map((o: string, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-xl text-sm transition-all border ${o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-white/[0.02] border-white/5 text-zinc-500"}`}>
                                               {String.fromCharCode(65+idx)}. {o}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <div className="space-y-6 border-l border-white/5 pl-12">
                                      <div className="flex items-center gap-2 mb-2">
                                         <Languages className="w-3 h-3 text-primary" />
                                         <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Punjabi Raavi Context</span>
                                      </div>
                                      <p className="font-medium text-lg leading-relaxed text-zinc-300">{q.question_pa}</p>
                                      <div className="grid grid-cols-1 gap-3">
                                          {q.options_pa.map((o: string, idx: number) => (
                                            <div key={idx} className="p-4 rounded-xl text-sm bg-white/[0.02] border border-white/5 text-zinc-400">
                                               {o}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                </div>
                                <div className="p-8 px-10 bg-white/[0.02] border-t border-white/5">
                                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Academic Explanation</p>
                                   <p className="text-xs text-zinc-500 leading-relaxed italic">{q.explanation_en}</p>
                                </div>
                              </Card>
                            ))}
                          </div>
                       </div>
                     ) : !parsing && (
                       <div className="py-60 text-center border-2 border-dashed border-white/5 rounded-[60px] bg-zinc-950/20">
                          <div className="w-24 h-24 rounded-[32px] bg-zinc-900 flex items-center justify-center mx-auto mb-8">
                             <FileText className="w-12 h-12 text-zinc-800" />
                          </div>
                          <h3 className="text-2xl font-bold text-zinc-600">No Ingestion Stream Active</h3>
                          <p className="text-zinc-700 mt-2 font-medium">Paste raw study data in the left panel to begin atomic extraction.</p>
                       </div>
                     )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
