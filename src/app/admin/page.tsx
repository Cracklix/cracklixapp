
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
  Globe
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

  const criticalMetrics = [
    { label: "Community Reports", value: 3, icon: AlertTriangle, color: "text-destructive" },
    { label: "Pending Reviews", value: 14, icon: FileText, color: "text-orange-500" },
    { label: "AI Usage (24h)", value: "8.4k", icon: Zap, color: "text-yellow-500" },
    { label: "Chat Activity", value: "2.1k", icon: MessageSquare, color: "text-cyan-500" },
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
                  <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] px-3 font-black">Production Layer v4.0</Badge>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3 h-3" /> System Stable
                  </span>
                </div>
                <h1 className="font-headline text-5xl font-black tracking-tighter">Command Center</h1>
                <p className="text-zinc-500 mt-2 font-medium">Global oversight for the CRACKLIX Punjab Exam Ecosystem.</p>
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

            <div className="grid lg:grid-cols-12 gap-8">
               {/* Health Monitor */}
               <div className="lg:col-span-4 space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="font-bold text-lg">System Health</h3>
                    <Badge variant="ghost" className="text-[10px] font-black text-zinc-600">RE-SYNC 5s</Badge>
                  </div>
                  <div className="space-y-4">
                     {criticalMetrics.map(item => (
                        <div key={item.label} className="p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                           <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center ${item.color} shadow-inner`}>
                                <item.icon className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.label}</p>
                                <h4 className={`text-2xl font-black mt-1`}>{item.value}</h4>
                             </div>
                           </div>
                           <TrendingUp className="w-4 h-4 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                        </div>
                     ))}
                  </div>
               </div>

               {/* Live Engagement Map */}
               <div className="lg:col-span-8">
                 <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 h-full relative overflow-hidden group">
                    <CardHeader className="p-10 border-b border-white/5 bg-white/[0.01]">
                       <div className="flex justify-between items-center">
                          <CardTitle className="text-2xl font-black flex items-center gap-3">
                            <Activity className="text-primary w-6 h-6" />
                            Engagement Stream
                          </CardTitle>
                          <div className="flex gap-2">
                             {['Week', 'Month', 'Year'].map(t => (
                               <button key={t} className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/40 border border-white/5 hover:bg-white/10 transition-all">
                                 {t}
                               </button>
                             ))}
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-10 flex items-center justify-center min-h-[400px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-5 pointer-events-none" />
                        <div className="text-center space-y-4 relative z-10">
                           <TrendingUp className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                           <p className="text-zinc-500 italic max-w-xs text-sm">Visualizing real-time growth vectors and district-wise enrollment densities...</p>
                           <Badge variant="outline" className="border-white/10 text-zinc-600 uppercase text-[9px] font-black">Data Latency: 120ms</Badge>
                        </div>
                    </CardContent>
                 </Card>
               </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-10 rounded-[48px] bg-gradient-to-r from-primary/10 via-zinc-950 to-black border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                     <Zap className="text-white w-8 h-8 fill-current" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-2xl font-black">System Ready for Broadacst</h4>
                     <p className="text-sm text-zinc-500 font-medium">New Punjab Police SI Notification detected. Prepare all exam assets.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button className="bg-white text-black h-14 px-10 rounded-2xl font-black text-sm hover:scale-105 transition-transform uppercase tracking-widest">
                     Release Alerts
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
