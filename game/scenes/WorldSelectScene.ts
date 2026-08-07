import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { WORLDS, getPrevWorld, isWorldComplete } from '../worlds';
import { getWorldProgress } from '../challenge';
import { drawTileBody } from './helpers';

/**
 * The top-level screen reached from Home. Grassland is always open (it's
 * the starting world); every other world unlocks the moment the world
 * before it finishes its own 20-level Story Mode. Tapping any unlocked
 * world drops straight into that world's Story Mode via ChallengeHub —
 * there's no separate mini-game picker screen anymore.
 */
export default class WorldSelectScene extends Phaser.Scene {
  constructor() {
    super('WorldSelect');
  }

  create() {
    this.drawBackground();
    this.drawHeader();

    const tileW = 300;
    const tileH = 280;
    const colGap = 26;
    const rowGap = 26;
    const col1X = GAME_WIDTH / 2 - tileW / 2 - colGap / 2;
    const col2X = GAME_WIDTH / 2 + tileW / 2 + colGap / 2;
    const row1Y = 380;
    const row2Y = row1Y + tileH + rowGap;
    const row3Y = row2Y + tileH + rowGap;
    const positions = [
      { x: col1X, y: row1Y },
      { x: col2X, y: row1Y },
      { x: col1X, y: row2Y },
      { x: col2X, y: row2Y },
      { x: col1X, y: row3Y },
      { x: col2X, y: row3Y },
    ];

    WORLDS.forEach((world, i) => {
      this.createWorldTile(world, positions[i].x, positions[i].y, tileW, tileH, i);
    });
  }

