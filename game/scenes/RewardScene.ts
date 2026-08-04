import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { celebrate } from './helpers';

interface RewardData {
  coinsEarned: number;
  starsEarned: number;
  nextScene: string;
}

export default class RewardScene extends Phaser.Scene {
  constructor() {
    super('Reward');
  }

  create(data: RewardData) {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.grapePurple).setOrigin(0);

    this.add.image(GAME_WIDTH / 2, 190, 'dino-happy').setScale(0.34).setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 340, 'Great job!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    for (let i = 0; i < (data.starsEarned ?? 3); i++) {
      this.add
        .text(GAME_WIDTH / 2 - 90 + i * 90, 400, '⭐', { fontSize: '80px' })
        .setOrigin(0.5)
        .setScale(0)
        .setAlpha(0);
    }
    this.tweens.addCounter({
      from: 0,
      to: data.starsEarned ?? 3,
      duration: 100,
    });
    this.children.list
      .filter((c) => c instanceof Phaser.GameObjects.Text && (c as Phaser.GameObjects.Text).text === '⭐')
      .forEach((star, i) => {
        this.tweens.add({
          targets: star,
          scale: 1,
          alpha: 1,
          delay: i * 200,
          duration: 300,
          ease: 'Back.Out',
        });
      });

    this.add
      .text(GAME_WIDTH / 2, 520, `🪙 +${data.coinsEarned ?? 0} coins`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    celebrate(this, GAME_WIDTH / 2, 400);

    const continueBtn = this.add
      .rectangle(GAME_WIDTH / 2, 700, 340, 100, COLORS.grassGreen)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(GAME_WIDTH / 2, 700, 'Continue', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    continueBtn.on('pointerdown', () => this.scene.start(data.nextScene ?? 'WorldMap'));
  }
}
