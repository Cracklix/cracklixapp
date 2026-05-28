
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-8">
        <div className="w-24 h-24 rounded-[40px] bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto shadow-2xl shadow-destructive/10">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-headline tracking-tight">System Interruption</h1>
          <p className="text-muted-foreground leading-relaxed">
            An unexpected error occurred in the CBT engine. Your progress is cached, but we need to re-initialize the session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="default" 
            size="lg" 
            className="h-14 rounded-2xl flex-1 font-bold bg-primary hover:bg-primary/90"
            onClick={() => reset()}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retry Session
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="h-14 rounded-2xl flex-1 border-white/10 font-bold hover:bg-white/5"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Exit to Safety
            </Link>
          </Button>
        </div>
        
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
          Error Log: {error.digest || 'Internal Exception'}
        </p>
      </div>
    </div>
  );
}
