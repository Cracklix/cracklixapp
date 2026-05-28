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
  Newspaper
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const items = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Questions", href: "/admin/questions", icon: FileQuestion },
    { name: "Mocks", href: "/admin/mocks", icon: FileText },
    { name: "Exams", href: "/admin/exams", icon: BookOpen },
    { name: "Content", href: "/admin/current-affairs", icon: Newspaper },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-72 bg-zinc-950 border-r border-white/5 min-h-screen p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="text-white w-5 h-5 fill-current" />
        </div>
        <span className="font-headline text-xl font-bold tracking-tight text-white uppercase">Cracklix Admin</span>
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
        <Link href="/dashboard">
          <div className="flex items-center gap-3 p-4 rounded-2xl text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Exit to App</span>
          </div>
        </Link>
      </div>
    </div>
  );
}