
import { WifiOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-8">
        <div className="w-24 h-24 rounded-[40px] bg-secondary flex items-center justify-center mx-auto shadow-2xl shadow-black/50 border border-white/5">
          <WifiOff className="w-12 h-12 text-muted-foreground opacity-50" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-headline">Connection Lost</h1>
          <p className="text-muted-foreground leading-relaxed">
            CRACKLIX requires an active connection to sync your XP and real-time standings. Please check your network and try again.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button asChild size="lg" className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold">
            <Link href="/">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reconnect to Server
            </Link>
          </Button>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
            Offline Mode: Beta Coming Soon
          </p>
        </div>
      </div>
    </div>
  );
}
