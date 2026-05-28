
"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SuperSidebar from "@/components/super/sidebar";
import SuperAdminProtect from "@/components/super/super-protect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Globe, Send } from "lucide-react";

export default function CMSPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("announcement");

  async function publishContent() {
    if (!title || !content) {
      toast({ title: "Title and content required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "cms"), {
        title,
        content,
        category,
        published: true,
        createdAt: Date.now(),
      });

      toast({ 
        title: "Content Propagated", 
        description: "The announcement is now visible across all student terminals." 
      });
      setTitle("");
      setContent("");
    } catch (error: any) {
      toast({ title: "Publication Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SuperAdminProtect>
      <div className="flex bg-black min-h-screen">
        <SuperSidebar />
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Globe className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <h1 className="font-headline text-4xl font-bold text-white">System CMS</h1>
                <p className="text-zinc-500">Dispatch global broadcasts and system documentation.</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[48px] space-y-8">
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Broadcast Title</Label>
                <Input
                  placeholder="e.g. System Maintenance Scheduled for June 1st"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Detailed Message</Label>
                <Textarea
                  placeholder="Compose your broadcast content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-zinc-800/50 border-white/5 h-64 rounded-3xl p-6 text-white leading-relaxed"
                />
              </div>

              <div className="p-6 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 flex gap-6 items-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FileText className="text-emerald-500 w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Published content will appear in the student <span className="text-white font-bold">Alert Center</span> and global notification feeds immediately.
                </p>
              </div>

              <Button
                onClick={publishContent}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-lg shadow-emerald-900/20"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                {loading ? "Propagating Stream..." : "Publish to Ecosystem"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SuperAdminProtect>
  );
}
