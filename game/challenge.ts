/**
 * Local-only session state for Story Mode, split into two independent
 * slots:
 *
 *  - Lives: ONE shared heart pool across the whole game. Losing a heart in
 *    any world's level costs from the same pool — switching worlds isn't a
 *    way to dodge running out of hearts.
 *  - Per-world progress: each world tracks its own levelIndex (which of its
 *    20 levels comes next) and which of its story beats have been seen.
 *    Finishing Grassland doesn't touch Forest's counter, and so on.
 */

import { spendCoins } from './progress';

export const MAX_LIVES = 3;
export const LIFE_REGEN_MS = 10 * 60 * 1000; // one free heart every 10 minutes
export const LIFE_COST_COINS = 15;

const LIVES_KEY = 'kna-lives-v1';
const WORLD_PROGRESS_KEY = 'kna-world-progress-v1';

// ---------------------------------------------------------------------
// Lives (shared across every world)
// ---------------------------------------------------------------------

export interface LivesState {
  lives: number;
  lastLifeLostAt: number | null; // epoch ms; drives the free-regen timer
}

function defaultLives(): LivesState {
  return { lives: MAX_LIVES, lastLifeLostAt: null };
}

/** Applies any free-life regen owed since lastLifeLostAt. Pure — returns a new object only if something changed. */
function applyRegen(state: LivesState): LivesState {
  if (state.lives >= MAX_LIVES || !state.lastLifeLostAt) return state;
  const elapsed = Date.now() - state.lastLifeLostAt;
  const gained = Math.floor(elapsed / LIFE_REGEN_MS);
  if (gained <= 0) return state;
  const newLives = Math.min(MAX_LIVES, state.lives + gained);
  return {
    ...state,
    lives: newLives,
    lastLifeLostAt: newLives >= MAX_LIVES ? null : state.lastLifeLostAt + gained * LIFE_REGEN_MS,
  };
}

function getLives(): LivesState {
  if (typeof window === 'undefined') return defaultLives();
  try {
    const raw = window.localStorage.getItem(LIVES_KEY);
    const parsed: LivesState = raw ? { ...defaultLives(), ...JSON.parse(raw) } : defaultLives();
    const regened = applyRegen(parsed);
    if (regened !== parsed) saveLives(regened);
    return regened;
  } catch {
    return defaultLives();
  }
}

function saveLives(state: LivesState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LIVES_KEY, JSON.stringify(state));
}

export function loseLife(): LivesState {
  const state = getLives();
  const next: LivesState = {
    ...state,
    lives: Math.max(0, state.lives - 1),
    lastLifeLostAt: state.lastLifeLostAt ?? Date.now(),
  };
  saveLives(next);
  return next;
}

export function hasLives(): boolean {
  return getLives().lives > 0;
}

export function msUntilNextLife(): number | null {
  const state = getLives();
  if (state.lives >= MAX_LIVES || !state.lastLifeLostAt) return null;
  const elapsed = Date.now() - state.lastLifeLostAt;
  return Math.max(0, LIFE_REGEN_MS - (elapsed % LIFE_REGEN_MS));
}

export function refillFull(): LivesState {
  const state = getLives();
  const next: LivesState = { ...state, lives: MAX_LIVES, lastLifeLostAt: null };
  saveLives(next);
  return next;
}

/** Spends shared coins for exactly one extra heart. Returns false (spends nothing) if the balance is too low or already full. */
export function buyLifeWithCoins(): boolean {
  const state = getLives();
  if (state.lives >= MAX_LIVES) return false;
  if (!spendCoins(LIFE_COST_COINS)) return false;
  const gained = state.lives + 1;
  saveLives({ ...state, lives: gained, lastLifeLostAt: gained >= MAX_LIVES ? null : state.lastLifeLostAt });
  return true;
}

// ---------------------------------------------------------------------
// Per-world Story Mode progress
// ---------------------------------------------------------------------

export interface WorldProgressState {
  levelIndex: number; // 0-based index into that world's level list — the next level to play
  seenStoryIds: string[];
}

function defaultWorldProgress(): WorldProgressState {
  return { levelIndex: 0, seenStoryIds: [] };
}

function getAllWorldProgressRaw(): Record<string, WorldProgressState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(WORLD_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllWorldProgress(all: Record<string, WorldProgressState>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WORLD_PROGRESS_KEY, JSON.stringify(all));
}

export function getWorldProgress(worldId: string): WorldProgressState {
  const all = getAllWorldProgressRaw();
  return { ...defaultWorldProgress(), ...all[worldId] };
}

function saveWorldProgress(worldId: string, state: WorldProgressState) {
  const all = getAllWorldProgressRaw();
  all[worldId] = state;
  saveAllWorldProgress(all);
}

export function advanceLevel(worldId: string): WorldProgressState {
  const state = getWorldProgress(worldId);
  const next = { ...state, levelIndex: state.levelIndex + 1 };
  saveWorldProgress(worldId, next);
  return next;
}

export function markStorySeen(worldId: string, storyId: string) {
  const state = getWorldProgress(worldId);
  if (state.seenStoryIds.includes(storyId)) return;
  saveWorldProgress(worldId, { ...state, seenStoryIds: [...state.seenStoryIds, storyId] });
}

export function hasSeenStory(worldId: string, storyId: string): boolean {
  return getWorldProgress(worldId).seenStoryIds.includes(storyId);
}
