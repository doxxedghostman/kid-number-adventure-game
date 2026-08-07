import * as Phaser from 'phaser';
import { getWorldLevels, ChallengeRunConfig } from '../levels';
import { WORLDS } from '../worlds';
import { getWorldProgress, hasLives, hasSeenStory } from '../challenge';
import { unlockCharacter } from '../progress';

interface HubData {
  worldId: string;
}

/**
 * No visuals of its own — this scene just decides "what's next" in this
 * world's Story Mode and immediately hands off to Story, a mini-game, or
 * (once the world's 20 levels are done) back to World Select. Every exit
 * from a level (via Reward) comes back through here with the same worldId,
 * so all the branching logic (out of hearts? story not seen yet? ladder
 * finished?) lives in exactly one place per world.
 */
export default class ChallengeHubScene extends Phaser.Scene {
  constructor() {
    super('ChallengeHub');
  }

  create(data: HubData) {
    const worldId = data.worldId;

    if (!hasLives()) {
      this.scene.start('ChallengeOver', { resumeScene: 'ChallengeHub', resumeData: { worldId } });
      return;
    }

    const levels = getWorldLevels(worldId);
    const progress = getWorldProgress(worldId);

    if (progress.levelIndex >= levels.length) {
      // World's ladder complete — show its finale once, then it's just a
      // normal World Select visit (World Select itself will show the next
      // world unlocked; re-entering this world via its tile starts a fresh
      // run through the same 20 levels for extra practice).
      const finaleId = `${worldId}-finale`;
      if (!hasSeenStory(worldId, finaleId)) {
        this.scene.start('Story', { worldId, storyId: finaleId, nextScene: 'WorldSelect' });
      } else {
        this.scene.start('WorldSelect');
      }
      return;
    }

    const level = levels[progress.levelIndex];
    const runConfig: ChallengeRunConfig = {
      levelId: level.id,
      worldId,
      levelIndex: progress.levelIndex,
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

    if (level.storyId && !hasSeenStory(worldId, level.storyId)) {
      const levelStoryStep = {
        worldId,
        storyId: level.storyId,
        nextScene: level.gameKey,
        nextSceneData: { challenge: runConfig },
      };

      // The very first level of the very first world also gets the game's
      // intro beat, chained in front of that level's own story via
      // Story -> Story.
      const isVeryFirstLevel = worldId === WORLDS[0].id && progress.levelIndex === 0;
      if (isVeryFirstLevel && !hasSeenStory(worldId, 'intro')) {
        this.scene.start('Story', { worldId, storyId: 'intro', nextScene: 'Story', nextSceneData: levelStoryStep });
        return;
      }

      this.scene.start('Story', levelStoryStep);
      return;
    }

    this.scene.start(level.gameKey, { challenge: runConfig });
  }
}
