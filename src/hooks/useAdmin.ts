
'use client';

import { UserProfile } from '@/lib/auth-context';
import { User } from 'firebase/auth';

/**
 * Checks if a user has administrative privileges.
 * Prioritizes the hardcoded developer email and then checks Firestore roles.
 */
export function checkIsAdmin(user: User | null, profile: UserProfile | null): boolean {
  if (!user) return false;
  
  // 1. Primary check: Hardcoded Super Admin Email
  if (user.email === 'arshdeepgrewal1122@gmail.com') return true;
  
  // 2. Fallback check: Firestore role
  if (profile) {
    if (profile.role === 'admin' || (profile.role as any) === 'superadmin') {
      return true;
    }
  }
  
  return false;
}
