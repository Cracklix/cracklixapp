
"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, where, limit } from 'firebase/firestore';
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
  Loader2,
  Search,
  UserCheck,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function PassManagementPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchEmail, setSearchSearchEmail] = useState("");
  
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
    loadRecentSubscriptions();
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

  async function loadRecentSubscriptions() {
    try {
      const q = query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(20));
      const snap = await getDocs(q);
      setSubscriptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreatePlan() {
    if (!newPlan.name || newPlan.price < 0) {
      toast({ title: "Validation Error", description: "Identity and price are mandatory.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "plans"), {
        ...newPlan,
        features: newPlan.features.split(',').map(f => f.trim()).filter(Boolean),
        exams: newPlan.exams.split(',').map(e => e.trim()).filter(Boolean),
        createdAt: Date.now()
      });
      toast({ title: "Access Tier Deployed", description: "The new PASS is now visible in the student marketplace." });
      setNewPlan({ name: "", price: 0, duration: 30, features: "", exams: "", active: true });
      loadPlans();
    } catch (e: any) {
      toast({ title: "Deployment Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePlanStatus(id: string, current: boolean) {
    try {
      await updateDoc(doc(db, "plans", id), { active: !current });
      setPlans(plans.map(p => p.id === id ? { ...p, active: !current } : p));
      toast({ title: "Visibility Updated", description: `Plan is now ${!current ? 'Live' : 'Hidden'}.` });
    } catch (e: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm("Caution: Deleting a plan may affect existing purchase logic. Proceed?")) return;
    try {
      await deleteDoc(doc(db, "plans", id));
      setPlans(plans.filter(p => p.id !== id));
      toast({ title: "Tier Terminated", variant: "destructive" });
    } catch (e: any) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    }
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                      <CreditCard className="text-primary w-6 h-6" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter">Monetization Engine</h1>
                 </div>
                 <p className="text-zinc-500 font-medium ml-1">Enterprise dashboard for automated gating, plan building, and revenue audit.</p>
              </div>
              <div className="p-4 px-6 rounded-2xl bg-zinc-900 border border-white/5 flex items-center gap-6">
                 <div className="text-right border-r border-white/5 pr-6">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Revenue</p>
                    <p className="text-xl font-black text-emerald-500">₹1.42L</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Growth</p>
                    <p className="text-xl font-black text-primary">+12.4%</p>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: "Active PASS", val: subscriptions.length + "+", icon: ShieldCheck, color: "text-blue-500" },
                 { label: "Plans Live", val: plans.filter(p => p.active).length, icon: Package, color: "text-emerald-500" },
                 { label: "Avg. Period", val: "90 Days", icon: Clock, color: "text-accent" },
                 { label: "Churn Rate", val: "2.1%", icon: TrendingUp, color: "text-purple-500" },
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
                  Active Tiers
                </TabsTrigger>
                <TabsTrigger value="builder" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Forge New Tier
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                  <UserCheck className="w-4 h-4 mr-2" />
                  User Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                      [1,2,3].map(i => <div key={i} className="h-64 rounded-[40px] bg-zinc-900/40 animate-pulse border border-white/5" />)
                    ) : plans.length > 0 ? (
                      plans.map((plan) => (
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
                             <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Strategic Unlocks</p>
                                <div className="flex flex-wrap gap-2">
                                   {plan.features?.map((f: string, idx: number) => (
                                     <Badge key={idx} variant="outline" className="bg-white/5 border-white/5 text-[9px] font-bold text-zinc-400">{f}</Badge>
                                   ))}
                                </div>
                             </div>
                             <div className="space-y-3 pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Applicable Exams</p>
                                <div className="flex flex-wrap gap-2">
                                   {plan.exams?.map((e: string, idx: number) => (
                                     <Badge key={idx} className="bg-primary/10 text-primary border-none text-[9px] font-bold">{e}</Badge>
                                   ))}
                                   {(!plan.exams || plan.exams.length === 0) && <span className="text-[10px] text-zinc-700 italic">Universal Access</span>}
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
                                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 text-destructive" onClick={() => handleDeletePlan(plan.id)}>
                                      <Trash2 size={16} />
                                   </Button>
                                </div>
                             </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[48px]">
                        <Package className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-600 italic">No monetization tiers have been forged yet.</p>
                      </div>
                    )}
                 </div>
              </TabsContent>

              <TabsContent value="builder">
                <Card className="rounded-[48px] bg-zinc-900/50 border-white/5 p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <Plus size={200} />
                   </div>
                   <div className="flex items-center gap-6 mb-12 relative z-10">
                      <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center">
                         <Plus className="text-primary w-10 h-10" />
                      </div>
                      <div>
                         <h2 className="text-4xl font-black uppercase tracking-tighter">Forge Access Tier</h2>
                         <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Configure automated gating, pricing, and duration payloads.</p>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">PASS Identity</label>
                            <Input 
                              placeholder="e.g. Punjab Police Special PRO" 
                              value={newPlan.name}
                              onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                              className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl text-lg font-bold"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Strategic Price (INR)</label>
                               <Input 
                                 type="number" 
                                 value={newPlan.price}
                                 onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})}
                                 className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-black text-emerald-500"
                               />
                            </div>
                            <div className="space-y-3">
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

                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Feature Payload (Comma separated)</label>
                            <textarea 
                              placeholder="Unlimited Mocks, AI Tutor, Rank Predictor..."
                              value={newPlan.features}
                              onChange={e => setNewPlan({...newPlan, features: e.target.value})}
                              className="w-full h-32 bg-zinc-800/40 border border-white/5 rounded-3xl p-6 text-sm font-medium focus:ring-primary/20 outline-none leading-relaxed"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Restricted Exams (Comma separated)</label>
                            <textarea 
                              placeholder="Punjab Police SI, PSSSB Clerk..."
                              value={newPlan.exams}
                              onChange={e => setNewPlan({...newPlan, exams: e.target.value})}
                              className="w-full h-32 bg-zinc-800/40 border border-white/5 rounded-3xl p-6 text-sm font-medium focus:ring-primary/20 outline-none leading-relaxed"
                            />
                            <p className="text-[9px] text-zinc-500 font-bold uppercase mt-2">Leave blank for universal access.</p>
                         </div>
                      </div>
                   </div>

                   <Button 
                     onClick={handleCreatePlan}
                     disabled={submitting}
                     className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black mt-16 blue-glow shadow-2xl transition-transform active:scale-95"
                   >
                      {submitting ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-3 w-8 h-8" />}
                      Deploy Production PASS
                   </Button>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                 <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-900/50 p-8 rounded-[40px] border border-white/5">
                       <div className="space-y-1">
                          <h3 className="text-xl font-bold">Aspirant Subscription Registry</h3>
                          <p className="text-xs text-zinc-500 font-medium">Audit active entitlements and manually grant access credentials.</p>
                       </div>
                       <div className="relative w-full md:w-96">
                          <Search className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                          <Input 
                             placeholder="Search User ID or Order..." 
                             className="h-12 bg-black/40 border-white/5 pl-12 rounded-xl text-sm"
                             value={searchEmail}
                             onChange={(e) => setSearchSearchEmail(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-[48px] overflow-hidden">
                       <table className="w-full text-left">
                          <thead className="bg-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                             <tr>
                                <th className="px-10 py-6">Identity</th>
                                <th className="px-10 py-6">Subscription Tier</th>
                                <th className="px-10 py-6">Activation Date</th>
                                <th className="px-10 py-6">Expiration Terminal</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {subscriptions.length > 0 ? subscriptions.map((sub) => (
                               <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                                  <td className="px-10 py-8">
                                     <p className="font-bold text-white text-sm">{sub.userId.substring(0, 12)}...</p>
                                     <p className="text-[10px] text-zinc-600 font-black uppercase mt-1">UID: {sub.userId.substring(0, 8)}</p>
                                  </td>
                                  <td className="px-10 py-8">
                                     <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                        {sub.plan}
                                     </Badge>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                        <Calendar size={14} />
                                        {new Date(sub.startDate || sub.createdAt).toLocaleDateString()}
                                     </div>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                                        <Clock size={14} />
                                        {new Date(sub.endDate).toLocaleDateString()}
                                     </div>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                     <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 text-zinc-700 hover:text-destructive transition-all">
                                        <Trash2 size={18} />
                                     </Button>
                                  </td>
                               </tr>
                             )) : (
                               <tr>
                                  <td colSpan={5} className="py-32 text-center text-zinc-600 italic">No production subscriptions detected in current cycle.</td>
                               </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