  private drawBackground() {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x8fd8ff, 0x8fd8ff, COLORS.skyBlue, COLORS.skyBlue, 1);
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private drawHeader() {
    const title = this.add
      .text(GAME_WIDTH / 2, 140, 'Choose Your World', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setShadow(0, 3, 'rgba(0,0,0,0.25)', 4);
    const badge = this.add
      .rectangle(GAME_WIDTH / 2, 140, title.width + 60, 70, 0xffffff, 0.22)
      .setStrokeStyle(2, 0xffffff, 0.3);
    this.children.moveBelow(badge, title);

    const { done, total } = this.totalStoryProgress();
    this.add.rectangle(GAME_WIDTH / 2, 210, 280, 52, 0xffffff, 0.95).setStrokeStyle(3, COLORS.ink, 0.08);
    this.add
      .text(GAME_WIDTH / 2, 210, `📖 Story Mode: ${done}/${total} levels`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#4a3728',
      })
      .setOrigin(0.5);

    // Exit to the Next.js home menu — this is now the outermost Phaser screen.
    this.add.circle(60, 64, 44, 0x000000, 0.18);
    const backBtn = this.add.circle(60, 60, 44, 0xffffff, 0.95).setInteractive({ useHandCursor: true });
    this.add.text(60, 60, '🏠', { fontSize: '36px' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: backBtn,
        scale: 0.9,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          window.location.href = '/';
        },
      });
    });
    backBtn.on('pointerover', () => backBtn.setScale(1.06));
    backBtn.on('pointerout', () => backBtn.setScale(1));
  }

  /** Sum of levels finished across every world, out of every world's total. */
  private totalStoryProgress(): { done: number; total: number } {
    let done = 0;
    let total = 0;
    WORLDS.forEach((world) => {
      total += world.levelCount;
      done += Math.min(getWorldProgress(world.id).levelIndex, world.levelCount);
    });
    return { done, total };
  }

  private createWorldTile(
    world: (typeof WORLDS)[number],
    x: number,
    y: number,
    w: number,
    h: number,
    index: number
  ) {
    const prev = getPrevWorld(world.id);
    const unlocked = !prev || isWorldComplete(prev, getWorldProgress(prev.id));
    const myProgress = getWorldProgress(world.id);
    const completed = isWorldComplete(world, myProgress);

    const container = this.add.container(x, y);
    const { shadow, body } = drawTileBody(this, container, w, h, unlocked ? COLORS.white : 0xeef0f2);

    // Every tile gets the same fixed-height footer strip for its name —
    // solid background, never covered by artwork, so it stays readable no
    // matter how busy or dark that world's art is. The art region above it
    // is capped to both the available width AND height so it can never
    // grow tall enough to bleed down into the footer text.
    const footerH = 84;
    const artTop = -h / 2 + 14;
    const artBottom = h / 2 - footerH;
    const artMaxW = w - 32;
    const artMaxH = artBottom - artTop;

    const art = this.add.image(0, (artTop + artBottom) / 2, world.tileKey).setOrigin(0.5);
    art.setScale(Math.min(artMaxW / art.width, artMaxH / art.height));
    if (!unlocked) {
      art.setTint(0x9aa0a6);
      art.setAlpha(0.55);
    }

    const footer = this.add
      .rectangle(0, h / 2 - footerH / 2, w - 16, footerH - 12, unlocked ? 0xffffff : 0xf1f1f1, 1)
      .setStrokeStyle(2, COLORS.ink, 0.06);

    const label = this.add
      .text(0, h / 2 - footerH + 24, world.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: unlocked ? '#4a3728' : '#9a9a9a',
      })
      .setOrigin(0.5);

    container.add([art, footer, label]);

    if (unlocked) {
      const badgeText = completed ? '⭐' : '▶️';
      const badge = this.add.text(w / 2 - 26, -h / 2 + 20, badgeText, { fontSize: '26px' }).setOrigin(0.5);
      container.add(badge);

      const progressLabel = this.add
        .text(0, h / 2 - footerH + 56, `${Math.min(myProgress.levelIndex, world.levelCount)}/${world.levelCount}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '17px',
          color: '#8a8a8a',
        })
        .setOrigin(0.5);
      container.add(progressLabel);
    } else {
      const lockBadge = this.add.circle(w / 2 - 32, -h / 2 + 32, 26, 0xffffff, 0.9);
      const lock = this.add.text(w / 2 - 32, -h / 2 + 32, '🔒', { fontSize: '24px' }).setOrigin(0.5);
      const subtitle = this.add
        .text(0, h / 2 - footerH + 56, `Finish ${prev?.label ?? 'previous world'}'s Story`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          color: '#9a9a9a',
        })
        .setOrigin(0.5);
      container.add([lockBadge, lock, subtitle]);
    }

    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.03, duration: 100 }));
    container.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 100 }));

    // Visual "pressed" feedback fires immediately on touch-down (feels
    // responsive), but the actual navigation only fires on 'pointerup' —
    // and Phaser only emits 'pointerup' on a game object if the pointer is
    // still over that SAME object when it's released. That's the standard,
    // mobile-safe tap pattern: it guarantees a tap can never be attributed
    // to a different tile than the one the finger actually lifted off of.
    container.on('pointerdown', () => {
      this.tweens.add({ targets: body, y: 6, duration: 70, yoyo: true });
      shadow.setAlpha(0.5);
    });
    container.on('pointerup', () => {
      if (!unlocked) {
        this.tweens.add({ targets: container, x: '+=8', duration: 60, yoyo: true, repeat: 2 });
        this.showToast(`🔒 Finish ${prev?.label ?? 'the previous world'}'s Story to unlock ${world.label}!`);
        return;
      }
      this.time.delayedCall(140, () => this.scene.start('ChallengeHub', { worldId: world.id }));
    });

    container.setAlpha(0);
    container.setScale(0.8);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 380,
      delay: index * 80,
      ease: 'Back.Out',
    });
  }

  private showToast(message: string) {
    const bg = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 140, GAME_WIDTH - 100, 100, 0x000000, 0.85)
      .setStrokeStyle(2, 0xffffff, 0.2);
    const text = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 140, message, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 160 },
      })
      .setOrigin(0.5);

    bg.setAlpha(0);
    text.setAlpha(0);
    this.tweens.add({
      targets: [bg, text],
      alpha: 1,
      duration: 150,
      onComplete: () => {
        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: [bg, text],
            alpha: 0,
            duration: 300,
            onComplete: () => {
              bg.destroy();
              text.destroy();
            },
          });
        });
      },
    });
  }
}
