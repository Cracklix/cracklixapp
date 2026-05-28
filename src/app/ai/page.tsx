"use client";

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import AiChatInterface from "@/components/ai/ai-chat-interface";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, MessageSquare, Zap } from "lucide-react";

export default function AIPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-24 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest"
            >
              <Sparkles className="w-4 h-4" />
              Next-Gen Learning
            </motion.div>
            <h1 className="font-headline text-5xl font-bold">AI Chat Tutor</h1>
            <p className="text-xl text-muted-foreground max-w-xl">
              Instant explanations, problem solving, and exam strategy tailored for Punjab government exams.
            </p>
          </div>
          <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20">
            <BrainCircuit className="text-white w-16 h-16" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <AiChatInterface />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Doubt Solver", desc: "Complex Punjab GK or Math doubts solved instantly.", icon: MessageSquare, color: "text-blue-500" },
              { title: "Revision Guide", desc: "Summarize topics into bullet points for quick recall.", icon: Zap, color: "text-yellow-500" },
              { title: "Syllabus AI", desc: "Ask about PPSC/PSSSB pattern updates.", icon: BrainCircuit, color: "text-purple-500" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-[32px] bg-card/40 border border-white/5 hover:bg-card/60 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
