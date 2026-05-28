
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/admin/sidebar";
import AdminGuard from "@/components/admin-guard";
import { Users, Search, MoreVertical, Shield, Ban, Star, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    async function loadUsers() {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: doc.id, ...d.data() })));
      setLoading(false);
    }
    loadUsers();
  }, []);

  const toggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    await updateDoc(doc(db, "users", userId), { role: newRole });
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold text-white">Student Base Manager</h1>
                <p className="text-zinc-500">Monitor engagement and manage administrative privileges.</p>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <Input 
                  placeholder="Search identity..." 
                  className="bg-zinc-900 border-white/5 pl-10 h-12 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden">
               <div className="p-8 border-b border-white/5 bg-zinc-900/30">
                  <h3 className="font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Student Registry ({filtered.length})
                  </h3>
               </div>
               
               <div className="divide-y divide-white/5">
                  {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-20 animate-pulse bg-white/5" />)
                  ) : filtered.length > 0 ? (
                    filtered.map((user) => (
                      <div key={user.id} className="p-6 flex items-center justify-between group hover:bg-zinc-800/40 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border border-white/10">
                            <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white">{user.name}</h4>
                              {user.role === 'admin' && <Badge className="bg-primary/20 text-primary border-none text-[10px]">STAFF</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                               <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                               <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {user.xp} XP</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="rounded-xl border-white/5 bg-zinc-900 text-zinc-400 hover:text-white"
                             onClick={() => toggleAdmin(user.id, user.role)}
                           >
                             <Shield className="w-4 h-4 mr-2" />
                             {user.role === 'admin' ? "Revoke Access" : "Grant Staff"}
                           </Button>
                           <Button variant="ghost" size="icon" className="rounded-xl text-zinc-600 hover:text-destructive">
                              <Ban className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreVertical className="w-4 h-4 text-zinc-500" />
                           </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center text-zinc-600 italic">No matching student records found.</div>
                  )}
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
