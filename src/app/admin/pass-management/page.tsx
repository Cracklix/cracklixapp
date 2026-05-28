"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Plus,
  RefreshCw,
  Crown,
  ChevronRight,
  Database,
  Users,
  Search,
  Filter,
  Layers,
  Trash2,
  Edit3,
  History,
  Activity,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc,
  query,
  limit,
  serverTimestamp,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MockTest, PassTier, UserProfile } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/**
 * INSTITUTIONAL PASS MANAGEMENT OS v18.0
 * Rebuilt as a professional Testbook-style control panel.
 */
export default function PassManagementOS() {
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    const unsubMocks = onSnapshot(query(collection(db, "mocks"), orderBy("createdAt", "desc")), (snap) => {
      setMocks(snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest)));
    });

    const unsubPlans = onSnapshot(query(collection(db, "plans"), orderBy("price", "asc")), (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubUsers = onSnapshot(query(collection(db, "users"), limit(100)), (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as any)));
    });

    setLoading(false);
    return () => {
      unsubMocks();
      unsubPlans();
      unsubUsers();
    };
  }, []);

  const handleMockTierUpdate = async (mockId: string, tier: PassTier) => {
    setSyncing(true);
    try {
      await updateDoc(doc(db, "mocks", mockId), { accessType: tier, updatedAt: Date.now() });
      toast({ title: "Entitlement Synced", description: `Updated to ${tier.toUpperCase()}` });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'plans', label: 'Plans & Tiers', icon: Crown },
    { id: 'mocks', label: 'Mock Access', icon: Target },
    { id: 'users', label: 'User Terminal', icon: Users },
    { id: 'matrix', label: 'Access Matrix', icon: Layers },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-[#0B1020] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Control Bar */}
          <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-[#121A2F]/40 backdrop-blur-xl shrink-0 z-30">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                  <Lock size={16} className="text-blue-500" />
                </div>
                <h1 className="text-[11px] font-black uppercase tracking-[0.4em]">Pass Operations v18.0</h1>
              </div>
              <div className="h-4 w-px bg-white/10 hidden md:block" />
              <div className="hidden lg:flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Realtime Sync Active</span>
                 </div>
                 <Badge className="bg-blue-600/10 text-blue-500 border-none text-[8px] font-black px-3 py-1 uppercase">12,420 Subscriptions</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative hidden md:block">
                  <Search size={14} className="absolute left-3 top-2.5 text-zinc-600" />
                  <Input placeholder="Search identity..." className="h-9 w-64 bg-black/20 border-white/5 pl-9 rounded-xl text-[10px] uppercase font-bold" />
               </div>
               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5">
                  <RefreshCw size={14} className={cn("text-zinc-500", syncing && "animate-spin text-blue-500")} />
               </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* Sub Sidebar */}
             <aside className="w-64 border-r border-white/5 bg-[#121A2F] flex flex-col shrink-0 p-4 space-y-2">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group",
                      activeModule === item.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                    )}
                  >
                    <item.icon size={16} className={cn(activeModule === item.id ? "text-white" : "group-hover:text-blue-500")} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
             </aside>

             {/* Dynamic Content Terminal */}
             <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-[#0B1020]">
                <div className="max-w-7xl mx-auto space-y-10">
                   
                   {activeModule === 'overview' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                           {[
                             { label: 'Total Identity', val: '14,240', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                             { label: 'Pro Tiers', val: '2,842', icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                             { label: 'Active Mocks', val: mocks.length, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                             { label: 'Revenue (Sim)', val: '₹1.2L', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                           ].map((stat, i) => (
                             <Card key={i} className="bg-[#121A2F] border-white/5 p-6 rounded-[32px] group hover:border-blue-600/20 transition-all border shadow-2xl">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                                   <stat.icon size={18} />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">{stat.label}</p>
                                   <h2 className="text-3xl font-black">{stat.val}</h2>
                                </div>
                             </Card>
                           ))}
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8">
                           <Card className="lg:col-span-8 bg-[#121A2F] border-white/5 rounded-[40px] p-8 shadow-2xl">
                              <div className="flex justify-between items-center mb-10">
                                 <h3 className="text-xl font-black uppercase tracking-tighter">Identity Distribution</h3>
                                 <Badge variant="outline" className="bg-zinc-900 border-white/10 text-zinc-500 text-[8px] uppercase">Last 30 Days</Badge>
                              </div>
                              <div className="h-64 flex items-end gap-4 px-4">
                                 {[40, 70, 45, 90, 65, 80, 100, 55, 85, 95].map((h, i) => (
                                   <div key={i} className="flex-1 bg-blue-600/10 rounded-t-xl relative group" style={{ height: `${h}%` }}>
                                      <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 1.5, delay: i * 0.1 }} className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-xl group-hover:bg-blue-400" />
                                   </div>
                                 ))}
                              </div>
                              <div className="flex justify-between mt-6 text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">
                                 <span>PSSSB CLERK</span><span>POLICE SI</span><span>PATWARI</span><span>PPSC PCS</span>
                              </div>
                           </Card>

                           <div className="lg:col-span-4 space-y-6">
                              <Card className="bg-[#121A2F] border-white/5 rounded-[40px] p-8 shadow-2xl">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2"><Activity size={12} className="text-emerald-500" /> System Pulse</h4>
                                 <div className="space-y-6">
                                    {[
                                      { label: 'Realtime Latency', val: '42ms', color: 'bg-emerald-500' },
                                      { label: 'DB Utilization', val: '84%', color: 'bg-blue-500' },
                                      { label: 'Auth Uptime', val: '99.9%', color: 'bg-purple-500' }
                                    ].map(metric => (
                                      <div key={metric.label} className="space-y-2">
                                         <div className="flex justify-between text-[9px] font-black uppercase text-zinc-400">
                                            <span>{metric.label}</span>
                                            <span className="text-white">{metric.val}</span>
                                         </div>
                                         <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                            <div className={cn("h-full", metric.color)} style={{ width: metric.val }} />
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                              </Card>
                              <div className="p-6 rounded-[32px] bg-blue-600/5 border border-blue-600/20 text-center space-y-2">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Master Control Status</p>
                                 <p className="text-xl font-black uppercase text-white tracking-tighter">Operational</p>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {activeModule === 'mocks' && (
                     <div className="animate-in fade-in slide-in-from-bottom-2">
                        <Card className="bg-[#121A2F] border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                           <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                 <h3 className="text-2xl font-black uppercase tracking-tighter">Simulation Entitlements</h3>
                                 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Calibrate individual simulation access tiers</p>
                              </div>
                              <div className="flex gap-2">
                                 <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">BULK PUBLISH</Button>
                                 <Button variant="outline" className="h-10 px-6 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest">FILTER: ALL</Button>
                              </div>
                           </div>
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead className="bg-black/20 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">
                                    <tr>
                                       <th className="px-8 py-6">Identity Signal</th>
                                       <th className="px-8 py-6">Exam Board</th>
                                       <th className="px-8 py-6">Engagement</th>
                                       <th className="px-8 py-6">Entitlement</th>
                                       <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                    {mocks.map(m => (
                                      <tr key={m.id} className="hover:bg-white/[0.01] transition-all group">
                                         <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                               <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5 shrink-0 group-hover:border-blue-600/40">
                                                  {m.accessType === 'free' ? <Unlock size={14} className="text-zinc-600" /> : <Lock size={14} className="text-blue-500" />}
                                               </div>
                                               <div>
                                                  <p className="font-bold text-sm text-zinc-100 line-clamp-1">{m.title}</p>
                                                  <p className="text-[8px] text-zinc-600 font-bold uppercase mt-0.5 tracking-widest">ID: {m.id.substring(0, 12)}</p>
                                               </div>
                                            </div>
                                         </td>
                                         <td className="px-8 py-6">
                                            <Badge variant="outline" className="bg-zinc-900 border-white/10 text-zinc-400 text-[8px] font-black uppercase px-2.5 py-0.5">{m.exam}</Badge>
                                         </td>
                                         <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                               <span className="text-sm font-black text-white">{m.attemptCount || 0}</span>
                                               <span className="text-[8px] font-bold text-zinc-600 uppercase">Attempts</span>
                                            </div>
                                         </td>
                                         <td className="px-8 py-6">
                                            <div className="flex gap-1.5">
                                               {['free', 'pass_plus', 'premium', 'elite'].map(tier => (
                                                 <button 
                                                   key={tier}
                                                   onClick={() => handleMockTierUpdate(m.id, tier as PassTier)}
                                                   className={cn(
                                                     "px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-tighter transition-all border",
                                                     m.accessType === tier 
                                                       ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                                                       : 'bg-zinc-900 border-white/5 text-zinc-600 hover:text-zinc-300'
                                                   )}
                                                 >
                                                   {tier.replace('_', ' ')}
                                                 </button>
                                               ))}
                                            </div>
                                         </td>
                                         <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5"><Edit3 size={14} /></Button>
                                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-600/10 text-blue-500"><Zap size={14} /></Button>
                                            </div>
                                         </td>
                                      </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </Card>
                     </div>
                   )}

                   {activeModule === 'plans' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-end">
                           <div>
                              <h3 className="text-3xl font-black uppercase tracking-tighter">Preparation Tiers</h3>
                              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure subscription packages and preparation tokens</p>
                           </div>
                           <Button className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl blue-glow">
                              <Plus className="mr-2 w-4 h-4" /> Initialize Tier
                           </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {plans.map((plan) => (
                             <Card key={plan.id} className="bg-[#121A2F] border-white/5 rounded-[48px] overflow-hidden shadow-2xl relative border group">
                                <div className="p-10 space-y-8">
                                   <div className="flex justify-between items-start">
                                      <Badge className="bg-blue-600/20 text-blue-400 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">{plan.tier}</Badge>
                                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5"><Edit3 size={16} /></Button>
                                   </div>
                                   <div className="space-y-2">
                                      <h4 className="text-3xl font-black uppercase leading-tight">{plan.name}</h4>
                                      <div className="flex items-baseline gap-2">
                                         <span className="text-4xl font-black text-emerald-500 tracking-tighter">₹{plan.price}</span>
                                         <span className="text-zinc-500 text-xs font-bold">/ {plan.duration} DAYS</span>
                                      </div>
                                   </div>
                                   <div className="space-y-3 pt-6 border-t border-white/5">
                                      {plan.features?.map((f: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 text-xs text-zinc-400">
                                           <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                           {f}
                                        </div>
                                      ))}
                                   </div>
                                   <Button className="w-full h-14 rounded-2xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 font-black text-[10px] uppercase tracking-widest transition-all">DEACTIVATE TIER</Button>
                                </div>
                             </Card>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
