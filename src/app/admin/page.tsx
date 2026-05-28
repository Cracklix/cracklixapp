
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { Users, FileText, IndianRupee, Activity, BookOpen, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const stats = [
    { label: "Total Users", value: "12,542", icon: Users, color: "text-blue-500" },
    { label: "Revenue", value: "₹82K", icon: IndianRupee, color: "text-yellow-500" },
    { label: "Active Students", value: "3,241", icon: Activity, color: "text-purple-500" },
    { label: "Question Bank", value: "8.4k", icon: BookOpen, color: "text-primary" },
  ];

  const contentAlerts = [
    { label: "Pending Reviews", count: 14, color: "text-orange-500" },
    { label: "Reported Errors", count: 3, color: "text-destructive" },
    { label: "Draft Mocks", count: 8, color: "text-zinc-500" },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-black text-white min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="mb-10">
              <h1 className="font-headline text-4xl font-bold">Platform Intelligence</h1>
              <p className="text-zinc-500 mt-2">Real-time oversight for the CRACKLIX ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] hover:bg-zinc-900 transition-all">
                    <div className={`w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                    <h2 className="text-4xl font-bold mt-2 tracking-tight">{stat.value}</h2>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
               {/* Content Health */}
               <div className="lg:col-span-1 space-y-6">
                  <h3 className="font-bold text-lg px-4">Content Quality Pipeline</h3>
                  <div className="space-y-4">
                     {contentAlerts.map(alert => (
                        <div key={alert.label} className="p-6 rounded-[28px] bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                           <div>
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{alert.label}</p>
                              <h4 className={`text-2xl font-black mt-1 ${alert.color}`}>{alert.count}</h4>
                           </div>
                           <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700">
                              <AlertTriangle className={`w-5 h-5 ${alert.color}`} />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="lg:col-span-2">
                 <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] h-[450px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
                    <p className="text-zinc-500 italic relative z-10">Engagement Analytics Stream (Live Data Feed)</p>
                 </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
