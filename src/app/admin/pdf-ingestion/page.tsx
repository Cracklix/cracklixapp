
"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { parseQuestionsAi } from '@/ai/flows/ai-question-parser-flow';
import { extractText } from '@/services/ocr';
import { findPotentialDuplicates } from '@/services/ai-duplicate-detector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, FileUp, Sparkles, Database, Trash2, CheckCircle2, Languages, AlertTriangle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PdfIngestionPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'idle' | 'ocr' | 'parsing' | 'review'>('idle');
  const [progress, setProgress] = useState(0);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  async function startIngestion() {
    if (!file) return;
    setLoading(true);
    setStep('ocr');
    setProgress(20);

    try {
      // 1. OCR Extraction
      const rawText = await extractText(file);
      setProgress(50);
      setStep('parsing');

      // 2. AI Parsing
      const result = await parseQuestionsAi({ rawText });
      
      // 3. Duplicate Detection Enhancement
      const enrichedDrafts = await Promise.all(result.questions.map(async (q) => {
        const potentialDupes = await findPotentialDuplicates(q.question_en);
        return { ...q, isDuplicate: potentialDupes.length > 0 };
      }));

      setDrafts(enrichedDrafts);
      setProgress(100);
      setStep('review');
      toast({ title: "Analysis Complete", description: `Detected ${result.questions.length} atomic structures.` });
    } catch (error: any) {
      toast({ title: "Ingestion Failed", description: error.message, variant: "destructive" });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  async function commitAll() {
    setLoading(true);
    try {
      const validDrafts = drafts.filter(d => !d.isDuplicate);
      const batch = validDrafts.map(d => 
        addDoc(collection(db, "questions"), {
          ...d,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          source: "PDF_INGESTION"
        })
      );
      await Promise.all(batch);
      toast({ title: "Question Bank Sync", description: `${validDrafts.length} artifacts committed to production.` });
      setDrafts([]);
      setStep('idle');
      setFile(null);
    } catch (e: any) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-end">
               <div>
                  <h1 className="font-headline text-5xl font-black tracking-tighter">Atomic Ingestion Hub</h1>
                  <p className="text-zinc-500 mt-2">End-to-end PDF to Question Bank pipeline with Gemini v4.2</p>
               </div>
            </header>

            {step === 'idle' && (
              <Card className="rounded-[48px] bg-zinc-900/50 border-white/5 p-20 flex flex-col items-center justify-center text-center border-dashed border-2">
                 <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                    <FileUp className="text-primary w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-bold mb-4">Start New Ingestion Session</h2>
                 <p className="text-zinc-500 max-w-sm mb-10">Upload scanned question papers or study material. Our OCR pipeline will handle the rest.</p>
                 
                 <div className="flex flex-col items-center gap-6">
                    <input type="file" id="file-up" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                    <label htmlFor="file-up" className="cursor-pointer px-10 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center gap-3 font-bold hover:bg-zinc-700 transition-all">
                       {file ? file.name : "Select Asset"}
                    </label>
                    <Button 
                      disabled={!file || loading} 
                      onClick={startIngestion}
                      className="h-16 px-16 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black blue-glow"
                    >
                       Execute Pipeline
                    </Button>
                 </div>
              </Card>
            )}

            {(step === 'ocr' || step === 'parsing') && (
              <div className="py-40 text-center space-y-10">
                 <div className="relative inline-block">
                    <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-10 h-10 animate-pulse" />
                 </div>
                 <div className="max-w-md mx-auto space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-widest">
                       {step === 'ocr' ? "Extracting Visual Symbols" : "Synthesizing Logical Structures"}
                    </h3>
                    <Progress value={progress} className="h-1.5 bg-zinc-800" />
                    <p className="text-zinc-600 italic">"Our AI is splitting 15 subjects and formatting Gurmukhi Raavi text..."</p>
                 </div>
              </div>
            )}

            {step === 'review' && drafts.length > 0 && (
              <div className="space-y-8">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="text-white w-8 h-8" />
                       </div>
                       <div>
                          <h4 className="text-2xl font-black uppercase tracking-tighter">Draft Validation Suite</h4>
                          <p className="text-emerald-500/60 font-bold uppercase text-[10px] tracking-widest">{drafts.length} Artifacts successfully extracted</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setStep('idle')}>Discard Session</Button>
                       <Button onClick={commitAll} disabled={loading} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black shadow-xl">
                          {loading ? <Loader2 className="animate-spin" /> : <Database className="mr-2" />}
                          Commit All to Bank
                       </Button>
                    </div>
                 </div>

                 <div className="grid gap-6">
                    {drafts.map((q, i) => (
                      <Card key={i} className={`rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden group ${q.isDuplicate ? 'opacity-60 grayscale' : ''}`}>
                         <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                               <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 uppercase text-[10px]">{q.subject}</Badge>
                               <Badge variant="outline" className="text-zinc-500 border-white/10 font-black px-3 py-1 uppercase text-[10px]">{q.difficulty}</Badge>
                               {q.isDuplicate && <Badge className="bg-destructive/20 text-destructive border-none font-black px-3 py-1 uppercase text-[10px] flex items-center gap-1"><AlertCircle size={10} /> Potential Duplicate</Badge>}
                            </div>
                            <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-destructive rounded-xl" onClick={() => setDrafts(prev => prev.filter((_, idx) => idx !== i))}>
                               <Trash2 size={18} />
                            </Button>
                         </div>
                         <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                               <p className="text-[10px] font-black uppercase text-zinc-600 flex items-center gap-2"><Languages className="w-3 h-3" /> English Context</p>
                               <p className="text-lg font-bold leading-relaxed">{q.question_en}</p>
                               <div className="grid gap-3">
                                  {q.options_en.map((o: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-xl text-sm border ${o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                                       {o}
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-6 border-l border-white/5 pl-12">
                               <p className="text-[10px] font-black uppercase text-zinc-600 flex items-center gap-2"><Languages className="w-3 h-3 text-primary" /> ਪੰਜਾਬੀ Context</p>
                               <p className="text-lg font-medium leading-relaxed">{q.question_pa}</p>
                               <div className="grid gap-3">
                                  {q.options_pa.map((o: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-xl text-sm bg-black/20 border border-white/5 text-zinc-400">{o}</div>
                                  ))}
                               </div>
                            </div>
                         </div>
                         <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                               <AlertTriangle className="text-primary w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">AI Explanation Draft</p>
                               <p className="text-xs text-zinc-400 leading-relaxed italic">{q.explanation_en}</p>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
