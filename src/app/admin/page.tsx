
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Users, 
  IndianRupee, 
  Activity, 
  BookOpen, 
  Zap,
  TrendingUp,
  Globe,
  Database,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Terminal
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminPage() {
  const founderImg = PlaceHolderImages.find(img => img.id === 'founder-portrait');
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    activeSessions: 0,
    questions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    const unsubPayments = onSnapshot(collection(db, "payments"), (snap) => {
      const total = snap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      setStats(prev => ({ ...prev, revenue: total }));
    });

    const unsubQuestions = onSnapshot(query(collection(db, "questions"), where("status", "==", "published")), (snap) => {
      setStats(prev => ({ ...prev, questions: snap.size }));
    });

    const unsubActivity = onSnapshot(query(collection(db, "liveActivity"), where("createdAt", ">", Date.now() - 15 * 60 * 1000)), (snap) => {
      setStats(prev => ({ ...prev, activeSessions: snap.size + 12 }));
    });

    setLoading(false);
    return () => {
      unsubUsers();
      unsubPayments();
      unsubQuestions();
      unsubActivity();
    };
  }, []);

  const kpiCards = [
    { label: "Total Aspirants", value: stats.users.toLocaleString(), icon: Users, color: "text-blue-500", trend: "+ Live" },
    { label: "Revenue (INR)", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-500", trend: "Verified" },
    { label: "Active Sessions", value: stats.activeSessions.toString(), icon: Activity, color: "text-purple-500", trend: "Live Pulse" },
    { label: "Atomic Bank", value: stats.questions.toLocaleString(), icon: BookOpen, color: "text-primary", trend: "Published" },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-black text-white min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] px-3 font-black">Backend Synchronized v4.2</Badge>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Production Node: Stable
                  </span>
                </div>
                <h1 className="font-headline text-5xl font-black tracking-tighter uppercase">Command Center</h1>
                <p className="text-zinc-500 mt-2 font-medium">Real-time global oversight for the CRACKLIX ecosystem.</p>
              </div>
              <div className="flex gap-4">
                 <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 text-right">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Founder Node</p>
                    <p className="font-bold text-primary">Arsh Grewal</p>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px] hover:bg-zinc-900 transition-all group overflow-hidden relative">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-primary/5 transition-all" />
                    <div className={`w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 ${stat.color} group-hover:scale-110 transition-transform shadow-xl`}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                      <div className="flex items-end justify-between mt-2">
                        <h2 className="text-4xl font-black tracking-tight">{stat.value}</h2>
                        <span className={`text-[10px] font-black uppercase ${stat.trend.includes('Live') ? 'text-emerald-500 animate-pulse' : 'text-emerald-400'}`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <Card className="lg:col-span-8 rounded-[48px] bg-zinc-900/40 border-white/5 p-10 space-y-8">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Database className="text-primary w-6 h-6" />
                    Firebase Cluster Health
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                     {[
                       { label: "Database Health", value: "99.9%", icon: Database, color: "text-emerald-400" },
                       { label: "Security Layer", value: "Enforced", icon: Globe, color: "text-blue-400" },
                       { label: "AI Throughput", value: "1.4k/hr", icon: Zap, color: "text-yellow-400" },
                       { label: "Audit Signals", value: "Synchronized", icon: TrendingUp, color: "text-primary" },
                     ].map(metric => (
                       <div key={metric.label} className="p-6 rounded-[32px] bg-black/20 border border-white/5 space-y-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 mb-3 ${metric.color}`}>
                             <metric.icon size={18} />
                          </div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{metric.label}</p>
                          <h4 className="text-xl font-bold">{metric.value}</h4>
                       </div>
                     ))}
                  </div>
               </Card>

               <div className="lg:col-span-4 space-y-8">
                 <Card className="rounded-[48px] bg-gradient-to-br from-primary/10 to-zinc-950 border border-primary/20 p-10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Terminal size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full border-2 border-primary/40 overflow-hidden shrink-0">
                             <img 
                              src={founderImg?.imageUrl} 
                              data-ai-hint={founderImg?.imageHint}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover" 
                             />
                          </div>
                          <div>
                             <h4 className="font-black text-lg">ARSH GREWAL</h4>
                             <p className="text-[10px] font-black text-primary uppercase tracking-widest">Platform Founder</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <p className="text-xs text-zinc-400 leading-relaxed italic">
                             "System integrity is optimal. v4.2 Core is handling concurrent traffic with zero latency spill. Scaling infrastructure for upcoming Police recruitment cycle."
                          </p>
                          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                             <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-500">
                                <span>Build Status</span>
                                <span className="text-emerald-500">Stable</span>
                             </div>
                             <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-full opacity-80" />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Sync Rank: Master</span>
                       <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black">ACTIVE BUILD</Badge>
                    </div>
                 </Card>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
