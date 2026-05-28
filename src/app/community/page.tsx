
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
  getDocs 
} from 'firebase/firestore';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Camera, 
  FileText, 
  Search, 
  CheckCircle2,
  Sparkles,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const CHANNELS = [
  { id: 'general', name: 'General Lounge', icon: Sparkles, desc: 'Daily Punjab exam discussions' },
  { id: 'punjab-police', name: 'Police Arena', icon: Users, desc: 'SI & Constable preparation' },
  { id: 'ppsc-pcs', name: 'PPSC Elite', icon: CheckCircle2, desc: 'PCS & high-level posts' },
  { id: 'current-affairs', name: 'Daily Pulse', icon: FileText, desc: 'News & PDF discussions' },
];

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'community_messages'),
      where('channelId', '==', activeChannel.id),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });

    return () => unsub();
  }, [activeChannel.id]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');

    await addDoc(collection(db, 'community_messages'), {
      channelId: activeChannel.id,
      senderId: user.uid,
      senderName: profile?.name || 'Aspirant',
      text,
      createdAt: Date.now(),
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-24 h-[calc(100vh-160px)] flex gap-8">
        {/* Channels Sidebar */}
        <aside className="w-80 hidden lg:flex flex-col gap-6">
           <div className="p-6 bg-zinc-900 border border-white/5 rounded-[40px] flex-1 overflow-y-auto no-scrollbar">
              <h3 className="text-xs font-black uppercase text-zinc-500 mb-8 tracking-widest">Active Channels</h3>
              <div className="space-y-2">
                 {CHANNELS.map(ch => (
                   <button 
                     key={ch.id} 
                     onClick={() => setActiveChannel(ch)}
                     className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-4 group ${activeChannel.id === ch.id ? 'bg-primary text-white blue-glow shadow-xl' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                   >
                      <ch.icon size={20} className={activeChannel.id === ch.id ? 'text-white' : 'group-hover:text-primary'} />
                      <div>
                        <p className="font-bold text-sm">{ch.name}</p>
                        <p className={`text-[10px] ${activeChannel.id === ch.id ? 'text-white/60' : 'text-zinc-600'}`}>{ch.desc}</p>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </aside>

        {/* Chat Main Area */}
        <main className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl">
           <header className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <activeChannel.icon className="text-primary w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold">{activeChannel.name}</h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Live Learning Pool</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5"><Search size={18} /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5"><Bot size={18} /></Button>
              </div>
           </header>

           <ScrollArea className="flex-1 p-8" ref={scrollRef}>
              <div className="space-y-8">
                 {messages.map((msg, i) => (
                   <motion.div 
                     key={msg.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`flex gap-4 ${msg.senderId === user?.uid ? 'flex-row-reverse' : 'flex-row'}`}
                   >
                      <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                         <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/100`} />
                         <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] space-y-1 ${msg.senderId === user?.uid ? 'text-right' : 'text-left'}`}>
                         <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">{msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         <div className={`p-5 rounded-[28px] text-sm leading-relaxed ${msg.senderId === user?.uid ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10' : 'bg-white/5 border border-white/5 rounded-tl-none'}`}>
                            {msg.text}
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </ScrollArea>

           <footer className="p-8 bg-zinc-950/40 border-t border-white/5">
              <form onSubmit={sendMessage} className="flex gap-4">
                 <div className="relative flex-1">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Message ${activeChannel.name}...`}
                      className="h-14 bg-zinc-900 border-white/10 rounded-2xl pl-6 pr-24 focus:ring-primary/20"
                    />
                    <div className="absolute right-3 top-3 flex gap-1">
                       <Button type="button" variant="ghost" size="icon" className="rounded-xl text-zinc-500 hover:text-white"><Camera size={18} /></Button>
                       <Button type="button" variant="ghost" size="icon" className="rounded-xl text-zinc-500 hover:text-white"><FileText size={18} /></Button>
                    </div>
                 </div>
                 <Button type="submit" disabled={!inputText.trim()} className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow">
                    <Send size={20} />
                 </Button>
              </form>
           </footer>
        </main>
      </div>
      <Navbar />
    </AppLayout>
  );
}
