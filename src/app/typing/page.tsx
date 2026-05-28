
"use client";

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Keyboard, Zap, Trophy, Timer, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function TypingHubPage() {
  const modes = [
    { 
      id: "clerk-en", 
      title: "English Speed Clerk", 
      lang: "English", 
      goal: "30 WPM", 
      desc: "Standard requirement for PSSSB Clerk / Clerk IT.",
      color: "from-blue-500/20 to-transparent",
      iconColor: "text-blue-500"
    },
    { 
      id: "clerk-pa", 
      title: "Punjabi Raavi Master", 
      lang: "Punjabi", 
      goal: "30 WPM", 
      desc: "Mandatory Raavi font test for Punjab state recruitment.",
      color: "from-primary/20 to-transparent",
      iconColor: "text-primary"
    },
    { 
      id: "steno-en", 
      title: "Senior Steno Sprint", 
      lang: "English", 
      goal: "50 WPM", 
      desc: "Advanced speed for Stenographer and Data Entry roles.",
      color: "from-emerald-500/20 to-transparent",
      iconColor: "text-emerald-500"
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-24 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <Badge className="bg-primary/10 border-primary/20 text-primary px-4 py-1 font-black uppercase text-[10px] tracking-widest">
              Skill Arena
            </Badge>
            <h1 className="font-headline text-5xl font-black tracking-tight">Typing Command Center</h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Master the mandatory typing requirements for Punjab clerical posts. Supports English and Raavi (Unicode) layouts.
            </p>
          </div>
          <div className="w-32 h-32 rounded-[40px] bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full animate-pulse" />
            <Keyboard className="text-primary w-16 h-16 relative z-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={cn(
                "rounded-[40px] cracklix-glass border-white/5 overflow-hidden group hover:scale-[1.02] transition-all duration-500 h-full flex flex-col bg-gradient-to-br",
                mode.color
              )}>
                <CardContent className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center", mode.iconColor)}>
                        <Zap className="w-6 h-6 fill-current" />
                      </div>
                      <Badge variant="outline" className="border-white/10 text-zinc-500 font-bold uppercase text-[9px]">{mode.lang}</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{mode.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-6">{mode.desc}</p>
                    
                    <div className="flex items-center gap-6 mb-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                       <span className="flex items-center gap-2"><Trophy className="w-3 h-3 text-accent" /> Goal: {mode.goal}</span>
                       <span className="flex items-center gap-2"><Timer className="w-3 h-3 text-primary" /> 10 Mins</span>
                    </div>
                  </div>

                  <Link href={`/typing/${mode.id}`} className="block">
                    <Button className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black group">
                      Enter Arena <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="p-10 rounded-[48px] bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 mt-12">
           <div className="flex gap-6 items-center">
              <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center shrink-0">
                 <ShieldCheck className="text-emerald-500 w-8 h-8" />
              </div>
              <div className="space-y-1">
                 <h4 className="text-xl font-bold">PSSSB Compliant Engine</h4>
                 <p className="text-sm text-muted-foreground">Our algorithms precisely mirror the official PSSSB Clerk typing test environment.</p>
              </div>
           </div>
           <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> RAAVI SUPPORTED</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> LIVE WPM</span>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
