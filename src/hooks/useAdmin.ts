
'use client';

import { UserProfile } from '@/lib/auth-context';

/**
 * Checks if a user profile has administrative privileges.
 * @param profile The user profile to check.
 */
export function checkIsAdmin(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  // Super Admin / Developer Access for specified identity
  if (profile.email === 'arshdeepgrewal1122@gmail.com') return true;
  
  return profile.role === 'admin' || (profile.role as any) === 'superadmin';
}
