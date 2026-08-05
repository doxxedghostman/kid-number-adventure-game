import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { createHud, createNumberTile, celebrate, flyCoins, randomInt, createRoundTimer } from './helpers';
import { completeLevel } from '../progress';
import { loseLife, advanceLevel } from '../challenge';
import { ChallengeRunConfig } from '../levels';

const ROUNDS_PER_LEVEL = 5;
const COINS_PER_CORRECT = 10;
const ANIMAL_EMOJIS = ['🐶', '🐱', '🐰', '🐻', '🐸', '🦆'];

export default class CountAnimalsScene extends Phaser.Scene {
  private round = 0;
  private answer = 0;
  private hud!: ReturnType<typeof createHud>;
  private busy = false;
  private roundObjects: Phaser.GameObjects.GameObject[] = [];
  private challenge?: ChallengeRunConfig;
  private mistakesThisRound = 0;
  private roundTimer?: ReturnType<typeof createRoundTimer>;

  constructor() {
    super('CountAnimals');
  }

  create(data?: { challenge?: ChallengeRunConfig }) {
    this.challenge = data?.challenge;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.skyBlue).setOrigin(0);
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

    const emoji = Phaser.Utils.Array.GetRandom(ANIMAL_EMOJIS);
    this.answer = randomInt(2, 9);
    this.hud.setInstructions(`How many ${this.animalName(emoji)}?`);

    // Scatter the animals in the top field.
    for (let i = 0; i < this.answer; i++) {
      const x = 120 + (i % 4) * 160 + randomInt(-15, 15);
      const y = 260 + Math.floor(i / 4) * 160 + randomInt(-10, 10);
      const sprite = this.add.text(x, y, emoji, { fontSize: '90px' }).setOrigin(0.5);
      this.roundObjects.push(sprite);
    }

    // Answer row: the correct count plus a few decoys, order shuffled.
    // Challenge Mode's decoyBoost adds extra options to choose between.
    const decoyBoost = this.challenge?.decoyBoost ?? 0;
    const optionCount = 4 + decoyBoost;
    const options = new Set<number>([this.answer]);
    while (options.size < optionCount) {
      options.add(randomInt(1, 10));
    }
    const shuffled = Phaser.Utils.Array.Shuffle([...options]);
    const y = GAME_HEIGHT - 260;
    // Spacing shrinks to fit as decoyBoost adds more options, so the row
    // never runs off the sides of the 720px-wide canvas.
    const maxSpacing = 160;
    const spacing = Math.min(maxSpacing, (GAME_WIDTH - 140) / (shuffled.length - 1 || 1));
    const startX = GAME_WIDTH / 2 - (spacing * (shuffled.length - 1)) / 2;
    shuffled.forEach((value, i) => {
      const tile = createNumberTile(this, startX + i * spacing, y, value, { radius: Math.min(65, spacing / 2 - 4) });
      tile.setInteractive(new Phaser.Geom.Circle(0, 0, Math.min(65, spacing / 2 - 4)), Phaser.Geom.Circle.Contains);
      tile.on('pointerdown', () => this.handleAnswer(value, tile));
      this.roundObjects.push(tile);
    });

    if (this.challenge?.timeLimitSec) {
      this.roundTimer = createRoundTimer(this, this.challenge.timeLimitSec, () => this.failRound());
    }
  }

  private handleAnswer(value: number, tile: Phaser.GameObjects.Container) {
    if (this.busy) return;

    if (value === this.answer) {
      this.busy = true;
      this.roundTimer?.destroy();
      celebrate(this, tile.x, tile.y);
      const earned = this.challenge?.coinsPerCorrect ?? COINS_PER_CORRECT;
      flyCoins(this, tile.x, tile.y, earned, () => this.hud.addCoins(earned));
      this.time.delayedCall(600, () => this.nextRound());
    } else {
      this.tweens.add({ targets: tile, scale: 0.9, duration: 100, yoyo: true });

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
        this.scene.start('ChallengeOver', { resumeScene: 'CountAnimals', resumeData: { challenge: this.challenge } });
      } else {
        this.nextRound();
      }
    });
  }

  private animalName(emoji: string) {
    const names: Record<string, string> = {
      '🐶': 'dogs',
      '🐱': 'cats',
      '🐰': 'bunnies',
      '🐻': 'bears',
      '🐸': 'frogs',
      '🦆': 'ducks',
    };
    return names[emoji] ?? 'animals';
  }

  private finishLevel() {
    const roundCount = this.challenge?.roundCount ?? ROUNDS_PER_LEVEL;
    // Coins already credited live via hud.addCoins — pass 0 here so
    // completeLevel only records stars/completion, not coins again.
    const coinsEarned = roundCount * (this.challenge?.coinsPerCorrect ?? COINS_PER_CORRECT);
    const starsEarned = 3;
    if (this.challenge) {
      completeLevel(this.challenge.levelId, 0, starsEarned);
      advanceLevel();
      this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'ChallengeHub' });
    } else {
      completeLevel('world1-count-animals', 0, starsEarned);
      this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldMap' });
    }
  }
}
