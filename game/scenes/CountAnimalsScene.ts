import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { createHud, createNumberTile, celebrate, flyCoins, randomInt } from './helpers';
import { completeLevel } from '../progress';

const ROUNDS_PER_LEVEL = 5;
const COINS_PER_CORRECT = 10;
const ANIMAL_EMOJIS = ['🐶', '🐱', '🐰', '🐻', '🐸', '🦆'];

export default class CountAnimalsScene extends Phaser.Scene {
  private round = 0;
  private answer = 0;
  private hud!: ReturnType<typeof createHud>;
  private busy = false;
  private roundObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('CountAnimals');
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.skyBlue).setOrigin(0);
    this.round = 0;
    this.hud = createHud(this, '', () => this.scene.start('WorldMap'));
    this.nextRound();
  }

  private nextRound() {
    this.round += 1;
    if (this.round > ROUNDS_PER_LEVEL) {
      this.finishLevel();
      return;
    }

    this.roundObjects.forEach((o) => o.destroy());
    this.roundObjects = [];
    this.busy = false;

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
    const options = new Set<number>([this.answer]);
    while (options.size < 4) {
      options.add(randomInt(1, 10));
    }
    const shuffled = Phaser.Utils.Array.Shuffle([...options]);
    const y = GAME_HEIGHT - 260;
    const spacing = 160;
    const startX = GAME_WIDTH / 2 - (spacing * (shuffled.length - 1)) / 2;
    shuffled.forEach((value, i) => {
      const tile = createNumberTile(this, startX + i * spacing, y, value, { radius: 65 });
      tile.setInteractive(new Phaser.Geom.Circle(0, 0, 65), Phaser.Geom.Circle.Contains);
      tile.on('pointerdown', () => this.handleAnswer(value, tile));
      this.roundObjects.push(tile);
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

  private handleAnswer(value: number, tile: Phaser.GameObjects.Container) {
    if (this.busy) return;

    if (value === this.answer) {
      this.busy = true;
      celebrate(this, tile.x, tile.y);
      flyCoins(this, tile.x, tile.y, COINS_PER_CORRECT);
      this.time.delayedCall(600, () => this.nextRound());
    } else {
      this.tweens.add({ targets: tile, scale: 0.9, duration: 100, yoyo: true });
    }
  }

  private finishLevel() {
    const coinsEarned = ROUNDS_PER_LEVEL * COINS_PER_CORRECT;
    const starsEarned = 3;
    completeLevel('world1-count-animals', coinsEarned, starsEarned);
    this.scene.start('Reward', { coinsEarned, starsEarned, nextScene: 'WorldMap' });
  }
}
