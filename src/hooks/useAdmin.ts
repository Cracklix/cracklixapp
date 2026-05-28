
'use client';

import { UserProfile } from '@/lib/auth-context';

/**
 * Checks if a user profile has administrative privileges.
 * @param profile The user profile to check.
 */
export function checkIsAdmin(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.role === 'admin' || (profile.role as string) === 'superadmin';
}
