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
import { Loader2, Sparkles, Database, FileText, CheckCircle2, AlertCircle, Plus, Trash2, Languages, Globe } from 'lucide-react';
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
      toast({ title: "Extraction Complete", description: `Parsed ${result.questions.length} artifacts across EN/HI/PA.` });
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
      toast({ title: "Bank Synchronized", description: `${parsedQuestions.length} assets pushed to production.` });
      setParsedQuestions([]);
      setRawText("");
    } catch (err) {
      toast({ title: "Saving Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex justify-between items-end border-b border-white/5 pb-10">
              <div>
                <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Universal Ingest</h1>
                <p className="text-zinc-500 mt-2 font-medium">Bilingual and Trilingual MCQ Synthesis for National Exams.</p>
              </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14">
                <TabsTrigger value="ai" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Trilingual Power Ingest
                </TabsTrigger>
                <TabsTrigger value="manual" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="space-y-8">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4">
                    <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-10 h-fit sticky top-8">
                      <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Globe className="text-primary" /> Source Payload
                      </h3>
                      <Textarea 
                        placeholder="Paste Trilingual content (English/Hindi/Punjabi)..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="min-h-[400px] bg-zinc-800/30 border-white/5 rounded-3xl p-6 text-sm leading-relaxed overflow-y-auto break-words resize-none"
                      />
                      <Button 
                        onClick={handleAiParse}
                        disabled={parsing || !rawText.trim()}
                        className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 mt-8 font-black text-lg blue-glow"
                      >
                        {parsing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        EXECUTE AI PARSER
                      </Button>
                    </Card>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                     {parsing && (
                       <div className="py-40 text-center animate-pulse">
                          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
                          <p className="text-2xl font-black uppercase">Decrypting Multilingual Data</p>
                       </div>
                     )}

                     {!parsing && parsedQuestions.length > 0 && (
                       <div className="space-y-8">
                          <div className="flex justify-between items-center bg-zinc-900/50 border border-white/5 p-8 rounded-[32px]">
                             <div>
                               <h4 className="font-bold text-xl">Review Staging Area</h4>
                               <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">{parsedQuestions.length} Questions Detected</p>
                             </div>
                             <Button onClick={saveAllToBank} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-2xl font-black">
                                COMMIT TO PRODUCTION BANK
                             </Button>
                          </div>

                          <div className="grid gap-6">
                            {parsedQuestions.map((q, i) => (
                              <Card key={i} className="rounded-[40px] bg-zinc-900/30 border-white/5 overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                   <div className="flex gap-4">
                                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black">{q.subject}</Badge>
                                      <Badge variant="outline" className="text-zinc-500 font-black">{q.difficulty}</Badge>
                                   </div>
                                   <Button variant="ghost" size="icon" onClick={() => setParsedQuestions(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-700 hover:text-destructive">
                                      <Trash2 size={20} />
                                   </Button>
                                </div>
                                <div className="p-10 space-y-10">
                                   <div className="grid md:grid-cols-2 gap-10">
                                      <div className="space-y-4">
                                         <Badge className="bg-blue-600 text-[8px] font-black">ENGLISH</Badge>
                                         <p className="font-bold text-lg leading-relaxed">{q.question_en}</p>
                                      </div>
                                      <div className="space-y-4 border-l border-white/5 pl-10">
                                         <Badge className="bg-orange-600 text-[8px] font-black">NATIVE (HI/PA)</Badge>
                                         <p className="font-medium text-lg leading-relaxed text-zinc-300">{q.question_hi || q.question_pa}</p>
                                      </div>
                                   </div>
                                </div>
                              </Card>
                            ))}
                          </div>
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
