
"use client";

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  BrainCircuit, 
  Settings, 
  LogOut, 
  Zap,
  Menu,
  Bell,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SidebarItem = ({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ x: 4 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-muted-foreground hover:bg-secondary hover:text-white"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </motion.div>
  </Link>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 fill-current" />
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/exams', icon: BookOpen, label: 'Exams' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/coach', icon: BrainCircuit, label: 'AI Coach' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className={cn(
          "bg-card border-r border-white/5 flex flex-col transition-all duration-500",
          !isSidebarOpen && "border-none overflow-hidden"
        )}
      >
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className={cn("font-headline text-xl font-bold tracking-tight whitespace-nowrap", !isSidebarOpen && "opacity-0")}>CRACKLIX</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                {...item} 
                active={pathname.startsWith(item.href)} 
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className={cn("cracklix-glass p-4 rounded-3xl space-y-3", !isSidebarOpen && "opacity-0")}>
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
              <span>XP Level</span>
              <span className="text-primary">{profile?.xp || 0} XP</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(profile?.xp || 0) % 100}%` }}
                className="h-full bg-primary" 
              />
            </div>
          </div>

          <SidebarItem href="/profile" icon={Settings} label="Profile" active={pathname === '/profile'} />
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden md:flex items-center bg-secondary/50 rounded-2xl px-4 py-2 border border-white/5 w-80">
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Search exams, topics..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{profile?.name || 'Student'}</p>
                <p className="text-xs text-muted-foreground">{profile?.streak || 0} Day Streak 🔥</p>
              </div>
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={`https://picsum.photos/seed/${profile?.uid}/200`} />
                <AvatarFallback>{profile?.name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
