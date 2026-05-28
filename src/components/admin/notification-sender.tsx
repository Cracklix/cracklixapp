
"use client";

import { useState } from "react";
import { addDoc, collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Loader2, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotificationSender() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");

  async function broadcast() {
    if (!title || !message) return;

    setLoading(true);
    try {
      // For MVP, we broadcast to a 'global' system or individual records
      // In production, this would trigger a Cloud Function to send FCM messages
      const usersSnap = await getDocs(query(collection(db, "users"), limit(50)));
      
      const batchPromises = usersSnap.docs.map(userDoc => 
        addDoc(collection(db, "notifications"), {
          userId: userDoc.id,
          title,
          message,
          type,
          read: false,
          createdAt: Date.now()
        })
      );

      await Promise.all(batchPromises);

      toast({ title: "Broadcast Dispatched", description: `Alert sent to ${batchPromises.length} active terminals.` });
      setTitle("");
      setMessage("");
    } catch (error: any) {
      toast({ title: "Broadcast Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[48px] max-w-2xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Bell className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Student Alert System</h2>
          <p className="text-zinc-500 text-sm">Dispatch real-time notices to user dashboards.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Alert Priority</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5 h-12 rounded-xl text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="mock">New Mock Release</SelectItem>
              <SelectItem value="achievement">Achievement/Reward</SelectItem>
              <SelectItem value="urgency">Critical Exam Update</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Headline</Label>
          <Input 
            placeholder="e.g. Punjab Police Exam Dates Released!" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Body Content</Label>
          <Textarea 
            placeholder="Provide details about the update..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-zinc-800/50 border-white/5 min-h-[150px] rounded-3xl p-6 text-white leading-relaxed"
          />
        </div>

        <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 flex gap-6 items-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="text-primary w-5 h-5" />
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            This broadcast will immediately propagate to the <span className="text-white font-bold">Alert Center</span> of all active students.
          </p>
        </div>

        <Button 
          onClick={broadcast}
          disabled={loading || !title || !message}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
          {loading ? "Propagating Signal..." : "Execute Broadcast"}
        </Button>
      </div>
    </div>
  );
}
