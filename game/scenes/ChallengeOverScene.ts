import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { hasLives, msUntilNextLife, buyLifeWithCoins, refillFull, LIFE_COST_COINS } from '../challenge';
import { getProgress } from '../progress';

interface ChallengeOverData {
  resumeScene: string;
  resumeData?: Record<string, unknown>;
}

export default class ChallengeOverScene extends Phaser.Scene {
  private overData!: ChallengeOverData;
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;

  constructor() {
    super('ChallengeOver');
  }

  create(data: ChallengeOverData) {
    this.overData = data;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.ink, 0.92).setOrigin(0);

    const panel = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 100, 800, COLORS.cream)
      .setStrokeStyle(6, 0xffffff, 0.8);

    const sadDino = this.add.image(GAME_WIDTH / 2, panel.y - 320, 'dino-sad').setOrigin(0.5);
    sadDino.setScale(150 / sadDino.height);
    this.add
      .text(GAME_WIDTH / 2, panel.y - 230, 'Out of Hearts!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#4a3728',
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, panel.y - 170, "That's okay! Get a heart back\nany of these ways:", {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        color: '#4a3728',
        align: 'center',
      })
      .setOrigin(0.5);

    // Option 1: free timer (auto-resumes the moment it ticks over).
    this.timerText = this.add
      .text(GAME_WIDTH / 2, panel.y - 90, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#8a7a68',
        align: 'center',
      })
      .setOrigin(0.5);
    this.updateTimerText();
    this.timerEvent = this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateTimerText() });

    // Option 2: spend coins.
    const canAfford = getProgress().coins >= LIFE_COST_COINS;
    this.makeButton(panel.y + 10, COLORS.tangerine, `🪙 Use ${LIFE_COST_COINS} Coins`, canAfford, () => {
      if (buyLifeWithCoins()) this.resumeIfPossible();
    });

    // Option 3: watch a rewarded ad — stubbed until AdMob is wired in
    // (per the project's own "ads last" decision). Everything downstream
    // (full refill + resume) is already correct; swapping the stub for a
    // real rewarded-video call is a one-line change later.
    this.makeButton(panel.y + 130, COLORS.grapePurple, '🎬 Watch Ad for Full Refill', true, () => this.showAdStub());

    const backBtn = this.add
      .text(GAME_WIDTH / 2, panel.y + 330, '⬅ Back to Map', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        color: '#8a7a68',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('WorldSelect'));
  }

  private makeButton(y: number, color: number, label: string, enabled: boolean, onTap: () => void) {
    const btn = this.add
      .rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 200, 96, color, enabled ? 1 : 0.4)
      .setStrokeStyle(4, 0xffffff, 0.7);
    this.add
      .text(GAME_WIDTH / 2, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    if (enabled) {
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', onTap);
    }
  }

  private updateTimerText() {
    if (hasLives()) {
      this.resumeIfPossible();
      return;
    }
    const ms = msUntilNextLife();
    if (ms === null) {
      this.timerText.setText('');
      return;
    }
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    this.timerText.setText(`⏳ Next free heart in ${mins}:${secs.toString().padStart(2, '0')}`);
  }

  private showAdStub() {
    this.timerText.setText('');
    const loading = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 380, 'Loading ad...', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#8a7a68',
      })
      .setOrigin(0.5);
    this.time.delayedCall(1200, () => {
      loading.destroy();
      refillFull();
      this.resumeIfPossible();
    });
  }

  private resumeIfPossible() {
    if (!hasLives()) return;
    this.timerEvent?.remove();
    this.scene.start(this.overData.resumeScene, this.overData.resumeData);
  }
}
