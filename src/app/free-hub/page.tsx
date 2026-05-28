"use client";

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { 
  FileText, 
  Video, 
  FileQuestion, 
  History, 
  Newspaper, 
  BookOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function FreeHubPage() {
  const sections = [
    { title: "Punjab GK", icon: BookOpen, color: "text-blue-500", count: "1,200+ Topics" },
    { title: "Free PDF Notes", icon: FileText, color: "text-emerald-500", count: "542 Files" },
    { title: "PYQ Archive", icon: History, color: "text-orange-500", count: "10 Years" },
    { title: "Daily News", icon: Newspaper, color: "text-purple-500", count: "Updated Daily" },
    { title: "Mini Quizzes", icon: FileQuestion, color: "text-pink-500", count: "50+ Active" },
    { title: "Free Mocks", icon: Video, color: "text-cyan-500", count: "12 Samples" },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-24 space-y-12">
        <div className="text-center md:text-left">
          <h1 className="font-headline text-5xl font-bold">Free Hub</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
            Unrestricted access to foundational study materials and practice tools for all aspirants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/60 backdrop-blur-md p-8 rounded-[40px] border border-white/5 hover:bg-card/80 transition-all group relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                
                <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${section.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                <p className="text-muted-foreground mb-8">{section.count}</p>
                
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                  Explore Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="p-10 rounded-[48px] bg-gradient-to-br from-primary/20 to-accent/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-bold">New to Punjab Govt Exams?</h2>
            <p className="text-muted-foreground max-w-md">Download our "Starter Roadmap" PDF to understand patterns, syllabus, and priority subjects.</p>
          </div>
          <button className="bg-white text-black h-14 px-8 rounded-2xl font-bold text-lg hover:scale-105 transition-transform whitespace-nowrap">
            Download Roadmap
          </button>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}