"use client";

import AppLayout from "@/components/layout/AppLayout";
import OCRUpload from "@/components/ocr-upload";
import VoiceAssistant from "@/components/voice-assistant";
import NotesPDF from "@/components/notes-pdf";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Beaker, Sparkles } from "lucide-react";

export default function AILabPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-24 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4"
            >
              <Beaker className="w-4 h-4" />
              Experimental AI Tools
            </motion.div>
            <h1 className="font-headline text-5xl font-bold">AI Command Center</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-xl">
              Advanced multimodal tools for the elite aspirant. Extract, speak, and synthesize data with next-gen intelligence.
            </p>
          </div>
          <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <Sparkles className="text-white w-16 h-16" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <OCRUpload />
            <div className="p-10 rounded-[48px] bg-gradient-to-br from-zinc-900 to-black border border-white/5">
              <h3 className="text-2xl font-bold mb-4">AI Pro tip</h3>
              <p className="text-muted-foreground leading-relaxed italic">
                "Use the OCR scanner for tricky Math diagrams or handwritten notes. The AI can interpret visual complexity better than standard text search."
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <VoiceAssistant />
            <NotesPDF />
          </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}