
"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  IndianRupee, 
  ShieldCheck, 
  Clock,
  Settings2,
  Package,
  Edit2,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PassManagementPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Plan Builder State
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    duration: 30,
    features: "",
    exams: "",
    active: true
  });

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const q = query(collection(db, "plans"), orderBy("price", "asc"));
      const snap = await getDocs(q);
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePlan() {
    if (!newPlan.name || newPlan.price < 0) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "plans"), {
        ...newPlan,
        features: newPlan.features.split(',').map(f => f.trim()),
        exams: newPlan.exams.split(',').map(e => e.trim()),
        createdAt: Date.now()
      });
      toast({ title: "Plan Created", description: "The new PASS is now available for purchase." });
      setNewPlan({ name: "", price: 0, duration: 30, features: "", exams: "", active: true });
      loadPlans();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePlanStatus(id: string, current: boolean) {
    await updateDoc(doc(db, "plans", id), { active: !current });
    loadPlans();
    toast({ title: "Plan Updated" });
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                      <CreditCard className="text-primary w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter">Monetization Engine</h1>
                 </div>
                 <p className="text-zinc-500 font-medium ml-1">Manage subscription tiers, plan features, and exam-specific access passes.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: "Active Subs", val: "1,240", icon: Users, color: "text-blue-500" },
                 { label: "Revenue (MTD)", val: "₹1.42L", icon: IndianRupee, color: "text-emerald-500" },
                 { label: "Churn Rate", val: "2.4%", icon: TrendingUp, color: "text-accent" },
                 { label: "Conversion", val: "12%", icon: ShieldCheck, color: "text-purple-500" },
               ].map(stat => (
                 <Card key={stat.label} className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8 group hover:bg-zinc-900 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <stat.icon className={`${stat.color} w-8 h-8`} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">{stat.label}</p>
                    <h2 className="text-4xl font-black">{stat.val}</h2>
                 </Card>
               ))}
            </div>

            <Tabs defaultValue="plans" className="space-y-8">
              <TabsList className="bg-zinc-900 border-white/5 p-1 rounded-2xl h-14">
                <TabsTrigger value="plans" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <Package className="w-4 h-4 mr-2" />
                  Active PASS Plans
                </TabsTrigger>
                <TabsTrigger value="builder" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Plan Builder
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                      [1,2,3].map(i => <div key={i} className="h-64 rounded-[40px] bg-zinc-900/40 animate-pulse border border-white/5" />)
                    ) : plans.map((plan) => (
                      <Card key={plan.id} className={cn(
                        "rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden transition-all group",
                        !plan.active && "opacity-50 grayscale"
                      )}>
                        <div className="p-8 border-b border-white/5 flex justify-between items-start">
                           <div>
                              <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                              <p className="text-emerald-500 font-black text-lg mt-1">₹{plan.price}</p>
                           </div>
                           <Badge className={cn(
                             "border-none font-black text-[10px] uppercase",
                             plan.active ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                           )}>
                             {plan.active ? "Live" : "Inactive"}
                           </Badge>
                        </div>
                        <CardContent className="p-8 space-y-6">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Unlocked Features</p>
                              <div className="flex flex-wrap gap-2">
                                 {plan.features?.map((f: string, idx: number) => (
                                   <Badge key={idx} variant="outline" className="bg-white/5 border-white/5 text-[9px] font-bold text-zinc-400">{f}</Badge>
                                 ))}
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-6 border-t border-white/5">
                              <div className="flex items-center gap-2 text-zinc-500">
                                 <Clock size={14} />
                                 <span className="text-xs font-bold">{plan.duration} Days</span>
                              </div>
                              <div className="flex gap-2">
                                 <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 text-primary" onClick={() => togglePlanStatus(plan.id, plan.active)}>
                                    <Edit2 size={16} />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 text-destructive">
                                    <Trash2 size={16} />
                                 </Button>
                              </div>
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="builder">
                <Card className="rounded-[48px] bg-zinc-900/50 border-white/5 p-10 max-w-4xl mx-auto shadow-2xl">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                         <Plus className="text-primary w-8 h-8" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black uppercase tracking-tighter">Forge New Access Tier</h2>
                         <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Configure automated gating and pricing.</p>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">PASS Identity</label>
                            <Input 
                              placeholder="e.g. Punjab Police Special PRO" 
                              value={newPlan.name}
                              onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                              className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl text-lg font-bold"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Strategic Price (INR)</label>
                               <Input 
                                 type="number" 
                                 value={newPlan.price}
                                 onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})}
                                 className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-black"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Duration (Days)</label>
                               <Input 
                                 type="number" 
                                 value={newPlan.duration}
                                 onChange={e => setNewPlan({...newPlan, duration: Number(e.target.value)})}
                                 className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-black"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Feature Payload (Comma separated)</label>
                            <textarea 
                              placeholder="Unlimited Mocks, AI Tutor, Rank Predictor..."
                              value={newPlan.features}
                              onChange={e => setNewPlan({...newPlan, features: e.target.value})}
                              className="w-full h-24 bg-zinc-800/40 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:ring-primary/20 outline-none"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Restricted Exams (Comma separated)</label>
                            <textarea 
                              placeholder="Punjab Police SI, PSSSB Clerk..."
                              value={newPlan.exams}
                              onChange={e => setNewPlan({...newPlan, exams: e.target.value})}
                              className="w-full h-24 bg-zinc-800/40 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:ring-primary/20 outline-none"
                            />
                         </div>
                      </div>
                   </div>

                   <Button 
                     onClick={handleCreatePlan}
                     disabled={submitting}
                     className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-xl font-black mt-12 blue-glow shadow-2xl"
                   >
                      {submitting ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                      Deploy PASS Plan
                   </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
