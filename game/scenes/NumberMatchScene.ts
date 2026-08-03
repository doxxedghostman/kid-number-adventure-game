import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { createHud, createNumberTile, celebrate, flyCoins, randomInt } from './helpers';
import { completeLevel } from '../progress';

const ROUNDS_PER_LEVEL = 5;
const COINS_PER_CORRECT = 10;
const ICON = '🍓';

export default class NumberMatchScene extends Phaser.Scene {
  private round = 0;
  private answer = 0;
  private hud!: ReturnType<typeof createHud>;
  private busy = false;
  private roundObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('NumberMatch');
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.cream).setOrigin(0);
    this.round = 0;
    this.hud = createHud(this, '', () => this.scene.start('WorldMap'));
    this.nextRound();
  }

  private nextRound() {
    this.round += 1;
    if (this.round > ROUNDS_PER_LEVEL) {
      this.finishLevel();
      return;
    }

    this.roundObjects.forEach((o) => o.destroy());
    this.roundObjects = [];
    this.busy = false;

    this.answer = randomInt(2, 9);
    this.hud.setInstructions('Tap the matching group!');

    const numberTile = createNumberTile(this, GAME_WIDTH / 2, 260, this.answer, { radius: 90 });
    this.roundObjects.push(numberTile);

    const counts = new Set<number>([this.answer]);
    while (counts.size < 3) {
      counts.add(randomInt(1, 10));
    }
    const shuffled = Phaser.Utils.Array.Shuffle([...counts]);

    const rowY = [520, 720, 920];
    shuffled.forEach((count, rowIndex) => {
      const y = rowY[rowIndex];
      const zone = this.add
        .rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 120, 150, COLORS.white, 0.7)
        .setStrokeStyle(4, COLORS.ink, 0.1)
        .setInteractive({ useHandCursor: true });
      this.roundObjects.push(zone);

      const icons: Phaser.GameObjects.Text[] = [];
      const spacing = 70;
      const startX = GAME_WIDTH / 2 - (spacing * (count - 1)) / 2;
      for (let i = 0; i < count; i++) {
        const icon = this.add.text(startX + i * spacing, y, ICON, { fontSize: '48px' }).setOrigin(0.5);
        icons.push(icon);
        this.roundObjects.push(icon);
      }

      zone.on('pointerdown', () => this.handleAnswer(count, zone, icons));
    });
  }

  private handleAnswer(count: number, zone: Phaser.GameObjects.Rectangle, icons: Phaser.GameObjects.Text[]) {
    if (this.busy) return;

    if (count === this.answer) {
      this.busy = true;
      celebrate(this, zone.x, zone.y);
      flyCoins(this, zone.x, zone.y, COINS_PER_CORRECT);
      this.time.delayedCall(600, () => this.nextRound());
    } else {
      this.tweens.add({ targets: [zone, ...icons], scale: 0.96, duration: 100, yoyo: true });
    }
  }

  private finishLevel() {
    const coinsEarned = ROUNDS_PER_LEVEL * COINS_PER_CORRECT;
    const starsEarned = 3;
    completeLevel('world1-number-match', coinsEarned, starsEarned);
    this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldMap' });
  }
}
