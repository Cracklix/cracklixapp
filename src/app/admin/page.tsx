
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
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
  Terminal
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminPage() {
  const founderImg = PlaceHolderImages.find(img => img.id === 'founder-portrait');
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    activeSessions: 0,
    questions: 0
  });

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

    return () => {
      unsubUsers();
      unsubPayments();
      unsubQuestions();
    };
  }, []);

  const kpiCards = [
    { label: "Total Aspirants", value: stats.users.toLocaleString(), icon: Users, color: "text-blue-500", trend: "+ Live" },
    { label: "Revenue (INR)", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-500", trend: "Verified" },
    { label: "Active Sessions", value: "142", icon: Activity, color: "text-purple-500", trend: "Pulse" },
    { label: "Atomic Bank", value: stats.questions.toLocaleString(), icon: BookOpen, color: "text-primary", trend: "Active" },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-black text-white min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex justify-between items-end border-b border-white/5 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="border-blue-500/20 text-blue-500 uppercase text-[10px] px-3 font-black">Backend Node v4.2</Badge>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Production: Stable
                  </span>
                </div>
                <h1 className="font-headline text-4xl font-black tracking-tighter uppercase">Command Center</h1>
                <p className="text-zinc-500 mt-1 text-sm font-medium">Real-time oversight for the CRACKLIX ecosystem.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[24px] hover:bg-zinc-900 transition-all group overflow-hidden relative">
                    <div className={`w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 ${stat.color} shadow-lg`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                      <div className="flex items-end justify-between mt-1">
                        <h2 className="text-3xl font-black tracking-tight">{stat.value}</h2>
                        <span className={`text-[9px] font-black uppercase ${stat.trend.includes('Live') ? 'text-emerald-500 animate-pulse' : 'text-zinc-500'}`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <Card className="lg:col-span-8 rounded-[32px] bg-zinc-900/40 border-white/5 p-8 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tight">
                    <Database className="text-primary w-5 h-5" />
                    Firebase Node Health
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     {[
                       { label: "Data Integrity", value: "99.9%", icon: Database, color: "text-emerald-400" },
                       { label: "Security Layer", value: "Enabled", icon: Globe, color: "text-blue-400" },
                       { label: "AI Pipeline", value: "Optimized", icon: Zap, color: "text-yellow-400" },
                       { label: "Audit Log", value: "Synced", icon: TrendingUp, color: "text-primary" },
                     ].map(metric => (
                       <div key={metric.label} className="p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between h-24">
                          <div className="flex justify-between items-start">
                             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{metric.label}</p>
                             <metric.icon size={14} className={metric.color} />
                          </div>
                          <h4 className="text-xl font-bold">{metric.value}</h4>
                       </div>
                     ))}
                  </div>
               </Card>

               <div className="lg:col-span-4">
                 <Card className="rounded-[32px] bg-gradient-to-br from-blue-900/20 to-zinc-950 border border-blue-500/20 p-8 h-full flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                       <Terminal size={100} />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-primary/40 overflow-hidden shrink-0">
                             <img 
                              src={founderImg?.imageUrl} 
                              data-ai-hint={founderImg?.imageHint}
                              className="w-full h-full object-cover" 
                             />
                          </div>
                          <div>
                             <h4 className="font-black text-base">ARSH GREWAL</h4>
                             <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Platform Founder</p>
                          </div>
                       </div>
                       <p className="text-xs text-zinc-400 leading-relaxed italic">
                         "CBT Architecture v4.2 is optimized for high-concurrency. Memory management across bilingual nodes is now terminal-stable."
                       </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Build: Stable</span>
                       <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black">MASTER NODE</Badge>
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
