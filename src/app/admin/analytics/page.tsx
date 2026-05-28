
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { BarChart3, TrendingUp, PieChart, Users } from "lucide-react";

export default function AnalyticsPage() {
  const reports = [
    { title: "Performance Metrics", description: "Average accuracy and completion rates across all students.", icon: BarChart3 },
    { title: "Growth Trends", description: "Monthly active user growth and new enrollment statistics.", icon: TrendingUp },
    { title: "Exam Distribution", description: "Popularity index of various Punjab government exam categories.", icon: PieChart },
    { title: "User Retention", description: "Daily login streaks and churn rate analysis.", icon: Users },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="font-headline text-4xl font-bold text-white">Advanced Analytics</h1>
              <p className="text-zinc-500 mt-2">Data-driven insights for Cracklix operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <div key={report.title} className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] hover:bg-zinc-900 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="text-primary w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{report.title}</h3>
                    <p className="text-zinc-500 leading-relaxed mb-8">{report.description}</p>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Data</span>
                      <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-3/4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-10 bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[48px] text-center">
              <h4 className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] mb-4">Strategic Insight</h4>
              <p className="text-2xl font-light italic text-white/80 max-w-2xl mx-auto leading-relaxed">
                "Student engagement in <span className="text-primary font-bold">Punjab Police</span> mocks has increased by 42% this week following the vacancy announcement."
              </p>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
