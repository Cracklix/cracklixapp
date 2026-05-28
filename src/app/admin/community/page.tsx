
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { 
  MessageSquare, 
  Trash2, 
  Ban, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunityModerationPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Listen to ALL community messages for moderation
    const q = query(
      collection(db, 'community_messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Terminate this signal string permanently?")) return;
    try {
      await deleteDoc(doc(db, 'community_messages', id));
      toast({ title: "Signal Terminated" });
    } catch (e) {
      toast({ title: "Operation Failed", variant: "destructive" });
    }
  }

  const filtered = messages.filter(m => 
    m.text?.toLowerCase().includes(search.toLowerCase()) || 
    m.senderName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="text-primary w-5 h-5" />
                  </div>
                  <h1 className="font-headline text-4xl font-black tracking-tight">Community Audit</h1>
                </div>
                <p className="text-zinc-500 font-medium">Real-time content moderation for global chat streams.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                    <Input 
                      placeholder="Audit message strings..." 
                      className="pl-10 h-12 bg-zinc-900 border-white/5 rounded-2xl"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500">Live Stream Audit</h3>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase animate-pulse">Monitoring Active</Badge>
                  </div>

                  <div className="space-y-4">
                     {loading ? (
                        [1,2,3,4].map(i => <div key={i} className="h-24 rounded-3xl bg-zinc-900/50 animate-pulse border border-white/5" />)
                     ) : filtered.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                          {filtered.map(m => (
                             <motion.div 
                               key={m.id}
                               layout
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               exit={{ opacity: 0, scale: 0.95 }}
                               className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all group"
                             >
                                <div className="flex items-start justify-between">
                                   <div className="flex gap-4">
                                      <Avatar className="w-10 h-10 border border-white/10">
                                         <AvatarImage src={`https://picsum.photos/seed/${m.senderId}/100`} />
                                         <AvatarFallback>{m.senderName?.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                         <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold">{m.senderName}</h4>
                                            <Badge variant="outline" className="text-[8px] border-white/10 text-zinc-600 font-black uppercase">{m.roomId}</Badge>
                                         </div>
                                         <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">{m.text}</p>
                                         <span className="text-[9px] font-bold text-zinc-700 uppercase mt-2 inline-block">
                                            {new Date(m.createdAt).toLocaleString()}
                                         </span>
                                      </div>
                                   </div>
                                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(m.id)}>
                                         <Trash2 className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-orange-500/10 hover:text-orange-500">
                                         <Ban className="w-4 h-4" />
                                      </Button>
                                   </div>
                                </div>
                             </motion.div>
                          ))}
                        </AnimatePresence>
                     ) : (
                        <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-zinc-950/20">
                           <ShieldCheck className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                           <p className="text-zinc-600 font-medium italic">Tactical streams within safety parameters.</p>
                        </div>
                     )}
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-6">
                     <h4 className="font-bold flex items-center gap-2">
                        <Flag className="text-primary w-4 h-4" />
                        Reported Signals
                     </h4>
                     <div className="py-10 text-center opacity-20 border-2 border-dashed border-primary/20 rounded-3xl">
                        <p className="text-[10px] font-black uppercase tracking-widest">No Active Violations</p>
                     </div>
                  </div>

                  <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 space-y-6">
                     <h4 className="font-bold flex items-center gap-2 text-zinc-400">
                        <AlertCircle className="w-4 h-4" />
                        Moderator Protocol
                     </h4>
                     <p className="text-xs text-zinc-500 leading-relaxed italic">
                        "Enforce Raavi-only Punjabi standards for clarity. Prohibit any sharing of pirated mock PDFs immediately."
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
