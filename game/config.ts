import * as Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import WorldSelectScene from './scenes/WorldSelectScene';
import BalloonPopScene from './scenes/BalloonPopScene';
import FeedDinoScene from './scenes/FeedDinoScene';
import CountAnimalsScene from './scenes/CountAnimalsScene';
import NumberMatchScene from './scenes/NumberMatchScene';
import RewardScene from './scenes/RewardScene';
import StoryScene from './scenes/StoryScene';
import ChallengeHubScene from './scenes/ChallengeHubScene';
import ChallengeOverScene from './scenes/ChallengeOverScene';

// Design-resolution canvas; Phaser.Scale.FIT letterboxes/scales it to whatever
// the phone/browser gives us, so every scene can be built against these fixed
// coordinates without worrying about device size.
export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export function createGameConfig(parent: string | HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#4fc3f7',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [
      BootScene,
      WorldSelectScene,
      BalloonPopScene,
      FeedDinoScene,
      CountAnimalsScene,
      NumberMatchScene,
      RewardScene,
      StoryScene,
      ChallengeHubScene,
      ChallengeOverScene,
    ],
  };
}
