
import SuperSidebar from "@/components/super/sidebar";
import SuperAdminProtect from "@/components/super/super-protect";
import { TrendingUp, Users, IndianRupee, Activity, ShieldCheck, Globe } from "lucide-react";

export default function SuperAdminPage() {
  const metrics = [
    { label: "Network Capacity", value: "99.9%", icon: Globe, color: "text-emerald-500" },
    { label: "Monthly Revenue", value: "₹5.2L", icon: IndianRupee, color: "text-yellow-500" },
    { label: "Active Admins", value: "14", icon: ShieldCheck, color: "text-primary" },
    { label: "Peak Concurrent", value: "2,450", icon: Activity, color: "text-purple-500" },
  ];

  return (
    <SuperAdminProtect>
      <div className="flex bg-black min-h-screen">
        <SuperSidebar />
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="font-headline text-5xl font-bold text-white tracking-tight">Executive Dashboard</h1>
                <p className="text-zinc-500 mt-2">Enterprise-wide system health and financial oversight.</p>
              </div>
              <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                System Online
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((m) => (
                <div key={m.label} className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] hover:bg-zinc-900 transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 ${m.color}`}>
                    <m.icon size={24} />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{m.label}</p>
                  <h2 className="text-4xl font-bold mt-2 tracking-tight text-white">{m.value}</h2>
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 p-10 rounded-[48px] h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <TrendingUp className="w-12 h-12 text-primary mx-auto opacity-20" />
                  <p className="text-zinc-500 italic">Advanced Revenue Forecasting Engine (Placeholder)</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-10 rounded-[48px] h-96">
                <h3 className="text-xl font-bold text-white mb-6">Recent Alerts</h3>
                <div className="space-y-4">
                  {[
                    "New admin seat assigned: editor_01",
                    "Payment threshold reached: PPSC Mock Pack",
                    "Audit: User batch deletion initiated by super_admin",
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-4 items-start text-sm border-b border-white/5 pb-4 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-zinc-400">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SuperAdminProtect>
  );
}
