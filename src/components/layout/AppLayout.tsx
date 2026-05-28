
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
  Briefcase,
  Keyboard,
  Bookmark,
  History,
  Newspaper,
  ShieldAlert,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/language-switcher';
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
        "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200",
        active 
          ? "bg-primary text-white shadow-xl shadow-primary/20" 
          : "text-zinc-500 hover:text-white"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-white" : "text-zinc-500")} />
      {sidebarOpen && <span className="font-bold text-sm tracking-tight">{label}</span>}
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

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/community', icon: MessageSquare, label: 'Community' },
    { href: '/exams', icon: BookOpen, label: 'Mock Tests' },
    { href: '/pyqs', icon: History, label: 'PYQ Archive' },
    { href: '/current-affairs', icon: Newspaper, label: 'Daily Pulse' },
    { href: '/typing', icon: Keyboard, label: 'Typing' },
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

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.email === 'arshdeepgrewal1122@gmail.com';

  return (
    <div className="flex h-screen bg-black overflow-hidden font-body">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 84 }}
        className="hidden md:flex bg-zinc-950 border-r border-white/5 flex-col transition-all duration-300"
      >
        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center shrink-0 blue-glow">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            {sidebarOpen && <span className="font-headline text-2xl font-black tracking-tighter">CRACKLIX</span>}
          </Link>

          <nav className="space-y-1">
            {isAdmin && (
               <Link href="/admin">
                 <div className={cn(
                   "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-6",
                   !sidebarOpen && "justify-center"
                 )}>
                   <ShieldAlert className="w-5 h-5" />
                   {sidebarOpen && <span className="font-bold text-sm">Admin Panel</span>}
                 </div>
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

        <div className="mt-auto p-6 space-y-4">
          <SidebarItem href="/profile" icon={Settings} label="Settings" active={pathname === '/profile'} sidebarOpen={sidebarOpen} />
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-600 hover:text-destructive w-full transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-bold text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:flex hidden rounded-xl" onClick={toggleSidebar}>
              <Menu className="w-5 h-5 text-zinc-400" />
            </Button>
            <div className="flex md:hidden items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0"><Zap className="text-white w-4 h-4 fill-current" /></div>
              <span className="font-headline text-lg font-black tracking-tighter">CRACKLIX</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{profile?.name || 'Aspirant'}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{profile?.xp || 0} XP Pool</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-10 h-10 border-2 border-white/5 cursor-pointer hover:border-primary/50 transition-colors">
                    <AvatarImage src={`https://picsum.photos/seed/${profile?.uid}/100`} />
                    <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-950 border-white/10 text-white rounded-2xl shadow-2xl p-2" align="end">
                  <DropdownMenuLabel className="px-4 py-3">
                    <p className="text-sm font-bold truncate">{profile?.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl cursor-pointer py-3 focus:bg-white/5">
                    <UserIcon className="mr-2 h-4 w-4 text-zinc-500" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl cursor-pointer py-3 focus:bg-white/5">
                    <Settings className="mr-2 h-4 w-4 text-zinc-500" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={logout} className="rounded-xl cursor-pointer py-3 text-red-500 focus:bg-red-500/10 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-bold">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
          <div className="h-24 md:hidden" />
        </main>
      </div>
    </div>
  );
}
