import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { createHud, celebrate, flyCoins, randomInt, createRoundTimer, addWorldBackground, completeStoryLevel } from './helpers';
import { completeLevel } from '../progress';
import { loseLife } from '../challenge';
import { ChallengeRunConfig } from '../levels';

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
  private dinoImage!: Phaser.GameObjects.Image;
  private challenge?: ChallengeRunConfig;
  private mistakesThisRound = 0;
  private roundTimer?: ReturnType<typeof createRoundTimer>;

  constructor() {
    super('FeedDino');
  }

  create(data?: { challenge?: ChallengeRunConfig }) {
    this.challenge = data?.challenge;
    addWorldBackground(this, this.challenge?.worldId ?? 'grassland');
    this.round = 0;
    this.hud = createHud(this, '', () => this.scene.start('WorldSelect'));

    // Dino + basket, fixed at the bottom of the screen.
    this.dinoImage = this.add
      .image(GAME_WIDTH / 2 - 60, GAME_HEIGHT - 220, 'dino-idle')
      .setScale(0.32)
      .setOrigin(0.5);
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
    const roundCount = this.challenge?.roundCount ?? ROUNDS_PER_LEVEL;
    if (this.round > roundCount) {
      this.finishLevel();
      return;
    }

    this.apples.forEach((a) => a.destroy());
    this.apples = [];
    this.basketCount = 0;
    this.basketText.setText('0');
    this.busy = false;
    this.mistakesThisRound = 0;
    this.roundTimer?.destroy();
    this.roundTimer = undefined;

    this.target = randomInt(2, 9);
    this.hud.setInstructions(`Dino wants ${this.target} apples!`);

    const decoyBoost = this.challenge?.decoyBoost ?? 0;
    const decoys = randomInt(2, 4) + decoyBoost;
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

    if (this.challenge?.timeLimitSec) {
      this.roundTimer = createRoundTimer(this, this.challenge.timeLimitSec, () => this.failRound());
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
          this.roundTimer?.destroy();
          this.dinoImage.setTexture('dino-happy');
          celebrate(this, GAME_WIDTH / 2 + 140, GAME_HEIGHT - 180);
          const earned = this.challenge?.coinsPerCorrect ?? COINS_PER_CORRECT;
          flyCoins(this, GAME_WIDTH / 2 + 140, GAME_HEIGHT - 180, earned, () => this.hud.addCoins(earned));
          // Remaining decoy apples fade — the round is already won.
          this.apples.forEach((a) => a.active && this.tweens.add({ targets: a, alpha: 0, duration: 300 }));
          this.time.delayedCall(700, () => {
            this.dinoImage.setTexture('dino-idle');
            this.nextRound();
          });
        }
      },
    });
  }

  /** Challenge Mode only: the per-round timer ran out before the basket was filled. */
  private failRound() {
    if (this.busy) return;
    this.busy = true;
    this.hud.setInstructions(`Dino needed ${this.target} apples!`);
    const state = loseLife();
    this.time.delayedCall(1100, () => {
      if (state.lives <= 0) {
        this.scene.start('ChallengeOver', { resumeScene: 'FeedDino', resumeData: { challenge: this.challenge } });
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
      const unlockedWorld = completeStoryLevel(this.challenge.worldId, this.challenge.levelId, starsEarned);
      this.scene.start('Reward', {
        coinsEarned,
        starsEarned,
        nextScene: 'ChallengeHub',
        nextSceneData: { worldId: this.challenge.worldId },
        unlockedWorld,
      });
    } else {
      completeLevel('world1-feed-dino', 0, starsEarned);
      this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldSelect' });
    }
  }
}
