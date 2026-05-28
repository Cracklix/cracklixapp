"use client";

/**
 * Offline Sync Service
 * Manages local caching of data and synchronization when online.
 */

export const OFFLINE_KEYS = {
  PENDING_ATTEMPTS: 'cracklix_pending_attempts',
  CACHED_MOCKS: 'cracklix_cached_mocks',
  USER_STATS: 'cracklix_user_stats'
};

export function saveForSync(type: string, data: any) {
  const existing = getPendingSync();
  const updated = [...existing, { type, data, timestamp: Date.now() }];
  localStorage.setItem(OFFLINE_KEYS.PENDING_ATTEMPTS, JSON.stringify(updated));
}

export function getPendingSync(): any[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(OFFLINE_KEYS.PENDING_ATTEMPTS);
  return raw ? JSON.parse(raw) : [];
}

export function clearSync() {
  localStorage.removeItem(OFFLINE_KEYS.PENDING_ATTEMPTS);
}

export function cacheData(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCachedData(key: string): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}