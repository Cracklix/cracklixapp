'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { checkIsAdmin } from "@/hooks/useAdmin";
import { Loader2, Zap } from "lucide-react";

/**
 * Standardized Higher-order component to protect admin routes.
 * Redirects non-admin users to the dashboard.
 */
export default function AdminProtect({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.push("/login");
      } else if (!checkIsAdmin(user, profile)) {
        router.push("/dashboard");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, profile, loading, router, mounted]);

  if (!mounted || loading || !authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 fill-current" />
        </div>
        <p className="text-zinc-500 font-medium animate-pulse tracking-widest uppercase text-xs">Accessing Command Center...</p>
      </div>
    );
  }

  return <>{children}</>;
}
