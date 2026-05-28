
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * SAFE RECOVERY MODE Activity Feed
 * Strict cleanup to prevent memory leaks and loops.
 */
export default function LiveActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const SAFE_MODE = true; // Safety lock enabled

  useEffect(() => {
    if (SAFE_MODE) {
       // Temporarily disable realtime during emergency stabilization
       return;
    }

    const q = query(
      collection(db, "liveActivity"),
      orderBy("createdAt", "desc"),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      console.count("Activity Stream Update");
      setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("[LiveActivity] Stream suspended.");
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <Activity className="w-5 h-5 text-accent" />
          Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-3 mt-4">
          {SAFE_MODE ? (
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center py-4">Stream Standby</p>
          ) : (
            <AnimatePresence mode="popLayout">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                  <p className="text-[11px] font-medium text-zinc-400 line-clamp-1">{activity.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
