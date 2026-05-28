
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
    // Standard student profile
    const profileRef = doc(db, "users", uid);
    await setDoc(profileRef, {
      uid,
      name: userName || 'Aspirant',
      email: userEmail,
      role: "student",
      xp: 0,
      streak: 0,
      coins: 50, // Initial reward
      targetExam: "Punjab Police SI", // Default target
      createdAt: Date.now(),
    });

    // Initialize daily targets
    const targetRef = doc(db, "dailyTargets", uid);
    await setDoc(targetRef, {
      userId: uid,
      questionsGoal: 50,
      questionsCompleted: 0,
      mockGoal: 1,
      mockCompleted: 0,
      studyMinutesGoal: 120,
      studyMinutesCompleted: 0,
      updatedAt: Date.now()
    });

    // Initialize readiness tracking
    const readinessRef = doc(db, "readiness", uid);
    await setDoc(readinessRef, {
      userId: uid,
      overallScore: 0,
      subjectPerformance: {},
      lastUpdated: Date.now()
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await initializeUserProfile(res.user.uid, email, name);
      
      toast({ title: "Account Created", description: "Welcome to the Punjab Exam Mastery ecosystem." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Signup Failed",
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
      
      // Only initialize if it's a new user (optional check, setDoc with merge works too)
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-4 blue-glow">
            <Zap className="text-white w-7 h-7 fill-current" />
          </Link>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white">Join Cracklix</h1>
          <p className="text-muted-foreground mt-2">Elite learning for Punjab's serious aspirants.</p>
        </div>

        <Card className="rounded-[32px] cracklix-glass shadow-2xl border-white/5">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Start your journey to Rank 1 today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-secondary/50 rounded-xl border-white/5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-11 bg-secondary/50 rounded-xl border-white/5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-secondary/50 rounded-xl border-white/5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Enrollment"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-[#050816] px-2 text-zinc-500">Secure Protocol</span></div>
            </div>

            <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 hover:bg-white/5 font-bold" onClick={handleGoogleLogin}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Continue with Google
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Already have an identity?{' '}
                <Link href="/login" className="text-primary hover:underline font-bold">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
