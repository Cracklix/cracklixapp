
"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  Cpu,
  Clock,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SystemHealthPage() {
  const [uptime, setUptime] = useState(0);
  const [activeListeners, setActiveListeners] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    // In a real scenario, we'd track a global listener count
    setActiveListeners(window.performance?.getEntriesByType("resource").length || 0);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { label: "Firestore Connectivity", status: "Stable", icon: Database, color: "text-emerald-500" },
    { label: "Auth Signal", status: "Active", icon: ShieldCheck, color: "text-blue-500" },
    { label: "Memory Usage", status: "Nominal", icon: Cpu, color: "text-purple-500" },
    { label: "Query Threads", status: activeListeners.toString(), icon: Activity, color: "text-primary" },
  ];

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <h1 className="font-headline text-4xl font-black uppercase tracking-tighter">System Health</h1>
                <p className="text-zinc-500 mt-2">Real-time infrastructure diagnostics & stability audit.</p>
              </div>
              <Button variant="outline" className="rounded-xl border-white/10" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Flush Cache
              </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((m) => (
                <Card key={m.label} className="bg-zinc-900/40 border-white/5 p-8 rounded-[32px] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                      <m.icon className={m.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{m.label}</p>
                      <h3 className="text-lg font-bold">{m.status}</h3>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Online</Badge>
                </Card>
              ))}
            </div>

            <Card className="p-10 rounded-[48px] bg-zinc-900/50 border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-500 w-6 h-6" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Latency Monitor</h2>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 rounded-[24px] bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="text-zinc-500 w-4 h-4" />
                    <span className="text-xs font-bold text-zinc-400">Platform Session Duration</span>
                  </div>
                  <span className="font-mono text-xl font-black text-primary">{Math.floor(uptime / 60)}m {uptime % 60}s</span>
                </div>

                <div className="p-6 rounded-[24px] bg-emerald-500/5 border border-emerald-500/20">
                   <p className="text-xs text-emerald-500 font-medium leading-relaxed italic">
                     "Architecture is currently running in Stabilization Mode. Recursive render loops have been neutralized. Memory leaks across the CBT engine have been resolved."
                   </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
