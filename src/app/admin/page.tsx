
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { Users, FileText, IndianRupee, Activity } from "lucide-react";

export default function AdminPage() {
  const stats = [
    { label: "Total Users", value: "12,542", icon: Users, color: "text-blue-500" },
    { label: "Total Mocks", value: "542", icon: FileText, color: "text-emerald-500" },
    { label: "Revenue", value: "₹82K", icon: IndianRupee, color: "text-yellow-500" },
    { label: "Active Students", value: "3,241", icon: Activity, color: "text-purple-500" },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-black text-white min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="font-headline text-4xl font-bold">Platform Overview</h1>
              <p className="text-zinc-500 mt-2">Real-time statistics for the Cracklix ecosystem.</p>
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

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] h-96 flex items-center justify-center">
                <p className="text-zinc-500 italic">User Growth Chart (Placeholder)</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] h-96 flex items-center justify-center">
                <p className="text-zinc-500 italic">Engagement Analytics (Placeholder)</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
