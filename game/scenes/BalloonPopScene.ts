import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { BALLOON_TEXTURES } from '../theme';
import { createHud, celebrate, flyCoins, randomInt, createRoundTimer, addWorldBackground } from './helpers';
import { completeLevel } from '../progress';
import { loseLife, advanceLevel } from '../challenge';
import { ChallengeRunConfig } from '../levels';

const ROUNDS_PER_LEVEL = 5;
const COINS_PER_CORRECT = 10;

export default class BalloonPopScene extends Phaser.Scene {
  private round = 0;
  private target = 0;
  private balloons: Phaser.GameObjects.Container[] = [];
  private hud!: ReturnType<typeof createHud>;
  private busy = false;
  private challenge?: ChallengeRunConfig;
  private mistakesThisRound = 0;
  private roundTimer?: ReturnType<typeof createRoundTimer>;

  constructor() {
    super('BalloonPop');
  }

  create(data?: { challenge?: ChallengeRunConfig }) {
    this.challenge = data?.challenge;
    addWorldBackground(this, 'grassland');
    this.round = 0;
    this.hud = createHud(this, '', () => this.scene.start('WorldMap'));
    this.nextRound();
  }

  private nextRound() {
    this.round += 1;
    const roundCount = this.challenge?.roundCount ?? ROUNDS_PER_LEVEL;
    if (this.round > roundCount) {
      this.finishLevel();
      return;
    }

    this.balloons.forEach((b) => b.destroy());
    this.balloons = [];
    this.busy = false;
    this.mistakesThisRound = 0;
    this.roundTimer?.destroy();
    this.roundTimer = undefined;

    this.target = randomInt(1, 10);
    this.hud.setInstructions(`Pop the balloon with ${this.target}!`);

    // Difficulty ramps a little each round: more decoy balloons. Challenge
    // Mode's decoyBoost pushes both the growth rate and the cap further.
    const decoyBoost = this.challenge?.decoyBoost ?? 0;
    const balloonCount = Math.min(4 + this.round + decoyBoost, 8 + decoyBoost, 10);
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

    if (this.challenge?.timeLimitSec) {
      this.roundTimer = createRoundTimer(this, this.challenge.timeLimitSec, () => this.failRound());
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
    const texture = BALLOON_TEXTURES[value % BALLOON_TEXTURES.length];
    // Balloon art is 170x300 (bulb + curly string baked into one image),
    // scaled to a ~150px-wide footprint on the canvas.
    const scale = 150 / 170;
    const body = this.add.image(x, y, texture).setScale(scale).setOrigin(0.5);
    // Label sits over the round bulb, not the image's vertical center
    // (which falls in the string) — bulb center is ~60px above the source
    // image's middle at native size.
    const label = this.add
      .text(x, y - 60 * scale, String(value), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '56px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setShadow(0, 2, 'rgba(0,0,0,0.25)', 3);

    const container = this.add.container(0, 0, [body, label]);
    container.setSize(150, 264);
    body.setInteractive({ useHandCursor: true });

    // Gentle bob so balloons feel alive.
    this.tweens.add({
      targets: [body, label],
      y: '+=18',
      duration: Phaser.Math.Between(1200, 1800),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    body.on('pointerdown', () => this.handleTap(value, x, y, container, body, label));
    this.balloons.push(container);
  }

  private handleTap(
    value: number,
    x: number,
    y: number,
    container: Phaser.GameObjects.Container,
    body: Phaser.GameObjects.Image,
    label: Phaser.GameObjects.Text
  ) {
    if (this.busy) return;

    if (value === this.target) {
      this.busy = true;
      this.roundTimer?.destroy();
      celebrate(this, x, y);
      const earned = this.challenge?.coinsPerCorrect ?? COINS_PER_CORRECT;
      flyCoins(this, x, y, earned, () => this.hud.addCoins(earned));
      body.destroy();
      label.destroy();
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

      // Challenge Mode only: too many misses in one round costs a heart.
      // Outside Challenge Mode, maxMistakes is undefined and kids can keep
      // trying a round forever, exactly as before.
      if (this.challenge) {
        this.mistakesThisRound += 1;
        if (this.mistakesThisRound >= this.challenge.maxMistakes) {
          this.failRound();
        }
      }
    }
  }

  /** Challenge Mode only: round lost (too many misses, or the timer ran out). */
  private failRound() {
    if (this.busy) return;
    this.busy = true;
    this.roundTimer?.destroy();
    this.hud.setInstructions(`The answer was ${this.target}!`);
    const state = loseLife();
    this.time.delayedCall(1100, () => {
      if (state.lives <= 0) {
        this.scene.start('ChallengeOver', { resumeScene: 'BalloonPop', resumeData: { challenge: this.challenge } });
      } else {
        this.nextRound();
      }
    });
  }

  private finishLevel() {
    const roundCount = this.challenge?.roundCount ?? ROUNDS_PER_LEVEL;
    // Coins were already credited live (per correct answer) via hud.addCoins,
    // so completeLevel() here only records stars/completion — passing 0 for
    // coins avoids double-crediting the same coins twice.
    const coinsEarned = roundCount * (this.challenge?.coinsPerCorrect ?? COINS_PER_CORRECT);
    const starsEarned = 3; // TODO: scale by mistakes made, once mistake-tracking is added
    if (this.challenge) {
      completeLevel(this.challenge.levelId, 0, starsEarned);
      advanceLevel();
      this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'ChallengeHub' });
    } else {
      completeLevel('world1-balloon-pop', 0, starsEarned);
      this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldMap' });
    }
  }
}
