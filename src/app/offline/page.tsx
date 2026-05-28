"use client";

import { WifiOff, RotateCcw, Smartphone, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-sm space-y-10 relative z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-24 rounded-[40px] bg-secondary flex items-center justify-center mx-auto shadow-2xl shadow-black/50 border border-white/5"
        >
          <WifiOff className="w-12 h-12 text-zinc-500 opacity-50" />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black font-headline tracking-tighter">CONNECTION LOST</h1>
          <p className="text-muted-foreground leading-relaxed text-sm">
            CRACKLIX requires an active stream to sync your Punjab State Rank. However, you can still access your <span className="text-white font-bold">Offline Downloads</span>.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button asChild size="lg" className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-xl">
            <Link href="/">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reconnect to Server
            </Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="h-12 rounded-xl border-white/5 bg-zinc-900/50 text-xs font-bold">
                <BookOpen className="w-4 h-4 mr-2 text-accent" />
                Saved Notes
             </Button>
             <Button variant="outline" className="h-12 rounded-xl border-white/5 bg-zinc-900/50 text-xs font-bold">
                <Smartphone className="w-4 h-4 mr-2 text-primary" />
                Offline Mocks
             </Button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
           <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">
            Cracklix Engine v2.5 • Offline Core
          </p>
        </div>
      </div>
    </div>
  );
}