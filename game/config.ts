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

// Design-resolution canvas. GAME_WIDTH is fixed; GAME_HEIGHT is derived from
// the *real* device/browser aspect ratio the moment this module first loads
// (client-side only, inside app/play's dynamic import — window is always
// defined by then). Matching the design aspect ratio to the real viewport
// aspect ratio means Phaser.Scale.FIT lands on a scale of ~1 in both axes at
// once, so there's no leftover letterbox strip top/bottom or left/right —
// the canvas always fills the whole screen edge-to-edge. Every scene is
// still built purely against GAME_WIDTH/GAME_HEIGHT (never hardcoded 1280s),
// so this "moves" safely without any scene-by-scene changes.
//
// Clamped to a plausible phone-portrait range (1.5–2.3, i.e. roughly iPad
// Mini portrait through a very tall/narrow phone) so an unusual window
// (desktop browser tab, tablet, landscape) can't stretch the design into
// something absurd — those fall back to a normal small FIT letterbox
// instead, which is the safe/expected behavior there.
function computeGameHeight(width: number): number {
  if (typeof window === 'undefined' || !window.innerWidth || !window.innerHeight) {
    return Math.round(width * (1280 / 720)); // SSR/build-time fallback, never actually rendered
  }
  const rawAspect = window.innerHeight / window.innerWidth;
  const aspect = Math.min(2.3, Math.max(1.5, rawAspect));
  return Math.round(width * aspect);
}

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = computeGameHeight(GAME_WIDTH);

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
