"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const googleProvider = new GoogleAuthProvider();

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const initializeUserProfile = async (uid: string, userEmail: string, userName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, "users", uid);
    
    // Normalize and prepare payload
    const profilePayload = {
      uid,
      name: userName.trim() || 'Aspirant',
      email: userEmail.toLowerCase().trim(),
      role: "student",
      xp: 0,
      streak: 0,
      coins: 100, // Launch Bonus
      district: "Ludhiana",
      targetExam: "Punjab Police SI",
      referralCode: `CLX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: Date.now(),
      bookmarks: [],
      updatedAt: serverTimestamp()
    };

    // 1. Core Profile creation with merge to prevent overwriting if exists
    await setDoc(userRef, profilePayload, { merge: true });

    // 2. Initialize Operational Sub-collections
    const targetRef = doc(db, "dailyTargets", uid);
    const targetSnap = await getDoc(targetRef);
    if (!targetSnap.exists()) {
      await setDoc(targetRef, {
        userId: uid,
        questionsGoal: 50,
        questionsCompleted: 0,
        mockGoal: 1,
        mockCompleted: 0,
        studyMinutesGoal: 120,
        studyMinutesCompleted: 0,
        date: today,
        updatedAt: Date.now()
      });
    }

    // 3. AI Usage Initialization
    const usageRef = doc(db, "aiUsage", `${uid}_${today}`);
    await setDoc(usageRef, {
      userId: uid,
      count: 0,
      date: today,
      lastUpdated: Date.now()
    }, { merge: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !password || !name.trim()) {
      toast({ title: "Validation Error", description: "All fields are mandatory.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Minimum 6 characters required.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      // Step 1: Create Auth User
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      
      // Step 2: Initialize Firestore Profile (Atomic)
      await initializeUserProfile(res.user.uid, cleanEmail, name);
      
      toast({ title: "Enrollment Successful", description: "Identity verified. Redirecting to Arena..." });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Signup error:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: "Account Exists",
          description: "This identity is already registered. Please access the terminal via Login.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enrollment Error",
          description: error.message || "Protocol failure. Please retry.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await initializeUserProfile(res.user.uid, res.user.email!, res.user.displayName || 'Student');
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "SSO Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-6 blue-glow">
            <Zap className="text-white w-8 h-8 fill-current" />
          </Link>
          <h1 className="font-headline text-4xl font-black tracking-tighter text-white uppercase">Initialize Identity</h1>
          <p className="text-zinc-500 mt-2 font-medium">Production Protocol v2.5 Synchronized.</p>
        </div>

        <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl">Enlist Now</CardTitle>
            <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Secure Identity Buffer</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Full Identity</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                  <Input
                    placeholder="E.g. Arshdeep Singh"
                    className="pl-10 h-12 bg-white/5 rounded-xl border-white/5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Email Identity</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                  <Input
                    type="email"
                    placeholder="aspirant@cracklix.in"
                    className="pl-10 h-12 bg-white/5 rounded-xl border-white/5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Access Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    className="pl-10 h-12 bg-white/5 rounded-xl border-white/5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg blue-glow shadow-xl" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize & Join"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]"><span className="bg-[#0f111a] px-3 text-zinc-600">Secure SSO</span></div>
            </div>

            <Button variant="outline" className="w-full h-12 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/5 font-bold" onClick={handleGoogleLogin} disabled={loading}>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Already a member? <Link href="/login" className="text-primary hover:underline font-black">Access Terminal</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
