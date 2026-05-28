
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
  Calendar,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    tier: "silver",
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
      const q = query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(50));
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
      setNewPlan({ name: "", price: 0, duration: 30, features: "", exams: "", tier: "silver", active: true });
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

  const totalRevenue = subscriptions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                   <div className="w-14 h-14 rounded-[24px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                      <CreditCard className="text-primary w-8 h-8" />
                   </div>
                   <h1 className="font-headline text-5xl font-black tracking-tighter">Monetization Hub</h1>
                 </div>
                 <p className="text-zinc-500 font-medium ml-1 text-lg">Manage Testbook-style PASS ecosystem and revenue operations.</p>
              </div>
              <div className="p-6 px-10 rounded-[32px] bg-zinc-900 border border-white/5 flex items-center gap-12">
                 <div className="text-right border-r border-white/5 pr-12">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-3xl font-black text-emerald-500">₹{totalRevenue.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Conversion</p>
                    <p className="text-3xl font-black text-primary">12.4%</p>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: "Active PASS", val: subscriptions.length + "+", icon: ShieldCheck, color: "text-blue-500" },
                 { label: "Tiers Live", val: plans.filter(p => p.active).length, icon: Package, color: "text-emerald-500" },
                 { label: "Avg. Duration", val: "90 Days", icon: Clock, color: "text-accent" },
                 { label: "Growth", val: "+24%", icon: TrendingUp, color: "text-purple-500" },
               ].map(stat => (
                 <Card key={stat.label} className="rounded-[40px] bg-zinc-900/40 border-white/5 p-8 group hover:bg-zinc-900 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <stat.icon className={`${stat.color} w-8 h-8`} />
                       <BarChart3 className="text-zinc-800 group-hover:text-zinc-600 transition-colors" size={16} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">{stat.label}</p>
                    <h2 className="text-4xl font-black tracking-tight">{stat.val}</h2>
                 </Card>
               ))}
            </div>

            <Tabs defaultValue="plans" className="space-y-10">
              <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-[24px] h-16 w-fit">
                <TabsTrigger value="plans" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-sm uppercase tracking-widest">
                  <Package className="w-4 h-4 mr-2" /> Active Tiers
                </TabsTrigger>
                <TabsTrigger value="builder" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-sm uppercase tracking-widest">
                  <Settings2 className="w-4 h-4 mr-2" /> Pass Builder
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-sm uppercase tracking-widest">
                  <UserCheck className="w-4 h-4 mr-2" /> Subscription Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                      [1,2,3].map(i => <div key={i} className="h-80 rounded-[48px] bg-zinc-900/40 animate-pulse border border-white/5" />)
                    ) : plans.length > 0 ? (
                      plans.map((plan) => (
                        <Card key={plan.id} className={cn(
                          "rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden transition-all group",
                          !plan.active && "opacity-40 grayscale"
                        )}>
                          <div className="p-10 border-b border-white/5 flex justify-between items-start">
                             <div>
                                <div className="flex items-center gap-2 mb-2">
                                   <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">{plan.tier}</Badge>
                                   {plan.active && <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">LIVE</Badge>}
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter">{plan.name}</h3>
                                <p className="text-emerald-500 font-black text-2xl mt-2">₹{plan.price}</p>
                             </div>
                             <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/10 text-primary" onClick={() => togglePlanStatus(plan.id, plan.active)}>
                                <Edit2 size={20} />
                             </Button>
                          </div>
                          <CardContent className="p-10 space-y-8">
                             <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Strategic Payloads</p>
                                <div className="flex flex-wrap gap-2">
                                   {plan.features?.map((f: string, idx: number) => (
                                     <Badge key={idx} variant="outline" className="bg-white/5 border-white/5 text-[9px] font-bold text-zinc-400 px-3 py-1">{f}</Badge>
                                   ))}
                                </div>
                             </div>
                             <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <div className="flex items-center gap-3 text-zinc-500">
                                   <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                                      <Clock size={14} />
                                   </div>
                                   <span className="text-xs font-bold uppercase tracking-widest">{plan.duration} Days</span>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-destructive/10 text-destructive">
                                   <Trash2 size={20} />
                                </Button>
                             </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full py-48 text-center border-2 border-dashed border-white/5 rounded-[64px] bg-zinc-950/20">
                        <Package className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                        <p className="text-zinc-600 font-medium italic text-lg">No PASS tiers have been forged in this cycle.</p>
                      </div>
                    )}
                 </div>
              </TabsContent>

              <TabsContent value="builder">
                <Card className="rounded-[64px] bg-zinc-900/50 border-white/5 p-12 max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                      <Sparkles size={300} />
                   </div>
                   
                   <div className="flex items-center gap-6 mb-16 relative z-10">
                      <div className="w-20 h-20 rounded-[28px] bg-primary flex items-center justify-center shadow-2xl blue-glow">
                         <Plus className="text-white w-10 h-10" />
                      </div>
                      <div>
                         <h2 className="text-5xl font-black uppercase tracking-tighter">Forge Pass Tier</h2>
                         <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-1">Configure automated gating, monetization, and feature payloads.</p>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-16 relative z-10">
                      <div className="space-y-10">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Pass Identity</label>
                            <Input 
                              placeholder="e.g. Punjab Police Elite PASS" 
                              value={newPlan.name}
                              onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                              className="h-16 bg-zinc-800/40 border-white/5 rounded-2xl text-xl font-bold px-8"
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Price (INR)</label>
                               <Input 
                                 type="number" 
                                 value={newPlan.price}
                                 onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})}
                                 className="h-16 bg-zinc-800/40 border-white/5 rounded-2xl font-black text-2xl text-emerald-500 px-8"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Duration (Days)</label>
                               <Input 
                                 type="number" 
                                 value={newPlan.duration}
                                 onChange={e => setNewPlan({...newPlan, duration: Number(e.target.value)})}
                                 className="h-16 bg-zinc-800/40 border-white/5 rounded-2xl font-black text-2xl px-8"
                               />
                            </div>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Tier Classification</label>
                            <Select value={newPlan.tier} onValueChange={v => setNewPlan({...newPlan, tier: v})}>
                               <SelectTrigger className="h-16 bg-zinc-800/40 border-white/5 rounded-2xl text-lg font-bold px-8">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                  <SelectItem value="silver">Silver Tier (Basic)</SelectItem>
                                  <SelectItem value="gold">Gold Tier (Recommended)</SelectItem>
                                  <SelectItem value="elite">Elite Tier (Unrestricted)</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="space-y-10">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Feature Manifest (Comma Separated)</label>
                            <textarea 
                              placeholder="Unlimited Mocks, AI-Coach, Rank Predictor, Premium PDFs..."
                              value={newPlan.features}
                              onChange={e => setNewPlan({...newPlan, features: e.target.value})}
                              className="w-full h-40 bg-zinc-800/40 border border-white/5 rounded-[32px] p-8 text-sm font-medium focus:ring-primary/20 outline-none leading-relaxed"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Restricted Exams (Optional)</label>
                            <textarea 
                              placeholder="Punjab Police SI, PSSSB Clerk..."
                              value={newPlan.exams}
                              onChange={e => setNewPlan({...newPlan, exams: e.target.value})}
                              className="w-full h-32 bg-zinc-800/40 border border-white/5 rounded-[32px] p-8 text-sm font-medium focus:ring-primary/20 outline-none leading-relaxed"
                            />
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 px-4 italic">Leave blank for universal platform access.</p>
                         </div>
                      </div>
                   </div>

                   <Button 
                     onClick={handleCreatePlan}
                     disabled={submitting}
                     className="w-full h-24 rounded-[32px] bg-primary hover:bg-primary/90 text-3xl font-black mt-20 blue-glow shadow-2xl transition-transform active:scale-[0.98]"
                   >
                      {submitting ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-4 w-10 h-10" />}
                      DEPLOY PRODUCTION PASS+
                   </Button>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                 <div className="space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-900/50 p-10 rounded-[48px] border border-white/5">
                       <div className="space-y-1">
                          <h3 className="text-2xl font-bold">Aspirant Subscription Registry</h3>
                          <p className="text-zinc-500 font-medium">Audit active entitlements and manually grant access credentials.</p>
                       </div>
                       <div className="relative w-full md:w-[450px]">
                          <Search className="absolute left-5 top-5 w-6 h-6 text-zinc-600" />
                          <Input 
                             placeholder="Search Identity or Payment ID..." 
                             className="h-16 bg-black/40 border-white/5 pl-14 rounded-2xl text-sm px-8"
                             value={searchEmail}
                             onChange={(e) => setSearchSearchEmail(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-[48px] overflow-hidden">
                       <table className="w-full text-left">
                          <thead className="bg-zinc-900/60 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                             <tr>
                                <th className="px-12 py-8">Aspirant Identity</th>
                                <th className="px-12 py-8">Subscription Plan</th>
                                <th className="px-12 py-8">Activation Date</th>
                                <th className="px-12 py-8">Expiration Threshold</th>
                                <th className="px-12 py-8 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {subscriptions.length > 0 ? subscriptions.map((sub) => (
                               <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                                  <td className="px-12 py-10">
                                     <p className="font-bold text-white text-lg">{sub.userId.substring(0, 14)}...</p>
                                     <p className="text-[10px] text-zinc-600 font-black uppercase mt-1">Order ID: {sub.paymentId || 'MANUAL'}</p>
                                  </td>
                                  <td className="px-12 py-10">
                                     <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5">
                                        {sub.planName || 'PASS+'}
                                     </Badge>
                                  </td>
                                  <td className="px-12 py-10">
                                     <div className="flex items-center gap-3 text-zinc-500 text-sm font-bold">
                                        <Calendar size={16} />
                                        {new Date(sub.startDate || sub.createdAt).toLocaleDateString()}
                                     </div>
                                  </td>
                                  <td className="px-12 py-10">
                                     <div className="flex items-center gap-3 text-emerald-500 text-sm font-black">
                                        <Clock size={16} />
                                        {new Date(sub.expiresAt).toLocaleDateString()}
                                     </div>
                                  </td>
                                  <td className="px-12 py-10 text-right">
                                     <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-destructive/10 text-zinc-700 hover:text-destructive transition-all">
                                        <Trash2 size={20} />
                                     </Button>
                                  </td>
                               </tr>
                             )) : (
                               <tr>
                                  <td colSpan={5} className="py-48 text-center text-zinc-600 italic text-lg">No production subscriptions detected in current cycle.</td>
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
