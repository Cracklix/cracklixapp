
"use client";

import { useEffect, useState } from "react";
import { subscribeNotifications } from "@/services/notifications";
import { useAuth } from "@/lib/auth-context";
import { Bell, Sparkles, Trophy, FileText, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function NotificationPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeNotifications(user.uid, setNotifications);
    return () => unsubscribe();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-4 h-4 text-accent" />;
      case 'mock': return <FileText className="w-4 h-4 text-primary" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="rounded-[40px] cracklix-glass border-white/5 overflow-hidden">
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
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl bg-secondary/30 border border-white/5 flex gap-4 items-start group hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1">{n.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      <Clock className="w-3 h-3" />
                      {n.createdAt ? formatDistanceToNow(n.createdAt, { addSuffix: true }) : 'Just now'}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground italic">Your inbox is clear for today.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
