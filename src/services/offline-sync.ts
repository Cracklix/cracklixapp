
"use client";

/**
 * Offline Sync Service
 * Manages local caching of data and synchronization when online.
 */

export const OFFLINE_KEYS = {
  PENDING_ATTEMPTS: 'cracklix_pending_attempts',
  CACHED_MOCKS: 'cracklix_cached_mocks',
  USER_STATS: 'cracklix_user_stats',
  ACTIVE_MOCK_STATE: 'cracklix_active_mock_state'
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

// Logic for saving/restoring active mock session
export function saveActiveMockState(mockId: string, state: any) {
  localStorage.setItem(OFFLINE_KEYS.ACTIVE_MOCK_STATE, JSON.stringify({ mockId, state, updatedAt: Date.now() }));
}

export function getActiveMockState(mockId: string) {
  const raw = localStorage.getItem(OFFLINE_KEYS.ACTIVE_MOCK_STATE);
  if (!raw) return null;
  const data = JSON.parse(raw);
  return data.mockId === mockId ? data.state : null;
}

export function clearActiveMockState() {
  localStorage.removeItem(OFFLINE_KEYS.ACTIVE_MOCK_STATE);
}
