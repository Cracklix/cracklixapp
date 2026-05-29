
'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, MessageSquare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveChat({ classId }: { classId: string }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const SAFE_MODE = true; // RECOVERY LOCK: Enabled

  useEffect(() => {
    if(SAFE_MODE) return;

    const q = query(
      collection(db, 'classChats'),
      where('classId', '==', classId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [classId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const msg = input;
    setInput('');

    try {
      await addDoc(collection(db, 'classChats'), {
        classId,
        userId: user.uid,
        userName: profile?.name || 'Student',
        message: msg,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-sm uppercase tracking-widest">Live Discussion</h3>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {SAFE_MODE ? (
            <div className="py-12 text-center space-y-4">
               <div className="w-12 h-12 rounded-2xl bg-zinc-900 mx-auto flex items-center justify-center opacity-30">
                  <Zap className="text-zinc-500 w-5 h-5" />
               </div>
               <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic">Stream Standby Mode</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-white/5">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">{msg.userName}</span>
                      <span className="text-[10px] text-zinc-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none">
                      {msg.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 bg-black/20">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chat is paused for maintenance"
            className="rounded-2xl bg-zinc-900 border-white/10 h-12"
            disabled={SAFE_MODE}
          />
          <Button type="submit" size="icon" className="rounded-xl h-12 w-12 bg-primary" disabled={SAFE_MODE}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
