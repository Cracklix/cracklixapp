"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileQuestion, 
  FileText, 
  BookOpen, 
  Users, 
  BarChart3,
  Zap,
  Newspaper,
  History,
  Bell,
  IndianRupee,
  ShieldCheck,
  Briefcase,
  MessageSquare,
  Trophy,
  ShieldAlert,
  Database,
  Cpu
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const items = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Ingestion Hub", href: "/admin/questions", icon: Cpu },
    { name: "Question Bank", href: "/admin/question-bank", icon: Database },
    { name: "Mock Tests", href: "/admin/mocks", icon: FileText },
    { name: "Community Hub", href: "/admin/community", icon: MessageSquare },
    { name: "PYQ Bank", href: "/admin/pyqs", icon: History },
    { name: "Current Affairs", href: "/admin/current-affairs", icon: Newspaper },
    { name: "Leaderboards", href: "/admin/leaderboards", icon: Trophy },
    { name: "Revenue Ops", href: "/admin/payments", icon: IndianRupee },
    { name: "AI Factory", href: "/admin/ai-assistant", icon: Zap },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-72 bg-zinc-950 border-r border-white/5 min-h-screen p-6 flex flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center blue-glow">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-lg font-bold text-white leading-none">CRACKLIX</span>
          <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Admin Command</span>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              )}>
                <Icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "group-hover:text-primary")} />
                <span className="font-bold tracking-tight text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-4">
        <div className="px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
           <ShieldAlert className="text-destructive w-4 h-4" />
           <span className="text-[10px] font-black text-destructive uppercase tracking-widest">Secure Shell</span>
        </div>
        <Link href="/dashboard">
          <div className="flex items-center gap-3 p-4 rounded-2xl text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
            <Zap className="w-5 h-5" />
            <span className="font-bold text-sm">Student Mode</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
