
'use client';

import { UserProfile } from '@/lib/auth-context';
import { User } from 'firebase/auth';

/**
 * Checks if a user has administrative privileges.
 * Prioritizes the hardcoded developer email and then checks Firestore roles.
 */
export function checkIsAdmin(user: User | null, profile: UserProfile | null): boolean {
  // 1. Check Auth User directly (Most secure for hardcoded access)
  if (user?.email === 'arshdeepgrewal1122@gmail.com') return true;
  
  // 2. Fallback to Firestore profile role
  if (!profile) return false;
  if (profile.email === 'arshdeepgrewal1122@gmail.com') return true;
  
  return profile.role === 'admin' || (profile.role as any) === 'superadmin';
}
