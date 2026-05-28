
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
  MessageSquare,
  ShoppingBag,
  Bookmark,
  History,
  Newspaper,
  ShieldAlert,
  User as UserIcon,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/language-switcher';
import { checkIsAdmin } from '@/hooks/useAdmin';
import SupportTrigger from '@/components/support/support-trigger';
import { usePremium } from '@/hooks/usePremium';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SidebarItem = ({ href, icon: Icon, label, active, sidebarOpen }: { href: string, icon: any, label: string, active: boolean, sidebarOpen: boolean }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
          : "text-zinc-500 hover:text-white"
      )}
    >
      <Icon className={cn("w-4 h-4", active ? "text-white" : "text-zinc-500")} />
      {sidebarOpen && <span className="font-bold text-[11px] tracking-tight uppercase">{label}</span>}
    </motion.div>
  </Link>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth();
  const { t } = useI18n();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { isPremium } = usePremium(user?.uid);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/community', icon: MessageSquare, label: 'Community' },
    { href: '/exams', icon: BookOpen, label: 'Mock Tests' },
    { href: '/pyqs', icon: History, label: 'PYQ Archive' },
    { href: '/current-affairs', icon: Newspaper, label: 'Daily Pulse' },
    { href: '/bookmarks', icon: Bookmark, label: 'Saved' },
    { href: '/marketplace', icon: ShoppingBag, label: 'Store' },
    { href: '/leaderboard', icon: Trophy, label: 'Rankings' },
    { href: '/ai', icon: BrainCircuit, label: 'AI Mentor' },
  ];

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const isAdmin = checkIsAdmin(user, profile);

  return (
    <div className="flex h-screen bg-black overflow-hidden font-body text-white">
      {/* Sidebar - Testbook Style */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="hidden md:flex bg-zinc-950 border-r border-white/5 flex-col transition-all duration-300 z-50 shrink-0"
      >
        <div className="p-5 overflow-y-auto no-scrollbar flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 mb-8 overflow-hidden group px-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 blue-glow">
              <Zap className="text-white w-4 h-4 fill-current" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-headline text-lg font-black tracking-tighter uppercase leading-none">CRACKLIX</span>
                <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-[0.3em] leading-none mt-1">BY ARSH GREWAL</span>
              </div>
            )}
          </Link>

          <nav className="space-y-1">
            {isAdmin && (
               <Link href="/admin">
                 <motion.div 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className={cn(
                   "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-6 shadow-lg",
                   !sidebarOpen && "justify-center"
                 )}>
                   <ShieldAlert className="w-4 h-4" />
                   {sidebarOpen && <span className="font-bold text-[10px] uppercase tracking-widest">Admin Control</span>}
                 </motion.div>
               </Link>
            )}

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

        <div className="mt-auto p-4 space-y-1">
          <SidebarItem href="/profile" icon={Settings} label="Identity" active={pathname === '/profile'} sidebarOpen={sidebarOpen} />
          <button 
            onClick={logout}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-600 hover:text-destructive w-full transition-all duration-200",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="font-bold text-[11px] uppercase tracking-tight">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:flex hidden h-8 w-8 rounded-lg" onClick={toggleSidebar}>
              <Menu className="w-4 h-4 text-zinc-400" />
            </Button>
            <div className="flex md:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0"><Zap className="text-white w-3.5 h-3.5 fill-current" /></div>
              <span className="font-headline text-base font-black tracking-tighter">CRACKLIX</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* GET PASS BUTTON - TESTBOOK STYLE */}
            <Link href="/pass">
              <Button className="h-10 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-primary text-[10px] font-black uppercase tracking-widest blue-glow shadow-xl animate-pulse hover:animate-none">
                 <Crown className="w-3.5 h-3.5 mr-2 fill-current" />
                 Get Pass+
              </Button>
            </Link>
            
            <LanguageSwitcher />
            
            <div className="flex items-center gap-3 pl-5 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-white leading-none">{profile?.name || 'Aspirant'}</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{profile?.xp || 0} XP</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 border border-white/10 cursor-pointer hover:border-primary/50 transition-colors">
                    <AvatarImage src={`https://picsum.photos/seed/${profile?.uid || user?.uid}/100`} />
                    <AvatarFallback className="text-[10px]">{profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-zinc-950 border-white/10 text-white rounded-2xl shadow-2xl p-1.5" align="end">
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl cursor-pointer py-2.5 text-xs">
                    <UserIcon className="mr-2 h-3.5 w-3.5 text-zinc-500" />
                    <span>My Identity</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/pass')} className="rounded-xl cursor-pointer py-2.5 text-xs text-primary">
                    <Crown className="mr-2 h-3.5 w-3.5" />
                    <span>My Pass+</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl cursor-pointer py-2.5 text-xs text-blue-500">
                      <ShieldAlert className="mr-2 h-3.5 w-3.5" />
                      <span>Admin Control</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={logout} className="rounded-xl cursor-pointer py-2.5 text-xs text-red-500">
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
          <div className="h-24 md:hidden" />
        </main>
      </div>

      <SupportTrigger />
    </div>
  );
}
