
"use client";

import { useEffect, useState } from "react";
import { subscribeNotifications } from "@/services/notifications";
import { useAuth } from "@/lib/auth-context";
import { Bell, Sparkles, Trophy, FileText, Clock, ShieldAlert, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * SAFE RECOVERY MODE Notification Panel
 * Realtime sync suspended to prevent resource loops.
 */
export default function NotificationPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const SAFE_MODE = true; // RECOVERY LOCK: Enabled

  useEffect(() => {
    if (!user || SAFE_MODE) return;
    
    // In recovery mode, we skip the realtime listener to free up CPU
    const unsubscribe = subscribeNotifications(user.uid, setNotifications);
    return () => unsubscribe();
  }, [user?.uid]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-4 h-4 text-accent" />;
      case 'mock': return <FileText className="w-4 h-4 text-primary" />;
      case 'founder': return <ShieldAlert className="w-4 h-4 text-primary" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          Alert Center
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-4 mt-6">
          {SAFE_MODE ? (
            <div className="py-12 text-center space-y-4">
               <div className="w-12 h-12 rounded-2xl bg-zinc-900 mx-auto flex items-center justify-center opacity-30">
                  <Zap className="text-zinc-500 w-5 h-5" />
               </div>
               <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic">Stream Standby Mode</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.length > 0 ? (
                notifications.map((n, i) => {
                  const isFounder = n.type === 'founder' || n.fromFounder === true;
                  
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "p-4 rounded-2xl border flex gap-4 items-start group transition-all",
                        isFounder 
                          ? "bg-primary/10 border-primary/20 shadow-lg shadow-primary/5" 
                          : "bg-secondary/30 border-white/5 hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
                        isFounder ? "bg-primary text-white" : "bg-zinc-800"
                      )}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">{n.title}</h4>
                          {isFounder && (
                            <span className="text-[6px] bg-primary text-white px-1.5 py-0.5 rounded font-black tracking-widest uppercase">FOUNDER</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                            <Clock className="w-3 h-3" />
                            {n.createdAt ? formatDistanceToNow(n.createdAt, { addSuffix: true }) : 'Just now'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 mx-auto flex items-center justify-center opacity-30">
                    <Bell className="text-zinc-500 w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground italic font-medium">Your inbox is clear for today.</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <Zap className="text-primary w-3 h-3 animate-pulse" />
              <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Global Signals: Stabilized</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
