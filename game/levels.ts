/**
 * Every world's Story Mode ladder — 20 levels per world, 6 worlds. Reuses
 * the 4 existing mini-game scenes rather than building new games per world;
 * each world gets its own background, title flavor, and story beats so it
 * still feels like a different place, and difficulty ramps the same way in
 * every world (round count, decoy count, mistake tolerance, and a per-round
 * timer for the last stretch). Number ranges intentionally stay within
 * 1-10 across every level in every world — that range is the whole point
 * of the app, harder levels just demand more accuracy and speed within it,
 * not bigger numbers.
 *
 * Grassland's first 10 levels are hand-authored (they carry the original
 * "find your scattered animal friends" story and the 8 character unlocks).
 * Everything else — Grassland's levels 11-20, and all 20 levels of the
 * other 5 worlds — comes from the generator below, using per-world title
 * flavor and a light story beat only at a level's start/midpoint/finale.
 */

import { WORLDS } from './worlds';

export type MiniGameKey = 'BalloonPop' | 'FeedDino' | 'CountAnimals' | 'NumberMatch';

export interface ChallengeLevel {
  id: string;
  worldId: string;
  title: string;
  gameKey: MiniGameKey;
  /** Only milestone levels (world welcome/checkpoint, or Grassland's original 1-10) have a story beat. */
  storyId?: string;
  roundCount: number;
  decoyBoost: number; // extra decoys/options added on top of a scene's base amount
  maxMistakes: number; // wrong answers allowed in a single round before it's a fail
  timeLimitSec: number | null; // per-round countdown; null = untimed
  coinsPerCorrect: number;
  unlockCharacter?: string; // granted on arriving at this level, ties into progress.unlockedCharacters
}

/** Passed into a mini-game scene's create() data when launched from Story Mode. */
export interface ChallengeRunConfig {
  levelId: string;
  worldId: string;
  levelIndex: number;
  roundCount: number;
  decoyBoost: number;
  maxMistakes: number;
  timeLimitSec: number | null;
  coinsPerCorrect: number;
}

// ---------------------------------------------------------------------
// Difficulty curve — 4 tiers of 5 levels each, same shape in every world.
// ---------------------------------------------------------------------

interface DifficultyTier {
  roundCount: number;
  decoyBoost: number;
  maxMistakes: number;
  timeLimitSec: number | null;
  coinsPerCorrect: number;
}

const TIERS: DifficultyTier[] = [
  { roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10 }, // 1-5
  { roundCount: 6, decoyBoost: 1, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 12 }, // 6-10
  { roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 14 }, // 11-15
  { roundCount: 7, decoyBoost: 3, maxMistakes: 1, timeLimitSec: 8, coinsPerCorrect: 16 }, // 16-20
];

function tierFor(levelNumber: number): DifficultyTier {
  const idx = Math.min(TIERS.length - 1, Math.floor((levelNumber - 1) / 5));
  return TIERS[idx];
}

const GAME_CYCLE: MiniGameKey[] = ['BalloonPop', 'FeedDino', 'CountAnimals', 'NumberMatch'];

function gameKeyFor(levelNumber: number): MiniGameKey {
  return GAME_CYCLE[(levelNumber - 1) % GAME_CYCLE.length];
}

const WORLD_FLAVOR: Record<string, string[]> = {
  grassland: ['Sunny Return', 'Buzzing Bees', 'Picnic Time', 'Butterfly Trail', 'Meadow Games', 'Haystack Hunt', 'Garden Party', 'Rolling Hills', 'Daisy Chain', 'Golden Field'],
  forest: ['Whispering Woods', 'Mossy Path', 'Acorn Hunt', 'Firefly Glow', 'Hidden Grove', 'Tall Pines', 'Berry Patch', "Owl's Watch", 'Foggy Trail', 'Old Oak'],
  ocean: ['Tide Pools', 'Coral Reef', 'Sandy Shore', 'Bubble Trail', 'Shipwreck Cove', 'Starfish Bay', 'Splashy Surf', 'Pearl Dive', 'Wavy Current', "Dolphin Song"],
  space: ['Star Hop', 'Comet Chase', 'Moon Base', 'Asteroid Field', 'Nebula Drift', 'Rocket Launch', 'Galaxy Trail', 'Meteor Shower', 'Cosmic Orbit', 'Stardust Path'],
  candyland: ['Lollipop Lane', 'Gumdrop Hill', 'Chocolate River', 'Cotton Candy Cloud', 'Peppermint Path', 'Jellybean Jungle', 'Caramel Cave', 'Sprinkle Storm', 'Sugar Rush', 'Candy Castle'],
  dinoisland: ['Fossil Field', 'Volcano Ridge', 'Jungle Roar', 'Egg Hunt', 'Stomping Grounds', 'Ancient Cave', 'Paw Print Trail', 'Dino Nest', 'Tar Pit', 'Prehistoric Peak'],
};

