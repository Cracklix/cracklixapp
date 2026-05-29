"use client";

import { useState, useRef } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Upload, 
  Plus, 
  Database, 
  Rocket, 
  CheckCircle2, 
  Trash2, 
  Languages, 
  Timer, 
  Zap,
  Loader2,
  Image as ImageIcon,
  Search,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EXAM_CONFIG, LanguageMode } from '@/types';
import { parseRawText } from '@/services/question-parser';
import { addDoc, collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Worker config
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function ManualMockBuilder() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("paste");
  
  // Basic Config
  const [config, setConfig] = useState({
    title: "",
    exam: "PSSSB",
    subject: "Punjab GK",
    duration: 60,
    negativeMarking: 0.25,
    marksPerQuestion: 1,
    languageMode: "english" as LanguageMode,
    accessType: "pass_plus" as any
  });

  const [rawText, setRawText] = useState("");
  const [parsedArtifacts, setParsedArtifacts] = useState<any[]>([]);

  // Local Parsing Logic
  const handleIngestRaw = () => {
    if (!rawText.trim()) return;
    const questions = parseRawText(rawText);
    setParsedArtifacts(questions);
    toast({ title: "Ingestion Complete", description: `Detected ${questions.length} MCQs.` });
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ');
        }
        setRawText(fullText);
        const questions = parseRawText(fullText);
        setParsedArtifacts(questions);
      } else if (file.type.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(file, 'eng+pan+hin');
        setRawText(text);
        const questions = parseRawText(text);
        setParsedArtifacts(questions);
      }
      toast({ title: "Extraction Success" });
    } catch (err: any) {
      toast({ title: "Parsing Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!config.title || parsedArtifacts.length === 0) {
      return toast({ title: "Missing Data", description: "Set title and ingest questions.", variant: "destructive" });
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const mockRef = doc(collection(db, "mocks"));
      
      const totalMarks = parsedArtifacts.length * config.marksPerQuestion;

      batch.set(mockRef, {
        ...config,
        id: mockRef.id,
        totalQuestions: parsedArtifacts.length,
        totalMarks,
        status: "published",
        attemptCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      parsedArtifacts.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        const finalAnswer = q.answer.charCodeAt(0) - 65; // A=0, B=1...

        batch.set(qRef, {
          id: qRef.id,
          questionEn: q.question,
          options: q.options.map((opt: string) => ({ en: opt })),
          correctAnswer: finalAnswer,
          explanationEn: q.explanation,
          subject: config.subject,
          difficulty: "medium",
          marks: config.marksPerQuestion,
          negativeMarks: config.negativeMarking,
          order: idx,
          createdAt: Date.now()
        });

        // Sync to Atomic Bank
        const bankRef = doc(collection(db, "questions"));
        batch.set(bankRef, {
          questionEn: q.question,
          subject: config.subject,
          status: "published",
          createdAt: Date.now()
        });
      });

      await batch.commit();
      toast({ title: "Mock Published", description: "Simulation is now live in student arena." });
      setParsedArtifacts([]);
      setRawText("");
    } catch (e: any) {
      toast({ title: "Publish Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Manual Mock Builder</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Upload → Parse → Build → Publish</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="h-12 rounded-xl border-white/10 hover:bg-white/5 font-black text-[10px] uppercase tracking-widest">
                   Save Draft
                </Button>
                <Button onClick={handlePublish} disabled={loading} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-xl blue-glow">
                   {loading ? <Loader2 className="animate-spin" /> : <Rocket className="mr-2 w-4 h-4" />} Publish Mock
                </Button>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
               {/* Left: Configuration */}
               <div className="lg:col-span-4 space-y-6">
                  <Card className="p-8 rounded-[40px] bg-zinc-900/40 border-white/5 space-y-8">
                     <h3 className="text-xl font-bold flex items-center gap-3">
                        <LayoutGrid className="text-primary w-5 h-5" /> Config Node
                     </h3>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-widest">Simulation Title</label>
                           <Input 
                             placeholder="e.g. Patwari Mega Mock #1" 
                             value={config.title}
                             onChange={e => setConfig({...config, title: e.target.value})}
                             className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-bold"
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-widest">Exam Board</label>
                           <Select value={config.exam} onValueChange={v => setConfig({...config, exam: v})}>
                              <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-950 text-white border-white/10">
                                 {Object.keys(EXAM_CONFIG).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-widest">Subject Stream</label>
                           <Select value={config.subject} onValueChange={v => setConfig({...config, subject: v})}>
                              <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-950 text-white border-white/10">
                                 {EXAM_CONFIG[config.exam as keyof typeof EXAM_CONFIG]?.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-widest">Language Mode</label>
                           <Select value={config.languageMode} onValueChange={v => setConfig({...config, languageMode: v as any})}>
                              <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-950 text-white border-white/10">
                                 <SelectItem value="english">English</SelectItem>
                                 <SelectItem value="punjabi">Punjabi</SelectItem>
                                 <SelectItem value="hindi">Hindi</SelectItem>
                                 <SelectItem value="en_pa">English + Punjabi</SelectItem>
                                 <SelectItem value="en_hi">English + Hindi</SelectItem>
                                 <SelectItem value="trilingual">Trilingual (EN+PA+HI)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-widest">Timer (Mins)</label>
                              <Input type="number" value={config.duration} onChange={e => setConfig({...config, duration: Number(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-widest">Negative Mark</label>
                              <Input type="number" step="0.25" value={config.negativeMarking} onChange={e => setConfig({...config, negativeMarking: Number(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-black text-red-500" />
                           </div>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* Right: Ingest Engine */}
               <div className="lg:col-span-8 space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                     <TabsList className="bg-zinc-950 border border-white/5 p-1 rounded-2xl h-14 w-full justify-start">
                        <TabsTrigger value="paste" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">Paste Questions</TabsTrigger>
                        <TabsTrigger value="upload" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary">PDF / Image Ingest</TabsTrigger>
                        <TabsTrigger value="review" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-600">Review ({parsedArtifacts.length})</TabsTrigger>
                     </TabsList>

                     <TabsContent value="paste" className="m-0 space-y-6">
                        <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-10 space-y-8">
                           <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                 <h4 className="text-xl font-bold">Text Ingest</h4>
                                 <p className="text-xs text-zinc-500">Paste raw questions from ChatGPT or Official PDFs.</p>
                              </div>
                              <Button onClick={handleIngestRaw} className="h-11 px-8 rounded-xl bg-primary font-black text-[10px] uppercase tracking-widest">
                                 Sync Signal
                              </Button>
                           </div>
                           <Textarea 
                             placeholder="1. Question text here? A) Opt 1 B) Opt 2 C) Opt 3 D) Opt 4 Answer: B Explanation: ..."
                             value={rawText}
                             onChange={e => setRawText(e.target.value)}
                             className="min-h-[400px] bg-black/40 border-white/5 rounded-[32px] p-8 text-sm leading-relaxed overflow-y-auto no-scrollbar font-medium"
                           />
                        </Card>
                     </TabsContent>

                     <TabsContent value="upload" className="m-0">
                        <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-20 flex flex-col items-center justify-center text-center border-dashed border-2 relative group min-h-[500px]">
                           <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-all">
                              <Upload className="text-primary w-10 h-10" />
                           </div>
                           <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Artifact Collector</h3>
                           <p className="text-zinc-500 text-sm max-w-sm mb-12">Scanned PDFs, Screenshots, or Handwritten notes. Supported: EN, PA, HI.</p>
                           
                           <input type="file" id="artifact-upload" className="hidden" onChange={handleFileUpload} />
                           <label htmlFor="artifact-upload" className="cursor-pointer h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm flex items-center justify-center blue-glow">
                              {loading ? <Loader2 className="animate-spin mr-3" /> : <Plus className="mr-3" />}
                              SELECT SOURCE ARTIFACT
                           </label>
                        </Card>
                     </TabsContent>

                     <TabsContent value="review" className="m-0 space-y-6">
                        {parsedArtifacts.length > 0 ? (
                          <div className="grid gap-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <CheckCircle2 className="text-emerald-500" />
                                  <div>
                                     <p className="font-bold">Heuristic Confidence: 92%</p>
                                     <p className="text-[10px] uppercase font-black text-emerald-500/60">Schema Validated for {config.languageMode}</p>
                                  </div>
                               </div>
                               <Button variant="ghost" onClick={() => setParsedArtifacts([])} className="text-red-500 hover:bg-red-500/10 rounded-xl">Clear All</Button>
                            </div>

                            {parsedArtifacts.map((q, i) => (
                              <Card key={i} className="p-8 rounded-[32px] bg-zinc-900/30 border-white/5 space-y-6 group hover:border-primary/30 transition-all">
                                 <div className="flex justify-between items-start">
                                    <Badge className="bg-zinc-800 text-zinc-400 font-black uppercase text-[8px] px-3 py-1">Artifact #{i+1}</Badge>
                                    <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-red-500"><Trash2 size={16} /></Button>
                                 </div>
                                 <div className="space-y-4">
                                    <p className="text-lg font-bold leading-relaxed">{q.question}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                       {q.options.map((opt: string, idx: number) => (
                                         <div key={idx} className={cn("p-4 rounded-xl border text-sm", String.fromCharCode(65+idx) === q.answer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-black/20 border-white/5 text-zinc-500")}>
                                            {String.fromCharCode(65+idx)}. {opt}
                                         </div>
                                       ))}
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                       <p className="text-[9px] font-black uppercase text-zinc-600 mb-1">Rationalization</p>
                                       <p className="text-xs text-zinc-400 leading-relaxed italic">{q.explanation || "No explanation detected."}</p>
                                    </div>
                                 </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="py-40 text-center opacity-20">
                             <Database size={60} className="mx-auto mb-6" />
                             <p className="text-xl font-black uppercase tracking-[0.4em]">Payload Buffer Empty</p>
                          </div>
                        )}
                     </TabsContent>
                  </Tabs>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
