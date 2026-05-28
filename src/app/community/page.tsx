
'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';
import { 
  CommunityRoom, 
  ChatMessage, 
  subscribeToMessages, 
  sendMessage, 
  uploadCommunityMedia,
  getRooms
} from '@/services/community';
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
  ShieldAlert,
  Download,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const ROOM_PRESETS: CommunityRoom[] = [
  { id: 'general', title: 'General Arena', slug: 'general', category: 'General', description: 'Punjab-wide aspirant discussions', icon: 'Sparkles', memberCount: 1240, roomType: 'general' },
  { id: 'police', title: 'Police Recruits', slug: 'police', category: 'Exam', description: 'SI & Constable focus group', icon: 'ShieldCheck', memberCount: 850, roomType: 'exam' },
  { id: 'ppsc', title: 'PPSC PCS Elite', slug: 'ppsc', category: 'Exam', description: 'Civil Services strategy room', icon: 'CheckCircle2', memberCount: 420, roomType: 'exam' },
  { id: 'psssb', title: 'PSSSB Command', slug: 'psssb', category: 'Exam', description: 'Clerk, Patwari & VDO preparation', icon: 'FileText', memberCount: 2100, roomType: 'exam' },
  { id: 'news', title: 'Daily News Pulse', slug: 'news', category: 'Updates', description: 'Analysis & PDF sharing', icon: 'Zap', memberCount: 3500, roomType: 'general' },
];

const FOUNDER_EMAIL = 'deepgrewal2600@gmail.com';

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeRoom, setActiveRoom] = useState(ROOM_PRESETS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToMessages(activeRoom.id, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      // Auto-scroll logic
      setTimeout(() => {
        const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }, 100);
    });

    return () => unsub();
  }, [activeRoom.id]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await sendMessage({
        roomId: activeRoom.id,
        senderId: user.uid,
        senderEmail: user.email!,
        senderName: profile?.name || 'Aspirant',
        text,
        messageType: 'text',
        role: profile?.role || 'student'
      });
    } catch (e) {
      toast({ title: "Signal Lost", variant: "destructive" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const { url, name, size } = await uploadCommunityMedia(file, activeRoom.id);
      await sendMessage({
        roomId: activeRoom.id,
        senderId: user.uid,
        senderEmail: user.email!,
        senderName: profile?.name || 'Aspirant',
        text: `Attached ${file.type.includes('image') ? 'Image' : 'PDF'}: ${name}`,
        messageType: file.type.includes('image') ? 'image' : 'pdf',
        mediaUrl: url,
        fileName: name,
        fileSize: size,
        role: profile?.role || 'student'
      });
      toast({ title: "Artifact Uploaded" });
    } catch (err) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setUploading(false);
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
                   <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em]">Exam Rooms</h3>
                   <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-zinc-600 hover:text-white"><Plus size={14} /></Button>
                </div>
                <div className="relative mt-4">
                   <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                   <Input placeholder="Filter channels..." className="h-9 bg-black/20 border-white/5 pl-9 rounded-xl text-[10px] uppercase font-black tracking-widest" />
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                 <div className="space-y-1">
                    {ROOM_PRESETS.map(room => (
                      <button 
                        key={room.id} 
                        onClick={() => setActiveRoom(room)}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3.5 group",
                          activeRoom.id === room.id 
                            ? "bg-primary text-white blue-glow shadow-xl" 
                            : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                        )}
                      >
                         <div className={cn(
                           "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                           activeRoom.id === room.id ? "bg-white/20" : "bg-zinc-800"
                         )}>
                            {room.id === 'general' && <Sparkles size={16} />}
                            {room.id === 'police' && <ShieldCheck size={16} />}
                            {room.id === 'ppsc' && <CheckCircle2 size={16} />}
                            {room.id === 'psssb' && <FileText size={16} />}
                            {room.id === 'news' && <Zap size={16} />}
                         </div>
                         <div className="overflow-hidden flex-1">
                            <p className="font-bold text-xs truncate">{room.title}</p>
                            <p className={cn(
                             "text-[9px] truncate font-black uppercase tracking-tighter",
                             activeRoom.id === room.id ? "text-white/60" : "text-zinc-700"
                            )}>{room.memberCount.toLocaleString()} Aspirants</p>
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
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20">
                    <MessageSquare className="text-primary w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold tracking-tight">{activeRoom.title}</h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">{activeRoom.description}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hidden sm:flex hover:bg-white/5 transition-all"><Bot size={18} /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hover:bg-white/5"><MoreVertical size={18} /></Button>
              </div>
           </header>

           <ScrollArea className="flex-1 p-6 md:p-10" ref={scrollRef}>
              <div className="space-y-8">
                 {loading ? (
                    <div className="py-20 text-center animate-pulse space-y-4">
                       <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                       <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Establishing Tactical Signal...</p>
                    </div>
                 ) : messages.length > 0 ? (
                   messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    const isFounder = msg.senderEmail === FOUNDER_EMAIL || msg.role === 'admin';
                    
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}
                      >
                         <Avatar className={cn("w-10 h-10 border shrink-0", isFounder ? "border-primary shadow-lg shadow-primary/10" : "border-white/10")}>
                            <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/100`} />
                            <AvatarFallback className="bg-zinc-800 text-[10px] font-black">{msg.senderName?.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div className={cn("max-w-[75%] space-y-1.5", isMe ? "text-right" : "text-left")}>
                            <div className={cn("flex items-center gap-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                               <p className={cn(
                                 "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", 
                                 isFounder ? "text-primary" : "text-zinc-500"
                               )}>
                                 {msg.senderName} 
                                 {isFounder && <ShieldAlert size={10} className="fill-current text-primary" />}
                               </p>
                               <span className="text-[9px] text-zinc-700 font-bold uppercase">
                                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>

                            <div className={cn(
                              "p-4 rounded-[28px] text-sm leading-relaxed shadow-xl relative",
                              isMe 
                                ? "bg-primary text-white rounded-tr-none" 
                                : isFounder 
                                  ? "bg-primary/10 border border-primary/20 text-white rounded-tl-none"
                                  : "bg-white/5 border border-white/5 rounded-tl-none"
                            )}>
                               {msg.messageType === 'text' && <p>{msg.text}</p>}
                               
                               {msg.messageType === 'image' && (
                                 <div className="space-y-3">
                                   <img src={msg.mediaUrl} className="rounded-2xl max-h-80 w-auto object-cover border border-white/10" alt="Attachment" />
                                   <p className="text-xs opacity-80">{msg.fileName}</p>
                                 </div>
                               )}

                               {msg.messageType === 'pdf' && (
                                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 group/pdf">
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
                            </div>
                         </div>
                      </motion.div>
                    );
                   })
                 ) : (
                   <div className="py-40 text-center space-y-4 opacity-30">
                      <MessageSquare size={64} className="mx-auto" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting First Signal</p>
                   </div>
                 )}
              </div>
           </ScrollArea>

           <footer className="p-6 md:p-8 bg-zinc-950/40 border-t border-white/5">
              <form onSubmit={handleSend} className="flex gap-4">
                 <div className="relative flex-1">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Broadcast to #${activeRoom.slug}...`}
                      className="h-14 bg-zinc-900 border-white/10 rounded-2xl px-6 pr-24 text-sm font-medium"
                    />
                    <div className="absolute right-3 top-3 flex gap-1">
                       <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" />
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
                        className="rounded-xl text-zinc-600 hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                          <ImageIcon size={18} />
                       </Button>
                    </div>
                 </div>
                 <Button type="submit" disabled={!inputText.trim()} className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 blue-glow shrink-0">
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
