
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Users, 
  FileText, 
  IndianRupee, 
  Activity, 
  BookOpen, 
  AlertTriangle,
  Zap,
  MessageSquare,
  TrendingUp,
  Globe,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const stats = [
    { label: "Total Aspirants", value: "15.4k", icon: Users, color: "text-blue-500", trend: "+12%" },
    { label: "Revenue (MTD)", value: "₹1.2L", icon: IndianRupee, color: "text-emerald-500", trend: "+8.4%" },
    { label: "Active Sessions", value: "3,241", icon: Activity, color: "text-purple-500", trend: "Live" },
    { label: "Question Bank", value: "12,850", icon: BookOpen, color: "text-primary", trend: "+240 today" },
  ];

  const backendMetrics = [
    { label: "Database Health", value: "99.9%", icon: Database, color: "text-emerald-400" },
    { label: "Security Layer", value: "Active", icon: Globe, color: "text-blue-400" },
    { label: "AI Throughput", value: "1.2k/hr", icon: Zap, color: "text-yellow-400" },
    { label: "Audit Signals", value: "Clean", icon: TrendingUp, color: "text-primary" },
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
                  <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] px-3 font-black">Production Architecture v4.2</Badge>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Step 42 Synchronized
                  </span>
                </div>
                <h1 className="font-headline text-5xl font-black tracking-tighter">Command Center</h1>
                <p className="text-zinc-500 mt-2 font-medium">Global oversight for the CRACKLIX scalable backend ecosystem.</p>
              </div>
              <div className="flex gap-4">
                 <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Server Latency</p>
                    <p className="font-mono text-emerald-500 font-bold">42ms</p>
                 </div>
              </div>
            </header>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
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
                        <span className={`text-[10px] font-black uppercase ${stat.trend === 'Live' ? 'text-emerald-500 animate-pulse' : 'text-emerald-400'}`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 42 Backend Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 space-y-8">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Database className="text-primary w-6 h-6" />
                    Firebase Cluster Health
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                     {backendMetrics.map(metric => (
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

               <Card className="rounded-[48px] bg-gradient-to-br from-primary/10 via-zinc-950 to-black border-primary/20 p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                     <h3 className="text-2xl font-black uppercase tracking-tighter">Ecosystem Status</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed italic">
                       "All production collections are now synchronized with Step 42 schemas. Security rules are enforced for arshdeepgrewal1122@gmail.com with master Read/Write authority."
                     </p>
                  </div>
                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-500 uppercase">System Ready</span>
                     </div>
                     <Badge className="bg-primary text-white border-none font-black text-[10px]">VERIFIED</Badge>
                  </div>
               </Card>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
