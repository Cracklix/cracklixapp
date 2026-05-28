"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  Lock, 
  Crown, 
  Users, 
  Search, 
  RefreshCw,
  LayoutGrid,
  ShieldCheck,
  CreditCard,
  Target,
  Layers,
  Zap,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot, doc, updateDoc, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MockTest, PassTier, UserProfile } from '@/types';
import { motion } from 'framer-motion';

/**
 * ENTERPRISE PASS MANAGEMENT OS v18.0
 * Features: Granular user entitlement control and real-time subscription auditing.
 */
export default function PassManagementOS() {
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubMocks = onSnapshot(query(collection(db, "mocks"), orderBy("createdAt", "desc")), (snap) => {
      setMocks(snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest)));
    });

    const unsubUsers = onSnapshot(query(collection(db, "users"), limit(100)), (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubMocks();
      unsubUsers();
    };
  }, []);

  const handleMockTierUpdate = async (mockId: string, tier: PassTier) => {
    setSyncing(true);
    try {
      await updateDoc(doc(db, "mocks", mockId), { accessType: tier, updatedAt: Date.now() });
      toast({ title: "Entitlement Updated", description: `Tier: ${tier.toUpperCase()}` });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { id: 'mocks', label: 'Mock Access', icon: Target },
    { id: 'users', label: 'User Terminal', icon: Users },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-[#0B1020] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-[#121A2F]/40 backdrop-blur-xl shrink-0 z-30">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                  <Lock size={16} className="text-blue-500" />
                </div>
                <h1 className="text-[10px] font-black uppercase tracking-[0.4em]">Pass Operations v18</h1>
              </div>
              <div className="hidden lg:flex items-center gap-4 border-l border-white/10 pl-6">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Realtime Nodes Active</span>
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-white/5">
                  <RefreshCw size={14} className={cn("text-zinc-500", syncing && "animate-spin text-blue-500")} />
               </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             <aside className="w-64 border-r border-white/5 bg-[#121A2F] flex flex-col p-4 space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group",
                      activeModule === item.id ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                    )}
                  >
                    <item.icon size={16} className={cn(activeModule === item.id ? "text-white" : "group-hover:text-blue-500")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
             </aside>

             <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-[#0B1020]">
                <div className="max-w-7xl mx-auto space-y-10">
                   
                   {activeModule === 'overview' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {[
                             { label: 'Total identities', val: users.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                             { label: 'Live Simulations', val: mocks.length, icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                             { label: 'Active Subscriptions', val: users.filter(u => u.activePass && u.activePass !== 'free').length, icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                           ].map((stat, i) => (
                             <Card key={i} className="bg-[#121A2F] border-white/5 p-8 rounded-[32px] border shadow-2xl">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                                   <stat.icon size={20} />
                                </div>
                                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">{stat.label}</p>
                                <h2 className="text-4xl font-black">{stat.val}</h2>
                             </Card>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeModule === 'mocks' && (
                     <Card className="bg-[#121A2F] border-white/5 rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/10">
                           <div>
                              <h3 className="text-2xl font-black uppercase tracking-tighter">Entitlement Matrix</h3>
                              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Calibrate Individual Mock Gating</p>
                           </div>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-black/20 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">
                                 <tr>
                                    <th className="px-10 py-6">Mock Identity</th>
                                    <th className="px-10 py-6">Current Entitlement</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {mocks.map(m => (
                                   <tr key={m.id} className="hover:bg-white/[0.01] transition-all group">
                                      <td className="px-10 py-6">
                                         <p className="font-bold text-sm text-zinc-100">{m.title}</p>
                                         <p className="text-[8px] text-zinc-600 font-bold uppercase mt-0.5">{m.exam}</p>
                                      </td>
                                      <td className="px-10 py-6">
                                         <div className="flex gap-2">
                                            {['free', 'pass_plus', 'premium'].map(tier => (
                                              <button 
                                                key={tier}
                                                onClick={() => handleMockTierUpdate(m.id, tier as PassTier)}
                                                className={cn(
                                                  "px-3 py-1 rounded-lg text-[7px] font-black uppercase transition-all border",
                                                  m.accessType === tier ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900 border-white/5 text-zinc-600'
                                                )}
                                              >
                                                {tier.replace('_', ' ')}
                                              </button>
                                            ))}
                                         </div>
                                      </td>
                                      <td className="px-10 py-6 text-right">
                                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5"><RefreshCw size={14} /></Button>
                                      </td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </Card>
                   )}
                </div>
             </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
