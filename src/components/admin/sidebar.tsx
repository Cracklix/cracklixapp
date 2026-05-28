
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Zap,
  History,
  Trophy,
  ShieldCheck,
  Database,
  CreditCard,
  Settings,
  Rocket,
  FilePlus2,
  LifeBuoy,
  Activity
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
        { name: "Support Desk", href: "/admin/support", icon: LifeBuoy },
      ]
    },
    {
      label: "Asset Factory",
      items: [
        { name: "PDF Ingestion", href: "/admin/pdf-ingestion", icon: FilePlus2 },
        { name: "Simulation Factory", href: "/admin/mocks", icon: Rocket },
        { name: "Atomic Bank", href: "/admin/question-bank", icon: Database },
      ]
    },
    {
      label: "Specialized",
      items: [
        { name: "PYQ Archive", href: "/admin/pyqs", icon: History },
        { name: "State Ranks", href: "/admin/leaderboards", icon: Trophy },
        { name: "AI Studio", href: "/admin/ai-assistant", icon: Zap },
      ]
    },
    {
      label: "Monitoring",
      items: [
        { name: "System Health", href: "/admin/system-health", icon: Activity },
        { name: "Gateway Config", href: "/admin/payment-settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-white/5 min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar pb-6">
      <div className="p-6 pb-4 flex items-center gap-2 mb-2 group">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center blue-glow shrink-0">
          <ShieldCheck className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-base font-bold text-white leading-none tracking-tight">CRACKLIX</span>
          <span className="text-[8px] text-primary font-black uppercase mt-1 tracking-[0.2em]">Command Console</span>
        </div>
      </div>

      <div className="px-3 space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h4 className="px-4 text-[11px] font-black uppercase text-zinc-600 tracking-[0.25em] mb-2">{group.label}</h4>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group mx-1",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
                    )}>
                      <Icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "group-hover:text-primary")} size={18} />
                      <span className="font-bold tracking-tight text-xs">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto px-6 pt-4">
        <Link href="/dashboard">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
            <Rocket className="w-3.5 h-3.5" />
            <span>Exit Arena</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
