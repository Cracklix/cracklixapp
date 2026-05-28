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
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc,
  query,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MockTest, PassTier } from '@/types';

/**
 * INSTITUTIONAL PASS MANAGEMENT OS v16.0
 * Real-time Preparatory Entitlement Controller.
 */
export default function PassManagementOS() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const unsubMocks = onSnapshot(collection(db, "mocks"), (snap) => {
      setMocks(snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest)));
    });

    const unsubPlans = onSnapshot(collection(db, "plans"), (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => {
      unsubMocks();
      unsubPlans();
    };
  }, []);

  const handleMockTierUpdate = async (mockId: string, tier: PassTier) => {
    setSyncing(true);
    try {
      await updateDoc(doc(db, "mocks", mockId), { accessType: tier, updatedAt: Date.now() });
      toast({ title: "Artifact Entitlement Synced", description: `Updated to ${tier.toUpperCase()}` });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AdminProtect>
      <div className="flex bg-[#05070A] min-h-screen text-white overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-[#0B1020] shrink-0 z-30">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                  <Lock size={16} className="text-blue-500" />
                </div>
                <h1 className="text-[10px] font-black uppercase tracking-[0.4em]">Pass Operations v16.0</h1>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase animate-pulse">Sync Active</Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5">
               <RefreshCw size={14} className={cn("text-zinc-500", syncing && "animate-spin text-blue-500")} />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar p-8">
             <div className="max-w-7xl mx-auto space-y-10">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   {[
                     { label: 'Live Simulations', val: mocks.length, icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                     { label: 'Gated Artifacts', val: mocks.filter(m => m.accessType !== 'free').length, icon: Lock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                     { label: 'Active Pass Hubs', val: plans.length, icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                     { label: 'Global Aspirants', val: '14,240', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                   ].map((stat, i) => (
                     <Card key={i} className="bg-[#121A2F] border-white/5 p-6 rounded-[32px] group hover:border-blue-600/20 transition-all">
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

                {/* Registry Table */}
                <div className="bg-[#121A2F] border border-white/5 rounded-[40px] overflow-hidden">
                   <div className="p-8 border-b border-white/5 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-tighter">Entitlement Matrix</h3>
                        <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1">Calibrate artifact locking signals</p>
                      </div>
                      <Button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase shadow-lg">BULK MIGRATION</Button>
                   </div>
                   <table className="w-full text-left">
                      <thead className="bg-black/20 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                         <tr>
                            <th className="px-8 py-6">Simulation ID</th>
                            <th className="px-8 py-6">Board</th>
                            <th className="px-8 py-6">Access Layer</th>
                            <th className="px-8 py-6 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {mocks.map((m) => (
                           <tr key={m.id} className="hover:bg-white/[0.01] group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                                       {m.accessType === 'free' ? <Unlock size={14} className="text-zinc-600" /> : <Lock size={14} className="text-blue-500" />}
                                    </div>
                                    <div>
                                       <p className="font-bold text-xs text-white line-clamp-1">{m.title}</p>
                                       <p className="text-[8px] text-zinc-600 font-bold mt-0.5 tracking-widest uppercase">ID: {m.id.substring(0, 10)}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <Badge variant="outline" className="bg-zinc-900 border-white/5 text-[8px] px-2 py-0.5 font-black uppercase text-zinc-400">{m.exam}</Badge>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex gap-1">
                                    {['free', 'pass_plus', 'premium', 'elite'].map(tier => (
                                      <button 
                                        key={tier}
                                        onClick={() => handleMockTierUpdate(m.id, tier as PassTier)}
                                        className={cn(
                                          "px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-tighter transition-all border",
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
                                    <ChevronRight size={14} />
                                 </Button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
