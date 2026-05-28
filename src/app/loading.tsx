"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-24 h-24 rounded-[40px] bg-primary flex items-center justify-center blue-glow mb-8"
      >
        <Zap className="text-white w-12 h-12 fill-current" />
      </motion.div>
      
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black font-headline tracking-tighter text-white">
          CRACKLIX
        </h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
          Initializing Engine
        </p>
      </div>
    </div>
  );
}