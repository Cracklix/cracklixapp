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
} from 'firebase/firestore';
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Search, 
  CheckCircle2,
  Sparkles,
  Bot,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Plus,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const CHANNELS = [
  { id: 'general', name: 'General Arena', icon: Sparkles, desc: 'Punjab-wide aspirant discussions' },
  { id: 'punjab-police', name: 'Police Recruits', icon: ShieldCheck, desc: 'SI & Constable focus group' },
  { id: 'ppsc-pcs', name: 'PPSC PCS Elite', icon: CheckCircle2, desc: 'Civil Services strategy room' },
  { id: 'psssb-hub', name: 'PSSSB Command', icon: FileText, desc: 'Clerk, Patwari & VDO preparation' },
  { id: 'ctet-pstet', name: 'Teacher Academy', icon: Search, desc: 'CDP & Pedagogy discussions' },
  { id: 'current-affairs', name: 'Daily News Pulse', icon: Zap, desc: 'Analysis & PDF sharing' },
];

const FOUNDER_EMAIL = 'arshdeepgrewal1122@gmail.com';

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
    // Realtime Listener for the selected channel
    const q = query(
      collection(db, 'community_messages'),
      where('channelId', '==', activeChannel.id),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      
      // Auto-scroll logic
      setTimeout(() => {
        const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }, 100);
    }, (err) => {
      console.error("Community Stream Error:", err);
      setLoading(false);
      toast({ title: "Stream Interrupted", description: "Could not sync with the live discussion board.", variant: "destructive" });
    });

    return () => unsub();
  }, [activeChannel.id, toast]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'community_messages'), {
        channelId: activeChannel.id,
        senderId: user.uid,
        senderEmail: user.email,
        senderName: profile?.name || 'Aspirant',
        text,
        createdAt: Date.now(),
        role: profile?.role || 'student'
      });
      
      // Post to Live Activity for Dashboard Pulse
      await addDoc(collection(db, "liveActivity"), {
        message: `${profile?.name || 'An aspirant'} posted in #${activeChannel.id}`,
        type: 'community',
        createdAt: Date.now()
      });
    } catch (e: any) {
      console.error("Message Send Failure:", e);
      toast({ title: "Signal Lost", description: "Failed to broadcast your message. Check your connection.", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex gap-6 pb-6">
        {/* Sidebar Channels */}
        <aside className="w-80 hidden lg:flex flex-col gap-6">
           <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] flex-1 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em]">Exam Channels</h3>
                   <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-zinc-600 hover:text-white"><Plus size={14} /></Button>
                </div>
                <div className="relative mt-4">
                   <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                   <Input placeholder="Filter channels..." className="h-9 bg-black/20 border-white/5 pl-9 rounded-xl text-[10px] uppercase font-black tracking-widest" />
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                 <div className="space-y-1">
                    {CHANNELS.map(ch => (
                      <button 
                        key={ch.id} 
                        onClick={() => setActiveChannel(ch)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3.5 group",
                          activeChannel.id === ch.id 
                            ? "bg-primary text-white blue-glow shadow-xl" 
                            : "text-zinc-500 hover:bg-white/5 hover:text-white"
                        )}
                      >
                         <div className={cn(
                           "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                           activeChannel.id === ch.id ? "bg-white/20" : "bg-zinc-800 group-hover:bg-zinc-700"
                         )}>
                            <ch.icon size={16} />
                         </div>
                         <div className="overflow-hidden flex-1">
                            <p className="font-bold text-xs truncate">{ch.name}</p>
                            <p className={cn(
                             "text-[9px] truncate font-bold uppercase tracking-tighter",
                             activeChannel.id === ch.id ? "text-white/60" : "text-zinc-700"
                            )}>#{ch.id}</p>
                         </div>
                      </button>
                    ))}
                 </div>
              </ScrollArea>

              <div className="p-6 bg-black/20 border-t border-white/5">
                 <div className="flex items-center gap-4 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center blue-glow">
                       <Zap className="text-white w-5 h-5 fill-current" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-primary uppercase">Identity Layer</p>
                       <p className="text-xs font-bold text-white">v4.2 Production</p>
                    </div>
                 </div>
              </div>
           </div>
        </aside>

        {/* Chat Arena */}
        <main className="flex-1 bg-zinc-900/30 border border-white/5 rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl">
           <header className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20 backdrop-blur-xl z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20">
                    <activeChannel.icon className="text-primary w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold tracking-tight">{activeChannel.name}</h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Real-time Aspirant Signal • #{activeChannel.id}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hidden sm:flex hover:bg-primary/10 hover:text-primary transition-all"><Bot size={18} /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hover:bg-white/5"><MoreVertical size={18} /></Button>
              </div>
           </header>

           <ScrollArea className="flex-1 p-6 md:p-10" ref={scrollRef}>
              <div className="space-y-10">
                 {loading ? (
                    <div className="py-20 text-center animate-pulse space-y-4">
                       <Bot className="w-12 h-12 mx-auto text-zinc-800" />
                       <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Decrypting Channel Data...</p>
                    </div>
                 ) : messages.length > 0 ? (
                   messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    const isFounder = msg.senderEmail === FOUNDER_EMAIL;
                    const isAdmin = (msg.role === 'admin' || msg.role === 'superadmin') && !isFounder;
                    
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}
                      >
                         <Avatar className={cn("w-10 h-10 border shrink-0 shadow-lg", isFounder ? "border-primary shadow-primary/20" : isAdmin ? "border-emerald-500/50" : "border-white/10")}>
                            <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/100`} />
                            <AvatarFallback className="bg-zinc-800 text-[10px] font-black">{msg.senderName?.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div className={cn("max-w-[75%] space-y-2", isMe ? "text-right" : "text-left")}>
                            <div className={cn("flex items-center gap-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                               <p className={cn(
                                 "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", 
                                 isFounder ? "text-primary" : isAdmin ? "text-emerald-500" : "text-zinc-500"
                               )}>
                                 {msg.senderName} 
                                 {isFounder ? <ShieldAlert size={10} className="fill-current text-primary" /> : isAdmin && <ShieldCheck size={10} className="fill-current" />}
                                 {isFounder && <span className="text-[6px] bg-primary text-white px-1 py-0.5 rounded ml-1 tracking-[0.2em]">FOUNDER</span>}
                               </p>
                               <span className="text-[9px] text-zinc-700 font-bold uppercase">
                                 {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                               </span>
                            </div>
                            <div className={cn(
                              "p-5 rounded-[28px] text-sm leading-relaxed shadow-2xl relative group transition-all",
                              isFounder 
                                ? "bg-primary/10 border border-primary/40 text-white rounded-tl-none"
                                : isMe 
                                  ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                                  : isAdmin 
                                    ? "bg-emerald-500/5 border border-emerald-500/20 text-white rounded-tl-none"
                                    : "bg-white/5 border border-white/5 rounded-tl-none"
                            )}>
                               {msg.text}
                            </div>
                         </div>
                      </motion.div>
                    );
                   })
                 ) : (
                   <div className="py-40 text-center space-y-6">
                      <MessageSquare size={64} className="mx-auto text-zinc-800" />
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-600">No discussions yet</h3>
                        <p className="text-xs font-bold uppercase mt-1 text-zinc-700">Start the conversation in #{activeChannel.id}</p>
                      </div>
                   </div>
                 )}
              </div>
           </ScrollArea>

           <footer className="p-6 md:p-8 bg-zinc-950/40 border-t border-white/5">
              <form onSubmit={sendMessage} className="flex gap-4">
                 <div className="relative flex-1 group">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Broadcast to #${activeChannel.id}...`}
                      className="h-14 bg-zinc-900 border-white/10 rounded-2xl px-6 focus:ring-primary/20 text-sm font-medium transition-all"
                    />
                    <div className="absolute right-3 top-3 z-20">
                       <Button type="button" variant="ghost" size="icon" className="rounded-xl text-zinc-500 hover:text-emerald-500 transition-all">
                          <ImageIcon size={18} />
                       </Button>
                    </div>
                 </div>
                 <Button type="submit" disabled={!inputText.trim()} className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shrink-0 transition-all active:scale-95 shadow-xl flex items-center justify-center">
                    <Send size={20} />
                 </Button>
              </form>
              <div className="mt-4 flex items-center justify-between text-[9px] font-black text-zinc-700 uppercase tracking-widest px-4">
                 <div className="flex items-center gap-4">
                    <span>Signal Sync: Active</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span>Founder Monitored</span>
                 </div>
              </div>
           </footer>
        </main>
      </div>
      <Navbar />
    </AppLayout>
  );
}
