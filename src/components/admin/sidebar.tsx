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
  Activity,
  BrainCircuit,
  Sparkles
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
      label: "AI Generation Core",
      items: [
        { name: "AI Mock Studio", href: "/admin/ai-mock-studio", icon: Sparkles },
        { name: "Power Ingest", href: "/admin/pdf-ingestion", icon: FilePlus2 },
      ]
    },
    {
      label: "Simulation Factory",
      items: [
        { name: "Mock Generator", href: "/admin/mock-generator", icon: BrainCircuit },
        { name: "Simulation Manager", href: "/admin/mocks", icon: Rocket },
        { name: "Atomic Bank", href: "/admin/question-bank", icon: Database },
      ]
    },
    {
      label: "Institutional Archive",
      items: [
        { name: "PYQ Repository", href: "/admin/pyqs", icon: History },
        { name: "State Merit List", href: "/admin/leaderboards", icon: Trophy },
      ]
    },
    {
      label: "Diagnostics",
      items: [
        { name: "System Pulse", href: "/admin/system-health", icon: Activity },
        { name: "Gateway Node", href: "/admin/payment-settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="w-60 bg-zinc-950 border-r border-white/5 min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar pb-6 shrink-0">
      <div className="p-6 pb-4 flex items-center gap-2 mb-4 group">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center blue-glow shrink-0">
          <ShieldCheck className="text-white w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-sm font-black text-white leading-none tracking-tight">CRACKLIX</span>
          <span className="text-[7px] text-primary font-black uppercase mt-1 tracking-[0.2em]">Enterprise Admin</span>
        </div>
      </div>

      <div className="px-2 space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h4 className="px-4 text-[9px] font-black uppercase text-zinc-600 tracking-[0.3em] mb-2">{group.label}</h4>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-2.5 py-2 px-3 rounded-lg transition-all duration-200 group mx-2",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    )}>
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
                      <span className="font-bold tracking-tight text-[11px] truncate uppercase">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 pt-6">
        <Link href="/dashboard">
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">
            <Rocket className="w-3.5 h-3.5" />
            <span>Launch Student Arena</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
