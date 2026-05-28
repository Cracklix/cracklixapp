
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
    
    // 1. Core Profile
    const profileRef = doc(db, "users", uid);
    await setDoc(profileRef, {
      uid,
      name: userName || 'Aspirant',
      email: userEmail,
      role: "student",
      xp: 0,
      streak: 0,
      coins: 100, // Launch Bonus
      targetExam: "Punjab Police SI",
      referralCode: `CLX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: Date.now(),
    });

    // 2. Daily Targets Initialization
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
    });

    // 3. AI Usage Limit Initiation
    await setDoc(doc(db, "aiUsage", `${uid}_${today}`), {
      userId: uid,
      count: 0,
      date: today,
      lastUpdated: Date.now()
    });

    // 4. Readiness Predictor initiation
    await setDoc(doc(db, "readiness", uid), {
      userId: uid,
      overallScore: 0,
      subjectPerformance: {},
      lastUpdated: Date.now()
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await initializeUserProfile(res.user.uid, email, name);
      
      toast({ title: "Enrollment Successful", description: "Welcome to Punjab's elite preparation engine." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      // Initialize if document doesn't exist (merge approach)
      await initializeUserProfile(res.user.uid, res.user.email!, res.user.displayName || 'Student');
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Google Auth Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-6 blue-glow">
            <Zap className="text-white w-8 h-8 fill-current" />
          </Link>
          <h1 className="font-headline text-4xl font-black tracking-tighter text-white uppercase">Initialize Identity</h1>
          <p className="text-zinc-500 mt-2 font-medium">Join 15,000+ Punjab Government Aspirants.</p>
        </div>

        <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl">Enlist Now</CardTitle>
            <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Secure Protocol v2.5</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                  <Input
                    placeholder="E.g. Arshdeep Singh"
                    className="pl-10 h-12 bg-white/5 rounded-xl border-white/5 focus:border-primary/50 transition-all"
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
                    className="pl-10 h-12 bg-white/5 rounded-xl border-white/5 focus:border-primary/50 transition-all"
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
                    className="pl-10 h-12 bg-white/5 rounded-xl border-white/5 focus:border-primary/50 transition-all"
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

            <Button variant="outline" className="w-full h-12 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/5 font-bold" onClick={handleGoogleLogin}>
              <svg className="mr-3 h-4 w-4" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Already a member?{' '}
              <Link href="/login" className="text-primary hover:underline font-black">
                Access Terminal
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
