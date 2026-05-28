
'use client';

import { useEffect, useState } from 'react';
import { getLiveClasses, LiveClass } from '@/services/live-class';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { motion } from 'framer-motion';
import { Play, Calendar, User, BookOpen, Clock, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getLiveClasses();
        setClasses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-24 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="font-headline text-5xl font-bold">Virtual Classroom</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-xl">
              Learn from Punjab's top educators in real-time. Join marathons, doubt sessions, and exam strategy meets.
            </p>
          </div>
          <div className="w-32 h-32 rounded-[40px] bg-red-600/20 border border-red-500/20 flex items-center justify-center animate-pulse">
            <Radio className="text-red-500 w-16 h-16" />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-[40px] bg-card/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.length > 0 ? (
              classes.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card/60 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden group hover:bg-card/80 transition-all"
                >
                  <div className="relative aspect-video">
                    <img
                      src={item.thumbnail || `https://picsum.photos/seed/${item.id}/800/450`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={item.title}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                        <Play className="text-white fill-current w-6 h-6 ml-1" />
                      </div>
                    </div>
                    {item.live && (
                      <Badge className="absolute top-4 left-4 bg-red-600 border-none px-3 py-1 font-bold animate-pulse">
                        LIVE NOW
                      </Badge>
                    )}
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        <BookOpen className="w-3 h-3" />
                        {item.exam}
                      </div>
                      <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="text-zinc-500 w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{item.teacherName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Educator</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Starts At</p>
                        <p className="text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-accent" />
                          {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <Button asChild className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-lg">
                      <Link href={`/live/${item.id}`}>
                        {item.live ? "Join Classroom" : "View Recording"}
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center rounded-[48px] border border-dashed border-white/10 bg-secondary/20">
                <Radio className="w-16 h-16 text-muted-foreground opacity-20 mx-auto mb-6" />
                <h3 className="text-2xl font-bold">No sessions scheduled</h3>
                <p className="text-muted-foreground mt-2">Check back soon for the next Punjab Police marathon!</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
