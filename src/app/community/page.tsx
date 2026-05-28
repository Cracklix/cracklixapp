
'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  MessageSquare, 
  Users, 
  Send, 
  FileText, 
  Search, 
  CheckCircle2,
  Sparkles,
  Bot,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const CHANNELS = [
  { id: 'general', name: 'General Arena', icon: Sparkles, desc: 'Punjab-wide aspirant discussions' },
  { id: 'punjab-police', name: 'Police Recruits', icon: ShieldCheck, desc: 'SI & Constable focus group' },
  { id: 'ppsc-pcs', name: 'PPSC PCS Elite', icon: CheckCircle2, desc: 'Civil Services strategy room' },
  { id: 'patwari', name: 'Patwari Hub', icon: FileText, desc: 'Revenue Dept preparation' },
  { id: 'clerk-steno', name: 'Clerk / Steno IT', icon: Search, desc: 'Typing & Clerical discussions' },
  { id: 'current-affairs', name: 'Daily News Pulse', icon: Search, desc: 'Analysis & PDF sharing' },
];

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'community_messages'),
      where('channelId', '==', activeChannel.id),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }, 100);
    });

    return () => unsub();
  }, [activeChannel.id]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'community_messages'), {
        channelId: activeChannel.id,
        senderId: user.uid,
        senderName: profile?.name || 'Aspirant',
        text,
        createdAt: Date.now(),
        role: profile?.role || 'student'
      });
      
      // Log activity for admin pulse
      await addDoc(collection(db, "liveActivity"), {
        message: `${profile?.name || 'An aspirant'} posted in #${activeChannel.id}`,
        type: 'community',
        createdAt: Date.now()
      });
    } catch (e) {
      toast({ title: "Signal Weak", description: "Failed to broadcast message.", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex gap-6 pb-6">
        {/* Sidebar Channels */}
        <aside className="w-80 hidden lg:flex flex-col gap-6">
           <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] flex-1 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5">
                <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] mb-2">Exam Channels</h3>
                <p className="text-[10px] text-zinc-600 font-bold">Join the high-yield streams</p>
              </div>
              <ScrollArea className="flex-1 p-4">
                 <div className="space-y-2">
                    {CHANNELS.map(ch => (
                      <button 
                        key={ch.id} 
                        onClick={() => setActiveChannel(ch)}
                        className={cn(
                          "w-full text-left p-4 rounded-3xl transition-all flex items-center gap-4 group",
                          activeChannel.id === ch.id 
                            ? "bg-primary text-white blue-glow shadow-xl" 
                            : "text-zinc-500 hover:bg-white/5 hover:text-white"
                        )}
                      >
                         <div className={cn(
                           "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                           activeChannel.id === ch.id ? "bg-white/20" : "bg-zinc-800 group-hover:bg-zinc-700"
                         )}>
                            <ch.icon size={18} />
                         </div>
                         <div className="overflow-hidden">
                           <p className="font-bold text-sm truncate">{ch.name}</p>
                           <p className={cn(
                             "text-[10px] truncate font-medium",
                             activeChannel.id === ch.id ? "text-white/60" : "text-zinc-600"
                           )}>#{ch.id}</p>
                         </div>
                      </button>
                    ))}
                 </div>
              </ScrollArea>
           </div>
        </aside>

        {/* Chat Arena */}
        <main className="flex-1 bg-zinc-900/30 border border-white/5 rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl">
           <header className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20 backdrop-blur-xl z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <activeChannel.icon className="text-primary w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold tracking-tight">{activeChannel.name}</h2>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Live Arena • Moderate v2.5</p>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hidden sm:flex"><Bot size={18} className="text-primary" /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5"><MoreVertical size={18} /></Button>
              </div>
           </header>

           <ScrollArea className="flex-1 p-6 md:p-10" ref={scrollRef}>
              <div className="space-y-10">
                 {loading ? (
                    <div className="py-20 text-center animate-pulse space-y-4">
                       <Bot className="w-12 h-12 mx-auto text-zinc-800" />
                       <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Decrypting Stream...</p>
                    </div>
                 ) : messages.map((msg, i) => {
                   const isMe = msg.senderId === user?.uid;
                   const isAdmin = msg.role === 'admin' || msg.role === 'superadmin';
                   
                   return (
                     <motion.div 
                       key={msg.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}
                     >
                        <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                           <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/100`} />
                           <AvatarFallback>{msg.senderName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={cn("max-w-[75%] space-y-1.5", isMe ? "text-right" : "text-left")}>
                           <div className={cn("flex items-center gap-2 mb-1", isMe ? "flex-row-reverse" : "flex-row")}>
                              <p className={cn("text-[10px] font-black uppercase tracking-widest", isAdmin ? "text-primary" : "text-zinc-500")}>
                                {msg.senderName} {isAdmin && '⚡'}
                              </p>
                              <span className="text-[9px] text-zinc-700 font-bold uppercase">
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                              </span>
                           </div>
                           <div className={cn(
                             "p-5 rounded-[28px] text-sm leading-relaxed shadow-xl",
                             isMe 
                               ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                               : "bg-white/5 border border-white/5 rounded-tl-none"
                           )}>
                              {msg.text}
                           </div>
                        </div>
                     </motion.div>
                   );
                 })}
              </div>
           </ScrollArea>

           <footer className="p-6 md:p-8 bg-zinc-950/40 border-t border-white/5">
              <form onSubmit={sendMessage} className="flex gap-4">
                 <div className="relative flex-1">
                    <div className="absolute left-3 top-3 flex gap-1 z-20">
                       <Button type="button" variant="ghost" size="icon" className="rounded-xl text-zinc-500 hover:text-primary transition-colors">
                          <Paperclip size={18} />
                       </Button>
                    </div>
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Broadcast to #${activeChannel.id}...`}
                      className="h-14 bg-zinc-900 border-white/10 rounded-2xl pl-14 pr-16 focus:ring-primary/20 text-sm font-medium"
                    />
                    <div className="absolute right-3 top-3 z-20">
                       <Button type="button" variant="ghost" size="icon" className="rounded-xl text-zinc-500 hover:text-emerald-500 transition-colors">
                          <ImageIcon size={18} />
                       </Button>
                    </div>
                 </div>
                 <Button type="submit" disabled={!inputText.trim()} className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shrink-0 transition-all active:scale-95 shadow-xl">
                    <Send size={20} />
                 </Button>
              </form>
              <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                 <span>Identity Verified</span>
                 <span className="w-1 h-1 rounded-full bg-zinc-800" />
                 <span>Moderated Community</span>
              </div>
           </footer>
        </main>
      </div>
      <Navbar />
    </AppLayout>
  );
}
