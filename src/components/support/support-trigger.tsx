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
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[80]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 w-[320px] md:w-[380px] bg-zinc-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[550px] blue-glow"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-primary to-blue-700 text-white relative">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase">Support Hub</h3>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-80">Founder: Arsh Grewal</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-full h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto no-scrollbar">
              {view === 'options' ? (
                <div className="p-6 space-y-4">
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest px-1">Rapid Assistance</p>
                   
                   <a href={WHATSAPP_LINK} target="_blank" className="block p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg">
                               <MessageSquare className="text-white w-4 h-4 fill-current" />
                            </div>
                            <div>
                               <p className="font-bold text-xs">WhatsApp Support</p>
                               <p className="text-[9px] text-zinc-500">Live: <span className="text-emerald-500">Fast Response</span></p>
                            </div>
                         </div>
                         <ExternalLink size={12} className="text-zinc-600 group-hover:text-emerald-500" />
                      </div>
                   </a>

                   <a href={`mailto:${SUPPORT_EMAIL}`} className="block p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                               <Mail className="text-white w-4 h-4" />
                            </div>
                            <div>
                               <p className="font-bold text-xs">Email Assistance</p>
                               <p className="text-[9px] text-zinc-500">Support Desk</p>
                            </div>
                         </div>
                         <ExternalLink size={12} className="text-zinc-600 group-hover:text-primary" />
                      </div>
                   </a>

                   <div className="pt-4 border-t border-white/5">
                      <Button 
                        onClick={() => setPhase('ticket')}
                        className="w-full h-12 rounded-xl bg-white text-black font-black hover:bg-zinc-200 text-[10px] uppercase tracking-widest"
                      >
                         RAISE OFFICIAL TICKET
                      </Button>
                   </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                   <Button variant="ghost" size="sm" onClick={() => setPhase('options')} className="text-zinc-500 hover:text-white p-0 h-auto text-[9px] font-black uppercase tracking-widest mb-2">
                      ← Back to Options
                   </Button>

                   <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Issue Category</label>
                        <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                           <SelectTrigger className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs">
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

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Headline</label>
                        <Input 
                          placeholder="Short summary" 
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="h-10 bg-zinc-900 border-white/5 rounded-xl text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Message</label>
                        <Textarea 
                          placeholder="Details..." 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="min-h-[100px] bg-zinc-900 border-white/5 rounded-xl text-xs"
                          required
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest shadow-xl">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "TRANSMIT TICKET"}
                      </Button>
                   </form>
                </div>
              )}
            </div>

            <div className="p-3 bg-black/40 border-t border-white/5 text-center">
               <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.4em]">Infrastructure by Arsh Grewal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl blue-glow relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
               <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="help" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}>
               <MessageSquare className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}