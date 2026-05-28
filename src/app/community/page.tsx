'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { 
  ChatMessage, 
  subscribeToMessages, 
  sendMessage, 
  uploadCommunityMedia,
  deleteMessage
} from '@/services/community';
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Sparkles,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Download,
  Loader2,
  Trash2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STABLE REALTIME LISTENER FOR SINGLE GLOBAL ROOM
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToMessages('global-arena', (msgs) => {
      setMessages(msgs);
      setLoading(false);
      // Auto-scroll to bottom
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
      await sendMessage({
        roomId: 'global-arena',
        senderId: user.uid,
        senderEmail: user.email!,
        senderName: profile?.name || 'Aspirant',
        text,
        messageType: 'text',
      });
    } catch (e: any) {
      console.error("Message Error:", e);
      toast({ 
        title: "Failed to send message", 
        description: "Please check your network signal.",
        variant: "destructive" 
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (type === 'pdf' && file.size > 15 * 1024 * 1024) {
      toast({ title: "File too large", description: "PDF limit is 15MB.", variant: "destructive" });
      return;
    }
    if (type === 'image' && file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Image limit is 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const { url, name, size } = await uploadCommunityMedia(file, type);
      await sendMessage({
        roomId: 'global-arena',
        senderId: user.uid,
        senderEmail: user.email!,
        senderName: profile?.name || 'Aspirant',
        text: `Attached ${type.toUpperCase()}: ${name}`,
        messageType: type,
        mediaUrl: url,
        fileName: name,
        fileSize: size
      });
      toast({ title: "Artifact Uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleMessageAction = async (id: string) => {
    if (confirm("Delete this message?")) {
      await deleteMessage(id);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col pb-6">
        {/* Chat Arena */}
        <main className="flex-1 bg-zinc-950 border border-white/5 rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl">
           <header className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20 backdrop-blur-xl z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20">
                    <Sparkles className="text-primary w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold tracking-tight">Global Student Arena</h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Live community stream for all Punjab Aspirants</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Stream</span>
                 </div>
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hover:bg-white/5"><MoreVertical size={18} /></Button>
              </div>
           </header>

           <ScrollArea className="flex-1 p-6 md:p-10" ref={scrollRef}>
              <div className="space-y-8">
                 {loading ? (
                    <div className="space-y-6">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="flex gap-4 items-start">
                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                            <div className="space-y-2 flex-1">
                               <Skeleton className="h-4 w-24 rounded" />
                               <Skeleton className="h-16 w-full max-w-md rounded-2xl" />
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : messages.length > 0 ? (
                   messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
                    
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}
                      >
                         <Avatar className="w-10 h-10 border border-white/10 shrink-0 shadow-lg">
                            <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/100`} />
                            <AvatarFallback className="bg-zinc-800 text-[10px] font-black">{msg.senderName?.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div className={cn("max-w-[75%] space-y-1.5", isMe ? "text-right" : "text-left")}>
                            <div className={cn("flex items-center gap-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                 {msg.senderName}
                               </p>
                               <span className="text-[8px] text-zinc-700 font-bold uppercase">
                                 {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                               </span>
                            </div>

                            <div className={cn(
                              "p-4 rounded-[24px] text-sm leading-relaxed shadow-xl group relative",
                              isMe 
                                ? "bg-primary text-white rounded-tr-none" 
                                : "bg-zinc-900 border border-white/5 rounded-tl-none text-zinc-100"
                            )}>
                               {msg.messageType === 'text' && <p className="break-words">{msg.text}</p>}
                               
                               {msg.messageType === 'image' && (
                                 <div className="space-y-3">
                                   <img src={msg.mediaUrl} className="rounded-xl max-h-80 w-full object-cover border border-white/10" alt="Attachment" />
                                   {msg.text && <p className="text-xs opacity-90">{msg.text}</p>}
                                 </div>
                               )}

                               {msg.messageType === 'pdf' && (
                                 <div className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/10 group/pdf">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                       <FileText className="text-primary w-5 h-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                       <p className="font-bold text-xs truncate">{msg.fileName}</p>
                                       <p className="text-[9px] uppercase font-black text-zinc-500">{(msg.fileSize! / 1024 / 1024).toFixed(1)} MB • PDF Artifact</p>
                                    </div>
                                    <a href={msg.mediaUrl} target="_blank" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                       <Download size={16} className="text-primary" />
                                    </a>
                                 </div>
                               )}

                               {(isMe || isAdmin) && (
                                 <button 
                                   onClick={() => handleMessageAction(msg.id)}
                                   className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-xl"
                                 >
                                    <Trash2 size={10} />
                                 </button>
                               )}
                            </div>
                         </div>
                      </motion.div>
                    );
                   })
                 ) : (
                   <div className="py-40 text-center space-y-4 opacity-30 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-[32px] bg-zinc-900 flex items-center justify-center mb-4">
                        <MessageSquare size={32} className="text-zinc-600" />
                      </div>
                      <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting first signal in the Global Arena</p>
                   </div>
                 )}
              </div>
           </ScrollArea>

           <footer className="p-6 md:p-8 bg-zinc-950 border-t border-white/5 relative">
              <form onSubmit={handleSend} className="flex gap-4">
                 <div className="relative flex-1">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Message Global Arena..."
                      className="h-14 bg-zinc-900 border-white/10 rounded-2xl px-6 pr-24 text-sm font-medium focus:ring-primary/20"
                    />
                    <div className="absolute right-3 top-3 flex gap-1">
                       <input 
                         type="file" 
                         className="hidden" 
                         ref={fileInputRef} 
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (!file) return;
                           const type = file.type.includes('image') ? 'image' : 'pdf';
                           handleFileUpload(e, type);
                         }} 
                         accept="image/*,application/pdf" 
                       />
                       <Button 
                         type="button" 
                         variant="ghost" 
                         size="icon" 
                         className="rounded-xl text-zinc-600 hover:text-primary"
                         onClick={() => fileInputRef.current?.click()}
                         disabled={uploading}
                       >
                          {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Paperclip size={18} />}
                       </Button>
                       <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-zinc-600 hover:text-primary hidden sm:flex"
                        onClick={() => fileInputRef.current?.click()}
                      >
                          <ImageIcon size={18} />
                       </Button>
                    </div>
                 </div>
                 <Button type="submit" disabled={!inputText.trim() || uploading} className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shrink-0">
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
