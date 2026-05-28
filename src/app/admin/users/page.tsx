"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  getDocs,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Shield, 
  Ban, 
  Star, 
  Mail, 
  ShieldCheck, 
  MessageSquare, 
  Trash2, 
  UserCheck, 
  Clock, 
  Zap,
  Bell,
  Activity,
  User as UserIcon,
  AlertTriangle,
  Loader2,
  CreditCard,
  Crown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getActivePlans, grantAccessManual, revokeAccess, Plan } from "@/services/subscriptions";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageMode, setMessageMode] = useState(false);
  const [passMode, setPassMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const logQ = query(collection(db, "adminLogs"), orderBy("timestamp", "desc"), limit(5));
    const unsubLogs = onSnapshot(logQ, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    getActivePlans().then(setPlans);

    return () => {
      unsub();
      unsubLogs();
    };
  }, []);

  const createLog = async (action: string, details: string) => {
    await addDoc(collection(db, "adminLogs"), {
      action,
      details,
      timestamp: Date.now(),
      adminId: "master_admin"
    });
  };

  const handleStatusUpdate = async (userId: string, updates: any, actionName: string) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "users", userId), updates);
      await createLog(actionName, `Updated user ${userId}: ${JSON.stringify(updates)}`);
      toast({ title: "Signal Updated", description: `User status changed to ${actionName}.` });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setSelectedUser(null);
    }
  };

  const handleGrantPass = async (plan: Plan) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await grantAccessManual(selectedUser.id, plan);
      await createLog("Pass Granted", `Tier ${plan.name} assigned to ${selectedUser.email}`);
      toast({ title: "Entitlement Activated", description: `${plan.name} is now live for student.` });
      setPassMode(false);
    } catch (e: any) {
      toast({ title: "Grant Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokePass = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await revokeAccess(selectedUser.id);
      await createLog("Pass Revoked", `Subscription terminated for ${selectedUser.email}`);
      toast({ title: "Access Revoked" });
      setPassMode(false);
    } catch (e: any) {
      toast({ title: "Revoke Failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        userId: selectedUser.id,
        title: "Direct Admin Message",
        message: message,
        type: "announcement",
        fromFounder: true,
        read: false,
        createdAt: Date.now()
      });
      await createLog("Message Sent", `To: ${selectedUser.email}`);
      toast({ title: "Message Dispatched" });
      setMessage("");
      setMessageMode(false);
    } catch (e: any) {
      toast({ title: "Dispatch Error", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const terminateAccount = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "users", selectedUser.id));
      await createLog("Account Terminated", `Identity purged: ${selectedUser.email}`);
      toast({ title: "Identity Purged" });
      setConfirmDelete(false);
    } catch (e: any) {
      toast({ title: "Purge Failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setSelectedUser(null);
    }
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center blue-glow">
                    <Users className="text-primary w-6 h-6" />
                  </div>
                  <h1 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Aspirant Registry</h1>
                </div>
                <p className="text-zinc-500 font-medium ml-1">Manage global user identities, access tiers, and security protocols.</p>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-4 w-5 h-5 text-zinc-600" />
                <Input 
                  placeholder="Audit by identity string..." 
                  className="bg-zinc-900 border-white/5 pl-12 h-14 rounded-2xl text-sm font-bold"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <h3 className="font-bold flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Live Student Feed ({filtered.length})
                    </h3>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest animate-pulse">Sync Active</Badge>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {loading ? (
                      [1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse bg-white/5" />)
                    ) : filtered.length > 0 ? (
                      filtered.map((user) => (
                        <div key={user.id} className="p-6 px-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                               <Avatar className="w-14 h-14 border-2 border-white/10 shadow-2xl">
                                 <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} />
                                 <AvatarFallback className="bg-zinc-800 font-black">{user.name?.charAt(0)}</AvatarFallback>
                               </Avatar>
                               {user.role === 'admin' && (
                                 <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-black">
                                   <Zap size={10} className="text-white fill-current" />
                                 </div>
                               )}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{user.name}</h4>
                                {user.role === 'admin' && <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">Staff</Badge>}
                                {user.suspended && <Badge variant="destructive" className="text-[8px] font-black uppercase">Suspended</Badge>}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {user.email}</span>
                                 <span className="flex items-center gap-1.5"><Star className="w-3 h-3 text-yellow-500" /> {user.xp || 0} XP</span>
                                 <span className="flex items-center gap-1.5 text-zinc-600"><Clock className="w-3 h-3" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                                  <MoreVertical className="w-5 h-5 text-zinc-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-56 bg-zinc-950 border-white/10 text-white rounded-2xl p-2" align="end">
                                <DropdownMenuLabel className="px-4 py-2 text-[10px] uppercase font-black text-zinc-500 tracking-widest">Aspirant Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => { setSelectedUser(user); setPassMode(true); }}>
                                  <CreditCard className="w-4 h-4 mr-3 text-primary" /> Manage Pass
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => { setSelectedUser(user); setMessageMode(true); }}>
                                  <MessageSquare className="w-4 h-4 mr-3 text-emerald-500" /> Send Signal
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                
                                {user.role === 'admin' ? (
                                  <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => handleStatusUpdate(user.id, { role: 'student' }, 'Demoted Staff')}>
                                    <Shield className="w-4 h-4 mr-3 text-zinc-500" /> Revoke Staff
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => handleStatusUpdate(user.id, { role: 'admin' }, 'Promoted Staff')}>
                                    <ShieldCheck className="w-4 h-4 mr-3 text-emerald-500" /> Grant Staff
                                  </DropdownMenuItem>
                                )}

                                {user.suspended ? (
                                  <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => handleStatusUpdate(user.id, { suspended: false }, 'Activated')}>
                                    <UserCheck className="w-4 h-4 mr-3 text-emerald-500" /> Activate Account
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-orange-400 focus:text-orange-400" onClick={() => handleStatusUpdate(user.id, { suspended: true }, 'Suspended')}>
                                    <Ban className="w-4 h-4 mr-3" /> Suspend Access
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={() => { setSelectedUser(user); setConfirmDelete(true); }}>
                                  <Trash2 className="w-4 h-4 mr-3" /> Terminate Identity
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-32 text-center text-zinc-600 italic font-medium">No matching student records found in this cycle.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <div className="p-8 rounded-[40px] bg-zinc-900/50 border border-white/5 space-y-8 shadow-2xl">
                    <h3 className="font-bold flex items-center gap-3 text-white">
                       <Activity className="text-primary w-5 h-5" />
                       Administrative Pulse
                    </h3>
                    <div className="space-y-6">
                       {logs.length > 0 ? logs.map(log => (
                         <div key={log.id} className="flex gap-4 items-start group">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-150 transition-transform shadow-lg shadow-primary/20" />
                            <div>
                               <p className="text-xs font-bold text-white uppercase tracking-tight">{log.action}</p>
                               <p className="text-[10px] text-zinc-500 leading-relaxed truncate max-w-[220px]">{log.details}</p>
                               <span className="text-[8px] font-black text-zinc-700 uppercase mt-1 block">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                               </span>
                            </div>
                         </div>
                       )) : (
                         <p className="text-xs text-zinc-600 italic">No recent system signals.</p>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Pass Management Modal */}
          <Dialog open={passMode} onOpenChange={setPassMode}>
            <DialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-10 text-white max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Entitlement Management</DialogTitle>
                <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">Manage Pass for: {selectedUser?.email}</DialogDescription>
              </DialogHeader>
              <div className="py-10 space-y-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2">Active Production Tiers</p>
                    <div className="grid grid-cols-2 gap-4">
                       {plans.map(plan => (
                         <Button 
                           key={plan.id}
                           onClick={() => handleGrantPass(plan)}
                           variant="outline"
                           className="h-20 rounded-3xl border-white/5 bg-white/[0.02] hover:bg-primary/10 hover:border-primary/20 flex flex-col items-center justify-center gap-1 group"
                           disabled={actionLoading}
                         >
                            <span className="font-bold text-sm text-zinc-300 group-hover:text-white">{plan.name}</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{plan.duration} Days</span>
                         </Button>
                       ))}
                    </div>
                 </div>
                 <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20 flex items-center justify-between">
                    <div>
                       <p className="text-sm font-bold text-destructive">Kill Active Signal</p>
                       <p className="text-[10px] text-zinc-600 font-black uppercase">Instantly revokes all premium capabilities</p>
                    </div>
                    <Button variant="destructive" size="sm" className="rounded-xl h-10 px-6 font-black" onClick={handleRevokePass} disabled={actionLoading}>REVOKE ACCESS</Button>
                 </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Messaging Modal */}
          <Dialog open={messageMode} onOpenChange={setMessageMode}>
            <DialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-10 text-white max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase">DIRECT SIGNAL</DialogTitle>
                <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">To Identity: {selectedUser?.email}</DialogDescription>
              </DialogHeader>
              <div className="py-8 space-y-3">
                 <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Message Payload</label>
                 <Textarea 
                   className="bg-black/40 border-white/5 rounded-3xl min-h-[180px] p-6 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                 />
              </div>
              <DialogFooter>
                <Button onClick={handleSendMessage} disabled={actionLoading || !message.trim()} className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black shadow-xl blue-glow">
                   {actionLoading ? <Loader2 className="animate-spin" /> : "DISPATCH SIGNAL"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Termination Confirmation */}
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
             <DialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-10 text-white max-w-md">
                <DialogHeader className="text-center space-y-6">
                   <div className="w-20 h-20 rounded-[28px] bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20"><Trash2 className="text-red-500 w-10 h-10" /></div>
                   <DialogTitle className="text-2xl font-bold">Purge Identity?</DialogTitle>
                   <DialogDescription className="text-zinc-500">All progress, XP, and rank signals for <span className="text-white font-bold">{selectedUser?.email}</span> will be erased.</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 gap-4">
                   <Button variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1 h-12 rounded-xl bg-zinc-900 border-white/5 font-bold">Cancel</Button>
                   <Button onClick={terminateAccount} disabled={actionLoading} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-black shadow-xl">
                     {actionLoading ? <Loader2 className="animate-spin" /> : "CONFIRM PURGE"}
                   </Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
        </main>
      </div>
    </AdminProtect>
  );
}
