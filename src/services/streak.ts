
/**
 * Streak Service
 * Logic for calculating and maintaining user activity streaks.
 */

export function calculateStreak(lastAttempt: number) {
  const oneDay = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = now - lastAttempt;

  // If the difference is less than or equal to 24 hours, the streak continues
  if (diff <= oneDay) {
    return true;
  }

  return false;
}
