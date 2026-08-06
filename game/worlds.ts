/**
 * The 6 worlds shown on the World Select screen. Only Grassland has actual
 * mini-games built — the rest exist so progress in Story Mode reveals a real
 * roadmap instead of showing all 6 (mostly-empty) worlds from day one.
 *
 * Unlock rule: Grassland is always open (it's the starting/home world).
 * Each of the other 5 worlds unlocks after finishing 2 more Story Mode
 * levels — that's every world tile spent exactly once across the existing
 * 10-level ladder (2,4,6,8,10), no leftover levels or worlds.
 */

import { CHALLENGE_LEVELS } from './levels';
import type { Progress } from './progress';

export interface WorldDef {
  id: string;
  label: string;
  tileKey: string; // world-tile-<id>, loaded in BootScene
  bgKey: string; // world-bg-<id>, loaded in BootScene
  hasGames: boolean; // only Grassland does, for now
  /** Story Mode levels-completed needed to reveal this world. null = always unlocked. */
  unlockAtStoryLevel: number | null;
}

export const WORLDS: WorldDef[] = [
  { id: 'grassland', label: 'Grassland', tileKey: 'world-tile-grassland', bgKey: 'world-bg-grassland', hasGames: true, unlockAtStoryLevel: null },
  { id: 'forest', label: 'Forest', tileKey: 'world-tile-forest', bgKey: 'world-bg-forest', hasGames: false, unlockAtStoryLevel: 2 },
  { id: 'ocean', label: 'Ocean', tileKey: 'world-tile-ocean', bgKey: 'world-bg-ocean', hasGames: false, unlockAtStoryLevel: 4 },
  { id: 'space', label: 'Space', tileKey: 'world-tile-space', bgKey: 'world-bg-space', hasGames: false, unlockAtStoryLevel: 6 },
  { id: 'candyland', label: 'Candyland', tileKey: 'world-tile-candyland', bgKey: 'world-bg-candyland', hasGames: false, unlockAtStoryLevel: 8 },
  { id: 'dinoisland', label: 'Dino Island', tileKey: 'world-tile-dinoisland', bgKey: 'world-bg-dinoisland', hasGames: false, unlockAtStoryLevel: 10 },
];

/** How many of the 10 Story Mode levels have been finished at least once. */
export function storyLevelsCompleted(progress: Progress): number {
  return CHALLENGE_LEVELS.filter((l) => progress.completedLevels.includes(l.id)).length;
}

export function isWorldUnlocked(world: WorldDef, progress: Progress): boolean {
  if (world.unlockAtStoryLevel == null) return true;
  return storyLevelsCompleted(progress) >= world.unlockAtStoryLevel;
}
