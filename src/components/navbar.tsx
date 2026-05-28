
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, BookOpen, User, Zap, Sparkles, Radio, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/live', icon: Radio, label: 'Live' },
    { href: '/marketplace', icon: ShoppingBag, label: 'Store' },
    { href: '/exams', icon: BookOpen, label: 'Mocks' },
    { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { href: '/ai', icon: Sparkles, label: 'AI' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-50 md:hidden">
      <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 flex justify-around items-center shadow-2xl overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link key={item.href} href={item.href} className="relative group shrink-0">
              <div className={cn(
                "flex flex-col items-center p-3 rounded-2xl transition-all duration-300",
                isActive ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-white"
              )}>
                <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "fill-primary/20" : "")} />
                <span className="text-[10px] mt-1 font-black uppercase tracking-tighter">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="nav-glow"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary blue-glow"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
