"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Zap,
  Newspaper,
  History,
  Trophy,
  ShieldCheck,
  MessageSquare,
  ShieldAlert,
  Database,
  Cpu,
  CreditCard,
  Settings,
  Rocket,
  FilePlus2,
  ListFilter,
  Terminal
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const groups = [
    {
      label: "Operational",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "PASS Management", href: "/admin/subscriptions", icon: CreditCard },
      ]
    },
    {
      label: "Ingestion Hub",
      items: [
        { name: "PDF Ingestion", href: "/admin/pdf-ingestion", icon: FilePlus2 },
        { name: "Power Ingest", href: "/admin/questions", icon: Cpu },
      ]
    },
    {
      label: "Asset Factory",
      items: [
        { name: "Atomic Bank", href: "/admin/question-bank", icon: Database },
        { name: "Moderation Queue", href: "/admin/question-bank?view=draft", icon: ListFilter },
        { name: "Simulation Factory", href: "/admin/mocks", icon: Rocket },
      ]
    },
    {
      label: "Specialized",
      items: [
        { name: "Community Audit", href: "/admin/community", icon: MessageSquare },
        { name: "PYQ Archive", href: "/admin/pyqs", icon: History },
        { name: "Daily Pulse", href: "/admin/current-affairs", icon: Newspaper },
        { name: "State Ranks", href: "/admin/leaderboards", icon: Trophy },
        { name: "AI Factory", href: "/admin/ai-assistant", icon: Zap },
      ]
    },
    {
      label: "System",
      items: [
        { name: "Gateway Config", href: "/admin/payment-settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="w-72 bg-zinc-950 border-r border-white/5 min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar pb-10">
      <div className="p-8 pb-4 flex items-center gap-2 mb-4 group">
        <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center blue-glow">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-lg font-bold text-white leading-none">CRACKLIX</span>
          <span className="text-[9px] text-primary font-black uppercase tracking-widest mt-1 tracking-tighter">Command Center</span>
          <span className="text-[6px] text-zinc-700 font-black uppercase tracking-[0.4em] mt-0.5 group-hover:text-primary/50 transition-colors">Arsh Grewal</span>
        </div>
      </div>

      <div className="px-4 space-y-8">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h4 className="px-4 text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">{group.label}</h4>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group mx-2",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
                    )}>
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "group-hover:text-primary")} />
                      <span className="font-bold tracking-tight text-xs">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto px-8 pt-8 space-y-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <Terminal size={12} className="text-primary" />
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Founder Session</span>
           </div>
           <p className="text-[10px] font-bold text-zinc-400">Arsh Grewal</p>
        </div>
        <Link href="/dashboard">
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            <span>Exit Arena</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
