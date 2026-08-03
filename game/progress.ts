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
