"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Rocket, 
  Sparkles, 
  Plus, 
  Zap, 
  Loader2, 
  Settings, 
  Layers, 
  ClipboardCheck,
  ChevronRight,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS, Subject } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { parseQuestionsAi } from "@/ai/flows/ai-question-parser-flow";

export default function MockFactoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState("Punjab Police SI");
  
  // Smart Generator State
  const [blueprints, setBlueprints] = useState<{subject: Subject, count: number}[]>([
    { subject: "Punjab GK", count: 20 },
    { subject: "Quant", count: 20 },
    { subject: "Reasoning", count: 20 },
  ]);

  // Direct Builder State
  const [pastedContent, setPastedContent] = useState("");

  async function handleSmartGenerate() {
    setLoading(true);
    try {
      let allSelectedIds: string[] = [];
      
      for (const blueprint of blueprints) {
        const q = query(
          collection(db, "questions"),
          where("status", "==", "published"),
          where("subject", "==", blueprint.subject),
          limit(blueprint.count)
        );
        const snap = await getDocs(q);
        allSelectedIds.push(...snap.docs.map(d => d.id));
      }

      if (allSelectedIds.length === 0) throw new Error("Atomic Bank is currently empty for these subjects.");

      await addDoc(collection(db, "mocks"), {
        title: `${exam} Standard Mock ${new Date().toLocaleDateString()}`,
        exam,
        questionIds: allSelectedIds,
        duration: 90,
        negativeMarking: 0.25,
        premium: true,
        status: "published",
        createdAt: Date.now()
      });

      toast({ title: "Standard Simulation Ready", description: `${allSelectedIds.length} artifacts synthesized from bank.` });
    } catch (e: any) {
      toast({ title: "Synthesis Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectBuild() {
    if (!pastedContent.trim()) return;
    setLoading(true);
    try {
      const result = await parseQuestionsAi({ rawText: pastedContent });
      
      // Direct builder bypasses the bank and creates a mock instantly
      const batch = result.questions.map(q => 
        addDoc(collection(db, "questions"), { ...q, status: "published", source: "DIRECT_MOCK_PASTE", createdAt: Date.now() })
      );
      const docRefs = await Promise.all(batch);
      
      await addDoc(collection(db, "mocks"), {
        title: `${exam} Express Mock`,
        exam,
        questionIds: docRefs.map(r => r.id),
        duration: 60,
        negativeMarking: 0.25,
        premium: false,
        status: "published",
        createdAt: Date.now()
      });

      toast({ title: "Express Mock Live", description: `${result.questions.length} questions parsed and deployed.` });
      setPastedContent("");
    } catch (e: any) {
      toast({ title: "Direct Build Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center blue-glow">
                      <Rocket className="text-white w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase">Simulation Factory</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Forge server-synced CBT environments from Atomic Assets or Express Pastes.</p>
              </div>
            </header>

            <Tabs defaultValue="smart" className="space-y-10">
               <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-[24px] h-16 w-fit">
                  <TabsTrigger value="smart" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-xs uppercase tracking-[0.2em]">
                    <Sparkles className="w-4 h-4 mr-2" /> Smart Generator
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-xs uppercase tracking-[0.2em]">
                    <Zap className="w-4 h-4 mr-2" /> Direct Builder
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="smart">
                  <div className="grid lg:grid-cols-12 gap-10 items-start">
                     <div className="lg:col-span-8 space-y-8">
                        <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 space-y-10">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Layers className="text-primary w-5 h-5" />
                                 </div>
                                 <h3 className="text-xl font-bold">Standard CBT Blueprint</h3>
                              </div>
                              <Select value={exam} onValueChange={setExam}>
                                 <SelectTrigger className="w-64 h-12 bg-black/40 border-white/5 rounded-xl font-bold">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    <SelectItem value="Punjab Police SI">Punjab Police SI</SelectItem>
                                    <SelectItem value="PSSSB Clerk">PSSSB Clerk</SelectItem>
                                    <SelectItem value="PPSC PCS">PPSC PCS</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest px-4">
                                 <span>Subject Index</span>
                                 <span className="text-right">Weightage (Questions)</span>
                              </div>
                              <div className="space-y-3">
                                 {blueprints.map((bp, i) => (
                                    <div key={i} className="p-6 rounded-[28px] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                       <span className="font-bold text-zinc-300">{bp.subject}</span>
                                       <div className="flex items-center gap-4">
                                          <input 
                                            type="number" 
                                            value={bp.count}
                                            onChange={(e) => {
                                              const next = [...blueprints];
                                              next[i].count = Number(e.target.value);
                                              setBlueprints(next);
                                            }}
                                            className="w-20 bg-black/40 border border-white/10 rounded-lg text-center font-black py-1.5 focus:ring-primary/20 outline-none" 
                                          />
                                       </div>
                                    </div>
                                 ))}
                                 <Button 
                                   variant="ghost" 
                                   onClick={() => setBlueprints([...blueprints, { subject: 'English', count: 10 }])}
                                   className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary"
                                 >+ Add Payload</Button>
                              </div>
                           </div>

                           <Button 
                             onClick={handleSmartGenerate}
                             disabled={loading}
                             className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow shadow-2xl transition-transform active:scale-95"
                           >
                              {loading ? <Loader2 className="animate-spin" /> : "Synthesize Smart Mock"}
                           </Button>
                        </Card>
                     </div>

                     <div className="lg:col-span-4 space-y-8">
                        <Card className="rounded-[40px] bg-emerald-500/10 border-emerald-500/20 p-8 flex flex-col justify-between h-48 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-10">
                              <Database size={100} />
                           </div>
                           <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-1">Atomic Inventory</p>
                           <h2 className="text-4xl font-black">12,450+ <span className="text-sm text-emerald-500/50">QS</span></h2>
                           <div className="pt-4 border-t border-emerald-500/10 flex items-center gap-2 text-[9px] font-black text-emerald-500/60 uppercase">
                              <Zap size={12} /> Sync: 100% Validated
                           </div>
                        </Card>
                        
                        <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 space-y-4">
                           <h4 className="font-bold flex items-center gap-2">
                              <ClipboardCheck className="text-primary w-4 h-4" />
                              Quality Protocol
                           </h4>
                           <p className="text-xs text-zinc-500 leading-relaxed italic">
                              "Smart generation uses randomized selection from approved assets. Ensure subject blueprints match official recruitment board notifications."
                           </p>
                        </div>
                     </div>
                  </div>
               </TabsContent>

               <TabsContent value="direct">
                  <div className="max-w-4xl mx-auto space-y-8">
                     <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                           <Zap size={200} />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-3xl font-black tracking-tighter">Direct Test Injector</h3>
                           <p className="text-zinc-500 font-medium">Paste raw MCQs from ChatGPT or Word docs. Our engine handles the segmentation.</p>
                        </div>

                        <div className="space-y-4">
                           <Textarea 
                             placeholder="Paste your questions here... 
Example:
1. What is...?
A. Option 1
B. Option 2..."
                             value={pastedContent}
                             onChange={(e) => setPastedContent(e.target.value)}
                             className="min-h-[400px] bg-black/40 border-white/5 rounded-[32px] p-8 text-sm leading-relaxed"
                           />
                        </div>

                        <Button 
                           onClick={handleDirectBuild}
                           disabled={loading || !pastedContent.trim()}
                           className="w-full h-20 rounded-[32px] bg-emerald-600 hover:bg-emerald-700 text-2xl font-black shadow-2xl transition-transform active:scale-95"
                        >
                           {loading ? <Loader2 className="animate-spin" /> : "Deploy Express Mock"}
                        </Button>
                     </Card>
                  </div>
               </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
