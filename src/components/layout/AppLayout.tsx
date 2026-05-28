"use client";

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/app/lib/i18n-context';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
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
  Sparkles,
  Briefcase,
  Gift
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/language-switcher';

const SidebarItem = ({ href, icon: Icon, label, active, sidebarOpen }: { href: string, icon: any, label: string, active: boolean, sidebarOpen: boolean }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-zinc-500 hover:text-zinc-200"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-white" : "text-zinc-500")} />
      {sidebarOpen && <span className="font-semibold text-sm tracking-tight">{label}</span>}
    </motion.div>
  </Link>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth();
  const { t } = useI18n();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050816] text-white">
         <div className="text-center space-y-4">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full mx-auto" 
           />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Secure Stream</p>
         </div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('home') },
    { href: '/live', icon: Radio, label: 'Live' },
    { href: '/exams', icon: BookOpen, label: t('mocks') },
    { href: '/jobs', icon: Briefcase, label: t('jobs') },
    { href: '/marketplace', icon: ShoppingBag, label: t('market') },
    { href: '/referral', icon: Gift, label: t('invites') },
    { href: '/leaderboard', icon: Trophy, label: t('leaderboard') },
    { href: '/ai', icon: BrainCircuit, label: t('ai_coach') },
  ];

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden font-body">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className={cn(
          "hidden md:flex bg-[#0f172a] border-r border-white/5 flex-col transition-all duration-300",
          !sidebarOpen && "items-center"
        )}
      >
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 blue-glow">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            {sidebarOpen && <span className="font-headline text-2xl font-black tracking-tighter whitespace-nowrap">CRACKLIX</span>}
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                {...item} 
                active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))} 
                sidebarOpen={sidebarOpen}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          {sidebarOpen && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-black">
                <span>{profile?.coins || 0} Coins</span>
                <span className="text-primary">{profile?.xp || 0} XP</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile?.xp || 0) % 100}%` }}
                  className="h-full bg-primary" 
                />
              </div>
            </div>
          )}

          <SidebarItem href="/profile" icon={Settings} label="Settings" active={pathname === '/profile'} sidebarOpen={sidebarOpen} />
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:text-destructive w-full transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-semibold text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#050816]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:flex hidden rounded-xl hover:bg-white/5" onClick={toggleSidebar}>
              <Menu className="w-5 h-5 text-zinc-400" />
            </Button>
            
            <div className="flex md:hidden items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Zap className="text-white w-4 h-4 fill-current" />
              </div>
              <span className="font-headline text-lg font-black tracking-tighter">CRACKLIX</span>
            </div>

            <div className="hidden lg:flex items-center bg-white/5 rounded-xl px-4 py-2 border border-white/5 w-[300px] focus-within:border-primary/40 transition-colors">
              <Search className="w-4 h-4 text-zinc-500 mr-2" />
              <input 
                type="text" 
                placeholder={t('search_placeholder')} 
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-zinc-600 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/5">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{profile?.name || 'Aspirant'}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">{profile?.streak || 0} {t('streak')} 🔥</p>
              </div>
              <Avatar className="w-9 h-9 border border-white/10">
                <AvatarImage src={`https://picsum.photos/seed/${profile?.uid}/100`} />
                <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-[1200px] mx-auto">
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
          </div>
          <div className="h-24 md:hidden" />
        </main>
      </div>
    </div>
  );
}