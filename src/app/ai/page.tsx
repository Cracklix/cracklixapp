
"use client";

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import AiChatInterface from "@/components/ai/ai-chat-interface";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, MessageSquare, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AIPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-24 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest"
            >
              <Sparkles className="w-4 h-4" />
              Intelligence Layer v4
            </motion.div>
            <h1 className="font-headline text-5xl font-black">AI Command Center</h1>
            <p className="text-xl text-zinc-500 max-w-xl">
              From instant doubt solving to high-stakes board interview simulations.
            </p>
          </div>
          <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20">
            <BrainCircuit className="text-white w-16 h-16" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <AiChatInterface />
          </div>
          
          <div className="lg:col-span-4 space-y-6">
             <Link href="/ai/interview">
               <motion.div 
                 whileHover={{ y: -4 }}
                 className="p-8 rounded-[40px] bg-gradient-to-br from-zinc-900 to-black border border-white/5 group relative overflow-hidden h-64 flex flex-col justify-between"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={120} />
                  </div>
                  <div>
                    <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black uppercase mb-4">New Module</Badge>
                    <h3 className="text-2xl font-bold">Interview Simulator</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Structured PPSC-style mock interviews with real-time feedback.</p>
                  </div>
                  <Button className="w-full h-11 rounded-xl bg-white text-black font-bold">
                    Start Session <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
               </motion.div>
             </Link>

             <div className="p-8 rounded-[40px] cracklix-glass border-white/5 space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Core Capabilities</h4>
                <div className="space-y-4">
                  {[
                    { title: "Doubt Solver", desc: "Complex Punjab GK or Math doubts.", icon: MessageSquare, color: "text-blue-500" },
                    { title: "Revision Guide", desc: "Summarize topics into high-yield bullets.", icon: Zap, color: "text-yellow-500" },
                    { title: "Voice Tutor", desc: "Hands-free learning via TTS.", icon: BrainCircuit, color: "text-purple-500" },
                  ].map((feature) => (
                    <div key={feature.title} className="flex gap-4 items-start">
                      <div className={`w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 ${feature.color}`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">{feature.title}</h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
