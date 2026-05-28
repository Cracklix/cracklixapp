
'use client';

import { useAuth } from '@/lib/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Shield, 
  LogOut, 
  ShieldCheck, 
  Zap, 
  Lock,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { checkIsAdmin } from '@/hooks/useAdmin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = checkIsAdmin(profile);

  const claimAdmin = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        role: "admin"
      });
      toast({ 
        title: "Identity Elevated", 
        description: "Admin privileges granted. Redirecting to Command Center..." 
      });
      setTimeout(() => router.push('/admin'), 1500);
    } catch (e: any) {
      toast({ title: "Operation Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-32 space-y-8">
        <header>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Identity Terminal</h1>
          <p className="text-zinc-500 mt-1">Manage your account credentials and system access.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Identity Card */}
            <Card className="rounded-[40px] bg-zinc-900 border-white/5 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/10" />
              <CardContent className="p-8 -mt-16 text-center md:text-left md:flex items-end gap-8">
                <Avatar className="w-32 h-32 border-8 border-[#050816] shadow-2xl mx-auto md:mx-0">
                  <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200`} />
                  <AvatarFallback className="text-3xl font-black">{profile?.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div className="mt-6 md:mt-0 flex-1 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h2 className="text-3xl font-black tracking-tight">{profile?.name}</h2>
                    {isAdmin && <Zap className="text-primary w-5 h-5 fill-current hidden md:block" />}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                       <Shield className="w-3.5 h-3.5" /> {profile?.role || 'Student'}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                       <Mail className="w-3.5 h-3.5" /> {user?.email}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 rounded-[32px] bg-zinc-900/50 border border-white/5 space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <UserIcon className="text-zinc-500 w-5 h-5" />
                    Personal Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Full Identity</p>
                      <p className="text-sm font-medium">{profile?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Target Exam</p>
                      <p className="text-sm font-medium">{profile?.targetExam || 'Punjab Police SI'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Enrollment Stamp</p>
                      <p className="text-sm font-medium">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
               </div>

               <div className="p-8 rounded-[32px] bg-zinc-900/50 border border-white/5 space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShieldCheck className="text-zinc-500 w-5 h-5" />
                    Security Baseline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-zinc-400">Password</span>
                      <Button variant="ghost" size="sm" className="text-primary text-[10px] font-black uppercase tracking-widest">Update</Button>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-zinc-400">2FA Baseline</span>
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Enabled</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-zinc-400">Identity Docs</span>
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Pending</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Session Panel */}
          <div className="space-y-8">
            <Card className="rounded-[40px] p-8 bg-zinc-900/50 border-white/5 h-fit">
              <h3 className="font-bold text-xl mb-6">Session Center</h3>
              <div className="space-y-4">
                <div className="p-6 rounded-[28px] bg-black/40 border border-white/5 flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                      <Lock className="text-zinc-500 w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold">Current Training Arena</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Active Device • Punjab</p>
                   </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full h-14 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all font-black">
                      <LogOut className="mr-2 w-5 h-5" />
                      SIGN OUT
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold">Terminate Session?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        You will be logged out of your current training arena. Your progress and ranking will remain securely cached in the cloud.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-4">
                      <AlertDialogCancel className="h-12 rounded-xl bg-zinc-900 border-white/5 text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={logout} className="h-12 rounded-xl bg-destructive hover:bg-destructive/90 font-bold">Sign Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>

            {/* Admin Access Section */}
            {!isAdmin && (
              <Card className="rounded-[40px] p-8 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3 mb-4">
                   <ShieldCheck className="text-primary w-5 h-5" />
                   <h4 className="font-bold">Access Escalation</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-6 italic">
                  "Only authorized personnel can enter the Command Center. Identity verification is required."
                </p>
                <Button onClick={claimAdmin} className="w-full h-12 bg-primary hover:bg-primary/90 font-black rounded-2xl">
                  Claim Admin Access
                </Button>
              </Card>
            )}

            {isAdmin && (
               <Button onClick={() => router.push('/admin')} variant="outline" className="w-full h-14 rounded-2xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black shadow-xl">
                  <Zap className="w-4 h-4 mr-2" /> ENTER ADMIN PANEL
               </Button>
            )}
            
            <div className="px-6 flex items-center gap-3 opacity-30">
               <AlertCircle size={16} />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cracklix Security v2.5</p>
            </div>
          </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
