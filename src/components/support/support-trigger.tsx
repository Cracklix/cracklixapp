
"use client";

import { useState } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Mail, 
  Phone, 
  MessageSquare, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SUPPORT_EMAIL = "cracklixhelp@gmail.com";
const SUPPORT_PHONE = "+91 9888188602";
const WHATSAPP_LINK = "https://wa.me/919888188602";

export default function SupportTrigger() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [view, setPhase] = useState<'options' | 'ticket'>('options');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "",
    category: "other",
    message: "",
    priority: "medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.subject || !formData.message) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        userName: profile?.name || 'Aspirant',
        userEmail: user.email,
        ...formData,
        status: "open",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      toast({ 
        title: "Signal Logged", 
        description: "Your ticket has been prioritized. Founder Arsh Grewal's team will respond shortly." 
      });
      setOpen(false);
      setPhase('options');
      setFormData({ subject: "", category: "other", message: "", priority: "medium" });
    } catch (err: any) {
      toast({ title: "Signal Lost", description: "Failed to transmit ticket. Please try WhatsApp.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[100]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[420px] bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[600px] blue-glow"
          >
            {/* Header */}
            <div className="p-8 bg-gradient-to-br from-primary to-blue-700 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <ShieldCheck size={100} />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="font-headline text-2xl font-black tracking-tight">CRACKLIX SUPPORT</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Founder: Arsh Grewal</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto no-scrollbar">
              {view === 'options' ? (
                <div className="p-8 space-y-6">
                   <div className="space-y-4">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">Rapid Channels</p>
                      
                      <a href={WHATSAPP_LINK} target="_blank" className="block p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                                  <MessageSquare className="text-white w-5 h-5 fill-current" />
                               </div>
                               <div>
                                  <p className="font-bold text-sm">WhatsApp Support</p>
                                  <p className="text-[10px] text-zinc-500">Response time: <span className="text-emerald-500">~5 mins</span></p>
                               </div>
                            </div>
                            <ExternalLink size={14} className="text-zinc-600 group-hover:text-emerald-500" />
                         </div>
                      </a>

                      <a href={`mailto:${SUPPORT_EMAIL}`} className="block p-5 rounded-3xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                                  <Mail className="text-white w-5 h-5" />
                               </div>
                               <div>
                                  <p className="font-bold text-sm">Email Assistance</p>
                                  <p className="text-[10px] text-zinc-500">{SUPPORT_EMAIL}</p>
                               </div>
                            </div>
                            <ExternalLink size={14} className="text-zinc-600 group-hover:text-primary" />
                         </div>
                      </a>

                      <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`} className="block p-5 rounded-3xl bg-zinc-900 border border-white/5 hover:bg-white/5 transition-all group">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                                  <Phone className="text-zinc-400 w-5 h-5" />
                               </div>
                               <div>
                                  <p className="font-bold text-sm">Voice Helpline</p>
                                  <p className="text-[10px] text-zinc-500">{SUPPORT_PHONE}</p>
                               </div>
                            </div>
                            <ExternalLink size={14} className="text-zinc-600 group-hover:text-white" />
                         </div>
                      </a>
                   </div>

                   <div className="pt-6 border-t border-white/5 space-y-4">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">Official Desk</p>
                      <Button 
                        onClick={() => setPhase('ticket')}
                        className="w-full h-14 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all"
                      >
                         RAISE SUPPORT TICKET
                      </Button>
                   </div>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                   <div className="flex items-center gap-2 mb-4">
                      <Button variant="ghost" size="sm" onClick={() => setPhase('options')} className="text-zinc-500 hover:text-white p-0">
                         Back to Channels
                      </Button>
                   </div>

                   <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Issue Category</label>
                        <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                           <SelectTrigger className="h-12 bg-zinc-900 border-white/5 rounded-xl">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              <SelectItem value="payment">Payment & PASS</SelectItem>
                              <SelectItem value="mock">Mock Test / Result</SelectItem>
                              <SelectItem value="login">Account / Login</SelectItem>
                              <SelectItem value="bug">Bug Report</SelectItem>
                              <SelectItem value="other">General Query</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Headline</label>
                        <Input 
                          placeholder="Short summary of issue" 
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="h-12 bg-zinc-900 border-white/5 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Deep Description</label>
                        <Textarea 
                          placeholder="Explain what happened..." 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="min-h-[120px] bg-zinc-900 border-white/5 rounded-2xl"
                          required
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-xl">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "TRANSMIT TICKET"}
                      </Button>
                   </form>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
               <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Infrastructure by Arsh Grewal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-white shadow-2xl blue-glow relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
               <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div key="help" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}>
               <MessageCircle className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
