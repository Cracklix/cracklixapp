
'use client';

import { useI18n } from '@/app/lib/i18n-context';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
      <button
        onClick={() => setLocale('en')}
        className={cn(
          "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
          locale === 'en' ? "bg-primary text-white shadow-lg" : "text-zinc-500 hover:text-white"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('pa')}
        className={cn(
          "px-4 py-1.5 rounded-xl text-[10px] font-black transition-all",
          locale === 'pa' ? "bg-primary text-white shadow-lg" : "text-zinc-500 hover:text-white"
        )}
      >
        ਪੰਜਾਬੀ
      </button>
    </div>
  );
}
