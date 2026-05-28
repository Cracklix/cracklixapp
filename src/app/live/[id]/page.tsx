
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { markAttendance } from '@/services/live-class';
import LiveChat from '@/components/live/live-chat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Hand, 
  Layout, 
  MoreHorizontal,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LiveClassRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const unwrappedParams = React.use(params);
  const classId = unwrappedParams.id;
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [attendees, setAttendees] = useState(124); // Mock count
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && classId) {
      markAttendance(user.uid, classId);
    }

    // Agora Mock initialization
    // In production, we'd use: 
    // const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    // await client.join(APP_ID, channel, token, uid);
  }, [user, classId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-zinc-950">
        <div className="flex items-center gap-6">
          <Link href="/live">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-[10px] font-black border-none px-2 py-0.5 animate-pulse">LIVE</Badge>
              <h1 className="text-xl font-bold tracking-tight">Punjab Police SI Marathon: Reasoning Part 1</h1>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Users className="w-3 h-3" />
              {attendees} Students currently attending
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-2">
             <Zap className="w-4 h-4 fill-current" />
             <span className="text-xs font-bold">+20 XP for attending</span>
           </div>
           <Button className="rounded-xl bg-destructive hover:bg-destructive/90 font-bold px-6">
             Leave Class
           </Button>
        </div>
      </header>

      {/* Classroom Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Main Stage */}
        <div className="flex-1 p-8 flex flex-col gap-6">
          <div className="flex-1 rounded-[48px] bg-zinc-900 border border-white/5 relative overflow-hidden shadow-2xl group" ref={videoRef}>
            {/* Mock Video Feed */}
            <div className="absolute inset-0 flex items-center justify-center">
               {!videoOn ? (
                 <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User className="w-16 h-16 text-zinc-700" />
                 </div>
               ) : (
                 <img 
                   src="https://picsum.photos/seed/teacher/1280/720" 
                   className="w-full h-full object-cover opacity-80"
                   alt="Educator"
                 />
               )}
            </div>
            
            {/* Teacher Overlay */}
            <div className="absolute bottom-8 left-8 p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                 <Radio className="text-white w-6 h-6 animate-pulse" />
               </div>
               <div>
                 <p className="text-sm font-bold">Arsh Sir (Expert Mentor)</p>
                 <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Mastering Punjab GK</p>
               </div>
            </div>

            {/* Stage Controls */}
            <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button size="icon" className="h-14 w-14 rounded-2xl bg-zinc-800 border border-white/10 hover:bg-zinc-700">
                 <Layout className="w-5 h-5" />
               </Button>
               <Button size="icon" className="h-14 w-14 rounded-2xl bg-zinc-800 border border-white/10 hover:bg-zinc-700">
                 <Hand className="w-5 h-5" />
               </Button>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center justify-center gap-6 py-4">
            <Button 
              size="icon" 
              onClick={() => setMicOn(!micOn)}
              className={`h-16 w-16 rounded-[28px] ${micOn ? 'bg-secondary' : 'bg-red-600'} hover:opacity-90 transition-all`}
            >
              {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            <Button 
              size="icon" 
              onClick={() => setVideoOn(!videoOn)}
              className={`h-16 w-16 rounded-[28px] ${videoOn ? 'bg-secondary' : 'bg-red-600'} hover:opacity-90 transition-all`}
            >
              {videoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            <Button size="icon" className="h-16 w-16 rounded-[28px] bg-secondary hover:opacity-90">
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Sidebar Panel */}
        <aside className="w-[450px] p-8 border-l border-white/5 bg-zinc-950 flex flex-col">
          <LiveChat classId={classId} />
        </aside>
      </main>
    </div>
  );
}

// Simple placeholder icon
function Radio(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
  )
}

function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
