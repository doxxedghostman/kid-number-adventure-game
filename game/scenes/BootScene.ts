import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Real Dino sprites (AI-generated, background-stripped — see
    // public/assets/sprites/). Everything else still draws with
    // Phaser.Graphics/emoji until more assets come in — see README
    // "Free art & sound" for where to source them.
    this.load.image('dino-idle', 'assets/sprites/dino-idle.png');
    this.load.image('dino-wave', 'assets/sprites/dino-wave.png');
    this.load.image('dino-happy', 'assets/sprites/dino-happy.png');
    this.load.image('dino-sad', 'assets/sprites/dino-sad.png');
  }

  create() {
    this.scene.start('WorldMap');
  }
}
