
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      const q = query(collection(db, "payments"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    loadPayments();
  }, []);

  const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="space-y-2">
              <h1 className="font-headline text-4xl font-bold text-white">Revenue Operations</h1>
              <p className="text-zinc-500">Audit PASS subscriptions and marketplace transactions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="rounded-[32px] bg-emerald-500/10 border-emerald-500/20 p-8 flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                     <IndianRupee className="text-emerald-500 w-8 h-8" />
                     <TrendingUp className="text-emerald-500/50 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-emerald-500/60 tracking-[0.2em] mb-1">Total Vault</p>
                    <h2 className="text-4xl font-black text-white">₹{totalRevenue.toLocaleString()}</h2>
                  </div>
               </Card>

               <Card className="rounded-[32px] bg-primary/10 border-primary/20 p-8 flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                     <ShieldCheck className="text-primary w-8 h-8" />
                     <ArrowUpRight className="text-primary/50 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-primary/60 tracking-[0.2em] mb-1">Active PASS</p>
                    <h2 className="text-4xl font-black text-white">{payments.length}</h2>
                  </div>
               </Card>

               <Card className="rounded-[32px] bg-zinc-900 border-white/5 p-8 flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                     <Calendar className="text-zinc-500 w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">Pending Sync</p>
                    <h2 className="text-4xl font-black text-zinc-500">Nominal</h2>
                  </div>
               </Card>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden">
               <div className="p-8 border-b border-white/5">
                 <h3 className="font-bold text-lg">Transaction Stream</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-zinc-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                     <tr>
                       <th className="px-8 py-4">Identity</th>
                       <th className="px-8 py-4">SKU / Plan</th>
                       <th className="px-8 py-4">Amount</th>
                       <th className="px-8 py-4">Stamp</th>
                       <th className="px-8 py-4">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-sm">
                     {loading ? (
                       <tr><td colSpan={5} className="p-20 text-center">Auditing ledger...</td></tr>
                     ) : payments.length > 0 ? (
                       payments.map(p => (
                         <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-6 font-medium text-white">{p.userId?.substring(0, 8)}...</td>
                           <td className="px-8 py-6 text-zinc-400">{p.plan || 'Marketplace'}</td>
                           <td className="px-8 py-6 font-black text-white">₹{p.amount}</td>
                           <td className="px-8 py-6 text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                           <td className="px-8 py-6">
                             <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[9px] font-black">Captured</Badge>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr><td colSpan={5} className="p-20 text-center text-zinc-600 italic">No transaction records found.</td></tr>
                     )}
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
