import * as Phaser from 'phaser';
import { COLORS, PALETTE_CYCLE } from '../theme';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { getProgress, addCoins as persistCoins, completeLevel } from '../progress';
import { WORLDS, getNextWorld, isWorldComplete, WorldDef } from '../worlds';
import { advanceLevel } from '../challenge';

/**
 * Cover-fits a world's full-scene background art (landscape, ~960x536) into
 * the portrait 720x1280 canvas: scales to fill the height, crops the sides.
 * Every screen for a given world (map + all its mini-games) calls this with
 * the same worldId so the whole world reads as one consistent place, not a
 * different flat color per screen.
 *
 * `dim` layers a soft white wash on top for legibility — gameplay elements
 * (balloons, apples, HUD text) need to stay readable over busy photo-real
 * art, whereas the World Map's big tiles have their own opaque backing and
 * don't need it.
 */
export function addWorldBackground(scene: Phaser.Scene, worldId: string, dim = true) {
  const bg = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, `world-bg-${worldId}`);
  const scale = GAME_HEIGHT / bg.height;
  bg.setScale(scale);
  if (dim) {
    scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.white, 0.55).setOrigin(0);
  }
  return bg;
}

/**
 * Records a Story Mode level completion within one world and advances that
 * world's own level counter. Returns the next world's WorldDef if this
 * level completion just finished the current world (so Reward can show a
 * "World Unlocked!" celebration), otherwise null. Coins are credited live
 * already (see addCoins on the hud returned by createHud), so this only
 * passes stars/completion through to completeLevel — never coins again.
 */
export function completeStoryLevel(worldId: string, levelId: string, starsEarned: number): WorldDef | null {
  completeLevel(levelId, 0, starsEarned);
  const state = advanceLevel(worldId);
  const world = WORLDS.find((w) => w.id === worldId);
  if (world && isWorldComplete(world, state)) {
    return getNextWorld(worldId);
  }
  return null;
}

/**
 * Rounded "3D" tile body: an offset dark rectangle behind a lighter rounded
 * body, matching the app's CSS button look (border-bottom shadow). Shared by
 * Shared by WorldSelectScene so every tile-grid screen looks the same and
 * there's one place to tweak the style.
 */
export function drawTileBody(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  w: number,
  h: number,
  color: number,
  radius = 28
) {
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.2);
  shadow.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, radius);

  const body = scene.add.graphics();
  body.fillStyle(color, 1);
  body.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
  body.lineStyle(4, 0xffffff, 0.55);
  body.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);

  container.add([shadow, body]);
  return { shadow, body };
}

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

/**
 * Bigger, longer confetti for milestone moments (World Unlocked) — full
 * canvas width, falls from the top instead of bursting from a point, and
 * fires in a few waves so it feels like an event, not just a round-win tick.
 */
export function bigCelebrate(scene: Phaser.Scene) {
  const waves = 3;
  for (let w = 0; w < waves; w++) {
    scene.time.delayedCall(w * 260, () => {
      for (let i = 0; i < 22; i++) {
        const color = PALETTE_CYCLE[Phaser.Math.Between(0, PALETTE_CYCLE.length - 1)];
        const startX = Phaser.Math.Between(20, GAME_WIDTH - 20);
        const piece = scene.add.rectangle(startX, -20, 16, 16, color);
        scene.tweens.add({
          targets: piece,
          y: GAME_HEIGHT + 40,
          x: startX + Phaser.Math.Between(-80, 80),
          angle: Phaser.Math.Between(-360, 360),
          duration: Phaser.Math.Between(1400, 2200),
          ease: 'Cubic.In',
          onComplete: () => piece.destroy(),
        });
      }
    });
  }
}

/**
 * Coins flying from a point up to the HUD coin counter (top-right of screen).
 * `onLanded` fires once, when the last coin arrives — mini-game scenes use
 * this to credit + animate the live coin badge created by `createHud`, so
 * kids actually see their total go up as they earn it instead of coins
 * vanishing into a corner with nothing tracking them.
 */
export function flyCoins(scene: Phaser.Scene, x: number, y: number, count: number, onLanded?: () => void) {
  const coinsToShow = Math.min(count, 8);
  for (let i = 0; i < coinsToShow; i++) {
    const coin = scene.add.circle(x, y, 16, COLORS.sunYellow).setStrokeStyle(3, COLORS.tangerine);
    const isLast = i === coinsToShow - 1;
    scene.tweens.add({
      targets: coin,
      x: GAME_WIDTH - 90,
      y: 60,
      scale: 0.4,
      delay: i * 60,
      duration: 500,
      ease: 'Cubic.In',
      onComplete: () => {
        coin.destroy();
        if (isLast) onLanded?.();
      },
    });
  }
}

/**
 * Standard top HUD: a back-to-map button + an instruction banner + a live
 * coin badge. Every mini-game scene uses this. The coin badge is the thing
 * kids are missing feedback on during play — it starts at their real saved
 * balance and ticks up (with a little pop) every time `addCoins` is called,
 * so earning coins is visible in the moment instead of only at the Reward
 * screen after the whole level is done.
 */
export function createHud(scene: Phaser.Scene, instructions: string, onBack: () => void) {
  const backBtn = scene.add.circle(60, 60, 44, COLORS.white, 0.9).setInteractive({ useHandCursor: true });
  scene.add
    .text(60, 60, '←', { fontFamily: 'Arial', fontSize: '40px', color: '#4a3728' })
    .setOrigin(0.5);
  backBtn.on('pointerdown', onBack);

  // Coin badge, top-right — same spot flyCoins() animates coins toward.
  const coinPill = scene.add
    .rectangle(GAME_WIDTH - 90, 60, 150, 68, COLORS.white, 0.95)
    .setStrokeStyle(3, COLORS.ink, 0.1);
  coinPill.setSize(150, 68);
  const coinLabel = scene.add
    .text(GAME_WIDTH - 90, 60, `🪙 ${getProgress().coins}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#4a3728',
    })
    .setOrigin(0.5);

  const banner = scene.add
    .rectangle(GAME_WIDTH / 2, 60, 360, 76, COLORS.white, 0.9)
    .setStrokeStyle(4, COLORS.ink, 0.1);
  const text = scene.add
    .text(GAME_WIDTH / 2, 60, instructions, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#4a3728',
      align: 'center',
      wordWrap: { width: 320 },
    })
    .setOrigin(0.5);

  return {
    setInstructions: (newText: string) => text.setText(newText),
    /** Persist coins earned AND bump the visible badge with a little pop. */
    addCoins: (amount: number) => {
      persistCoins(amount);
      coinLabel.setText(`🪙 ${getProgress().coins}`);
      scene.tweens.add({
        targets: [coinPill, coinLabel],
        scale: 1.25,
        duration: 120,
        yoyo: true,
        ease: 'Quad.Out',
      });
    },
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
