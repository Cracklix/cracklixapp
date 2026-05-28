"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { parseQuestionsAi } from '@/ai/flows/ai-question-parser-flow';
import { extractText } from '@/services/ocr';
import { findPotentialDuplicates, calculateQualityScore } from '@/services/ai-duplicate-detector';
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
  AlertTriangle, 
  AlertCircle,
  Cpu,
  LayoutGrid,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

type IngestionStep = 'idle' | 'ocr' | 'parsing' | 'duplicate_check' | 'review';

export default function EnterprisePdfIngestion() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<IngestionStep>('idle');
  const [progress, setProgress] = useState(0);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  async function startPipeline() {
    if (!file) return;
    setLoading(true);
    
    try {
      // PHASE 1: OCR EXTRACTION
      setStep('ocr');
      setProgress(15);
      const rawText = await extractText(file);
      
      // PHASE 2: AI SYNTHESIS
      setStep('parsing');
      setProgress(45);
      const result = await parseQuestionsAi({ 
        rawText, 
        sourceMetadata: `Source: ${file.name} | Size: ${Math.round(file.size / 1024)}KB` 
      });
      
      // PHASE 3: DUPLICATE & QUALITY ENGINE
      setStep('duplicate_check');
      setProgress(75);
      const enrichedDrafts = await Promise.all(result.questions.map(async (q) => {
        const potentialDupes = await findPotentialDuplicates(q.question_en);
        return { 
          ...q, 
          isDuplicate: potentialDupes.length > 0,
          qualityScore: calculateQualityScore(q)
        };
      }));

      setDrafts(enrichedDrafts);
      setProgress(100);
      setStep('review');
      toast({ title: "Pipeline Ready", description: `Synthesized ${result.questions.length} atomic assets.` });
    } catch (error: any) {
      toast({ title: "Pipeline Break", description: error.message, variant: "destructive" });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  async function commitToBank() {
    setLoading(true);
    try {
      const validDrafts = drafts.filter(d => !d.isDuplicate);
      const batch = validDrafts.map(d => 
        addDoc(collection(db, "questions"), {
          ...d,
          status: "published",
          usageCount: 0,
          createdAt: Date.now(),
          source: "PIPELINE_v4",
          sourceFile: file?.name
        })
      );
      await Promise.all(batch);
      toast({ title: "Asset Bank Synchronized", description: `${validDrafts.length} structures injected into production.` });
      setDrafts([]);
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
                       <Cpu className="text-primary w-6 h-6" />
                    </div>
                    <h1 className="font-headline text-5xl font-black tracking-tighter">Content Ingestion Engine</h1>
                  </div>
                  <p className="text-zinc-500 font-medium ml-1">Enterprise pipeline for bulk Punjab Govt exam asset production.</p>
               </div>
            </header>

            {step === 'idle' && (
              <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-24 flex flex-col items-center justify-center text-center border-dashed border-2 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                 <div className="w-28 h-28 rounded-[36px] bg-primary/10 flex items-center justify-center mb-10 transition-transform group-hover:scale-110">
                    <FileUp className="text-primary w-12 h-12" />
                 </div>
                 <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Initialize Ingestion Stream</h2>
                 <p className="text-zinc-500 max-w-md mb-12 text-lg">Upload official PPSC/PSSSB papers or scanned books. Our hybrid OCR+AI pipeline handles the bilingual complexity.</p>
                 
                 <div className="flex flex-col items-center gap-8 w-full max-w-md">
                    <label className="w-full cursor-pointer p-8 rounded-3xl bg-zinc-800/40 border border-white/5 flex items-center justify-center gap-4 font-bold hover:bg-zinc-800 transition-all">
                       <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                       <LayoutGrid className="text-zinc-500 w-5 h-5" />
                       {file ? file.name : "Select Asset Identity"}
                    </label>
                    <Button 
                      disabled={!file || loading} 
                      onClick={startPipeline}
                      className="w-full h-20 rounded-[28px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow shadow-2xl transition-transform active:scale-95"
                    >
                       Execute Pipeline
                    </Button>
                 </div>
              </Card>
            )}

            {step !== 'idle' && step !== 'review' && (
              <div className="py-60 text-center space-y-12">
                 <div className="relative inline-block">
                    <div className="w-40 h-40 border-8 border-primary/10 border-t-primary rounded-full animate-spin mx-auto shadow-2xl" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-14 h-14 animate-pulse" />
                 </div>
                 <div className="max-w-xl mx-auto space-y-6">
                    <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-white">
                       {step === 'ocr' ? "Visual Symbol Extraction" : 
                        step === 'parsing' ? "Logical Schema Synthesis" : "Integrity Audit Active"}
                    </h3>
                    <div className="relative">
                      <Progress value={progress} className="h-3 bg-zinc-900 rounded-full overflow-hidden" />
                      <div className="absolute inset-0 bg-primary/10 blur-xl -z-10" />
                    </div>
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest animate-pulse">
                       "Refining 15 subjects... splitting Gurmukhi Raavi text... detecting answer keys..."
                    </p>
                 </div>
              </div>
            )}

            {step === 'review' && drafts.length > 0 && (
              <div className="space-y-10">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                       <CheckCircle size={150} />
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                       <div className="w-20 h-20 rounded-[28px] bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <CheckCircle2 className="text-white w-10 h-10" />
                       </div>
                       <div>
                          <h4 className="text-4xl font-black uppercase tracking-tighter">Production Validation Suite</h4>
                          <p className="text-emerald-500/60 font-bold uppercase text-xs tracking-widest mt-1">{drafts.length} Assets successfully synthesized from {file?.name}</p>
                       </div>
                    </div>
                    <div className="flex gap-4 relative z-10 w-full md:w-auto">
                       <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 font-bold text-zinc-500 hover:bg-white/5" onClick={() => setStep('idle')}>Discard Session</Button>
                       <Button onClick={commitToBank} disabled={loading} className="h-16 flex-1 md:flex-none px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg shadow-xl shadow-emerald-900/20">
                          {loading ? <Loader2 className="animate-spin" /> : <Database className="mr-3 w-6 h-6" />}
                          Inject to Bank
                       </Button>
                    </div>
                 </div>

                 <div className="grid gap-10">
                    <AnimatePresence>
                      {drafts.map((q, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className={`rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden group transition-all hover:border-primary/20 ${q.isDuplicate ? 'opacity-50 grayscale' : ''}`}>
                            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex flex-wrap items-center gap-4">
                                   <Badge className="bg-primary text-white border-none font-black px-5 py-2 uppercase text-xs tracking-widest">{q.subject}</Badge>
                                   <Badge variant="outline" className="text-zinc-500 border-white/10 font-black px-4 py-2 uppercase text-xs tracking-widest">{q.difficulty}</Badge>
                                   <Badge variant="outline" className="bg-zinc-800 border-none font-black px-3 py-2 uppercase text-[10px] text-zinc-400">Score: {q.qualityScore}%</Badge>
                                   {q.isDuplicate && (
                                     <Badge className="bg-destructive/20 text-destructive border-none font-black px-4 py-2 uppercase text-xs flex items-center gap-2 animate-pulse"><AlertCircle size={14} /> Potential Duplicate Detected</Badge>
                                   )}
                                </div>
                                <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all" onClick={() => setDrafts(prev => prev.filter((_, idx) => idx !== i))}>
                                   <Trash2 size={24} />
                                </Button>
                            </div>
                            
                            <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
                               <div className="space-y-8">
                                  <div className="flex items-center gap-3">
                                     <Languages className="w-5 h-5 text-blue-500" />
                                     <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">English Standard context</span>
                                  </div>
                                  <p className="text-2xl font-bold leading-tight text-white">{q.question_en}</p>
                                  <div className="grid gap-4">
                                     {q.options_en.map((o: any, idx: number) => (
                                       <div key={idx} className={`p-6 rounded-[28px] text-lg border transition-all ${o === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold shadow-lg" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                                          <span className="font-black text-zinc-700 mr-4">{String.fromCharCode(65+idx)}</span>
                                          {o}
                                       </div>
                                     ))}
                                  </div>
                               </div>
                               
                               <div className="space-y-8 border-l border-white/5 pl-16">
                                  <div className="flex items-center gap-3">
                                     <Languages className="w-5 h-5 text-primary" />
                                     <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">ਪੰਜਾਬੀ ਗੁਰਮੁਖੀ (Raavi) context</span>
                                  </div>
                                  <p className="text-2xl font-medium leading-tight text-zinc-300">{q.question_pa}</p>
                                  <div className="grid gap-4">
                                     {q.options_pa.map((o: any, idx: number) => (
                                       <div key={idx} className="p-6 rounded-[28px] text-lg bg-black/20 border border-white/5 text-zinc-400">
                                          <span className="font-black text-zinc-800 mr-4">{idx + 1}</span>
                                          {o}
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </div>

                            <div className="p-10 bg-white/[0.02] border-t border-white/5 flex gap-6 items-start">
                               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                  <AlertTriangle className="text-primary w-6 h-6" />
                               </div>
                               <div className="space-y-2">
                                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Academic Explanation Draft</p>
                                  <p className="text-sm text-zinc-400 leading-relaxed italic pr-12">{q.explanation_en}</p>
                               </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
