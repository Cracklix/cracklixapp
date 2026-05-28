"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Sparkles, 
  BrainCircuit, 
  Database, 
  FileUp, 
  Loader2, 
  Zap,
  ShieldCheck,
  PlusCircle,
  History,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createMock } from "@/services/mocks";
import { SUBJECT_LIST, EXAM_LIST } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

/**
 * PRODUCTION SIMULATION FACTORY v32.0
 * Features: Build from Bank, Manual Injection, and Direct Live Publish.
 */
export default function MockGeneratorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    exam: "PSSSB Clerk (General)",
    customExam: "",
    subject: "General Knowledge",
    customSubject: "",
    category: "full" as const,
    duration: 60,
    negativeMarking: 0.25,
    accessType: "pass_plus" as const,
    languageMode: "bilingual" as const
  });

  async function handleManualCreate() {
    if (!formData.title) return toast({ title: "Mock Title Required", variant: "destructive" });
    setLoading(true);
    try {
      const finalExam = formData.exam === "Other..." ? formData.customExam : formData.exam;
      const mockId = await createMock({
        ...formData,
        exam: finalExam,
        totalQuestions: 0,
        status: 'draft'
      });
      router.push(`/admin/mocks/${mockId}`);
      toast({ title: "Simulation Container Initialized" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div className="space-y-1">
                <h1 className="font-headline text-3xl font-black tracking-tighter uppercase leading-none">Simulation Factory</h1>
                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.3em] ml-1">Forge Production-Grade Assessments</p>
              </div>
            </header>

            <Tabs defaultValue="create" className="space-y-8">
              <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14 w-fit shadow-xl">
                <TabsTrigger value="create" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary text-[10px] uppercase tracking-widest">
                  <PlusCircle className="w-4 h-4 mr-2" /> Manual Build
                </TabsTrigger>
                <TabsTrigger value="bank" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary text-[10px] uppercase tracking-widest">
                  <Database className="w-4 h-4 mr-2" /> From Global Bank
                </TabsTrigger>
                <TabsTrigger value="pyq" className="rounded-xl px-8 font-bold data-[state=active]:bg-orange-600 text-[10px] uppercase tracking-widest">
                  <History className="w-4 h-4 mr-2" /> PYQ Quiz Engine
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="animate-in fade-in slide-in-from-bottom-2">
                <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-12 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none"><BrainCircuit size={300} /></div>
                   <div className="space-y-10 relative z-10">
                      <div className="grid grid-cols-1 gap-8">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Simulation Identity</label>
                            <Input placeholder="e.g. JE Civil Full Mock #01" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-xl" />
                         </div>
                         
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Board / Exam Mapping</label>
                               <Select value={formData.exam} onValueChange={(v: any) => setFormData({...formData, exam: v})}>
                                  <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                  <SelectContent className="bg-zinc-950 text-white border-white/10 max-h-80">
                                     {EXAM_LIST.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                                  </SelectContent>
                               </Select>
                               {formData.exam === "Other..." && (
                                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2">
                                    <Input placeholder="Enter Custom Exam" value={formData.customExam} onChange={e => setFormData({...formData, customExam: e.target.value})} className="h-10 bg-primary/5 border-primary/20 rounded-xl" />
                                 </motion.div>
                               )}
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Category</label>
                               <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                                  <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                                     <SelectItem value="full">Full Length Simulation</SelectItem>
                                     <SelectItem value="sectional">Sectional Performance</SelectItem>
                                     <SelectItem value="chapter">Topic Mastery</SelectItem>
                                     <SelectItem value="pyq">Official Board PYQ</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                         </div>

                         <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Duration (Min)</label>
                               <Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-6 font-black text-blue-500" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Negative Penalty</label>
                               <Input type="number" step="0.25" value={formData.negativeMarking} onChange={e => setFormData({...formData, negativeMarking: Number(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl px-6 font-black text-red-500" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Tier Level</label>
                               <Select value={formData.accessType} onValueChange={(v: any) => setFormData({...formData, accessType: v})}>
                                  <SelectTrigger className="h-12 bg-black/40 border-white/5 rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                                     <SelectItem value="free">FREE ACCESS</SelectItem>
                                     <SelectItem value="pass_plus">PASS+ ENROLLED</SelectItem>
                                     <SelectItem value="premium">PREMIUM ONLY</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                         </div>
                      </div>

                      <Button onClick={handleManualCreate} disabled={loading} className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow shadow-2xl transition-all active:scale-95">
                         {loading ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-3 w-7 h-7" />}
                         INITIALIZE CONTAINER
                      </Button>
                   </div>
                </Card>
              </TabsContent>

              <TabsContent value="bank" className="py-24 text-center opacity-30">
                 <Database size={60} className="mx-auto mb-6 text-zinc-700" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Subject Signals...</p>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
