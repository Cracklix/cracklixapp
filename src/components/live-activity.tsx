"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Activity, Zap, Users, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function LiveActivity() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const collectionRef = collection(db, "liveActivity");
    const q = query(
      collectionRef,
      orderBy("createdAt", "desc"),
      limit(8)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Card className="rounded-[40px] cracklix-glass border-white/5 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-accent pulse-accent rounded-full" />
          </div>
          Live Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-4 mt-6">
          <AnimatePresence mode="popLayout">
            {activities.length > 0 ? (
              activities.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-accent/5 border border-accent/10"
                >
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                  <p className="text-sm font-medium text-white/90">
                    {activity.message}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-xs text-muted-foreground uppercase font-bold tracking-widest">
                  <Users className="w-3 h-3" />
                  Observing Traffic...
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">
            <Zap className="w-3 h-3 text-yellow-500" />
            Active Now: 1.2k
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Sync: 100%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}