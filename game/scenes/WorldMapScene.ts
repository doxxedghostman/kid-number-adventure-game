import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { getProgress } from '../progress';

interface GameTile {
  key: string;
  label: string;
  emoji: string;
  color: number;
}

// MVP scope only (per project doc): Balloon Pop, Feed Dino, Count Animals, Number Match.
// Memory Cards / Fishing / Train / Shape Count / Trace Number are later-update scenes —
// add them here once built, no other wiring needed.
const MVP_GAMES: GameTile[] = [
  { key: 'BalloonPop', label: 'Balloon Pop', emoji: '🎈', color: COLORS.bubblePink },
  { key: 'FeedDino', label: 'Feed Dino', emoji: '🦕', color: COLORS.grassGreen },
  { key: 'CountAnimals', label: 'Count Animals', emoji: '🐶', color: COLORS.tangerine },
  { key: 'NumberMatch', label: 'Number Match', emoji: '🔢', color: COLORS.grapePurple },
];

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMap');
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.skyBlue).setOrigin(0);

    // Ground band to suggest "Grassland" without needing a background image yet.
    this.add.rectangle(0, GAME_HEIGHT - 200, GAME_WIDTH, 200, COLORS.grassGreen).setOrigin(0);

    this.add
      .text(GAME_WIDTH / 2, 120, 'World 1: Grassland', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const progress = getProgress();
    this.add
      .text(GAME_WIDTH / 2, 180, `⭐ ${progress.stars}   🪙 ${progress.coins}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const startY = 320;
    const gap = 210;
    MVP_GAMES.forEach((game, i) => {
      this.createGameTile(game, GAME_WIDTH / 2, startY + i * gap, progress.completedLevels);
    });

    // Exit back to the Next.js home menu.
    const backBtn = this.add.circle(60, 60, 44, 0xffffff, 0.9).setInteractive({ useHandCursor: true });
    this.add.text(60, 60, '🏠', { fontSize: '36px' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      window.location.href = '/';
    });
  }

  private createGameTile(game: GameTile, x: number, y: number, completed: string[]) {
    const isDone = completed.some((id) => id.includes(game.key.toLowerCase()));

    const tile = this.add
      .rectangle(x, y, 560, 170, game.color)
      .setStrokeStyle(6, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true });

    this.add.text(x - 220, y, game.emoji, { fontSize: '72px' }).setOrigin(0.5);
    this.add
      .text(x + 20, y, game.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    if (isDone) {
      this.add.text(x + 240, y - 60, '⭐', { fontSize: '40px' }).setOrigin(0.5);
    }

    tile.on('pointerdown', () => {
      tile.setScale(0.97);
      this.time.delayedCall(80, () => this.scene.start(game.key));
    });
    tile.on('pointerover', () => tile.setScale(1.02));
    tile.on('pointerout', () => tile.setScale(1));
  }
}
