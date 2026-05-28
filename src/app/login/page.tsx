
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-Repair Engine: Fixes accounts that exist in Auth but missing in Firestore
  const checkRoleAndRedirect = async (uid: string, userEmail: string) => {
    const userRef = doc(db, "users", uid);
    try {
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn("Broken profile detected for UID:", uid, ". Initiating Auto-Repair...");
        const today = new Date().toISOString().split('T')[0];
        
        await setDoc(userRef, {
          uid,
          name: userEmail.split('@')[0] || 'Aspirant',
          email: userEmail.toLowerCase().trim(),
          role: "student",
          xp: 0,
          streak: 0,
          coins: 100,
          district: "Ludhiana",
          targetExam: "Punjab Police SI",
          referralCode: `CLX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          createdAt: Date.now(),
          bookmarks: [],
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Ensure daily target exists
        await setDoc(doc(db, "dailyTargets", uid), {
          userId: uid,
          questionsGoal: 50,
          questionsCompleted: 0,
          mockGoal: 1,
          mockCompleted: 0,
          studyMinutesGoal: 120,
          studyMinutesCompleted: 0,
          date: today,
          updatedAt: Date.now()
        }, { merge: true });
      }

      // Re-fetch or use existing data to determine route
      const finalDoc = await getDoc(userRef);
      const data = finalDoc.data();
      
      if (data?.role === 'admin' || data?.role === 'superadmin' || userEmail === 'arshdeepgrewal1122@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error("Profile sync failed:", err);
      toast({ title: "Sync Error", description: "Could not synchronize identity. Please try again.", variant: "destructive" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !password) {
      toast({ title: "Validation Error", description: "Email and password are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await checkRoleAndRedirect(res.user.uid, res.user.email!);
    } catch (error: any) {
      console.error("Login error:", error);
      let msg = "Invalid credentials. Please check your access key.";
      if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (error.code === 'auth/wrong-password') msg = "Incorrect access key.";
      
      toast({
        title: "Access Denied",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await checkRoleAndRedirect(res.user.uid, res.user.email!);
    } catch (error: any) {
      toast({ title: "SSO Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-4 blue-glow">
            <Zap className="text-white w-7 h-7 fill-current" />
          </Link>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white uppercase">CRACKLIX Terminal</h1>
          <p className="text-zinc-500 mt-2">Access your competitive arena.</p>
        </div>

        <Card className="rounded-[32px] bg-zinc-900/40 border-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle>Aspirant Login</CardTitle>
            <CardDescription>Enter credentials to resume your training.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Identity</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="aspirant@cracklix.in"
                    className="pl-10 h-11 bg-black/20 rounded-xl border-white/5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Access Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-black/20 rounded-xl border-white/5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-600 hover:text-zinc-400 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Entry"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]"><span className="bg-[#050816] px-3 text-zinc-600">Secure SSO</span></div>
            </div>

            <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 hover:bg-white/5 font-bold" onClick={handleGoogleLogin} disabled={loading}>
              Continue with Google
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                New aspirant? <Link href="/signup" className="text-primary hover:underline font-black">Register Identity</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
