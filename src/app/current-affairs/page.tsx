"use client";

import { useEffect, useState } from "react";
import { getCurrentAffairs } from "@/services/current-affairs";
import Navbar from "@/components/navbar";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Calendar, FileText, ChevronRight, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCurrentAffairs();
        setArticles(data);
      } catch (error) {
        console.error("Failed to load current affairs", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-24 space-y-8">
        <div>
          <h1 className="font-headline text-4xl font-bold">Current Affairs</h1>
          <p className="text-muted-foreground mt-2">Daily updates tailored for Punjab State exams.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-card/40 animate-pulse rounded-[40px] border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/60 backdrop-blur-md overflow-hidden rounded-[40px] border border-white/5 group"
                >
                  <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-2 relative h-64 md:h-auto overflow-hidden">
                      <img
                        src={article.image || "https://picsum.photos/seed/news/800/600"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={article.title}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary/90 text-white border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
                          {article.category || "Punjab GK"}
                        </Badge>
                      </div>
                    </div>

                    <div className="md:col-span-3 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 uppercase tracking-widest font-bold">
                          <Calendar className="w-3 h-3" />
                          {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <h2 className="text-2xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                          {article.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {article.pdfUrl ? (
                          <Button asChild className="rounded-2xl h-12 px-6 bg-primary font-bold">
                            <a href={article.pdfUrl} target="_blank">
                              <FileText className="w-4 h-4 mr-2" />
                              Download Study Notes
                            </a>
                          </Button>
                        ) : (
                          <Button variant="secondary" className="rounded-2xl h-12 px-6 font-bold">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read Analysis
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-xl border border-white/5">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center rounded-[40px] border border-dashed border-white/10 bg-secondary/20">
                <p className="text-muted-foreground">The news desk is gathering the latest updates. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}