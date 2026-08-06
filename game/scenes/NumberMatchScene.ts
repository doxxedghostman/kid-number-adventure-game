import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { createHud, createNumberTile, celebrate, flyCoins, randomInt, createRoundTimer, addWorldBackground, completeStoryLevel } from './helpers';
import { completeLevel } from '../progress';
import { loseLife, advanceLevel } from '../challenge';
import { ChallengeRunConfig } from '../levels';

const ROUNDS_PER_LEVEL = 5;
const COINS_PER_CORRECT = 10;
const ICON = '🍓';

export default class NumberMatchScene extends Phaser.Scene {
  private round = 0;
  private answer = 0;
  private hud!: ReturnType<typeof createHud>;
  private busy = false;
  private roundObjects: Phaser.GameObjects.GameObject[] = [];
  private challenge?: ChallengeRunConfig;
  private mistakesThisRound = 0;
  private roundTimer?: ReturnType<typeof createRoundTimer>;

  constructor() {
    super('NumberMatch');
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

    this.roundObjects.forEach((o) => o.destroy());
    this.roundObjects = [];
    this.busy = false;
    this.mistakesThisRound = 0;
    this.roundTimer?.destroy();
    this.roundTimer = undefined;

    this.answer = randomInt(2, 9);
    this.hud.setInstructions('Tap the matching group!');

    const numberTile = createNumberTile(this, GAME_WIDTH / 2, 260, this.answer, { radius: 90 });
    this.roundObjects.push(numberTile);

    // NumberMatch's layout is fixed at 3 answer rows — decoyBoost doesn't
    // apply here (no room to add more rows). Difficulty for this game comes
    // from roundCount/coins/mistake-tolerance instead, set in levels.ts.
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

    if (this.challenge?.timeLimitSec) {
      this.roundTimer = createRoundTimer(this, this.challenge.timeLimitSec, () => this.failRound());
    }
  }

  private handleAnswer(count: number, zone: Phaser.GameObjects.Rectangle, icons: Phaser.GameObjects.Text[]) {
    if (this.busy) return;

    if (count === this.answer) {
      this.busy = true;
      this.roundTimer?.destroy();
      celebrate(this, zone.x, zone.y);
      const earned = this.challenge?.coinsPerCorrect ?? COINS_PER_CORRECT;
      flyCoins(this, zone.x, zone.y, earned, () => this.hud.addCoins(earned));
      this.time.delayedCall(600, () => this.nextRound());
    } else {
      this.tweens.add({ targets: [zone, ...icons], scale: 0.96, duration: 100, yoyo: true });

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
    this.hud.setInstructions(`The answer was ${this.answer}!`);
    const state = loseLife();
    this.time.delayedCall(1100, () => {
      if (state.lives <= 0) {
        this.scene.start('ChallengeOver', { resumeScene: 'NumberMatch', resumeData: { challenge: this.challenge } });
      } else {
        this.nextRound();
      }
    });
  }

  private finishLevel() {
    const roundCount = this.challenge?.roundCount ?? ROUNDS_PER_LEVEL;
    // Coins already credited live via hud.addCoins — pass 0 here so
    // completeLevel only records stars/completion, not coins again.
    const coinsEarned = roundCount * (this.challenge?.coinsPerCorrect ?? COINS_PER_CORRECT);
    const starsEarned = 3;
    if (this.challenge) {
      const unlockedWorld = completeStoryLevel(this.challenge.levelId, starsEarned);
      advanceLevel();
      this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'ChallengeHub', unlockedWorld });
    } else {
      completeLevel('world1-number-match', 0, starsEarned);
      this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldMap' });
    }
  }
}
