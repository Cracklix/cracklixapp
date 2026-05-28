
"use client";

import { useAuth } from "@/lib/auth-context";
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { Bookmark, FileText, ChevronRight, Trash2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BookmarksPage() {
  const { profile } = useAuth();
  const bookmarks = (profile as any)?.bookmarks || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-24">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center">
              <Bookmark className="text-primary w-8 h-8 fill-current" />
           </div>
           <div>
              <h1 className="font-headline text-4xl font-bold tracking-tight">Your Revision Desk</h1>
              <p className="text-muted-foreground">Quickly access saved questions and important study materials.</p>
           </div>
        </div>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {bookmarks.map((b: any, i: number) => (
              <motion.div
                key={b.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-3xl bg-zinc-900/50 border-white/5 hover:bg-zinc-900 hover:border-primary/20 transition-all group">
                  <CardContent className="p-6 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                       <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          {b.type === 'question' ? <Zap className="w-4 h-4 text-yellow-500" /> : <FileText className="w-4 h-4 text-primary" />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{b.text}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <Badge variant="outline" className="text-[9px] border-white/10 uppercase tracking-widest font-black text-zinc-500">{b.subject}</Badge>
                             <span className="text-[9px] text-zinc-600 font-bold uppercase">{new Date(b.savedAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button variant="ghost" size="icon" className="rounded-xl text-zinc-600 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                          <ChevronRight className="w-4 h-4" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-zinc-950/20">
             <Bookmark className="w-16 h-16 text-zinc-500 opacity-20 mx-auto mb-6" />
             <h3 className="text-xl font-bold">No saved content</h3>
             <p className="text-zinc-500 mt-2">Bookmark tricky questions during mocks to see them here.</p>
             <Link href="/exams" className="inline-block mt-8">
               <Button className="rounded-xl bg-white text-black font-bold h-12 px-8">Start Practicing</Button>
             </Link>
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
