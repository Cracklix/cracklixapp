"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  Database, 
  Users, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Zap, 
  Clock, 
  LayoutGrid, 
  BarChart3, 
  CreditCard, 
  Layers, 
  Search, 
  Settings2,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDocs, 
  orderBy, 
  limit, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MockTest, MockAccessType } from '@/types';

type Module = 'overview' | 'tiers' | 'mocks' | 'users' | 'matrix' | 'ai' | 'audit';

export default function PassManagementOS() {
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState<Module>('overview');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Data States
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    // Realtime Listeners for the entire control panel
    const unsubMocks = onSnapshot(collection(db, "mocks"), (snap) => {
      setMocks(snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest)));
    });

    const unsubUsers = onSnapshot(query(collection(db, "users"), limit(100)), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubPlans = onSnapshot(collection(db, "plans"), (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubLogs = onSnapshot(query(collection(db, "adminLogs"), orderBy("timestamp", "desc"), limit(20)), (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => {
      unsubMocks();
      unsubUsers();
      unsubPlans();
      unsubLogs();
    };
  }, []);

  const handleTierUpdate = async (mockId: string, tier: MockAccessType) => {
    setSyncing(true);
    try {
      await updateDoc(doc(db, "mocks", mockId), { accessType: tier });
      toast({ title: "Signal Synced", description: `Mock entitlement updated to ${tier.toUpperCase()}` });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tiers', label: 'Plans & Tiers', icon: Crown },
    { id: 'mocks', label: 'Mock Entitlements', icon: Lock },
    { id: 'users', label: 'User Terminal', icon: Users },
    { id: 'matrix', label: 'Access Matrix', icon: Layers },
    { id: 'ai', label: 'Neural Limits', icon: BrainCircuit },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-[#05070a] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Control Bar */}
          <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0b1020] backdrop-blur-xl z-30">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                  <Lock size={16} className="text-blue-500" />
                </div>
                <h1 className="text-[11px] font-black uppercase tracking-[0.3em]">Pass Management System v4.5</h1>
              </div>
              <div className="h-4 w-px bg-white/10 hidden md:block" />
              <div className="hidden md:flex items-center gap-4">
                 <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase animate-pulse">Realtime Sync Active</Badge>
                 <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{users.length} Active Identity Signals</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    placeholder="Search Aspirant Identity..." 
                    className="h-9 w-64 bg-zinc-900/50 border-white/5 rounded-xl pl-9 text-[10px] font-bold focus:ring-1 ring-blue-600/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5">
                 <RefreshCw size={14} className={cn("text-zinc-500", syncing && "animate-spin text-blue-500")} />
               </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* Local Navigation Sidebar */}
             <aside className="w-56 border-r border-white/5 bg-[#0b1020] shrink-0 p-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id as Module)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider group",
                      activeModule === item.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                    )}
                  >
                    <item.icon size={14} className={cn(activeModule === item.id ? "text-white" : "text-zinc-600 group-hover:text-blue-500")} />
                    {item.label}
                  </button>
                ))}
             </aside>

             {/* Module Stage */}
             <div className="flex-1 overflow-y-auto no-scrollbar bg-[#080d1a] p-8">
                <div className="max-w-7xl mx-auto space-y-10">
                   
                   {activeModule === 'overview' && (
                     <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                           {[
                             { label: 'Global Aspirants', val: users.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                             { label: 'Active Pass Holder', val: users.filter(u => u.role !== 'student').length, icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                             { label: 'Locked Artifacts', val: mocks.filter(m => m.accessType !== 'free').length, icon: Lock, color: 'text-red-500', bg: 'bg-red-500/10' },
                             { label: 'Live Simulations', val: mocks.filter(m => m.status === 'published').length, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                           ].map((stat, i) => (
                             <Card key={i} className="bg-[#121a2f] border-white/5 p-6 rounded-[32px] hover:border-blue-600/20 transition-all group">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                   <stat.icon size={18} />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">{stat.label}</p>
                                   <h2 className="text-3xl font-black">{stat.val.toLocaleString()}</h2>
                                </div>
                             </Card>
                           ))}
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                           <Card className="lg:col-span-2 rounded-[40px] bg-[#121a2f] border-white/5 p-8">
                              <h3 className="text-sm font-bold flex items-center gap-2 mb-8 uppercase tracking-tighter">
                                 <BarChart3 size={16} className="text-blue-500" /> Tier Distribution Activity
                              </h3>
                              <div className="h-64 flex items-end gap-3 px-4">
                                {[40, 70, 45, 90, 65, 80, 100, 30, 55, 85].map((h, i) => (
                                  <div key={i} className="flex-1 bg-blue-600/20 rounded-t-xl relative group overflow-hidden" style={{ height: `${h}%` }}>
                                    <div className="absolute bottom-0 left-0 w-full bg-blue-600 transition-all duration-1000 group-hover:bg-blue-400 h-full origin-bottom scale-y-[0.7]" />
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between mt-4 text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] px-2">
                                <span>Free Tier</span><span>Basic</span><span>Pro</span><span>Elite</span><span>Custom</span>
                              </div>
                           </Card>

                           <Card className="rounded-[40px] bg-[#121a2f] border-white/5 p-8 flex flex-col justify-between overflow-hidden relative">
                              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={120} /></div>
                              <div className="relative z-10">
                                 <h3 className="text-sm font-bold mb-1">System Health</h3>
                                 <p className="text-[10px] text-zinc-500 uppercase font-black">Infrastructure Cluster 4</p>
                              </div>
                              <div className="space-y-6 relative z-10 my-8">
                                 {[
                                   { label: "Auth Latency", val: "12ms" },
                                   { label: "Sync Consistency", val: "99.9%" },
                                   { label: "Lock Resilience", val: "Active" }
                                 ].map(item => (
                                   <div key={item.label} className="space-y-2">
                                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-zinc-600">{item.label}</span>
                                        <span className="text-blue-500">{item.val}</span>
                                      </div>
                                      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                         <div className="h-full bg-blue-600 w-full opacity-60" />
                                      </div>
                                   </div>
                                 ))}
                              </div>
                              <Badge className="w-fit bg-emerald-500/10 text-emerald-500 border-none text-[8px] px-3 py-1 font-black">OS: OPTIMIZED</Badge>
                           </Card>
                        </div>
                     </div>
                   )}

                   {activeModule === 'mocks' && (
                     <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#121a2f] p-6 rounded-[32px] border border-white/5">
                           <div>
                              <h3 className="text-xl font-bold uppercase tracking-tighter">Entitlement Matrix</h3>
                              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Surgically manage simulation locking and tiering</p>
                           </div>
                           <div className="flex gap-3">
                              <Button size="sm" variant="outline" className="rounded-xl border-white/5 text-[9px] font-black uppercase">Bulk Unpublish</Button>
                              <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-[9px] font-black uppercase shadow-lg shadow-blue-900/20">Mass Tier Migration</Button>
                           </div>
                        </div>

                        <div className="bg-[#121a2f] border border-white/5 rounded-[40px] overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-zinc-900/40 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                                 <tr>
                                    <th className="px-8 py-6">Simulation ID</th>
                                    <th className="px-8 py-6">Classification</th>
                                    <th className="px-8 py-6">Operational Status</th>
                                    <th className="px-8 py-6">Access Entitlement</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {mocks.map((m) => (
                                   <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                                      <td className="px-8 py-6">
                                         <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                                               {m.accessType === 'free' ? <Unlock size={14} className="text-zinc-600" /> : <Lock size={14} className="text-blue-500" />}
                                            </div>
                                            <div>
                                               <p className="font-bold text-xs text-white line-clamp-1">{m.title}</p>
                                               <p className="text-[8px] text-zinc-600 font-bold uppercase mt-0.5">Hash: {m.id.substring(0, 10)}</p>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-8 py-6">
                                         <Badge variant="outline" className="bg-zinc-900 border-white/5 text-[8px] px-2 py-0.5 font-bold uppercase text-zinc-400">{m.exam}</Badge>
                                      </td>
                                      <td className="px-8 py-6">
                                         <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", m.status === 'published' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-zinc-700')} />
                                            <span className="text-[10px] font-bold uppercase text-zinc-500">{m.status}</span>
                                         </div>
                                      </td>
                                      <td className="px-8 py-6">
                                         <div className="flex gap-1.5">
                                            {['free', 'pass_plus', 'premium', 'elite'].map(tier => (
                                              <button 
                                                key={tier}
                                                onClick={() => handleTierUpdate(m.id, tier as MockAccessType)}
                                                className={cn(
                                                  "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter transition-all border",
                                                  m.accessType === tier 
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                                                    : 'bg-zinc-900 border-white/5 text-zinc-700 hover:text-zinc-400'
                                                )}
                                              >
                                                {tier.replace('_', ' ')}
                                              </button>
                                            ))}
                                         </div>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                         <Button variant="ghost" size="icon" className="rounded-xl text-zinc-700 hover:text-blue-500">
                                            <Settings2 size={14} />
                                         </Button>
                                      </td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}

                   {activeModule === 'matrix' && (
                     <div className="space-y-8 animate-in zoom-in-95 duration-500">
                        <Card className="rounded-[48px] bg-[#121a2f] border-white/5 p-10 overflow-hidden relative">
                           <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none"><LayoutGrid size={200} /></div>
                           <div className="mb-10 relative z-10">
                              <h2 className="text-3xl font-black uppercase tracking-tighter">Feature Access Matrix</h2>
                              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Cross-Platform permission management</p>
                           </div>

                           <div className="bg-black/20 rounded-[32px] border border-white/5 overflow-hidden">
                              <table className="w-full text-left">
                                 <thead className="bg-zinc-900/60 border-b border-white/5">
                                    <tr>
                                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Module Capability</th>
                                       {['FREE', 'BASIC', 'PRO', 'ELITE'].map(tier => (
                                         <th key={tier} className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center text-blue-500">{tier}</th>
                                       ))}
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                    {[
                                      { id: 'full_mocks', label: 'Full Length CBT Mocks' },
                                      { id: 'pyq_vault', label: 'Official PYQ Artifacts' },
                                      { id: 'ai_coach', label: 'AI Performance Mentoring' },
                                      { id: 'live_test', label: 'Mega Sunday Simulations' },
                                      { id: 'analytics', label: 'Advanced Percentile Analytics' },
                                      { id: 'doubt_solver', label: '24/7 OCR Doubt Solver' },
                                      { id: 'typing_engine', label: 'Raavi Typing Simulator' }
                                    ].map((feat) => (
                                      <tr key={feat.id} className="hover:bg-white/[0.01]">
                                         <td className="px-10 py-5 font-bold text-xs text-zinc-300">{feat.label}</td>
                                         {[1,2,3,4].map(col => (
                                           <td key={col} className="px-6 py-5 text-center">
                                              <Switch className="data-[state=checked]:bg-blue-600 scale-75" defaultChecked={col >= 2} />
                                           </td>
                                         ))}
                                      </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                           
                           <div className="mt-8 flex justify-end">
                              <Button className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/30">Commit Matrix Settings</Button>
                           </div>
                        </Card>
                     </div>
                   )}

                   {activeModule === 'users' && (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-end mb-4">
                           <div>
                              <h3 className="text-2xl font-black uppercase tracking-tighter">Identity Console</h3>
                              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Active student signal management</p>
                           </div>
                           <Badge className="bg-blue-600/20 text-blue-500 border-none px-4 py-2 font-black uppercase text-[9px]">Filter: Top Performers</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {users.map((user) => (
                             <Card key={user.id} className="bg-[#121a2f] border-white/5 p-6 rounded-[32px] group hover:border-blue-600/30 transition-all">
                                <div className="flex items-start justify-between mb-6">
                                   <div className="flex gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                         <img src={`https://picsum.photos/seed/${user.id}/100`} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                      <div>
                                         <h4 className="font-bold text-sm text-white group-hover:text-blue-500 transition-colors">{user.name}</h4>
                                         <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{user.email}</p>
                                      </div>
                                   </div>
                                   <Badge className={cn(
                                     "text-[8px] font-black uppercase border-none px-2 py-0.5",
                                     user.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'
                                   )}>{user.role}</Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                   <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                                      <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">XP POOL</p>
                                      <p className="text-sm font-black text-white">{user.xp || 0}</p>
                                   </div>
                                   <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                                      <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">STREAK</p>
                                      <p className="text-sm font-black text-orange-500">{user.streak || 0} D</p>
                                   </div>
                                </div>

                                <div className="flex gap-2">
                                   <Button className="flex-1 h-9 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white font-black text-[9px] uppercase tracking-widest transition-all">Surgical Audit</Button>
                                   <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 bg-zinc-900 border border-white/5 hover:bg-red-500/10 hover:text-red-500">
                                      <AlertTriangle size={14} />
                                   </Button>
                                </div>
                             </Card>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeModule === 'audit' && (
                     <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <Card className="rounded-[40px] bg-[#121a2f] border-white/5 p-8">
                           <div className="flex items-center justify-between mb-10">
                              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                 <History size={18} className="text-zinc-500" /> Administrative Audit Trail
                              </h3>
                              <Button variant="ghost" size="sm" className="text-zinc-600 font-bold uppercase text-[9px] tracking-widest">Download Full Log (CSV)</Button>
                           </div>

                           <div className="space-y-4">
                              {logs.map((log) => (
                                <div key={log.id} className="flex gap-6 items-start p-4 rounded-2xl bg-black/20 border border-white/5 group hover:bg-black/40 transition-all">
                                   <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                      <Settings2 size={16} className="text-zinc-600" />
                                   </div>
                                   <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                         <h5 className="font-bold text-xs text-white">{log.action}</h5>
                                         <span className="text-[9px] font-bold text-zinc-700 uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                                      </div>
                                      <p className="text-[10px] text-zinc-500 leading-relaxed max-w-2xl">{log.details}</p>
                                   </div>
                                   <Badge variant="outline" className="border-white/5 text-zinc-700 text-[8px] font-bold uppercase">{log.adminId}</Badge>
                                </div>
                              ))}
                           </div>
                        </Card>
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
