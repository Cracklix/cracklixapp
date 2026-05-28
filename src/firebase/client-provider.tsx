'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './init';
import { FirebaseProvider } from './provider';

/**
 * Exports a React Provider that handles Firebase initialization only on the client.
 * This ensures that Firebase client SDKs are not invoked during server-side rendering.
 */
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use useMemo to ensure initialization happens once and only on the client
  const { app, auth, db } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
