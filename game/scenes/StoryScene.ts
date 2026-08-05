import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { COLORS } from '../theme';
import { STORY_BEATS, StoryBeat } from '../story';
import { markStorySeen } from '../challenge';

interface StoryData {
  storyId: string;
  nextScene: string;
  nextSceneData?: Record<string, unknown>;
}

export default class StoryScene extends Phaser.Scene {
  private lineIndex = 0;
  private storyData!: StoryData;
  private lineText!: Phaser.GameObjects.Text;

  constructor() {
    super('Story');
  }

  create(data: StoryData) {
    this.storyData = data;
    this.lineIndex = 0;
    const beat = STORY_BEATS[data.storyId];

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.ink, 0.92).setOrigin(0);

    const panel = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 100, 560, COLORS.cream)
      .setStrokeStyle(6, 0xffffff, 0.8);

    const portraitY = panel.y - 200;
    this.add.circle(GAME_WIDTH / 2, portraitY, 90, beat.portraitColor).setStrokeStyle(6, 0xffffff, 0.8);
    this.add.text(GAME_WIDTH / 2, portraitY, beat.portraitEmoji, { fontSize: '90px' }).setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, portraitY + 130, beat.speaker, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#4a3728',
      })
      .setOrigin(0.5);

    this.lineText = this.add
      .text(GAME_WIDTH / 2, portraitY + 210, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        color: '#4a3728',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 220 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(GAME_WIDTH / 2, panel.y + panel.height / 2 - 50, 'Tap to continue ▶', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#8a7a68',
      })
      .setOrigin(0.5);

    this.showLine(beat);
    this.input.on('pointerdown', () => this.advance(beat));
  }

  private showLine(beat: StoryBeat) {
    this.lineText.setText(beat.lines[this.lineIndex]);
  }

  private advance(beat: StoryBeat) {
    this.lineIndex += 1;
    if (this.lineIndex < beat.lines.length) {
      this.showLine(beat);
      return;
    }
    markStorySeen(this.storyData.storyId);
    this.input.off('pointerdown');
    this.scene.start(this.storyData.nextScene, this.storyData.nextSceneData);
  }
}
