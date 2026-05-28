
"use client";

import { useState } from "react";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, ShieldCheck, Mail } from "lucide-react";
import { ROLE_PERMISSIONS } from "@/constants/permissions";

export default function AdminManager() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);

  async function createAdmin() {
    if (!email) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Create a registry entry in 'admins'
      await addDoc(collection(db, "admins"), {
        email: email.toLowerCase(),
        role,
        permissions: ROLE_PERMISSIONS[role] || [],
        active: true,
        createdAt: Date.now(),
      });

      // Note: In a production app, you'd trigger a cloud function here 
      // to update the custom claims of the user if they already exist.
      
      toast({ 
        title: "Admin Provisioned", 
        description: `${email} is now designated as ${role}.` 
      });
      setEmail("");
    } catch (error: any) {
      toast({ title: "Provisioning Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[48px] max-w-2xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
          <UserPlus className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Privileged Access</h2>
          <p className="text-zinc-500 text-sm">Assign administrative roles and predefined permissions.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Email Identity</Label>
          <div className="relative">
            <Input
              placeholder="admin@cracklix.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl pl-12 text-white"
            />
            <Mail className="absolute left-4 top-4.5 text-zinc-500 w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Strategic Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl text-white">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="editor">Content Editor</SelectItem>
              <SelectItem value="support">Support Representative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 flex gap-6 items-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="text-primary w-5 h-5" />
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            This will automatically assign <span className="text-white font-bold">{ROLE_PERMISSIONS[role]?.length || 0} base permissions</span> including {ROLE_PERMISSIONS[role]?.[0]?.replace('_', ' ')}.
          </p>
        </div>

        <Button
          onClick={createAdmin}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2" />}
          {loading ? "Authorizing Identity..." : "Grant Admin Access"}
        </Button>
      </div>
    </div>
  );
}
