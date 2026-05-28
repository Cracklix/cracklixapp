
"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import QuestionForm from '@/components/admin/question-form';
import { parseQuestionsAi } from '@/ai/flows/ai-question-parser-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Database, FileText, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function QuestionsAdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("manual");
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
    setSaving(true);
    try {
      const batch = parsedQuestions.map(q => 
        addDoc(collection(db, "questions"), {
          ...q,
          status: "published",
          usageCount: 0,
          createdAt: Date.now()
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
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="font-headline text-4xl font-bold">Ingestion Hub</h1>
                <p className="text-zinc-500 mt-2">Manual injection or AI-powered bulk ingestion pipeline.</p>
              </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14">
                <TabsTrigger value="manual" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  Manual Form
                </TabsTrigger>
                <TabsTrigger value="ai" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  Power Ingest (AI OCR)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <QuestionForm />
              </TabsContent>

              <TabsContent value="ai" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <Card className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8 h-fit sticky top-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="text-primary w-5 h-5" />
                      Parser Inputs
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Source Text / OCR Output</label>
                        <Textarea 
                          placeholder="Paste text from PDF or OCR here..."
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          className="min-h-[300px] bg-zinc-800/50 border-white/5 rounded-2xl p-4 text-sm leading-relaxed"
                        />
                      </div>
                      <Button 
                        onClick={handleAiParse}
                        disabled={parsing || !rawText.trim()}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg"
                      >
                        {parsing ? <Loader2 className="animate-spin mr-2" /> : <Database className="mr-2 w-4 h-4" />}
                        Execute AI Extraction
                      </Button>
                    </div>
                  </Card>

                  <div className="lg:col-span-2 space-y-6">
                     {parsing && (
                       <div className="py-40 text-center animate-pulse space-y-4">
                          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Synthesizing Bilingual Structures...</p>
                       </div>
                     )}

                     {!parsing && parsedQuestions.length > 0 ? (
                       <div className="space-y-6">
                          <div className="flex justify-between items-center px-4">
                            <h4 className="font-bold text-zinc-400">Extracted Preview ({parsedQuestions.length})</h4>
                            <Button onClick={saveAllToBank} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 rounded-xl font-bold">
                              {saving ? <Loader2 className="animate-spin" /> : "Commit All to Bank"}
                            </Button>
                          </div>

                          {parsedQuestions.map((q, i) => (
                            <Card key={i} className="rounded-[32px] bg-zinc-900/30 border-white/5 overflow-hidden group">
                               <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                     <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{q.subject}</Badge>
                                     <Badge variant="outline" className="text-zinc-500">{q.difficulty}</Badge>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => removeParsed(i)} className="text-zinc-600 hover:text-destructive">
                                     <Trash2 size={16} />
                                  </Button>
                               </div>
                               <div className="p-8 grid md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                     <p className="font-bold leading-relaxed">{q.question_en}</p>
                                     <div className="grid grid-cols-1 gap-2 text-xs text-zinc-500">
                                        {q.options_en.map((o: string, idx: number) => (
                                          <div key={idx} className={o === q.correctAnswer ? "text-emerald-500 font-bold" : ""}>• {o}</div>
                                        ))}
                                     </div>
                                  </div>
                                  <div className="space-y-4 border-l border-white/5 pl-8">
                                     <p className="font-medium text-zinc-400 leading-relaxed">{q.question_pa}</p>
                                     <div className="grid grid-cols-1 gap-2 text-xs text-zinc-600">
                                        {q.options_pa.map((o: string, idx: number) => (
                                          <div key={idx}>• {o}</div>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </Card>
                          ))}
                       </div>
                     ) : !parsing && (
                       <div className="py-60 text-center border-2 border-dashed border-white/5 rounded-[48px] bg-zinc-950/20">
                          <FileText className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                          <p className="text-zinc-600 italic">Feed OCR data into the system to start bulk ingestion.</p>
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
