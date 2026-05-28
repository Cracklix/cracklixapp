"use client";

import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import MockBuilder from "@/components/admin/mock-builder";
import AIMockBuilder from "@/components/admin/ai-mock-builder";
import { FileText, Sparkles, Plus, Zap, Filter, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateAutoMock } from "@/services/mocks";
import { useToast } from "@/hooks/use-toast";
import { SUBJECTS } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function MockAdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState("Punjab Police SI");
  const [subject, setSubject] = useState<string>("All");

  async function handleAutoGenerate() {
    setLoading(true);
    try {
      await generateAutoMock({
        exam,
        subjects: subject === "All" ? undefined : [subject as any],
        count: 50,
        difficulty: "medium"
      });
      toast({ title: "Synthesis Successful", description: "Standard mock generated from bank." });
    } catch (e: any) {
      toast({ title: "Synthesis Failed", description: e.message, variant: "destructive" });
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
            <header className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="font-headline text-5xl font-black tracking-tighter">Simulation Factory</h1>
                <p className="text-zinc-500 font-medium">Create server-synced CBT simulations or let our synthesis engine pick high-yield assets.</p>
              </div>
              <div className="flex gap-4">
                 <div className="p-5 rounded-3xl bg-zinc-900 border border-white/5 flex items-center gap-6">
                    <div className="flex flex-col items-center border-r border-white/5 pr-6">
                       <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Live Mocks</span>
                       <span className="text-2xl font-black text-emerald-500">12</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Synthesis Goal</span>
                       <span className="text-2xl font-black text-primary">50/mo</span>
                    </div>
                 </div>
              </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-8">
                <MockBuilder />
                
                {/* Fast Synthesis Engine */}
                <Card className="rounded-[48px] bg-gradient-to-br from-primary/10 via-zinc-900 to-black border-primary/20 p-10 space-y-10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <Zap size={150} />
                   </div>
                   <div className="relative z-10 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center blue-glow">
                         <Zap className="text-white w-8 h-8 fill-current" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black uppercase tracking-tighter">Fast Synthesis Engine</h3>
                         <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Automatic CBT Compilation</p>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8 relative z-10">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Recruitment Board</label>
                         <Select value={exam} onValueChange={setExam}>
                            <SelectTrigger className="bg-black/40 border-white/5 h-14 rounded-2xl font-bold px-6">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-white">
                               <SelectItem value="Punjab Police SI">Punjab Police SI</SelectItem>
                               <SelectItem value="PSSSB Clerk">PSSSB Clerk</SelectItem>
                               <SelectItem value="PPSC PCS">PPSC PCS</SelectItem>
                               <SelectItem value="Patwari 2024">Patwari 2024</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Subject Focus</label>
                         <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger className="bg-black/40 border-white/5 h-14 rounded-2xl font-bold px-6">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-white max-h-[300px]">
                               <SelectItem value="All">Balanced Full Mock</SelectItem>
                               {SUBJECTS.map(s => (
                                 <SelectItem key={s} value={s}>{s}</SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <Button 
                     onClick={handleAutoGenerate} 
                     disabled={loading}
                     className="w-full h-16 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black text-lg relative z-10 group"
                   >
                      {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 w-5 h-5 group-hover:rotate-90 transition-transform" />}
                      Compile Auto Mock from Bank
                   </Button>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-10">
                <AIMockBuilder />
                
                <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[48px] space-y-8">
                   <div className="flex items-center gap-3">
                      <LayoutGrid className="text-zinc-600 w-5 h-5" />
                      <h3 className="font-bold text-xl">Ingestion Pipeline</h3>
                   </div>
                   <div className="space-y-4">
                      {[
                        { label: "Draft Index", val: 8, color: "text-zinc-500" },
                        { label: "AI Ready", val: 3, color: "text-primary" },
                        { label: "Production Tests", val: 12, color: "text-emerald-500" },
                        { label: "Total Bank Qs", val: "12,450", color: "text-accent" },
                      ].map(stat => (
                        <div key={stat.label} className="flex justify-between items-center p-6 rounded-3xl bg-black/40 border border-white/5 group hover:bg-white/[0.02] transition-colors">
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                           <span className={`text-2xl font-black ${stat.color}`}>{stat.val}</span>
                        </div>
                      ))}
                   </div>
                   
                   <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-primary">Strategic Reminder</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed italic">
                         "Maintain a 1:4 ratio of PYQs to fresh content for maximum selection ROI."
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
