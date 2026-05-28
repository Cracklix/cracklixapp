
"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

export default function SupportTrigger() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject || !message) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "supportTickets"), {
        userId: user.uid,
        userName: user.displayName || 'User',
        subject,
        message,
        status: "open",
        createdAt: Date.now()
      });
      toast({ title: "Ticket Raised", description: "Our support team will contact you within 24 hours." });
      setOpen(false);
      setSubject("");
      setMessage("");
    } catch (err) {
      toast({ title: "Failed to raise ticket", variant: "destructive" });
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
            className="absolute bottom-20 right-0 w-80 md:w-96 bg-zinc-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden overflow-y-auto max-h-[600px]"
          >
            <div className="p-6 bg-primary flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-lg">Cracklix Support</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">We're here to help</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Issue Subject</label>
                <Input 
                  placeholder="e.g. Payment Issue" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-zinc-900 border-white/5 rounded-xl h-11"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Description</label>
                <Textarea 
                  placeholder="Describe your issue in detail..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-zinc-900 border-white/5 rounded-2xl min-h-[120px]"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Raise Ticket</>}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 md:w-16 md:h-16 rounded-[24px] bg-primary flex items-center justify-center text-white shadow-2xl blue-glow"
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>
    </div>
  );
}
