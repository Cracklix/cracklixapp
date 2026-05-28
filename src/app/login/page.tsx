
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const checkRoleAndRedirect = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    try {
      const userDoc = await getDoc(userRef);
      const data = userDoc.data();
      
      if (data?.role === 'admin' || data?.role === 'superadmin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      // If it's a permission error, surface it contextually
      if (err.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      } else {
        throw err;
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await checkRoleAndRedirect(res.user.uid);
    } catch (error: any) {
      toast({
        title: "Login Failed",
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
      await checkRoleAndRedirect(res.user.uid);
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
          <h1 className="font-headline text-3xl font-bold tracking-tight">CRACKLIX Terminal</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your competitive arena.</p>
        </div>

        <Card className="rounded-[32px] cracklix-glass shadow-2xl border-white/5">
          <CardHeader>
            <CardTitle>Aspirant Login</CardTitle>
            <CardDescription>Enter your credentials to resume preparation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Identity</Label>
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
                <Label htmlFor="password">Access Key</Label>
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access Terminal"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-[#050816] px-2 text-zinc-500">SSO Provider</span></div>
            </div>

            <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 hover:bg-white/5 font-bold" onClick={handleGoogleLogin}>
              Continue with Google
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                New aspirant?{' '}
                <Link href="/signup" className="text-primary hover:underline font-bold">
                  Enroll Now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
