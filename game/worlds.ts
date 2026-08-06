/**
 * The 6 worlds shown on the World Select screen. Each world is a full,
 * self-contained 20-level Story Mode. Grassland is always open (it's the
 * starting/home world); every other world unlocks the moment the previous
 * world's 20 levels are finished — that's it, one story flows into the
 * next.
 *
 * There's no separate "mini-game picker" anymore: tapping an unlocked
 * world drops the player straight into ChallengeHub for that world, which
 * always knows exactly which of the 20 levels comes next.
 */

export interface WorldDef {
  id: string;
  label: string;
  tileKey: string; // world-tile-<id>, loaded in BootScene
  bgKey: string; // world-bg-<id>, loaded in BootScene
  levelCount: number; // every world's Story Mode length
}

export const WORLDS: WorldDef[] = [
  { id: 'grassland', label: 'Grassland', tileKey: 'world-tile-grassland', bgKey: 'world-bg-grassland', levelCount: 20 },
  { id: 'forest', label: 'Forest', tileKey: 'world-tile-forest', bgKey: 'world-bg-forest', levelCount: 20 },
  { id: 'ocean', label: 'Ocean', tileKey: 'world-tile-ocean', bgKey: 'world-bg-ocean', levelCount: 20 },
  { id: 'space', label: 'Space', tileKey: 'world-tile-space', bgKey: 'world-bg-space', levelCount: 20 },
  { id: 'candyland', label: 'Candyland', tileKey: 'world-tile-candyland', bgKey: 'world-bg-candyland', levelCount: 20 },
  { id: 'dinoisland', label: 'Dino Island', tileKey: 'world-tile-dinoisland', bgKey: 'world-bg-dinoisland', levelCount: 20 },
];

/** Minimal shape needed to judge completion — matches challenge.ts's WorldProgressState. */
export interface WorldProgressLike {
  levelIndex: number;
}

export function isWorldComplete(world: WorldDef, progress: WorldProgressLike): boolean {
  return progress.levelIndex >= world.levelCount;
}

export function getWorldByIndex(index: number): WorldDef | null {
  return WORLDS[index] ?? null;
}

export function getWorldIndex(worldId: string): number {
  return WORLDS.findIndex((w) => w.id === worldId);
}

/** The world right before this one in the ladder, or null for Grassland (the first world). */
export function getPrevWorld(worldId: string): WorldDef | null {
  const idx = getWorldIndex(worldId);
  return idx <= 0 ? null : WORLDS[idx - 1];
}

/** The world right after this one, or null if this is the last world. */
export function getNextWorld(worldId: string): WorldDef | null {
  const idx = getWorldIndex(worldId);
  if (idx === -1) return null;
  return WORLDS[idx + 1] ?? null;
}
