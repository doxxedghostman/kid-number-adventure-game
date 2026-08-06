import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { celebrate, bigCelebrate } from './helpers';
import type { WorldDef } from '../worlds';

interface RewardData {
  coinsEarned: number;
  starsEarned: number;
  nextScene: string;
  nextSceneData?: Record<string, unknown>;
  unlockedWorld?: WorldDef | null;
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

    continueBtn.on('pointerdown', () => {
      if (data.unlockedWorld) {
        this.showWorldUnlocked(data.unlockedWorld, data.nextScene ?? 'WorldSelect', data.nextSceneData);
      } else {
        this.scene.start(data.nextScene ?? 'WorldSelect', data.nextSceneData);
      }
    });
  }

  /**
   * A dedicated fanfare beat for crossing a world's unlock threshold —
   * separate from the per-level "Great job!" reward above so unlocking a
   * whole new world reads as a bigger deal than a normal round win.
   * Covers the reward screen, plays a few waves of confetti, bounces the
   * world's real tile art in, then continues to nextScene on tap.
   */
  private showWorldUnlocked(world: WorldDef, nextScene: string, nextSceneData?: Record<string, unknown>) {
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setOrigin(0).setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });

    bigCelebrate(this);

    const panel = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 100, 620, 0xffffff, 0.97)
      .setStrokeStyle(4, COLORS.sunYellow, 1)
      .setScale(0)
      .setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 300, delay: 150, ease: 'Back.Out' });

    const heading = this.add
      .text(GAME_WIDTH / 2, panel.y - 240, '🎉 New World Unlocked! 🎉', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#4a3728',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 180 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const art = this.add.image(GAME_WIDTH / 2, panel.y - 60, world.tileKey).setOrigin(0.5).setAlpha(0).setScale(0);
    const targetArtScale = 320 / art.width;

    const label = this.add
      .text(GAME_WIDTH / 2, panel.y + 150, world.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#4a3728',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.time.delayedCall(300, () => {
      this.tweens.add({ targets: heading, alpha: 1, duration: 250 });
      this.tweens.add({ targets: art, alpha: 1, scale: targetArtScale, duration: 450, ease: 'Back.Out' });
      this.tweens.add({ targets: label, alpha: 1, duration: 250, delay: 150 });
      // Gentle idle bob on the newly-revealed world art, same treatment as
      // the World Select tiles get once actually shown there.
      this.tweens.add({
        targets: art,
        y: '-=14',
        duration: 1200,
        delay: 750,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    });

    const tapHint = this.add
      .text(GAME_WIDTH / 2, panel.y + 260, 'Tap anywhere to continue', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#8a8a8a',
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: tapHint, alpha: 1, duration: 300, delay: 900 });

    overlay.setInteractive();
    overlay.once('pointerdown', () => this.scene.start(nextScene, nextSceneData));
  }
}
