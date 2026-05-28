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
  ShieldCheck,
  CheckCircle2,
  FileText,
  BarChart3,
  Search,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createMock } from "@/services/mocks";
import { SUBJECTS } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * PRODUCTION MOCK GENERATOR HUB v30.0
 * Replaces dummy "Architect" with a real creation engine.
 */
export default function MockGeneratorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    exam: "PSSSB Clerk",
    subject: "All Subjects",
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
      const mockId = await createMock(formData);
      router.push(`/admin/mocks/${mockId}`);
      toast({ title: "Mock Container Initialized" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-10">
              <div className="space-y-1">
                <h1 className="font-headline text-4xl font-black tracking-tighter uppercase leading-none">Simulation Engine</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-1">Forge Production-Grade Assessments</p>
              </div>
            </header>

            <Tabs defaultValue="create" className="space-y-10">
              <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-[24px] h-16 w-fit shadow-xl">
                <TabsTrigger value="create" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-[10px] uppercase tracking-widest">
                  <PlusCircle className="w-4 h-4 mr-2" /> Create Mock
                </TabsTrigger>
                <TabsTrigger value="bank" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-[10px] uppercase tracking-widest">
                  <Database className="w-4 h-4 mr-2" /> Question Bank
                </TabsTrigger>
                <TabsTrigger value="ai" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-[10px] uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Generator
                </TabsTrigger>
                <TabsTrigger value="bulk" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-[10px] uppercase tracking-widest">
                  <FileUp className="w-4 h-4 mr-2" /> Bulk Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="animate-in fade-in slide-in-from-bottom-2">
                <Card className="rounded-[56px] bg-zinc-900/40 border-white/5 p-12 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none"><Rocket size={300} /></div>
                   <div className="space-y-12 relative z-10">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Simulation Identity</label>
                            <Input placeholder="e.g. Sunday Mega Mock #42" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-16 bg-black/40 border-white/5 rounded-2xl px-6 font-black text-xl" />
                         </div>
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Exam Board</label>
                               <Input placeholder="e.g. PSSSB Clerk" value={formData.exam} onChange={e => setFormData({...formData, exam: e.target.value})} className="h-14 bg-black/40 border-white/5 rounded-xl px-6 font-bold" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Category</label>
                               <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                                  <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                                     <SelectItem value="full">Full Mock</SelectItem>
                                     <SelectItem value="sectional">Sectional</SelectItem>
                                     <SelectItem value="chapter">Chapter Test</SelectItem>
                                     <SelectItem value="pyq">Official PYQ</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                         </div>
                         <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Duration (Min)</label>
                               <Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-xl px-6 font-black text-blue-500" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Negative Coefficient</label>
                               <Input type="number" step="0.25" value={formData.negativeMarking} onChange={e => setFormData({...formData, negativeMarking: Number(e.target.value)})} className="h-14 bg-black/40 border-white/5 rounded-xl px-6 font-black text-red-500" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Access Tier</label>
                               <Select value={formData.accessType} onValueChange={(v: any) => setFormData({...formData, accessType: v})}>
                                  <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                                  <SelectContent className="bg-zinc-950 text-white border-white/10">
                                     <SelectItem value="free">FREE HUB</SelectItem>
                                     <SelectItem value="pass_plus">PASS+</SelectItem>
                                     <SelectItem value="premium">PREMIUM</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                         </div>
                      </div>
                      <Button onClick={handleManualCreate} disabled={loading} className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black blue-glow shadow-2xl transition-transform active:scale-95">
                         {loading ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-3 w-7 h-7" />}
                         INITIALIZE SIMULATION
                      </Button>
                   </div>
                </Card>
              </TabsContent>

              <TabsContent value="bank" className="py-20 text-center opacity-30">
                 <Database size={60} className="mx-auto mb-6" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em]">Question Vault: Stabilizing Signal</p>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
