
'use client';

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, 
  Zap, 
  Loader2, 
  ClipboardPaste,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseQuestionsAi } from "@/ai/flows/ai-question-parser-flow";
import { Badge } from "@/components/ui/badge";

/**
 * ENTERPRISE DIRECT INJECTOR v20.0
 * Turn raw text payload into structured artifacts.
 */
export default function DirectMockBuilderPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState("Punjab Police Express");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleExpressDeploy() {
    if (!content.trim() || !title.trim()) {
      toast({ title: "Signal Incomplete", description: "Identity and Payload are mandatory.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await parseQuestionsAi({ rawText: content });
      
      if (!result.questions || result.questions.length === 0) {
        throw new Error("AI failed to extract structured signals from payload.");
      }

      const mockRef = doc(collection(db, "mocks"));
      const batch = writeBatch(db);

      // 1. Create Simulation Artifact
      batch.set(mockRef, {
        id: mockRef.id,
        title,
        exam,
        totalQuestions: result.questions.length,
        duration: 60,
        negativeMarking: 0.25,
        accessType: "pass_plus",
        status: "published",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // 2. Link Artifacts
      result.questions.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        batch.set(qRef, {
          id: qRef.id,
          en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
          pa: q.question_pa ? { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa } : null,
          correctAnswer: q.correctAnswer,
          subject: q.subject || "General Proficiency",
          difficulty: q.difficulty || "medium",
          order: idx,
          createdAt: Date.now()
        });
      });

      await batch.commit();

      toast({ 
        title: "Simulation Deployed", 
        description: `${result.questions.length} artifacts synthesized and published.` 
      });
      setContent("");
      setTitle("");
    } catch (e: any) {
      toast({ title: "Deployment Breach", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-14 h-14 rounded-[28px] bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                      <Rocket className="text-white w-7 h-7" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Direct Injector</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Instantly turn raw MCQ lists into live production simulations.</p>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-8">
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-8 md:p-12 space-y-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none rotate-12">
                        <Zap size={300} />
                     </div>

                     <div className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-4">Simulation Identity</p>
                              <Input 
                                placeholder="e.g. Daily General GK Express #42" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-4">Exam Cluster</p>
                              <Input 
                                placeholder="e.g. PSSSB Clerk 2024" 
                                value={exam} 
                                onChange={(e) => setExam(e.target.value)}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center px-4">
                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Payload Stream</p>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black px-3">AUTO-PARSE: ACTIVE</Badge>
                           </div>
                           <Textarea 
                             placeholder="Paste your questions here... 
Example:
1. Question Text?
A. Opt 1
B. Opt 2
C. Opt 3
D. Opt 4
Answer: C
Explanation: Step by step logic..."
                             value={content}
                             onChange={(e) => setContent(e.target.value)}
                             className="min-h-[450px] bg-black/40 border-white/5 rounded-[32px] p-8 text-sm leading-relaxed overflow-y-auto no-scrollbar resize-none font-medium"
                           />
                        </div>
                     </div>

                     <Button 
                        onClick={handleExpressDeploy}
                        disabled={loading}
                        className="w-full h-20 rounded-[32px] bg-emerald-600 hover:bg-emerald-700 text-2xl font-black shadow-2xl transition-transform active:scale-95 shadow-emerald-900/20"
                     >
                        {loading ? <Loader2 className="animate-spin mr-4" /> : <Rocket className="mr-4" />}
                        <span>DEPLOY SIMULATION</span>
                     </Button>
                  </Card>
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 space-y-6 shadow-2xl">
                     <h4 className="font-bold flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500 w-5 h-5" />
                        Injection Protocol
                     </h4>
                     <ul className="space-y-5">
                        {[
                           "Direct Bank Porting",
                           "Bilingual Normalization",
                           "Auto-Subject Mapping",
                           "Immediate Live Publish"
                        ].map((p, i) => (
                           <li key={i} className="flex gap-4 text-xs text-zinc-500 font-bold uppercase tracking-tight">
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                              {p}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <Card className="rounded-[40px] p-8 bg-primary/5 border border-primary/20">
                     <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-primary w-5 h-5" />
                        <h4 className="font-bold uppercase text-xs tracking-widest">Admin Hub Tip</h4>
                     </div>
                     <p className="text-xs text-zinc-400 leading-relaxed italic">
                        "For 100% extraction precision, ensure the 'Answer' line is clearly defined at the end of each artifact block."
                     </p>
                  </Card>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
