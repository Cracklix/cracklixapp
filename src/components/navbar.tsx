
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, BookOpen, User, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/mocks', icon: FileText, label: 'Mocks' },
    { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { href: '/exams', icon: BookOpen, label: 'Exams' },
    { href: '/pass', icon: Zap, label: 'Pass' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 p-3 flex justify-around z-50 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex flex-col items-center transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground hover:text-white"
            )}>
              <Icon size={22} className={isActive ? "fill-primary/20" : ""} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
