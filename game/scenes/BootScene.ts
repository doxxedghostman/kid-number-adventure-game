import * as Phaser from 'phaser';
import { playBackgroundMusic } from './helpers';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Dino (4 poses).
    this.load.image('dino-idle', 'assets/sprites/dino-idle.png');
    this.load.image('dino-wave', 'assets/sprites/dino-wave.png');
    this.load.image('dino-happy', 'assets/sprites/dino-happy.png');
    this.load.image('dino-sad', 'assets/sprites/dino-sad.png');

    // 8 unlockable characters (Challenge Mode story rewards).
    this.load.image('char-bear', 'assets/characters/bear.png');
    this.load.image('char-cat', 'assets/characters/cat.png');
    this.load.image('char-elephant', 'assets/characters/elephant.png');
    this.load.image('char-fox', 'assets/characters/fox.png');
    this.load.image('char-monkey', 'assets/characters/monkey.png');
    this.load.image('char-panda', 'assets/characters/panda.png');
    this.load.image('char-penguin', 'assets/characters/penguin.png');
    this.load.image('char-rabbit', 'assets/characters/rabbit.png');

    // 6 world tiles + 6 full-scene backgrounds. Only Grassland has games
    // built yet, but loading all 6 now means wiring a new world later is
    // just a levels.ts + WORLD entry away — no scene code changes needed.
    const worlds = ['grassland', 'forest', 'ocean', 'space', 'candyland', 'dinoisland'];
    worlds.forEach((w) => {
      this.load.image(`world-tile-${w}`, `assets/worlds/${w}-tile.png`);
      this.load.image(`world-bg-${w}`, `assets/backgrounds/${w}-bg.jpg`);
    });

    // 6 balloon colors + 1 extra (red), see theme.ts BALLOON_TEXTURES.
    const balloonColors = ['red', 'yellow', 'blue', 'green', 'pink', 'purple', 'orange'];
    balloonColors.forEach((c) => this.load.image(`balloon-${c}`, `assets/balloons/balloon-${c}.png`));

    // Glossy 3D UI icons — used for status badges and nav buttons across scenes.
    this.load.image('ui-icon-star', 'assets/ui/icons/icon-star.png');
    this.load.image('ui-icon-play', 'assets/ui/icons/icon-play.png');
    this.load.image('ui-icon-back', 'assets/ui/icons/icon-back.png');
    this.load.image('ui-icon-coin', 'assets/ui/icons/icon-coin.png');
    this.load.image('ui-icon-heart', 'assets/ui/icons/icon-heart.png');

    // Sound effects.
    this.load.audio('sfx-tap', 'assets/sounds/tap.wav');
    this.load.audio('sfx-correct', 'assets/sounds/correct.wav');
    this.load.audio('sfx-wrong', 'assets/sounds/wrong.wav');
    this.load.audio('sfx-fail', 'assets/sounds/fail.wav');
    this.load.audio('sfx-coin', 'assets/sounds/coin.wav');
    this.load.audio('sfx-celebrate', 'assets/sounds/celebrate.wav');
    this.load.audio('sfx-bigwin', 'assets/sounds/bigwin.wav');
    // Plays whenever a level finishes and the Reward screen comes up — a
    // distinct "you did it, next level!" cue on top of the confetti-pop
    // 'celebrate' sound that also fires per-round. Drop the file in as
    // either format; whichever the browser supports gets used.
    this.load.audio('sfx-nextlevel', ['assets/sounds/nextlevel.wav', 'assets/sounds/nextlevel.mp3']);

    // Looping background music for the whole game session. Also accepts
    // either format — mp3 is the better choice for a full-length music
    // loop (much smaller file for the same length than .wav).
    this.load.audio('bgm-main', ['assets/sounds/bgm.mp3', 'assets/sounds/bgm.wav']);
  }

  create() {
    playBackgroundMusic(this);
    this.scene.start('WorldSelect');
  }
}
