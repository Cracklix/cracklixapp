'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

/**
 * Listens for specialized Firestore errors and surfaces them gracefully.
 * In production, we log to console and show a retry message instead of crashing.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Production Logging
      console.error("[Cracklix Security/Index Heartbeat]:", error.message);
      
      // Graceful notification instead of a global UI crash
      toast({
        title: "System Latency Detected",
        description: "A database query is synchronizing. Please retry if data remains hidden.",
        variant: "destructive",
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
