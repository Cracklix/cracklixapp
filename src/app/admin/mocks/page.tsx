
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import MockBuilder from "@/components/admin/mock-builder";
import AIMockBuilder from "@/components/admin/ai-mock-builder";
import { FileText, Sparkles } from "lucide-react";

export default function MockAdminPage() {
  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h1 className="font-headline text-4xl font-bold">Mock Test Factory</h1>
              <p className="text-zinc-500 mt-2">Create manual simulations or let our AI synthesize high-yield papers.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <MockBuilder />
              </div>
              <div className="lg:col-span-5 space-y-8">
                <AIMockBuilder />
                
                <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] space-y-6">
                   <h3 className="font-bold flex items-center gap-2">
                     <FileText className="text-zinc-500 w-4 h-4" />
                     Pipeline Status
                   </h3>
                   <div className="space-y-4">
                      {[
                        { label: "Draft Mocks", val: 8, color: "text-zinc-500" },
                        { label: "AI Pending", val: 3, color: "text-primary" },
                        { label: "Live Tests", val: 12, color: "text-emerald-500" },
                      ].map(stat => (
                        <div key={stat.label} className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-white/5">
                           <span className="text-xs font-bold text-zinc-500 uppercase">{stat.label}</span>
                           <span className={`text-xl font-black ${stat.color}`}>{stat.val}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
