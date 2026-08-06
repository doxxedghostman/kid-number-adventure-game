import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { getProgress } from '../progress';
import { getChallenge, MAX_LIVES } from '../challenge';
import { drawTileBody } from './helpers';

interface GameTile {
  key: string;
  label: string;
  emoji: string;
  color: number;
  iconTexture?: string; // real sprite key, used instead of the emoji when set
}

// MVP scope only (per project doc): Balloon Pop, Feed Dino, Count Animals, Number Match.
// Memory Cards / Fishing / Train / Shape Count / Trace Number are later-update scenes —
// add them here once built, no other wiring needed.
const MVP_GAMES: GameTile[] = [
  { key: 'BalloonPop', label: 'Balloon Pop', emoji: '🎈', color: COLORS.bubblePink, iconTexture: 'balloon-pink' },
  { key: 'FeedDino', label: 'Feed Dino', emoji: '🦕', color: COLORS.grassGreen, iconTexture: 'dino-happy' },
  { key: 'CountAnimals', label: 'Count Animals', emoji: '🐶', color: COLORS.tangerine },
  { key: 'NumberMatch', label: 'Number Match', emoji: '🔢', color: COLORS.grapePurple },
];

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMap');
  }

  create() {
    this.drawBackground();
    this.drawHeader();

    const progress = getProgress();

    // 2x2 grid for the 4 games — replaces the old single-file vertical
    // stack so everything fits above the fold and reads as a deliberate
    // menu rather than a scrolling list.
    const tileW = 300;
    const tileH = 250;
    const colGap = 30;
    const rowGap = 30;
    const col1X = GAME_WIDTH / 2 - tileW / 2 - colGap / 2;
    const col2X = GAME_WIDTH / 2 + tileW / 2 + colGap / 2;
    const row1Y = 400;
    const row2Y = row1Y + tileH + rowGap;

    const positions = [
      { x: col1X, y: row1Y },
      { x: col2X, y: row1Y },
      { x: col1X, y: row2Y },
      { x: col2X, y: row2Y },
    ];

    MVP_GAMES.forEach((game, i) => {
      this.createGameTile(game, positions[i].x, positions[i].y, tileW, tileH, progress.completedLevels, i);
    });

    this.createChallengeTile(GAME_WIDTH / 2, row2Y + tileH / 2 + rowGap + 95);
  }

  private drawBackground() {
    // Real world art, cover-scaled to fill the portrait canvas — same
    // grassland-bg used by the 4 mini-games so the whole world reads as one
    // consistent place instead of a different flat color per screen.
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'world-bg-grassland');
    bg.setScale(GAME_HEIGHT / bg.height);
  }

  private drawHeader() {
    // Title with a soft frosted badge behind it, matching the home menu's title treatment.
    const title = this.add
      .text(GAME_WIDTH / 2, 150, 'World 1: Grassland', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '46px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setShadow(0, 3, 'rgba(0,0,0,0.25)', 4);

    const badge = this.add
      .rectangle(GAME_WIDTH / 2, 150, title.width + 60, 74, 0xffffff, 0.22)
      .setStrokeStyle(2, 0xffffff, 0.3);
    this.children.moveBelow(badge, title);

    const progress = getProgress();
    this.add.rectangle(GAME_WIDTH / 2, 225, 220, 56, 0xffffff, 0.95).setStrokeStyle(3, COLORS.ink, 0.08);
    this.add
      .text(GAME_WIDTH / 2, 225, `⭐ ${progress.stars}   🪙 ${progress.coins}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#4a3728',
      })
      .setOrigin(0.5);

    // Back one level to World Select — the Next.js home menu is now a scene
    // further out, reached from there instead.
    this.add.circle(60, 64, 44, 0x000000, 0.18);
    const backBtn = this.add.circle(60, 60, 44, 0xffffff, 0.95).setInteractive({ useHandCursor: true });
    this.add.text(60, 60, '🗺️', { fontSize: '32px' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: backBtn,
        scale: 0.9,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.scene.start('WorldSelect');
        },
      });
    });
    backBtn.on('pointerover', () => backBtn.setScale(1.06));
    backBtn.on('pointerout', () => backBtn.setScale(1));
  }

  private createGameTile(
    game: GameTile,
    x: number,
    y: number,
    w: number,
    h: number,
    completed: string[],
    index: number
  ) {
    const isDone = completed.some((id) => id.includes(game.key.toLowerCase()));

    const container = this.add.container(x, y);
    const { shadow, body } = drawTileBody(this, container, w, h, game.color);

    const iconBadge = this.add.circle(0, -34, 52, 0xffffff, 0.25);
    const icon: Phaser.GameObjects.Text | Phaser.GameObjects.Image = game.iconTexture
      ? this.add.image(0, -34, game.iconTexture).setScale(76 / (this.textures.get(game.iconTexture).getSourceImage().height))
      : this.add.text(0, -34, game.emoji, { fontSize: '56px' }).setOrigin(0.5);
    const label = this.add
      .text(0, 58, game.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: w - 40 },
      })
      .setOrigin(0.5)
      .setShadow(0, 2, 'rgba(0,0,0,0.15)', 2);

    container.add([iconBadge, icon, label]);

    if (isDone) {
      const star = this.add.text(w / 2 - 26, -h / 2 + 20, '⭐', { fontSize: '32px' }).setOrigin(0.5);
      container.add(star);
    }

    // Gentle idle bounce on the icon, staggered per tile so the grid doesn't pulse in unison.
    this.tweens.add({
      targets: icon,
      y: -42,
      duration: 1400,
      delay: index * 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.03, duration: 100 }));
    container.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 100 }));
    container.on('pointerdown', () => {
      // Squish the tile down onto its shadow — same "press" feel as the CSS buttons elsewhere in the app.
      this.tweens.add({
        targets: body,
        y: 6,
        duration: 70,
        yoyo: true,
      });
      this.tweens.add({
        targets: [iconBadge, icon, label],
        y: '+=6',
        duration: 70,
        yoyo: true,
      });
      shadow.setAlpha(0.5);
      this.time.delayedCall(140, () => this.scene.start(game.key));
    });

    // Staggered entrance so the grid feels alive on arrival instead of popping in flat.
    container.setAlpha(0);
    container.setScale(0.8);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 380,
      delay: index * 90,
      ease: 'Back.Out',
    });
  }

  /** Entry point into the 10-level story ladder. Uses whatever lives/level progress is already saved. */
  private createChallengeTile(x: number, y: number) {
    const w = 630;
    const h = 190;
    const container = this.add.container(x, y);
    const { shadow, body } = drawTileBody(this, container, w, h, COLORS.sunYellow, 32);

    const icon = this.add.text(-220, -8, '⚡', { fontSize: '72px' }).setOrigin(0.5);
    const label = this.add
      .text(30, -30, 'Story Mode', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#4a3728',
      })
      .setOrigin(0.5);

    const lives = getChallenge().lives;
    const heartsText = this.add
      .text(30, 22, '❤️'.repeat(lives) + '🖤'.repeat(MAX_LIVES - lives), { fontSize: '30px' })
      .setOrigin(0.5);

    container.add([icon, label, heartsText]);

    // Small pulsing glow ring to draw the eye to the featured mode.
    const glow = this.add.circle(-220, -8, 60, 0xffffff, 0.35);
    container.addAt(glow, 2);
    this.tweens.add({ targets: glow, scale: 1.25, alpha: 0, duration: 1400, repeat: -1, ease: 'Sine.Out' });

    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.02, duration: 100 }));
    container.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 100 }));
    container.on('pointerdown', () => {
      this.tweens.add({
        targets: body,
        y: 6,
        duration: 70,
        yoyo: true,
      });
      shadow.setAlpha(0.5);
      this.time.delayedCall(140, () => this.scene.start('ChallengeHub'));
    });

    container.setAlpha(0);
    container.setScale(0.85);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 400,
      delay: MVP_GAMES.length * 90,
      ease: 'Back.Out',
    });
  }
}
