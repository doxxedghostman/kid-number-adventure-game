import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Nothing to load yet — every scene currently draws its own shapes/text
    // via Phaser.Graphics so the game is fully playable with zero art assets.
    //
    // Once real assets are in (see README "Free art & sound" section for
    // where to get them), load them here, e.g.:
    //   this.load.atlas('dino', 'assets/sprites/dino.png', 'assets/sprites/dino.json');
    //   this.load.audio('pop', 'assets/audio/pop.mp3');
  }

  create() {
    this.scene.start('WorldMap');
  }
}