function flavorFor(worldId: string, levelNumber: number): string {
  const bank = WORLD_FLAVOR[worldId] ?? ['Adventure'];
  return bank[(levelNumber - 1) % bank.length];
}

function worldLabel(worldId: string): string {
  return WORLDS.find((w) => w.id === worldId)?.label ?? worldId;
}

function buildLevel(worldId: string, levelNumber: number, overrides: Partial<ChallengeLevel> = {}): ChallengeLevel {
  const tier = tierFor(levelNumber);
  return {
    id: `${worldId}-level-${levelNumber}`,
    worldId,
    title: `${worldLabel(worldId)} ${levelNumber}: ${flavorFor(worldId, levelNumber)}`,
    gameKey: gameKeyFor(levelNumber),
    roundCount: tier.roundCount,
    decoyBoost: tier.decoyBoost,
    maxMistakes: tier.maxMistakes,
    timeLimitSec: tier.timeLimitSec,
    coinsPerCorrect: tier.coinsPerCorrect,
    ...overrides,
  };
}

// ---------------------------------------------------------------------
// Grassland's original hand-authored 10 levels (unchanged content) — the
// "find your scattered animal friends" story, 8 character unlocks.
// ---------------------------------------------------------------------

const GRASSLAND_HAND_LEVELS: Omit<ChallengeLevel, 'worldId'>[] = [
  { id: 'grassland-level-1', title: "Level 1: Bear's Balloons", gameKey: 'BalloonPop', storyId: 'level-1', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'bear' },
  { id: 'grassland-level-2', title: 'Level 2: Feed the Gang', gameKey: 'FeedDino', storyId: 'level-2', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'monkey' },
  { id: 'grassland-level-3', title: 'Level 3: Spot the Cat', gameKey: 'CountAnimals', storyId: 'level-3', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'cat' },
  { id: 'grassland-level-4', title: "Level 4: Elephant's Clue", gameKey: 'NumberMatch', storyId: 'level-4', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'elephant' },
  { id: 'grassland-level-5', title: 'Level 5: Hop After Rabbit', gameKey: 'BalloonPop', storyId: 'level-5', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'rabbit' },
  { id: 'grassland-level-6', title: 'Level 6: Shy Panda', gameKey: 'FeedDino', storyId: 'level-6', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'panda' },
  { id: 'grassland-level-7', title: "Level 7: Penguin's Pond", gameKey: 'CountAnimals', storyId: 'level-7', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'penguin' },
  { id: 'grassland-level-8', title: 'Level 8: Tricky Fox', gameKey: 'NumberMatch', storyId: 'level-8', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'fox' },
  { id: 'grassland-level-9', title: 'Level 9: Windy Finish', gameKey: 'BalloonPop', storyId: 'level-9', roundCount: 7, decoyBoost: 3, maxMistakes: 1, timeLimitSec: 8, coinsPerCorrect: 15 },
  { id: 'grassland-level-10', title: 'Level 10: Grassland Reunion', gameKey: 'CountAnimals', storyId: 'level-10', roundCount: 7, decoyBoost: 3, maxMistakes: 1, timeLimitSec: 8, coinsPerCorrect: 15 },
];

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

/** Every level for one world, in play order. Computed on each call — cheap, no need to cache. */
export function getWorldLevels(worldId: string): ChallengeLevel[] {
  const world = WORLDS.find((w) => w.id === worldId);
  const count = world?.levelCount ?? 20;

  if (worldId === 'grassland') {
    const levels: ChallengeLevel[] = GRASSLAND_HAND_LEVELS.map((l) => ({ ...l, worldId: 'grassland' }));
    for (let n = levels.length + 1; n <= count; n++) {
      levels.push(buildLevel('grassland', n));
    }
    return levels;
  }

  const levels: ChallengeLevel[] = [];
  for (let n = 1; n <= count; n++) {
    const overrides: Partial<ChallengeLevel> = {};
    if (n === 1) overrides.storyId = `${worldId}-welcome`;
    if (n === 11) overrides.storyId = `${worldId}-checkpoint`;
    levels.push(buildLevel(worldId, n, overrides));
  }
  return levels;
}
