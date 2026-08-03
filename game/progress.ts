/**
 * Single source of truth for saved progress. Both the Next.js/React screens
 * (menu, achievements, parent dashboard) and the Phaser scenes read/write
 * through this module so there's only one storage shape to keep in sync.
 */

export const STORAGE_KEY = 'kna-progress-v1';

export interface Progress {
  coins: number;
  stars: number;
  currentWorld: number;
  unlockedCharacters: string[];
  completedLevels: string[]; // e.g. "world1-balloon-pop"
  lastDailyRewardDay: number; // 1-7, cycles
  lastDailyRewardDate: string | null; // ISO date string, to prevent double-claiming same day
  achievements: string[]; // achievement ids unlocked
  stats: {
    levelsCompleted: number;
    totalPlaySeconds: number;
    daysPlayed: number;
  };
}

function defaultProgress(): Progress {
  return {
    coins: 0,
    stars: 0,
    currentWorld: 1,
    unlockedCharacters: ['dino'],
    completedLevels: [],
    lastDailyRewardDay: 0,
    lastDailyRewardDate: null,
    achievements: [],
    stats: {
      levelsCompleted: 0,
      totalPlaySeconds: 0,
      daysPlayed: 0,
    },
  };
}

export function getProgress(): Progress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  // Lets any mounted React component (e.g. CoinCounter) refresh without prop drilling.
  window.dispatchEvent(new CustomEvent('progress-updated'));
}

export function updateProgress(mutator: (p: Progress) => void) {
  const p = getProgress();
  mutator(p);
  saveProgress(p);
}

export function addCoins(amount: number) {
  updateProgress((p) => {
    p.coins += amount;
  });
}

export function completeLevel(levelId: string, coinsEarned: number, starsEarned: number) {
  updateProgress((p) => {
    if (!p.completedLevels.includes(levelId)) {
      p.completedLevels.push(levelId);
      p.stats.levelsCompleted += 1;
    }
    p.coins += coinsEarned;
    p.stars += starsEarned;
  });
}

/**
 * Backup/restore as a short pasteable code — the zero-backend, zero-account
 * answer to "what if the kid gets a new phone". A parent taps "Backup",
 * saves the code somewhere (screenshot, notes app, text to themselves), and
 * can paste it into "Restore" on any other device. No server, no login, no
 * child data ever leaves the device unless the parent copies the code out
 * themselves.
 *
 * The code is just the progress JSON, base64-encoded with a short prefix +
 * checksum so a mistyped/garbled paste fails loudly instead of silently
 * corrupting the save.
 */
const CODE_PREFIX = 'KNA1-';

function checksum(str: string): string {
  // Simple non-cryptographic checksum — just enough to catch a mis-typed
  // or truncated paste, not a security measure.
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export function exportProgressCode(): string {
  const json = JSON.stringify(getProgress());
  const body = typeof window === 'undefined' ? '' : window.btoa(unescape(encodeURIComponent(json)));
  return `${CODE_PREFIX}${body}.${checksum(body)}`;
}

export type ImportResult = { ok: true } | { ok: false; error: string };

export function importProgressCode(rawCode: string): ImportResult {
  const code = rawCode.trim();
  if (!code.startsWith(CODE_PREFIX)) {
    return { ok: false, error: "That doesn't look like a backup code." };
  }

  const withoutPrefix = code.slice(CODE_PREFIX.length);
  const lastDot = withoutPrefix.lastIndexOf('.');
  if (lastDot === -1) {
    return { ok: false, error: 'That code looks incomplete.' };
  }

  const body = withoutPrefix.slice(0, lastDot);
  const providedChecksum = withoutPrefix.slice(lastDot + 1);

  if (checksum(body) !== providedChecksum) {
    return { ok: false, error: "That code looks mistyped — double-check it and try again." };
  }

  try {
    const json = decodeURIComponent(escape(window.atob(body)));
    const parsed = JSON.parse(json);
    saveProgress({ ...defaultProgress(), ...parsed });
    return { ok: true };
  } catch {
    return { ok: false, error: "That code couldn't be read — double-check it and try again." };
  }
}
