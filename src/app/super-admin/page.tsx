
import SuperSidebar from "@/components/super/sidebar";
import SuperAdminProtect from "@/components/super/super-protect";
import { 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Activity, 
  ShieldCheck, 
  Globe,
  BarChart3,
  Map,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminPage() {
  const metrics = [
    { label: "Global Users", value: "84,250", icon: Users, color: "text-blue-500", trend: "+12%" },
    { label: "Annual Revenue", value: "₹42.5L", icon: IndianRupee, color: "text-emerald-500", trend: "+24%" },
    { label: "AI Usage", value: "1.2M", icon: Zap, color: "text-yellow-500", trend: "+45%" },
    { label: "SaaS Latency", value: "42ms", icon: Activity, color: "text-purple-500", trend: "Stable" },
  ];

  const stateDistribution = [
    { name: "Punjab", count: "15,420", growth: "High" },
    { name: "Haryana", count: "8,240", growth: "Medium" },
    { name: "Delhi", count: "5,100", growth: "Very High" },
    { name: "Rajasthan", count: "4,800", growth: "Stable" },
  ];

  return (
    <SuperAdminProtect>
      <div className="flex bg-black min-h-screen">
        <SuperSidebar />
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-headline text-5xl font-bold text-white tracking-tight">Executive SaaS Panel</h1>
                <p className="text-zinc-500 mt-2">National ecosystem oversight and multi-region analytics.</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2 font-black">SYSTEM NOMINAL</Badge>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5">
                  <Globe className="text-zinc-400 w-6 h-6 animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((m) => (
                <div key={m.label} className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] hover:bg-zinc-900 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 ${m.color} group-hover:scale-110 transition-transform`}>
                    <m.icon size={24} />
                  </div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-4xl font-black tracking-tight text-white">{m.value}</h2>
                    <span className="text-[10px] font-bold text-emerald-500 mb-1">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Expansion Map Mock */}
              <Card className="lg:col-span-2 rounded-[48px] bg-zinc-900/40 border-white/5 overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Map className="text-primary w-6 h-6" />
                    Geographical Penetration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 h-[400px] flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                   <div className="text-center space-y-4 relative z-10">
                     <Globe size={120} className="text-primary/20 mx-auto" />
                     <p className="text-zinc-500 italic max-w-xs">Interactive national heatmap loading dynamic state-wise metrics...</p>
                   </div>
                </CardContent>
              </Card>

              {/* State Leaderboard */}
              <Card className="rounded-[48px] bg-zinc-900/40 border-white/5">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-bold">Top Performing States</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                   {stateDistribution.map((state) => (
                     <div key={state.name} className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500">
                             {state.name.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                             <p className="font-bold">{state.name}</p>
                             <p className="text-[10px] text-zinc-500 uppercase font-black">{state.count} Aspirants</p>
                           </div>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[9px]">{state.growth}</Badge>
                     </div>
                   ))}
                   <button className="w-full h-14 rounded-2xl border border-white/5 text-zinc-500 font-bold hover:bg-white/5 transition-all">
                     View All Regions
                   </button>
                </CardContent>
              </Card>
            </div>

            {/* AI Usage Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="rounded-[48px] bg-gradient-to-br from-zinc-900 to-black border-white/5 p-10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <BarChart3 className="text-accent w-6 h-6" />
                    Subscription Growth
                  </h3>
                  <div className="h-64 flex items-end gap-3 px-4">
                    {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-xl relative group" style={{ height: `${h}%` }}>
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-primary rounded-t-xl transition-all duration-1000 group-hover:bg-accent h-full" 
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">
                    <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span>
                  </div>
               </Card>

               <Card className="rounded-[48px] bg-zinc-900/40 border-white/5 p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Enterprise Health</h3>
                    <p className="text-zinc-500">System reliability and infrastructure status.</p>
                  </div>
                  <div className="space-y-6 my-8">
                     {[
                       { label: "Database Consistency", val: "99.9%" },
                       { label: "AI Response Time", val: "1.4s" },
                       { label: "Payment Success Rate", val: "98.2%" }
                     ].map(item => (
                       <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase">
                            <span className="text-zinc-500">{item.label}</span>
                            <span className="text-white">{item.val}</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 w-full opacity-80" />
                          </div>
                       </div>
                     ))}
                  </div>
                  <Badge className="w-fit bg-emerald-500/10 text-emerald-500 border-none px-4 py-2">ALL SYSTEMS OPERATIONAL</Badge>
               </Card>
            </div>
          </div>
        </main>
      </div>
    </SuperAdminProtect>
  );
}
