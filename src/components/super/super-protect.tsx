
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert } from "lucide-react";

export default function SuperAdminProtect({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile?.role !== 'superadmin') {
        router.push("/admin");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Authenticating Super Admin</p>
      </div>
    );
  }

  return <>{children}</>;
}
