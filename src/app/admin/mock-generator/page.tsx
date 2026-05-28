
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Sparkles, 
  BrainCircuit, 
  Plus, 
  Rocket, 
  Database, 
  FileUp, 
  Loader2, 
  LayoutGrid,
  Zap,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseQuestionsAi } from "@/ai/flows/ai-question-parser-flow";

export default function MockGeneratorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");

  // Generator State
  const [title, setTitle] = useState("");
  const [exam, setExam] = useState("Punjab Police SI");
  const [content, setContent] = useState("");

  async function handleAIGenerate() {
    if (!title || !exam) {
      toast({ title: "Input Required", description: "Define simulation identity and board." });
      return;
    }
    setLoading(true);
    // Logic for AI synthesis would go here, for now using direct inject as bridge
    try {
      const mockRef = await addDoc(collection(db, "mocks"), {
        title,
        exam,
        status: "draft",
        accessType: "pass_plus",
        totalQuestions: 0,
        duration: 60,
        createdAt: Date.now()
      });
      router.push(`/admin/mocks/${mockRef.id}`);
      toast({ title: "Staging Area Created", description: "Simulation artifacts initialized." });
    } finally {
      setLoading(false);
    }
  }

  async function handleExpressDeploy() {
     if (!content.trim() || !title.trim()) {
      toast({ title: "Signal Incomplete", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await parseQuestionsAi({ rawText: content });
      
      const mockRef = await addDoc(collection(db, "mocks"), {
        title,
        exam,
        totalQuestions: result.questions?.length || 0,
        duration: 60,
        negativeMarking: 0.25,
        accessType: "pass_plus",
        status: "published",
        createdAt: Date.now()
      });

      const batch = result.questions.map(q => 
        addDoc(collection(db, "mocks", mockRef.id, "questions"), { 
          ...q, 
          order: Date.now(), 
          createdAt: Date.now() 
        })
      );
      await Promise.all(batch);

      toast({ title: "Deployment Successful", description: `${result.questions.length} artifacts forged.` });
      router.push('/admin/mocks');
    } catch (e: any) {
      toast({ title: "Injection Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <BrainCircuit className="text-primary w-5 h-5" />
                   </div>
                   <h1 className="font-headline text-3xl font-black tracking-tighter uppercase leading-none">Simulation Architect</h1>
                 </div>
                 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Institutional Creation Engine v5.0</p>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-zinc-950/50 p-1.5 rounded-2xl border border-white/5">
                <TabsList className="bg-transparent h-9 gap-1">
                  {['ai', 'manual', 'direct', 'bank', 'ocr'].map(t => (
                    <TabsTrigger key={t} value={t} className="h-full px-5 rounded-xl font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary">
                       {t} Engine
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-10">
                  <Tabs value={activeTab}>
                    <TabsContent value="ai" className="m-0 space-y-8">
                       <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-12 text-center border-dashed border-2 relative group min-h-[450px] flex flex-col justify-center">
                          <div className="w-20 h-20 rounded-3xl bg-primary/10 mx-auto flex items-center justify-center mb-8">
                             <Sparkles className="text-primary w-8 h-8 animate-float" />
                          </div>
                          <h2 className="text-3xl font-black uppercase tracking-tighter">AI Simulation Synthesis</h2>
                          <p className="text-zinc-500 max-w-sm mx-auto mt-3 text-sm font-medium leading-relaxed">AI will scan official notifications and syllabus nodes to forge a balanced 100-question mock.</p>
                          
                          <div className="mt-12 max-w-md mx-auto w-full space-y-4">
                             <Input 
                               placeholder="Mock Identity (e.g. Punjab Police Full Mock #1)" 
                               value={title}
                               onChange={(e) => setTitle(e.target.value)}
                               className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                             />
                             <Button onClick={handleAIGenerate} disabled={loading} className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-widest blue-glow shadow-2xl">
                                {loading ? <Loader2 className="animate-spin" /> : "Initiate AI Synthesis"}
                             </Button>
                          </div>
                       </Card>
                    </TabsContent>

                    <TabsContent value="direct" className="m-0 space-y-8">
                       <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-10 space-y-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Zap size={200} /></div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-2">Simulation Title</p>
                               <Input value={title} onChange={e => setTitle(e.target.value)} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-bold" placeholder="e.g. Daily Express #42" />
                            </div>
                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-2">Exam Board</p>
                               <Input value={exam} onChange={e => setExam(e.target.value)} className="h-12 bg-black/40 border-white/5 rounded-xl px-4 font-bold" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-2">Raw MCQ Payload</p>
                            <Textarea 
                              value={content}
                              onChange={e => setContent(e.target.value)}
                              placeholder="Paste questions here... ChatGPT style format supported."
                              className="min-h-[350px] bg-black/40 border-white/5 rounded-3xl p-8 text-sm font-medium leading-relaxed resize-none"
                            />
                          </div>
                          <Button onClick={handleExpressDeploy} disabled={loading} className="w-full h-18 rounded-[28px] bg-emerald-600 hover:bg-emerald-700 text-base font-black uppercase tracking-widest shadow-2xl">
                             {loading ? <Loader2 className="animate-spin" /> : "Deploy Express Simulation"}
                          </Button>
                       </Card>
                    </TabsContent>

                    <TabsContent value="manual" className="m-0">
                       <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-zinc-950/20">
                          <LayoutGrid className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                          <h3 className="text-xl font-black uppercase text-zinc-600 tracking-tighter">Manual Workshop Ready</h3>
                          <Button className="mt-8 rounded-xl bg-white text-black font-black uppercase text-[10px] h-10 px-8">Initialize Workspace</Button>
                       </div>
                    </TabsContent>
                  </Tabs>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 space-y-6">
                     <h4 className="font-bold flex items-center gap-3 text-zinc-400">
                        <ShieldCheck className="text-primary w-4 h-4" />
                        Generation Protocol
                     </h4>
                     <ul className="space-y-4">
                        {[
                           "Syllabus-weighted Distribution",
                           "Bilingual Raavi Translation",
                           "Difficulty Balance Check",
                           "Duplicate Signal Detection"
                        ].map((p, i) => (
                           <li key={i} className="flex gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                              <CheckCircle2 size={14} className="text-primary shrink-0" />
                              {p}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <Card className="rounded-[40px] bg-primary/5 border border-primary/20 p-8 space-y-4">
                     <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-primary w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-tight">Active Ingestions</h4>
                     </div>
                     <div className="py-8 text-center opacity-30 border-2 border-dashed border-primary/20 rounded-3xl">
                        <p className="text-[9px] font-black uppercase tracking-widest">No Active Jobs</p>
                     </div>
                  </Card>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
