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
  Search,
  Radio,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SidebarItem = ({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.05)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300",
        active 
          ? "bg-primary text-white shadow-xl shadow-primary/30" 
          : "text-zinc-500 hover:text-white"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-white" : "text-inherit")} />
      <span className="font-bold tracking-tight">{label}</span>
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
      <div className="h-screen w-screen flex items-center justify-center bg-[#050816] text-white">
         <div className="text-center space-y-6">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full mx-auto" 
           />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 animate-pulse">Establishing Secure Stream</p>
         </div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/live', icon: Radio, label: 'Live' },
    { href: '/exams', icon: BookOpen, label: 'Mocks' },
    { href: '/marketplace', icon: ShoppingBag, label: 'Market' },
    { href: '/leaderboard', icon: Trophy, label: 'Rank' },
    { href: '/ai', icon: BrainCircuit, label: 'AI Coach' },
  ];

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 300 : 0 }}
        className={cn(
          "hidden md:flex bg-zinc-950/50 backdrop-blur-3xl border-r border-white/5 flex-col transition-all duration-500",
          !isSidebarOpen && "border-none overflow-hidden"
        )}
      >
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center shrink-0 blue-glow">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className={cn("font-headline text-2xl font-black tracking-tighter whitespace-nowrap", !isSidebarOpen && "opacity-0")}>CRACKLIX</span>
          </Link>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                {...item} 
                active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))} 
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-6">
          <div className={cn("p-6 rounded-[28px] bg-white/[0.02] border border-white/5 space-y-4", !isSidebarOpen && "opacity-0")}>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">
              <span>Tier: Elite</span>
              <span className="text-primary">{profile?.xp || 0} XP</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(profile?.xp || 0) % 100}%` }}
                className="h-full bg-primary blue-glow" 
              />
            </div>
          </div>

          <SidebarItem href="/profile" icon={Settings} label="Settings" active={pathname === '/profile'} />
          
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-5 py-4 rounded-[20px] text-zinc-600 hover:bg-destructive/5 hover:text-destructive w-full transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold tracking-tight">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 md:px-12 bg-[#050816]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:flex hidden rounded-xl hover:bg-white/5" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-5 h-5 text-zinc-400" />
            </Button>
            
            <div className="flex md:hidden items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 blue-glow">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="font-headline text-xl font-black tracking-tighter">CRACKLIX</span>
            </div>

            <div className="hidden lg:flex items-center bg-white/[0.03] rounded-[20px] px-5 py-3 border border-white/5 w-[400px] focus-within:border-primary/50 transition-colors">
              <Search className="w-4 h-4 text-zinc-500 mr-3" />
              <input 
                type="text" 
                placeholder="Search topics, mocks, news..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-zinc-600 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5">
               <Sparkles className="w-4 h-4 text-accent" />
               <span className="text-[10px] font-black uppercase tracking-widest text-accent">Pro Status</span>
            </div>
            
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/5">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-4 ring-[#050816]" />
            </Button>

            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black tracking-tight">{profile?.name || 'Aspirant'}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{profile?.streak || 0} DAY STREAK 🔥</p>
              </div>
              <Avatar className="w-12 h-12 border-2 border-primary/20 p-0.5">
                <AvatarImage src={`https://picsum.photos/seed/${profile?.uid}/200`} className="rounded-full" />
                <AvatarFallback className="bg-zinc-800">{profile?.name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth bg-transparent">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Padding for mobile bottom nav */}
          <div className="h-24 md:hidden" />
        </main>
      </div>
    </div>
  );
}