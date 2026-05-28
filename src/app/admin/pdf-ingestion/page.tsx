"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { parseQuestionsAi } from '@/ai/flows/ai-question-parser-flow';
import { extractText } from '@/services/ocr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Loader2, 
  FileUp, 
  Sparkles, 
  Database, 
  Trash2, 
  CheckCircle2, 
  Languages, 
  AlertCircle,
  Cpu,
  LayoutGrid,
  CheckCircle,
  XCircle,
  Layers,
  Search,
  Table as TableIcon,
  Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

type IngestionStep = 'idle' | 'processing' | 'review';

export default function UniversalPdfIngestion() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<IngestionStep>('idle');
  const [progress, setProgress] = useState(0);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [diSets, setDiSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  }

  async function executeUniversalPipeline() {
    if (!file) return;
    setLoading(true);
    setStep('processing');
    setProgress(10);
    
    try {
      // 1. OCR Pre-process (Optional cleanup)
      setProgress(20);
      const reader = new FileReader();
      
      const photoDataUri = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setProgress(40);
      
      // 2. Multimodal Vision Parsing
      const result = await parseQuestionsAi({ 
        photoDataUri,
        preferredSubject: "General" 
      });

      setProgress(85);
      setDrafts(result.questions);
      setDiSets(result.diSets || []);
      setStep('review');
      setProgress(100);
      
      toast({ 
        title: "Ingestion Success", 
        description: `Synthesized ${result.questions.length} atomic questions and ${result.diSets?.length || 0} DI sets.` 
      });
    } catch (error: any) {
      toast({ title: "Pipeline Break", description: error.message, variant: "destructive" });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  async function commitAllToBank() {
    setLoading(true);
    try {
      const batch = drafts.map(d => 
        addDoc(collection(db, "questions"), {
          ...d,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          source: "UNIVERSAL_PIPELINE_v5",
          sourceFile: file?.name
        })
      );
      
      const diBatch = diSets.map(set => 
        addDoc(collection(db, "diSets"), {
          ...set,
          status: "published",
          createdAt: Date.now(),
          sourceFile: file?.name
        })
      );

      await Promise.all([...batch, ...diBatch]);
      toast({ title: "Question Bank Synced", description: "All assets are now live." });
      setDrafts([]);
      setDiSets([]);
      setStep('idle');
      setFile(null);
    } catch (e: any) {
      toast({ title: "Injection Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                       <Layers className="text-primary w-6 h-6" />
                    </div>
                    <h1 className="font-headline text-5xl font-black tracking-tighter uppercase">Universal Ingestion</h1>
                  </div>
                  <p className="text-zinc-500 font-medium ml-1">Multimodal pipeline for English, Punjabi, Math, and DI content.</p>
               </div>
            </header>

            {step === 'idle' && (
              <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-24 flex flex-col items-center justify-center text-center border-dashed border-2 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                 <div className="w-28 h-28 rounded-[36px] bg-primary/10 flex items-center justify-center mb-10 transition-transform group-hover:scale-110">
                    <FileUp className="text-primary w-12 h-12" />
                 </div>
                 <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Initialize Stream</h2>
                 <p className="text-zinc-500 max-w-md mb-12 text-lg">Drop any Punjab Exam paper, scan, or book page. The engine handles complex math and DI tables automatically.</p>
                 
                 <div className="flex flex-col items-center gap-8 w-full max-w-md">
                    <label className="w-full cursor-pointer p-8 rounded-3xl bg-zinc-800/40 border border-white/5 flex items-center justify-center gap-4 font-bold hover:bg-zinc-800 transition-all">
                       <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                       <LayoutGrid className="text-zinc-500 w-5 h-5" />
                       {file ? file.name : "Select Document Artifact"}
                    </label>
                    <Button 
                      disabled={!file || loading} 
                      onClick={executeUniversalPipeline}
                      className="w-full h-20 rounded-[28px] bg-primary hover:bg-primary/90 text-2xl font-black shadow-2xl transition-transform active:scale-95"
                    >
                       Launch Universal Parser
                    </Button>
                 </div>
              </Card>
            )}

            {step === 'processing' && (
              <div className="py-40 text-center space-y-12">
                 <div className="relative inline-block">
                    <div className="w-40 h-40 border-8 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-14 h-14 animate-pulse" />
                 </div>
                 <div className="max-w-xl mx-auto space-y-6">
                    <h3 className="text-3xl font-black uppercase tracking-[0.2em]">Synthesizing Artifacts</h3>
                    <Progress value={progress} className="h-3 bg-zinc-900 rounded-full" />
                    <div className="flex justify-center gap-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                       <span className={progress >= 20 ? "text-primary" : ""}>Visual Audit</span>
                       <span className={progress >= 60 ? "text-primary" : ""}>Math/DI Logic</span>
                       <span className={progress >= 90 ? "text-primary" : ""}>Bilingual Pairing</span>
                    </div>
                 </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-10 pb-20">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 rounded-[28px] bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="text-white w-10 h-10" />
                       </div>
                       <div>
                          <h4 className="text-4xl font-black uppercase tracking-tighter">Review Arena</h4>
                          <p className="text-emerald-500/60 font-bold uppercase text-xs tracking-widest mt-1">
                             {drafts.length} Questions • {diSets.length} DI Sets synthesized from {file?.name}
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 font-bold" onClick={() => setStep('idle')}>Abort</Button>
                       <Button onClick={commitAllToBank} disabled={loading} className="h-16 flex-1 md:flex-none px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg">
                          {loading ? <Loader2 className="animate-spin" /> : "Commit All to Bank"}
                       </Button>
                    </div>
                 </div>

                 <Tabs defaultValue="questions" className="space-y-10">
                   <TabsList className="bg-zinc-900 border-white/5 p-1.5 h-16 rounded-[24px] w-fit">
                      <TabsTrigger value="questions" className="rounded-[18px] px-10 font-bold text-sm uppercase tracking-widest">
                         <LayoutGrid className="w-4 h-4 mr-2" /> Atomic MCQs
                      </TabsTrigger>
                      <TabsTrigger value="di" className="rounded-[18px] px-10 font-bold text-sm uppercase tracking-widest">
                         <TableIcon className="w-4 h-4 mr-2" /> DI Sets
                      </TabsTrigger>
                   </TabsList>

                   <TabsContent value="questions" className="grid gap-10">
                      {drafts.map((q, i) => (
                        <Card key={i} className="rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden group">
                           <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                              <div className="flex gap-4">
                                 <Badge className="bg-primary text-white border-none font-black px-5 py-2 uppercase text-xs tracking-widest">{q.subject}</Badge>
                                 <Badge variant="outline" className="text-zinc-500 border-white/10 font-black px-4 py-2 uppercase text-xs tracking-widest">{q.difficulty}</Badge>
                                 {q.isMath && <Badge className="bg-blue-500/10 text-blue-500 border-none font-black px-4 py-2 uppercase text-xs"><Calculator className="w-3 h-3 mr-1" /> Math</Badge>}
                              </div>
                              <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-destructive rounded-2xl" onClick={() => setDrafts(prev => prev.filter((_, idx) => idx !== i))}>
                                 <Trash2 size={24} />
                              </Button>
                           </div>
                           <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
                              <div className="space-y-8">
                                 <p className="text-2xl font-bold leading-tight">{q.question_en}</p>
                                 <div className="grid gap-4">
                                    {q.options_en.map((o: string, idx: number) => (
                                      <div key={idx} className={`p-6 rounded-[28px] text-lg border ${o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                                         {o}
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              {q.question_pa && (
                                <div className="space-y-8 border-l border-white/5 pl-16">
                                   <p className="text-2xl font-medium text-zinc-300">{q.question_pa}</p>
                                   <div className="grid gap-4">
                                      {q.options_pa?.map((o: string, idx: number) => (
                                        <div key={idx} className="p-6 rounded-[28px] text-lg bg-black/20 border border-white/5 text-zinc-400">
                                           {o}
                                        </div>
                                      ))}
                                   </div>
                                </div>
                              )}
                           </div>
                        </Card>
                      ))}
                   </TabsContent>

                   <TabsContent value="di" className="space-y-10">
                      {diSets.length > 0 ? diSets.map((set, i) => (
                        <Card key={i} className="rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden">
                           <div className="p-10 bg-white/[0.02] border-b border-white/5">
                              <h5 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">DI Passage Context</h5>
                              <p className="text-lg text-zinc-300 leading-relaxed italic">{set.passage}</p>
                              {set.tableData && (
                                <div className="mt-8 p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-xs whitespace-pre-wrap text-emerald-500">
                                   {set.tableData}
                                </div>
                              )}
                           </div>
                           <div className="p-10 space-y-8">
                              {set.questions.map((q: any, qIdx: number) => (
                                <div key={qIdx} className="p-8 bg-white/[0.01] rounded-[32px] border border-white/5 space-y-4">
                                   <div className="flex justify-between items-start">
                                      <p className="text-lg font-bold">{q.question_en}</p>
                                      <Badge className="bg-emerald-600 text-[10px]">Correct: {q.correctAnswer}</Badge>
                                   </div>
                                   <div className="flex flex-wrap gap-3">
                                      {q.options_en.map((o: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="bg-zinc-800 border-none text-[10px] py-2 px-4">{o}</Badge>
                                      ))}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </Card>
                      )) : (
                        <div className="py-32 text-center text-zinc-600 italic">No Data Interpretation sets detected in this document.</div>
                      )}
                   </TabsContent>
                 </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
