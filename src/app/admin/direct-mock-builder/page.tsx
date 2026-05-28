'use client';

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, 
  Zap, 
  Loader2, 
  ShieldCheck,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

/**
 * PRODUCTION DIRECT INJECTOR v4.0
 * Parses raw institutional text patterns into structured bilingual artifacts.
 */
export default function DirectMockBuilderPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState("Punjab Police SI");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const parseTextPayload = (text: string) => {
    // Regex for: 1. Question? A) Opt B) Opt C) Opt D) Opt Answer: B Explanation: ...
    const blocks = text.split(/\d+\./g).filter(b => b.trim().length > 10);
    
    return blocks.map((block, idx) => {
      const questionMatch = block.split(/[A-D][\)\.]/)[0].trim();
      const optionsMatch = block.match(/[A-D][\)\.](.*?)(?=[A-D][\)\.]|Answer:|Explanation:|$)/gs);
      const answerMatch = block.match(/Answer:\s*([A-D])/i);
      const explanationMatch = block.match(/Explanation:\s*(.*)/is);

      return {
        question_en: questionMatch,
        options_en: optionsMatch ? optionsMatch.map(o => o.replace(/^[A-D][\)\.]\s*/, '').trim()) : [],
        correctAnswer: answerMatch ? answerMatch[1].toUpperCase() : "A",
        explanation_en: explanationMatch ? explanationMatch[1].trim() : "",
        subject: "General Awareness",
        difficulty: "medium",
        order: idx
      };
    });
  };

  async function handleDeploy() {
    if (!content.trim() || !title.trim()) return toast({ title: "Payload Missing", variant: "destructive" });

    setLoading(true);
    try {
      const parsed = parseTextPayload(content);
      if (parsed.length === 0) throw new Error("Regex failed to extract signals. Ensure '1. Question' format.");

      const batch = writeBatch(db);
      const mockRef = doc(collection(db, "mocks"));

      batch.set(mockRef, {
        id: mockRef.id,
        title,
        exam,
        totalQuestions: parsed.length,
        duration: 60,
        negativeMarking: 0.25,
        status: "published",
        accessType: "pass_plus",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      parsed.forEach((q, idx) => {
        const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
        const finalAnswer = q.options_en[q.correctAnswer.charCodeAt(0) - 65] || "A";
        
        batch.set(qRef, {
          id: qRef.id,
          en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
          pa: null, // Initial direct port is EN only
          correctAnswer: finalAnswer,
          subject: q.subject,
          difficulty: q.difficulty,
          order: idx,
          createdAt: Date.now()
        });
      });

      await batch.commit();
      toast({ title: "Simulation Deployed", description: `${parsed.length} artifacts indexed.` });
      setContent("");
      setTitle("");
    } catch (e: any) {
      toast({ title: "Injection Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Direct Injector</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Manual Port -> Structured JSON</p>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-8">
                  <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 space-y-8 relative overflow-hidden shadow-2xl">
                     <div className="space-y-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-zinc-500 px-4 tracking-widest">Simulation Identity</label>
                              <Input 
                                placeholder="e.g. Daily Express #42" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-zinc-500 px-4 tracking-widest">Board Mapping</label>
                              <Input 
                                value={exam} 
                                onChange={e => setExam(e.target.value)}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between px-4">
                              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Raw Payload Stream</label>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">REGEX PARSER ACTIVE</Badge>
                           </div>
                           <Textarea 
                             placeholder="1. Question text? A) Opt 1 B) Opt 2 C) Opt 3 D) Opt 4 Answer: B Explanation: ..."
                             value={content}
                             onChange={e => setContent(e.target.value)}
                             className="min-h-[450px] bg-black/40 border-white/5 rounded-[32px] p-8 text-sm leading-relaxed overflow-y-auto no-scrollbar resize-none font-medium"
                           />
                        </div>
                     </div>

                     <Button 
                        onClick={handleDeploy}
                        disabled={loading}
                        className="w-full h-20 rounded-[32px] bg-emerald-600 hover:bg-emerald-700 text-2xl font-black shadow-2xl transition-all active:scale-95"
                     >
                        {loading ? <Loader2 className="animate-spin mr-4" /> : <Rocket className="mr-4" />}
                        INITIALIZE INJECTION
                     </Button>
                  </Card>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 rounded-[40px] bg-zinc-950 border border-white/5 space-y-6 shadow-2xl">
                     <h4 className="font-bold flex items-center gap-3 text-xs uppercase tracking-widest">
                        <ShieldCheck className="text-emerald-500 w-4 h-4" /> Security Protocol
                     </h4>
                     <ul className="space-y-4 text-[10px] font-bold text-zinc-500 uppercase leading-loose">
                        <li className="flex gap-3"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Real-time Schema Validation</li>
                        <li className="flex gap-3"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Immediate Bank Porting</li>
                        <li className="flex gap-3"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Atomic Order Preservation</li>
                     </ul>
                  </div>
                  
                  <Card className="p-8 rounded-[40px] bg-primary/5 border border-primary/20">
                     <h5 className="text-[10px] font-black uppercase text-primary tracking-widest mb-3 flex items-center gap-2"><Zap size={12} /> Pro-Tip</h5>
                     <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                        "For 100% precision, ensure the 'Answer:' token is clearly defined before the 'Explanation:' block."
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
