'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { db, storage } from '@/lib/firebase';
import { 
  collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Image as ImageIcon, FileText, Loader2, Trash2, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

/**
 * PRODUCTION COMMUNITY HUB (Telegram Standard)
 * Single Global Room Architecture for Maximum Engagement.
 */
export default function CommunityPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'communityMessages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs.reverse());
      setLoading(false);
      setTimeout(() => {
        const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }, 100);
    });

    return () => unsub();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'communityMessages'), {
        text,
        senderId: user.uid,
        senderName: profile?.name || 'Aspirant',
        senderEmail: user.email,
        type: 'text',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      toast({ title: "Failed to send", variant: "destructive" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const isPdf = file.type === 'application/pdf';
      const path = isPdf ? 'community/pdfs' : 'community/images';
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'communityMessages'), {
        text: `Shared ${isPdf ? 'PDF' : 'Image'}: ${file.name}`,
        mediaUrl: url,
        fileName: file.name,
        senderId: user.uid,
        senderName: profile?.name || 'Aspirant',
        type: isPdf ? 'pdf' : 'image',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col pb-6">
        <main className="flex-1 bg-zinc-950 border border-white/5 rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl">
           <header className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                    <Zap className="text-primary w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Global Student Arena</h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 1,240 Aspirants Active
                    </p>
                 </div>
              </div>
           </header>

           <ScrollArea className="flex-1 p-10" ref={scrollRef}>
              <div className="space-y-8">
                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 opacity-30 gap-4">
                       <Loader2 className="w-10 h-10 animate-spin" />
                       <p className="font-black uppercase tracking-widest text-[10px]">Establishing Secure Signal</p>
                    </div>
                 ) : messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}>
                         <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                            <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/100`} />
                            <AvatarFallback>{msg.senderName?.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div className={cn("max-w-[70%] space-y-2", isMe ? "text-right" : "text-left")}>
                            <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest px-1">{msg.senderName}</p>
                            <div className={cn("p-4 rounded-[28px] text-sm leading-relaxed shadow-xl", isMe ? "bg-primary text-white rounded-tr-none" : "bg-zinc-900 border border-white/5 rounded-tl-none text-zinc-100")}>
                               {msg.type === 'text' && <p>{msg.text}</p>}
                               {msg.type === 'image' && <img src={msg.mediaUrl} className="rounded-xl max-h-64 object-cover" />}
                               {msg.type === 'pdf' && (
                                 <a href={msg.mediaUrl} target="_blank" className="flex items-center gap-3 bg-black/20 p-3 rounded-xl hover:bg-black/40 transition-all">
                                    <FileText className="text-primary" />
                                    <span className="text-xs font-bold truncate">{msg.fileName}</span>
                                 </a>
                               )}
                            </div>
                         </div>
                      </motion.div>
                    );
                 })}
              </div>
           </ScrollArea>

           <footer className="p-8 bg-zinc-950 border-t border-white/5">
              <form onSubmit={handleSend} className="flex gap-4">
                 <div className="relative flex-1">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Message Global Arena..."
                      className="h-14 bg-zinc-900 border-white/10 rounded-2xl px-6 pr-12 text-sm font-medium"
                    />
                    <div className="absolute right-3 top-3">
                       <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                       <Button type="button" variant="ghost" size="icon" className="rounded-xl text-zinc-600 hover:text-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                       </Button>
                    </div>
                 </div>
                 <Button type="submit" disabled={!inputText.trim()} className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shadow-xl">
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