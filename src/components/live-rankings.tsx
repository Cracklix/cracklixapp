"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Zap, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function LiveRankings() {
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collectionRef = collection(db, "liveRanks");
    const q = query(
      collectionRef,
      orderBy("score", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        setRanks(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })));
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Card className="rounded-[40px] cracklix-glass border-white/5 overflow-hidden h-fit sticky top-8">
      <CardHeader className="p-8 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="text-primary w-5 h-5" />
             </div>
             Arena Ranks
          </CardTitle>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
        ) : ranks.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {ranks.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    index === 0 
                      ? "bg-primary/10 border-primary/20" 
                      : "bg-secondary/30 border-white/5 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                      index === 0 ? "bg-primary text-white" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      #{index + 1}
                    </div>
                    <Avatar className="w-10 h-10 border-2 border-white/5">
                       <AvatarImage src={`https://picsum.photos/seed/${user.userId}/100`} />
                       <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[120px]">{user.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">{user.district || 'Punjab'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <h3 className="text-lg font-black text-primary">{user.score}</h3>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-accent font-bold uppercase tracking-tighter">
                       <TrendingUp className="w-3 h-3" />
                       {user.accuracy || 0}% Acc
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-[28px] bg-zinc-800 flex items-center justify-center mx-auto opacity-20">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-zinc-500 italic text-sm">Waiting for gladiators to enter the arena...</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
           <span className="flex items-center gap-2">
             <Zap className="w-3 h-3 text-yellow-500 fill-current" />
             Updated Just Now
           </span>
           <span>500+ Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
