/**
 * Challenge Mode's own save slot — separate from the main `progress.ts` save
 * because lives are a session-recovery mechanic, not permanent progress.
 * Everything here is local-only, same pattern as progress.ts.
 */

import { spendCoins } from './progress';

export const MAX_LIVES = 3;
export const LIFE_REGEN_MS = 10 * 60 * 1000; // one free heart every 10 minutes
export const LIFE_COST_COINS = 15;

const KEY = 'kna-challenge-v1';

export interface ChallengeState {
  levelIndex: number; // 0-based index into CHALLENGE_LEVELS — the next level to play
  lives: number;
  lastLifeLostAt: number | null; // epoch ms; drives the free-regen timer
  seenStoryIds: string[];
}

function defaultState(): ChallengeState {
  return { levelIndex: 0, lives: MAX_LIVES, lastLifeLostAt: null, seenStoryIds: [] };
}

/** Applies any free-life regen owed since lastLifeLostAt. Pure — returns a new object only if something changed. */
function applyRegen(state: ChallengeState): ChallengeState {
  if (state.lives >= MAX_LIVES || !state.lastLifeLostAt) return state;
  const elapsed = Date.now() - state.lastLifeLostAt;
  const gained = Math.floor(elapsed / LIFE_REGEN_MS);
  if (gained <= 0) return state;
  const newLives = Math.min(MAX_LIVES, state.lives + gained);
  return {
    ...state,
    lives: newLives,
    // Below max still: keep the clock running from where it left off instead
    // of resetting it, so partial progress toward the next heart isn't lost.
    lastLifeLostAt: newLives >= MAX_LIVES ? null : state.lastLifeLostAt + gained * LIFE_REGEN_MS,
  };
}

export function getChallenge(): ChallengeState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: ChallengeState = raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    const regened = applyRegen(parsed);
    if (regened !== parsed) saveChallenge(regened);
    return regened;
  } catch {
    return defaultState();
  }
}

export function saveChallenge(state: ChallengeState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function loseLife(): ChallengeState {
  const state = getChallenge();
  const next: ChallengeState = {
    ...state,
    lives: Math.max(0, state.lives - 1),
    lastLifeLostAt: state.lastLifeLostAt ?? Date.now(),
  };
  saveChallenge(next);
  return next;
}

export function hasLives(): boolean {
  return getChallenge().lives > 0;
}

export function msUntilNextLife(): number | null {
  const state = getChallenge();
  if (state.lives >= MAX_LIVES || !state.lastLifeLostAt) return null;
  const elapsed = Date.now() - state.lastLifeLostAt;
  return Math.max(0, LIFE_REGEN_MS - (elapsed % LIFE_REGEN_MS));
}

export function refillFull(): ChallengeState {
  const state = getChallenge();
  const next: ChallengeState = { ...state, lives: MAX_LIVES, lastLifeLostAt: null };
  saveChallenge(next);
  return next;
}

/** Spends shared coins for exactly one extra heart. Returns false (spends nothing) if the balance is too low or already full. */
export function buyLifeWithCoins(): boolean {
  const state = getChallenge();
  if (state.lives >= MAX_LIVES) return false;
  if (!spendCoins(LIFE_COST_COINS)) return false;
  const gained = state.lives + 1;
  saveChallenge({ ...state, lives: gained, lastLifeLostAt: gained >= MAX_LIVES ? null : state.lastLifeLostAt });
  return true;
}

export function advanceLevel(): ChallengeState {
  const state = getChallenge();
  const next = { ...state, levelIndex: state.levelIndex + 1 };
  saveChallenge(next);
  return next;
}

export function markStorySeen(storyId: string) {
  const state = getChallenge();
  if (state.seenStoryIds.includes(storyId)) return;
  saveChallenge({ ...state, seenStoryIds: [...state.seenStoryIds, storyId] });
}

export function hasSeenStory(storyId: string): boolean {
  return getChallenge().seenStoryIds.includes(storyId);
}
