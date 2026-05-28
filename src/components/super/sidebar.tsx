
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Zap, 
  Lock,
  ArrowLeft
} from "lucide-react";

export default function SuperSidebar() {
  const pathname = usePathname();

  const items = [
    { name: "Overview", href: "/super-admin", icon: ShieldCheck },
    { name: "Admin Manager", href: "/super-admin/admins", icon: Users },
    { name: "System CMS", href: "/super-admin/cms", icon: FileText },
    { name: "Advanced Analytics", href: "/super-admin/analytics", icon: BarChart3 },
    { name: "Feature Flags", href: "/super-admin/flags", icon: Zap },
    { name: "Audit Logs", href: "/super-admin/audit", icon: Lock },
  ];

  return (
    <div className="w-72 bg-zinc-950 border-r border-white/5 min-h-screen p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-lg font-bold text-white leading-none">SUPER PANEL</span>
          <span className="text-[10px] text-primary font-black uppercase tracking-widest">Enterprise Mode</span>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-primary")} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <Link href="/admin">
          <div className="flex items-center gap-3 p-4 rounded-2xl text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Standard Admin</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
