import Phaser from 'phaser';
import { COLORS, PALETTE_CYCLE } from '../theme';
import { GAME_WIDTH } from '../config';

/**
 * Draws a big rounded "tile" with a number on it — used anywhere the game
 * needs to show a numeral (Balloon Pop targets, Number Match cards, Feed
 * Dino's apple count). No image asset needed: it's a Graphics circle + Text,
 * so it costs nothing and is trivial to reskin once real numeral art exists.
 */
export function createNumberTile(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: number,
  opts: { radius?: number; color?: number } = {}
): Phaser.GameObjects.Container {
  const radius = opts.radius ?? 70;
  const color = opts.color ?? PALETTE_CYCLE[value % PALETTE_CYCLE.length];

  const circle = scene.add.circle(0, 0, radius, color).setStrokeStyle(6, COLORS.ink, 0.15);
  const label = scene.add
    .text(0, 0, String(value), {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${Math.round(radius * 1.1)}px`,
      fontStyle: 'bold',
      color: '#ffffff',
    })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [circle, label]);
  container.setSize(radius * 2, radius * 2);
  return container;
}

/** Cheap confetti burst: small colored rectangles that fly out and fade. No image assets required. */
export function celebrate(scene: Phaser.Scene, x: number, y: number) {
  for (let i = 0; i < 18; i++) {
    const color = PALETTE_CYCLE[i % PALETTE_CYCLE.length];
    const piece = scene.add.rectangle(x, y, 14, 14, color);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.Between(80, 220);
    scene.tweens.add({
      targets: piece,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance - 60,
      alpha: 0,
      angle: Phaser.Math.Between(-180, 180),
      duration: Phaser.Math.Between(500, 900),
      ease: 'Cubic.Out',
      onComplete: () => piece.destroy(),
    });
  }
}

/** Coins flying from a point up to the HUD coin counter (top-right of screen). */
export function flyCoins(scene: Phaser.Scene, x: number, y: number, count: number) {
  const coinsToShow = Math.min(count, 8);
  for (let i = 0; i < coinsToShow; i++) {
    const coin = scene.add.circle(x, y, 16, COLORS.sunYellow).setStrokeStyle(3, COLORS.tangerine);
    scene.tweens.add({
      targets: coin,
      x: GAME_WIDTH - 60,
      y: 60,
      scale: 0.4,
      delay: i * 60,
      duration: 500,
      ease: 'Cubic.In',
      onComplete: () => coin.destroy(),
    });
  }
}

/** Standard top HUD: a back-to-map button + an instruction banner. Every mini-game scene uses this. */
export function createHud(scene: Phaser.Scene, instructions: string, onBack: () => void) {
  const backBtn = scene.add.circle(60, 60, 44, COLORS.white, 0.9).setInteractive({ useHandCursor: true });
  scene.add
    .text(60, 60, '←', { fontFamily: 'Arial', fontSize: '40px', color: '#4a3728' })
    .setOrigin(0.5);
  backBtn.on('pointerdown', onBack);

  const banner = scene.add
    .rectangle(GAME_WIDTH / 2, 60, GAME_WIDTH - 200, 76, COLORS.white, 0.9)
    .setStrokeStyle(4, COLORS.ink, 0.1);
  const text = scene.add
    .text(GAME_WIDTH / 2, 60, instructions, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#4a3728',
      align: 'center',
      wordWrap: { width: GAME_WIDTH - 240 },
    })
    .setOrigin(0.5);

  return {
    setInstructions: (newText: string) => text.setText(newText),
  };
}

export function randomInt(min: number, max: number) {
  return Phaser.Math.Between(min, max);
}

/**
 * Small countdown badge for timed Challenge Mode rounds (levels 9-10). Calls
 * onExpire exactly once. Always call .destroy() when a round ends normally —
 * otherwise it can still fire after the scene has moved on to the next round.
 */
export function createRoundTimer(scene: Phaser.Scene, seconds: number, onExpire: () => void) {
  let remaining = seconds;
  let done = false;
  const text = scene.add
    .text(GAME_WIDTH - 70, 140, `⏱ ${remaining}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
    })
    .setOrigin(0.5);

  const event = scene.time.addEvent({
    delay: 1000,
    loop: true,
    callback: () => {
      if (done) return;
      remaining -= 1;
      if (remaining <= 0) {
        text.setText('⏱ 0');
        done = true;
        event.remove();
        onExpire();
      } else {
        text.setText(`⏱ ${remaining}`);
      }
    },
  });

  return {
    destroy: () => {
      done = true;
      event.remove();
      text.destroy();
    },
  };
}
