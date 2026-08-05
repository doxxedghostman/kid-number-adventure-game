/**
 * The 10-level Challenge Mode ladder. Reuses the 4 existing mini-game
 * scenes rather than building new games — difficulty comes from round
 * count, decoy count, mistake tolerance, and (for the last tier) a per-round
 * timer. Number ranges intentionally stay within 1-10 across every level —
 * that range is the whole point of the app, harder levels just demand more
 * accuracy and speed within it, not bigger numbers.
 */

export type MiniGameKey = 'BalloonPop' | 'FeedDino' | 'CountAnimals' | 'NumberMatch';

export interface ChallengeLevel {
  id: string;
  title: string;
  gameKey: MiniGameKey;
  storyId: string;
  roundCount: number;
  decoyBoost: number; // extra decoys/options added on top of a scene's base amount
  maxMistakes: number; // wrong answers allowed in a single round before it's a fail
  timeLimitSec: number | null; // per-round countdown; null = untimed
  coinsPerCorrect: number;
  unlockCharacter?: string; // granted on arriving at this level, ties into progress.unlockedCharacters
}

/** Passed into a mini-game scene's create() data when launched from Challenge Mode. */
export interface ChallengeRunConfig {
  levelId: string;
  levelIndex: number;
  roundCount: number;
  decoyBoost: number;
  maxMistakes: number;
  timeLimitSec: number | null;
  coinsPerCorrect: number;
}

export const CHALLENGE_LEVELS: ChallengeLevel[] = [
  { id: 'challenge-1', title: "Level 1: Bear's Balloons", gameKey: 'BalloonPop', storyId: 'level-1', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'bear' },
  { id: 'challenge-2', title: 'Level 2: Feed the Gang', gameKey: 'FeedDino', storyId: 'level-2', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'monkey' },
  { id: 'challenge-3', title: 'Level 3: Spot the Cat', gameKey: 'CountAnimals', storyId: 'level-3', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'cat' },
  { id: 'challenge-4', title: "Level 4: Elephant's Clue", gameKey: 'NumberMatch', storyId: 'level-4', roundCount: 5, decoyBoost: 0, maxMistakes: 3, timeLimitSec: null, coinsPerCorrect: 10, unlockCharacter: 'elephant' },
  { id: 'challenge-5', title: 'Level 5: Hop After Rabbit', gameKey: 'BalloonPop', storyId: 'level-5', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'rabbit' },
  { id: 'challenge-6', title: 'Level 6: Shy Panda', gameKey: 'FeedDino', storyId: 'level-6', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'panda' },
  { id: 'challenge-7', title: "Level 7: Penguin's Pond", gameKey: 'CountAnimals', storyId: 'level-7', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'penguin' },
  { id: 'challenge-8', title: 'Level 8: Tricky Fox', gameKey: 'NumberMatch', storyId: 'level-8', roundCount: 6, decoyBoost: 2, maxMistakes: 2, timeLimitSec: null, coinsPerCorrect: 12, unlockCharacter: 'fox' },
  { id: 'challenge-9', title: 'Level 9: Windy Finish', gameKey: 'BalloonPop', storyId: 'level-9', roundCount: 7, decoyBoost: 3, maxMistakes: 1, timeLimitSec: 8, coinsPerCorrect: 15 },
  { id: 'challenge-10', title: 'Level 10: Grassland Reunion', gameKey: 'CountAnimals', storyId: 'level-10', roundCount: 7, decoyBoost: 3, maxMistakes: 1, timeLimitSec: 8, coinsPerCorrect: 15 },
];
