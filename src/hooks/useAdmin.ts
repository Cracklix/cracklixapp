
'use client';

import { UserProfile } from '@/types';
import { User } from 'firebase/auth';

/**
 * Checks if a user has administrative privileges.
 * Strictly prioritizes the master developer emails and then checks Firestore roles.
 */
export function checkIsAdmin(user: User | null, profile: UserProfile | null): boolean {
  if (!user) return false;
  
  // 1. Primary check: Master Admin Emails (Directly from Auth session for speed)
  const masterAdmins = [
    'arshdeepgrewal1122@gmail.com',
    'deepgrewal2600@gmail.com'
  ];
  
  if (user.email && masterAdmins.includes(user.email)) return true;
  
  // 2. Fallback check: Firestore profile role
  if (profile) {
    if (profile.role === 'admin' || profile.role === 'superadmin') {
      return true;
    }
  }
  
  return false;
}
