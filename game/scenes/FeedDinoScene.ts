import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { createHud, celebrate, flyCoins, randomInt } from './helpers';
import { completeLevel } from '../progress';

const ROUNDS_PER_LEVEL = 5;
const COINS_PER_CORRECT = 10;

export default class FeedDinoScene extends Phaser.Scene {
  private round = 0;
  private target = 0;
  private basketCount = 0;
  private hud!: ReturnType<typeof createHud>;
  private basketText!: Phaser.GameObjects.Text;
  private apples: Phaser.GameObjects.Text[] = [];
  private busy = false;

  constructor() {
    super('FeedDino');
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.cream).setOrigin(0);
    this.round = 0;
    this.hud = createHud(this, '', () => this.scene.start('WorldMap'));

    // Dino + basket, fixed at the bottom of the screen.
    this.add.text(GAME_WIDTH / 2 - 60, GAME_HEIGHT - 220, '🦕', { fontSize: '140px' }).setOrigin(0.5);
    this.add
      .rectangle(GAME_WIDTH / 2 + 140, GAME_HEIGHT - 180, 200, 120, COLORS.tangerine)
      .setStrokeStyle(4, 0xffffff, 0.6);
    this.basketText = this.add
      .text(GAME_WIDTH / 2 + 140, GAME_HEIGHT - 180, '0', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '56px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.nextRound();
  }

  private nextRound() {
    this.round += 1;
    if (this.round > ROUNDS_PER_LEVEL) {
      this.finishLevel();
      return;
    }

    this.apples.forEach((a) => a.destroy());
    this.apples = [];
    this.basketCount = 0;
    this.basketText.setText('0');
    this.busy = false;

    this.target = randomInt(2, 9);
    this.hud.setInstructions(`Dino wants ${this.target} apples!`);

    const decoys = randomInt(2, 4);
    const total = this.target + decoys;
    const cols = 4;
    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 140 + col * 150;
      const y = 300 + row * 150;
      const apple = this.add.text(x, y, '🍎', { fontSize: '80px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      apple.on('pointerdown', () => this.handleTapApple(apple));
      this.apples.push(apple);
    }
  }

  private handleTapApple(apple: Phaser.GameObjects.Text) {
    if (this.busy || this.basketCount >= this.target) return;

    apple.disableInteractive();
    this.tweens.add({
      targets: apple,
      x: GAME_WIDTH / 2 + 140,
      y: GAME_HEIGHT - 180,
      scale: 0.5,
      duration: 350,
      ease: 'Cubic.In',
      onComplete: () => {
        apple.destroy();
        this.basketCount += 1;
        this.basketText.setText(String(this.basketCount));
        if (this.basketCount === this.target) {
          this.busy = true;
          celebrate(this, GAME_WIDTH / 2 + 140, GAME_HEIGHT - 180);
          flyCoins(this, GAME_WIDTH / 2 + 140, GAME_HEIGHT - 180, COINS_PER_CORRECT);
          // Remaining decoy apples fade — the round is already won.
          this.apples.forEach((a) => a.active && this.tweens.add({ targets: a, alpha: 0, duration: 300 }));
          this.time.delayedCall(700, () => this.nextRound());
        }
      },
    });
  }

  private finishLevel() {
    const coinsEarned = ROUNDS_PER_LEVEL * COINS_PER_CORRECT;
    const starsEarned = 3;
    completeLevel('world1-feed-dino', coinsEarned, starsEarned);
    this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldMap' });
  }
}
