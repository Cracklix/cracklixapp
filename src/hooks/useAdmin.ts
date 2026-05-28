
'use client';

import { UserProfile } from '@/types';
import { User } from 'firebase/auth';

/**
 * Checks if a user has administrative privileges.
 * Strictly prioritizes the master developer email and then checks Firestore roles.
 */
export function checkIsAdmin(user: User | null, profile: UserProfile | null): boolean {
  if (!user) return false;
  
  // 1. Primary check: Master Admin Email (Directly from Auth session for speed)
  if (user.email === 'arshdeepgrewal1122@gmail.com') return true;
  
  // 2. Fallback check: Firestore profile role
  if (profile) {
    if (profile.role === 'admin' || profile.role === 'superadmin') {
      return true;
    }
  }
  
  return false;
}
