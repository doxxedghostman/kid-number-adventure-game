import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS, PALETTE_CYCLE } from '../theme';
import { createHud, celebrate, flyCoins, randomInt } from './helpers';
import { completeLevel } from '../progress';

const ROUNDS_PER_LEVEL = 5;
const COINS_PER_CORRECT = 10;

export default class BalloonPopScene extends Phaser.Scene {
  private round = 0;
  private target = 0;
  private balloons: Phaser.GameObjects.Container[] = [];
  private hud!: ReturnType<typeof createHud>;
  private busy = false;

  constructor() {
    super('BalloonPop');
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.skyBlue).setOrigin(0);
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

    this.balloons.forEach((b) => b.destroy());
    this.balloons = [];
    this.busy = false;

    this.target = randomInt(1, 10);
    this.hud.setInstructions(`Pop the balloon with ${this.target}!`);

    // Difficulty ramps a little each round: more decoy balloons.
    const balloonCount = Math.min(4 + this.round, 8);
    const values = new Set<number>([this.target]);
    while (values.size < balloonCount) {
      values.add(randomInt(1, 10));
    }

    const positions = this.layoutPositions(values.size);
    let i = 0;
    for (const value of values) {
      const { x, y } = positions[i];
      this.spawnBalloon(x, y, value);
      i += 1;
    }
  }

  private layoutPositions(count: number): { x: number; y: number }[] {
    const cols = 2;
    const rows = Math.ceil(count / cols);
    const marginX = 160;
    const marginY = 260;
    const spacingX = (GAME_WIDTH - marginX * 2) / (cols - 1 || 1);
    const spacingY = (GAME_HEIGHT - marginY - 200) / (rows - 1 || 1);
    const pts: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (pts.length >= count) break;
        pts.push({
          x: marginX + c * spacingX + randomInt(-20, 20),
          y: marginY + r * spacingY + randomInt(-15, 15),
        });
      }
    }
    return Phaser.Utils.Array.Shuffle(pts);
  }

  private spawnBalloon(x: number, y: number, value: number) {
    const color = PALETTE_CYCLE[value % PALETTE_CYCLE.length];
    const string = this.add.rectangle(x, y + 95, 3, 60, 0x999999);
    const body = this.add.ellipse(x, y, 130, 160, color).setStrokeStyle(4, 0xffffff, 0.6);
    const label = this.add
      .text(x, y, String(value), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const container = this.add.container(0, 0, [string, body, label]);
    container.setSize(130, 220);
    body.setInteractive({ useHandCursor: true });

    // Gentle bob so balloons feel alive.
    this.tweens.add({
      targets: [body, label, string],
      y: '+=18',
      duration: Phaser.Math.Between(1200, 1800),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    body.on('pointerdown', () => this.handleTap(value, x, y, container, body, label, string));
    this.balloons.push(container);
  }

  private handleTap(
    value: number,
    x: number,
    y: number,
    container: Phaser.GameObjects.Container,
    body: Phaser.GameObjects.Ellipse,
    label: Phaser.GameObjects.Text,
    string: Phaser.GameObjects.Rectangle
  ) {
    if (this.busy) return;

    if (value === this.target) {
      this.busy = true;
      celebrate(this, x, y);
      flyCoins(this, x, y, COINS_PER_CORRECT);
      body.destroy();
      label.destroy();
      string.destroy();
      this.time.delayedCall(500, () => this.nextRound());
    } else {
      // "Funny pop" for a wrong guess: it wobbles and shrinks briefly instead
      // of vanishing — wrong answers aren't punished, just gently corrected.
      this.tweens.add({
        targets: [body, label],
        scale: 0.85,
        angle: Phaser.Math.Between(-10, 10),
        duration: 120,
        yoyo: true,
      });
    }
  }

  private finishLevel() {
    const coinsEarned = ROUNDS_PER_LEVEL * COINS_PER_CORRECT;
    const starsEarned = 3; // TODO: scale by mistakes made, once mistake-tracking is added
    completeLevel('world1-balloon-pop', coinsEarned, starsEarned);
    this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldMap' });
  }
}
