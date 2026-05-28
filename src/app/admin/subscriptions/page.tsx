"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Package, 
  Edit2, 
  Loader2, 
  Search, 
  UserCheck, 
  Calendar, 
  Sparkles, 
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function PassManagementPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchEmail, setSearchSearchEmail] = useState("");
  
  // Plan Builder State with Granular Access Matrix
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    duration: 30,
    features: "",
    exams: "",
    tier: "silver",
    active: true,
    access: {
      mocks: { full: true, sectional: true, chapter: false, live: false, premium: false, ai: false },
      pyqs: { basic: true, premium: false, solved: false, ai_explanations: false },
      community: { general: true, premium: false, exam_channels: false, voice: false, media: false },
      content: { current_affairs: true, pdfs: false, typing: true, ai_doubt_solver: false },
      features: { leaderboard: true, rank_prediction: false, analytics: false, reattempt: true }
    },
    limits: { mockAttempts: 5, aiUsage: 10, downloads: 5 }
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
      loadPlans();
    } catch (e: any) {
      toast({ title: "Deployment Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const toggleAccess = (section: string, feature: string) => {
    setNewPlan(prev => ({
      ...prev,
      access: {
        ...prev.access,
        [section]: {
          ...(prev.access as any)[section],
          [feature]: !(prev.access as any)[section][feature]
        }
      }
    }));
  };

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
                   <h1 className="font-headline text-5xl font-black tracking-tighter uppercase">Pass Management</h1>
                 </div>
                 <p className="text-zinc-500 font-medium ml-1">Configure granular access tiers and SaaS monetization rules.</p>
              </div>
              <div className="p-6 px-10 rounded-[32px] bg-zinc-900 border border-white/5 flex items-center gap-12">
                 <div className="text-right border-r border-white/5 pr-12">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Ecosystem Revenue</p>
                    <p className="text-3xl font-black text-emerald-500">₹{totalRevenue.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Active Entitlements</p>
                    <p className="text-3xl font-black text-primary">{subscriptions.length}</p>
                 </div>
              </div>
            </header>

            <Tabs defaultValue="plans" className="space-y-10">
              <TabsList className="bg-zinc-900 border-white/5 p-1.5 rounded-[24px] h-16 w-fit">
                <TabsTrigger value="plans" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-sm uppercase tracking-widest">
                  <Package className="w-4 h-4 mr-2" /> Tier Registry
                </TabsTrigger>
                <TabsTrigger value="builder" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-sm uppercase tracking-widest">
                  <Zap className="w-4 h-4 mr-2" /> Tier Architect
                </TabsTrigger>
                <TabsTrigger value="audit" className="rounded-[18px] px-10 font-bold data-[state=active]:bg-primary text-sm uppercase tracking-widest">
                  <UserCheck className="w-4 h-4 mr-2" /> Subscription Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-80 rounded-[48px] bg-zinc-900/40 animate-pulse border border-white/5" />)
                  ) : plans.map((plan) => (
                    <Card key={plan.id} className={cn("rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden transition-all group relative", !plan.active && "opacity-40 grayscale")}>
                       <div className="p-8 border-b border-white/5 flex justify-between items-start">
                          <div>
                             <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase mb-2">{plan.tier}</Badge>
                             <h3 className="text-2xl font-black">{plan.name}</h3>
                             <p className="text-emerald-500 font-black text-xl mt-1">₹{plan.price}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 text-primary">
                             <Edit2 size={18} />
                          </Button>
                       </div>
                       <div className="p-8 space-y-4">
                          <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Entitlements Matrix</p>
                          <div className="flex flex-wrap gap-2">
                             {plan.access?.mocks?.full && <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-500">MOCKS:ALL</Badge>}
                             {plan.access?.aiUsage && <Badge variant="outline" className="text-[8px] border-blue-500/20 text-blue-500">AI:ACTIVE</Badge>}
                             {plan.access?.community?.media && <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">MEDIA:ENABLED</Badge>}
                          </div>
                          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-zinc-500">
                             <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> {plan.duration} Days</span>
                             <Badge className="bg-zinc-800 text-[10px] font-black">ID: {plan.id.substring(0, 5)}</Badge>
                          </div>
                       </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="builder">
                <Card className="rounded-[64px] bg-zinc-900/50 border-white/5 p-12 max-w-6xl mx-auto shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                      <Sparkles size={300} />
                   </div>
                   
                   <div className="flex items-center gap-6 mb-12 relative z-10">
                      <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center shadow-2xl blue-glow">
                         <Plus className="text-white w-8 h-8" />
                      </div>
                      <div>
                         <h2 className="text-4xl font-black uppercase tracking-tighter">Forge Pass Tier</h2>
                         <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Configure automated gating and feature payloads.</p>
                      </div>
                   </div>

                   <div className="grid lg:grid-cols-12 gap-16 relative z-10">
                      {/* Left: Basic Config */}
                      <div className="lg:col-span-4 space-y-10">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Pass Identity</label>
                            <Input 
                              placeholder="e.g. Punjab Police Elite PASS" 
                              value={newPlan.name}
                              onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                              className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl text-lg font-bold px-6"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Price (INR)</label>
                               <Input 
                                 type="number" 
                                 value={newPlan.price}
                                 onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})}
                                 className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-black text-xl text-emerald-500 px-6"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Duration (Days)</label>
                               <Input 
                                 type="number" 
                                 value={newPlan.duration}
                                 onChange={e => setNewPlan({...newPlan, duration: Number(e.target.value)})}
                                 className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-black text-xl px-6"
                               />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-2">Tier Rank</label>
                            <Select value={newPlan.tier} onValueChange={v => setNewPlan({...newPlan, tier: v as any})}>
                               <SelectTrigger className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-bold px-6">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                  <SelectItem value="silver">Silver Tier</SelectItem>
                                  <SelectItem value="gold">Gold Tier</SelectItem>
                                  <SelectItem value="elite">Elite Tier</SelectItem>
                                  <SelectItem value="vip">VIP Tier</SelectItem>
                                  <SelectItem value="custom">Custom Tier</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      {/* Right: Access Matrix */}
                      <div className="lg:col-span-8 grid md:grid-cols-2 gap-10">
                         <div className="space-y-8">
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Lock size={12} /> CBT Access Controls</p>
                               <div className="space-y-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                  {Object.entries(newPlan.access.mocks).map(([feat, val]) => (
                                    <div key={feat} className="flex items-center justify-between">
                                       <span className="text-xs font-bold text-zinc-400 uppercase">{feat.replace('_', ' ')} Mocks</span>
                                       <Switch checked={val} onCheckedChange={() => toggleAccess('mocks', feat)} />
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Globe size={12} /> Community Signals</p>
                               <div className="space-y-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                  {Object.entries(newPlan.access.community).map(([feat, val]) => (
                                    <div key={feat} className="flex items-center justify-between">
                                       <span className="text-xs font-bold text-zinc-400 uppercase">{feat.replace('_', ' ')}</span>
                                       <Switch checked={val} onCheckedChange={() => toggleAccess('community', feat)} />
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2"><Zap size={12} /> Advanced Capabilities</p>
                               <div className="space-y-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                  {Object.entries(newPlan.access.features).map(([feat, val]) => (
                                    <div key={feat} className="flex items-center justify-between">
                                       <span className="text-xs font-bold text-zinc-400 uppercase">{feat.replace('_', ' ')}</span>
                                       <Switch checked={val} onCheckedChange={() => toggleAccess('features', feat)} />
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2"><Clock size={12} /> Usage Boundaries</p>
                               <div className="grid gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                  <div className="space-y-1">
                                     <span className="text-[9px] font-black text-zinc-600 uppercase">Max AI Daily</span>
                                     <Input type="number" value={newPlan.limits.aiUsage} onChange={e => setNewPlan({...newPlan, limits: {...newPlan.limits, aiUsage: Number(e.target.value)}})} className="h-10 bg-black/20 border-white/5 rounded-xl text-xs font-bold" />
                                  </div>
                                  <div className="space-y-1">
                                     <span className="text-[9px] font-black text-zinc-600 uppercase">Max Mocks Daily</span>
                                     <Input type="number" value={newPlan.limits.mockAttempts} onChange={e => setNewPlan({...newPlan, limits: {...newPlan.limits, mockAttempts: Number(e.target.value)}})} className="h-10 bg-black/20 border-white/5 rounded-xl text-xs font-bold" />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <Button 
                     onClick={handleCreatePlan}
                     disabled={submitting}
                     className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black mt-16 blue-glow shadow-2xl transition-transform active:scale-95"
                   >
                      {submitting ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-3 w-8 h-8" />}
                      DEPLOY PRODUCTION TIER
                   </Button>
                </Card>
              </TabsContent>

              <TabsContent value="audit">
                 <div className="space-y-8">
                    <div className="flex justify-between items-center bg-zinc-900/50 p-10 rounded-[48px] border border-white/5">
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter">Entitlement Registry</h3>
                          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Audit active student subscriptions.</p>
                       </div>
                       <div className="relative w-96">
                          <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600" />
                          <Input placeholder="Search identity signal..." className="h-12 bg-black/40 border-white/5 pl-12 rounded-xl text-sm" />
                       </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-[48px] overflow-hidden">
                       <table className="w-full text-left">
                          <thead className="bg-zinc-900/60 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                             <tr>
                                <th className="px-12 py-8">Aspirant Signal</th>
                                <th className="px-12 py-8">Active Tier</th>
                                <th className="px-12 py-8">Activation</th>
                                <th className="px-12 py-8">Threshold</th>
                                <th className="px-12 py-8 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {subscriptions.length > 0 ? subscriptions.map((sub) => (
                               <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors group">
                                  <td className="px-12 py-10">
                                     <p className="font-bold text-white text-lg">{sub.userId.substring(0, 12)}...</p>
                                     <p className="text-[10px] text-zinc-600 font-black uppercase mt-1">Provider: {sub.source || 'GATEWAY'}</p>
                                  </td>
                                  <td className="px-12 py-10">
                                     <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 py-1.5">{sub.planName || 'PASS+'}</Badge>
                                  </td>
                                  <td className="px-12 py-10">
                                     <span className="text-zinc-500 text-sm font-bold uppercase flex items-center gap-2"><Calendar size={14} /> {new Date(sub.startDate || sub.createdAt).toLocaleDateString()}</span>
                                  </td>
                                  <td className="px-12 py-10">
                                     <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black px-3 py-1 uppercase text-[10px]">{new Date(sub.expiresAt).toLocaleDateString()}</Badge>
                                  </td>
                                  <td className="px-12 py-10 text-right">
                                     <Button variant="ghost" size="icon" className="rounded-xl text-zinc-700 hover:text-destructive"><Trash2 size={20} /></Button>
                                  </td>
                               </tr>
                             )) : (
                               <tr><td colSpan={5} className="py-48 text-center text-zinc-600 italic">No active production subscriptions detected in current cycle.</td></tr>
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
