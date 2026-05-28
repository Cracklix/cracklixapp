'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

/**
 * Listens for specialized Firestore errors and surfaces them via toasts
 * instead of throwing global exceptions that trigger the Error Boundary.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Log to console for developer visibility
      console.error("[Firebase Security/Index Error]:", error.message);
      
      // Notify the user gracefully without crashing the UI
      if (process.env.NODE_ENV === 'development') {
        toast({
          title: "System Signal Interrupted",
          description: "A database query failed (check console for index/permission details).",
          variant: "destructive",
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
