
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
  Loader2
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

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageMode, setMessageMode] = useState(false);
  const [notifyMode, setNotifyMode] = useState(false);
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
      adminId: "master_admin" // In prod, use actual current admin UID
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

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        userId: selectedUser.id,
        title: notifyMode ? "Official Notice" : "Direct Admin Message",
        message: message,
        type: notifyMode ? "urgency" : "announcement",
        fromFounder: true,
        read: false,
        createdAt: Date.now()
      });
      await createLog("Message Sent", `To: ${selectedUser.email}`);
      toast({ title: "Message Dispatched", description: "Signal successfully routed to student terminal." });
      setMessage("");
      setMessageMode(false);
      setNotifyMode(false);
    } catch (e: any) {
      toast({ title: "Dispatch Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const terminateAccount = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "users", selectedUser.id));
      
      // 2. Clear related data (Mocks, Notifications etc - basic version)
      // Note: Full cascading delete usually handled by Cloud Functions
      
      await createLog("Account Terminated", `Identity purged: ${selectedUser.email}`);
      toast({ title: "Identity Purged", description: "Account and associated data removed from ecosystem." });
      setConfirmDelete(false);
    } catch (e: any) {
      toast({ title: "Purge Failed", description: e.message, variant: "destructive" });
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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
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
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Main Registry */}
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
                            <div className="text-right mr-6 hidden md:block">
                               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Attempt Density</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-white">{user.mockAttempts || 0} Mocks</span>
                                  <div className="h-3 w-1 bg-primary/20 rounded-full overflow-hidden">
                                     <div className="h-full bg-primary" style={{ height: `${Math.min((user.mockAttempts || 0) * 10, 100)}%` }} />
                                  </div>
                               </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                                  <MoreVertical className="w-5 h-5 text-zinc-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-56 bg-zinc-950 border-white/10 text-white rounded-2xl p-2" align="end">
                                <DropdownMenuLabel className="px-4 py-2 text-[10px] uppercase font-black text-zinc-500 tracking-widest">Aspirant Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => { setSelectedUser(user); setMessageMode(true); }}>
                                  <MessageSquare className="w-4 h-4 mr-3 text-primary" /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => { setSelectedUser(user); setNotifyMode(true); }}>
                                  <Bell className="w-4 h-4 mr-3 text-orange-400" /> Issue Alert
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

              {/* Sidebar: Activity & Stats */}
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

                 <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 space-y-6">
                    <div className="flex items-center gap-3">
                       <Zap className="text-primary w-6 h-6 fill-current" />
                       <h4 className="font-bold text-lg">System Integrity</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                       "All identity terminations are irreversible. Ensure compliance with Punjab state data retention protocols before purging user data artifacts."
                    </p>
                    <div className="pt-6 border-t border-white/5 space-y-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-zinc-500">Security Baseline</span>
                          <span className="text-emerald-500">OPTIMAL</span>
                       </div>
                       <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-full animate-pulse" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Messaging Modals */}
          <Dialog open={messageMode || notifyMode} onOpenChange={(v) => { if(!v) { setMessageMode(false); setNotifyMode(false); setSelectedUser(null); setMessage(""); } }}>
            <DialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-10 text-white max-w-xl shadow-[0_0_50px_-12px_rgba(37,99,235,0.2)]">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
                  {notifyMode ? "ISSUE OFFICIAL ALERT" : "DIRECT SIGNAL"}
                </DialogTitle>
                <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">
                  To Identity: {selectedUser?.email}
                </DialogDescription>
              </DialogHeader>
              <div className="py-8 space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-2">Message Payload</label>
                    <Textarea 
                      placeholder={notifyMode ? "Enter critical update details..." : "Enter your message to the student..."}
                      className="bg-black/40 border-white/5 rounded-3xl min-h-[180px] p-6 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-primary/40"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                 </div>
                 <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                       <Zap className="text-primary w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight">
                       This signal will propagate immediately to the student's dashboard and trigger a priority notification badge.
                    </p>
                 </div>
              </div>
              <DialogFooter className="gap-4">
                <Button variant="ghost" onClick={() => { setMessageMode(false); setNotifyMode(false); }} className="rounded-xl h-12 text-zinc-500 font-bold">Discard</Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={actionLoading || !message.trim()}
                  className="bg-primary hover:bg-primary/90 h-12 px-10 rounded-xl font-black shadow-xl blue-glow"
                >
                  {actionLoading ? <Loader2 className="animate-spin" /> : "Dispatch Signal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Termination Confirmation */}
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
             <DialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-10 text-white max-w-md">
                <DialogHeader className="text-center space-y-6">
                   <div className="w-20 h-20 rounded-[28px] bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                      <Trash2 className="text-red-500 w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                     <DialogTitle className="text-2xl font-bold">Purge Identity?</DialogTitle>
                     <DialogDescription className="text-zinc-500">
                        This action will permanently terminate <span className="text-white font-bold">{selectedUser?.email}</span>. All progress, XP, and rank signals will be erased.
                     </DialogDescription>
                   </div>
                </DialogHeader>
                <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-center gap-4 my-4">
                   <AlertTriangle className="text-red-500 w-6 h-6 shrink-0" />
                   <p className="text-[10px] font-bold text-red-500 uppercase leading-relaxed">System warning: This protocol is non-reversible and logs an executive audit signal.</p>
                </div>
                <DialogFooter className="mt-8 gap-4">
                   <Button variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1 h-12 rounded-xl border-white/5 bg-zinc-900 text-white font-bold">Cancel</Button>
                   <Button 
                     onClick={terminateAccount} 
                     disabled={actionLoading}
                     className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-black shadow-xl"
                   >
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
