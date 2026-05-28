
'use client';

import { useAuth } from '@/lib/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Shield, Calendar, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, logout } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-24">
        <h1 className="font-headline text-4xl font-bold mb-8">Your Profile</h1>

        <div className="space-y-6">
          <div className="bg-card/60 backdrop-blur-md p-8 rounded-[32px] border border-white/5 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 border-4 border-primary/20 mb-6">
              <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200`} />
              <AvatarFallback>{profile?.name?.charAt(0) || 'S'}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile?.name}</h2>
            <p className="text-muted-foreground">{profile?.role.toUpperCase()} • Level 12</p>
          </div>

          <div className="bg-card/60 backdrop-blur-md p-8 rounded-[32px] border border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Email Address</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Account Role</p>
                <p className="font-medium">{profile?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Member Since</p>
                <p className="font-medium">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <Button 
            variant="destructive" 
            className="w-full h-14 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all"
            onClick={logout}
          >
            <LogOut className="mr-2 w-5 h-5" />
            Sign Out of Account
          </Button>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
