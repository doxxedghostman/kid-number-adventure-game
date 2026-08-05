import Phaser from 'phaser';
import { CHALLENGE_LEVELS, ChallengeRunConfig } from '../levels';
import { getChallenge, hasLives, hasSeenStory } from '../challenge';
import { unlockCharacter } from '../progress';

/**
 * No visuals of its own — this scene just decides "what's next" in Challenge
 * Mode and immediately hands off to Story, a mini-game, or WorldMap. Every
 * exit from a Challenge level (via Reward) comes back through here, so all
 * the branching logic (out of hearts? story not seen yet? ladder finished?)
 * lives in exactly one place.
 */
export default class ChallengeHubScene extends Phaser.Scene {
  constructor() {
    super('ChallengeHub');
  }

  create() {
    if (!hasLives()) {
      this.scene.start('ChallengeOver', { resumeScene: 'ChallengeHub' });
      return;
    }

    const state = getChallenge();

    if (state.levelIndex >= CHALLENGE_LEVELS.length) {
      // Ladder complete — show the finale once, then it's just a normal
      // WorldMap visit from here on (nothing loops back into Challenge Mode
      // automatically; re-entering via the map tile starts a fresh run).
      if (!hasSeenStory('finale')) {
        this.scene.start('Story', { storyId: 'finale', nextScene: 'WorldMap' });
      } else {
        this.scene.start('WorldMap');
      }
      return;
    }

    const level = CHALLENGE_LEVELS[state.levelIndex];
    const runConfig: ChallengeRunConfig = {
      levelId: level.id,
      levelIndex: state.levelIndex,
      roundCount: level.roundCount,
      decoyBoost: level.decoyBoost,
      maxMistakes: level.maxMistakes,
      timeLimitSec: level.timeLimitSec,
      coinsPerCorrect: level.coinsPerCorrect,
    };

    if (level.unlockCharacter) {
      // Granted on arriving at the level that introduces that friend (i.e.
      // the story beat where you meet them), not on completing it — so a
      // lives-out retry never takes the unlock away.
      unlockCharacter(level.unlockCharacter);
    }

    if (!hasSeenStory(level.storyId)) {
      const levelStoryStep = {
        storyId: level.storyId,
        nextScene: level.gameKey,
        nextSceneData: { challenge: runConfig },
      };

      // The very first entry into Challenge Mode also gets the intro beat,
      // chained in front of level 1's own story via Story -> Story.
      if (state.levelIndex === 0 && !hasSeenStory('intro')) {
        this.scene.start('Story', { storyId: 'intro', nextScene: 'Story', nextSceneData: levelStoryStep });
        return;
      }

      this.scene.start('Story', levelStoryStep);
      return;
    }

    this.scene.start(level.gameKey, { challenge: runConfig });
  }
}
