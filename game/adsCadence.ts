import { LEVELS_PER_INTERSTITIAL } from './adsConfig';

const KEY = 'kna-levels-since-ad-v1';

function getCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(window.localStorage.getItem(KEY) ?? '0') || 0;
  } catch {
    return 0;
  }
}

function setCount(n: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, String(n));
}

/**
 * Call once per completed Story Mode level. Returns true exactly when an
 * interstitial is due (and resets the counter) — false otherwise.
 */
export function recordLevelCompletedForAds(): boolean {
  const next = getCount() + 1;
  if (next >= LEVELS_PER_INTERSTITIAL) {
    setCount(0);
    return true;
  }
  setCount(next);
  return false;
}
