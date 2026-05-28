
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, BookOpen, User, Briefcase, Radio, ShoppingBag, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Premium Mobile Navigation Component
 * Integrated with Glassmorphism and Neon highlights.
 */
export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/live', icon: Radio, label: 'Live' },
    { href: '/exams', icon: BookOpen, label: 'Mocks' },
    { href: '/jobs', icon: Briefcase, label: 'Jobs' },
    { href: '/marketplace', icon: ShoppingBag, label: 'Store' },
    { href: '/referral', icon: Gift, label: 'Earn' },
    { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-[60] md:hidden">
      <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[30px] p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href} className="relative flex-1 min-w-[60px]">
              <div className={cn(
                "flex flex-col items-center py-2.5 rounded-2xl transition-all duration-300",
                isActive ? "text-primary" : "text-zinc-500"
              )}>
                <Icon size={18} className={cn("transition-transform duration-300", isActive ? "scale-110 fill-primary/10" : "")} />
                <span className={cn(
                  "text-[8px] mt-1 font-black uppercase tracking-tighter transition-all duration-300",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-6 h-1 rounded-full bg-primary blue-glow"
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
