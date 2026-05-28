
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, 
  Zap, 
  Loader2, 
  ChevronRight,
  ClipboardPaste,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseQuestionsAi } from "@/ai/flows/ai-question-parser-flow";
import { Badge } from "@/components/ui/badge";

export default function DirectMockBuilderPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState("Punjab Police Express");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleExpressDeploy() {
    if (!content.trim() || !title.trim()) {
      toast({ title: "Identity Required", description: "Please provide a title and paste questions.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await parseQuestionsAi({ rawText: content });
      
      if (!result.questions || result.questions.length === 0) {
        throw new Error("AI could not detect any structured MCQs in the input.");
      }

      // 1. Inject Questions with Express Tag
      const batch = result.questions.map(q => 
        addDoc(collection(db, "questions"), { 
          ...q, 
          status: "published", 
          source: "DIRECT_EXPRESS_DEPLOY", 
          createdAt: Date.now() 
        })
      );
      const docRefs = await Promise.all(batch);
      
      // 2. Create the Mock Simulation
      await addDoc(collection(db, "mocks"), {
        title,
        exam,
        questionIds: docRefs.map(r => r.id),
        duration: 60,
        negativeMarking: 0.25,
        premium: false,
        status: "published",
        createdAt: Date.now()
      });

      toast({ title: "Deployment Successful", description: `${result.questions.length} questions forged into a live simulation.` });
      setContent("");
      setTitle("");
    } catch (e: any) {
      toast({ title: "Express Deployment Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-14 h-14 rounded-[28px] bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                      <Rocket className="text-white w-7 h-7" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Direct Injector</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Instantly turn ChatGPT output or raw text lists into live CBT environments.</p>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-8">
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-8 md:p-12 space-y-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                        <Zap size={200} />
                     </div>

                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-4">Test Identity</p>
                              <Input 
                                placeholder="e.g. Daily Punjab GK Express #42" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-4">Exam Cluster</p>
                              <Input 
                                placeholder="e.g. Punjab Police SI" 
                                value={exam} 
                                onChange={(e) => setExam(e.target.value)}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center px-4">
                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Raw MCQ Payload</p>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">FAST-DEPLOY ACTIVE</Badge>
                           </div>
                           <Textarea 
                             placeholder="Paste your questions here... 
Example:
1. What is...?
A. Option 1
B. Option 2..."
                             value={content}
                             onChange={(e) => setContent(e.target.value)}
                             className="min-h-[450px] bg-black/40 border-white/5 rounded-[32px] p-8 text-sm leading-relaxed overflow-y-auto break-words resize-none whitespace-pre-wrap"
                           />
                        </div>
                     </div>

                     <Button 
                        onClick={handleExpressDeploy}
                        disabled={loading}
                        className="w-full min-h-[96px] h-auto p-6 rounded-[32px] bg-emerald-600 hover:bg-emerald-700 text-2xl md:text-3xl font-black shadow-2xl transition-transform active:scale-95 shadow-emerald-900/20 whitespace-normal break-words leading-tight text-center flex items-center justify-center"
                     >
                        {loading ? <Loader2 className="animate-spin mr-4 shrink-0" /> : <Rocket className="mr-4 shrink-0" />}
                        <span>DEPLOY EXPRESS MOCK</span>
                     </Button>
                  </Card>
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 space-y-6">
                     <h4 className="font-bold flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500 w-5 h-5" />
                        Express Protocol
                     </h4>
                     <ul className="space-y-4">
                        {[
                           "Bypasses Moderation Queue",
                           "Auto-segments Language",
                           "Detects Subject Mapping",
                           "Direct Bank Injection"
                        ].map((p, i) => (
                           <li key={i} className="flex gap-3 text-xs text-zinc-500 font-medium">
                              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                              <span className="break-words">{p}</span>
                           </li>
                        ))}
                     </ul>
                  </div>

                  <Card className="rounded-[40px] p-8 cracklix-glass border-primary/20 bg-primary/5">
                     <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-primary w-5 h-5" />
                        <h4 className="font-bold">Pro Tip</h4>
                     </div>
                     <p className="text-xs text-zinc-400 leading-relaxed italic break-words">
                        "If pasting from ChatGPT, ensure 'Correct Answer' is clearly mentioned at the end of each question for 100% accuracy."
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
