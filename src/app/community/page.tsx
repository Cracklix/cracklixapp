
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
import { Send, Image as ImageIcon, FileText, Loader2, Trash2, ShieldCheck, Zap, MessageSquare, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

/**
 * PRODUCTION COMMUNITY HUB v3
 * Fixed multimedia upload logic and unified collection naming.
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
    // Standardized to 'community_messages' to match admin moderation signals
    const q = query(
      collection(db, 'community_messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs.reverse());
      setLoading(false);
      scrollToBottom();
    }, (err) => {
      console.error("Community Feed Error:", err);
      toast({ title: "Signal Lost", description: "Re-establishing connection...", variant: "destructive" });
    });

    return () => unsub();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'community_messages'), {
        text,
        senderId: user.uid,
        senderName: profile?.name || 'Aspirant',
        senderEmail: user.email,
        type: 'text',
        createdAt: serverTimestamp()
      });
      scrollToBottom();
    } catch (e) {
      toast({ title: "Transmission Failed", variant: "destructive" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // MIME Validation
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      toast({ title: "Unsupported Format", description: "Only Photos and PDFs allowed.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const path = isPdf ? 'community/pdfs' : 'community/images';
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'community_messages'), {
        text: `Shared ${isPdf ? 'PDF' : 'Artifact'}: ${file.name}`,
        mediaUrl: url,
        fileName: file.name,
        senderId: user.uid,
        senderName: profile?.name || 'Aspirant',
        type: isPdf ? 'pdf' : 'image',
        createdAt: serverTimestamp()
      });
      
      toast({ title: "Artifact Shared" });
      scrollToBottom();
    } catch (err: any) {
      console.error("Upload Error:", err);
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col pb-6">
        <main className="flex-1 bg-zinc-950 border border-white/5 rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl">
           <header className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                    <MessageSquare className="text-primary w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Global Student Arena</h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Mentorship
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
                               {msg.type === 'text' && <p className="whitespace-pre-wrap">{msg.text}</p>}
                               {msg.type === 'image' && (
                                 <div className="space-y-3">
                                   <img src={msg.mediaUrl} className="rounded-xl max-h-80 w-auto object-contain bg-black/40" alt="Shared Artifact" />
                                   <p className="text-[10px] opacity-60 italic">{msg.text}</p>
                                 </div>
                               )}
                               {msg.type === 'pdf' && (
                                 <a href={msg.mediaUrl} target="_blank" className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl hover:bg-black/60 transition-all border border-white/5">
                                    <FileText className="text-primary w-6 h-6" />
                                    <div className="text-left overflow-hidden">
                                       <p className="text-xs font-bold truncate">{msg.fileName}</p>
                                       <p className="text-[8px] font-black uppercase text-zinc-500">PDF Document</p>
                                    </div>
                                 </a>
                               )}
                            </div>
                         </div>
                      </motion.div>
                    );
                 })}
                 {uploading && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-4">
                      <div className="bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-3 border border-primary/20">
                         <Loader2 className="w-4 h-4 animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Transmitting Artifact...</span>
                      </div>
                   </motion.div>
                 )}
              </div>
           </ScrollArea>

           <footer className="p-8 bg-zinc-950 border-t border-white/5">
              <form onSubmit={handleSend} className="flex gap-4">
                 <div className="relative flex-1">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Message Global Arena..."
                      className="h-14 bg-zinc-900 border-white/10 rounded-2xl px-6 pr-24 text-sm font-medium focus:ring-primary/20"
                    />
                    <div className="absolute right-3 top-2.5 flex gap-1">
                       <input 
                         type="file" 
                         className="hidden" 
                         ref={fileInputRef} 
                         onChange={handleFileUpload} 
                         accept="image/*,application/pdf"
                       />
                       <Button 
                         type="button" 
                         variant="ghost" 
                         size="icon" 
                         className="rounded-xl h-10 w-10 text-zinc-600 hover:text-primary" 
                         onClick={() => fileInputRef.current?.click()} 
                         disabled={uploading}
                       >
                          <Paperclip size={20} />
                       </Button>
                    </div>
                 </div>
                 <Button type="submit" disabled={!inputText.trim() || uploading} className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shadow-xl">
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
