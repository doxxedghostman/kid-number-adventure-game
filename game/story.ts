import { COLORS } from './theme';

/**
 * Story beats for Challenge Mode. Portraits are emoji-in-a-circle, same
 * "no image asset needed yet" pattern as celebrate()/createNumberTile() in
 * helpers.ts — once the 8 unlockable-character art assets exist, swap
 * `portraitEmoji` for a `this.add.image(...)` call in StoryScene and these
 * data entries barely change.
 *
 * Narrative: a gust of wind scattered Dino's animal friends across
 * Grassland. Each Challenge level "finds" one friend via that level's
 * mini-game, and arriving at the level also unlocks that character in
 * progress.unlockedCharacters (see game/levels.ts + ChallengeHubScene).
 */
export interface StoryBeat {
  speaker: string;
  portraitEmoji: string;
  portraitColor: number;
  lines: string[];
}

export const STORY_BEATS: Record<string, StoryBeat> = {
  intro: {
    speaker: 'Dino',
    portraitEmoji: '🦕',
    portraitColor: COLORS.grassGreen,
    lines: [
      'Oh no! A big gust of wind just blew through Grassland!',
      'All my animal friends got scattered everywhere!',
      'Will you help me find them? Each one needs your counting skills!',
    ],
  },
  'level-1': {
    speaker: 'Dino',
    portraitEmoji: '🦕',
    portraitColor: COLORS.grassGreen,
    lines: ["I hear something behind those balloons...", 'Pop the right one to find Bear!'],
  },
  'level-2': {
    speaker: 'Bear',
    portraitEmoji: '🐻',
    portraitColor: COLORS.tangerine,
    lines: ['You found me! Thank you!', "But now I'm hungry — let's feed the whole gang together!"],
  },
  'level-3': {
    speaker: 'Dino',
    portraitEmoji: '🦕',
    portraitColor: COLORS.grassGreen,
    lines: ["Someone's hiding in the grass...", 'Count carefully to spot Cat!'],
  },
  'level-4': {
    speaker: 'Cat',
    portraitEmoji: '🐱',
    portraitColor: COLORS.grapePurple,
    lines: ['Meow! Elephant left number clues before she wandered off.', 'Match the right group to find her!'],
  },
  'level-5': {
    speaker: 'Elephant',
    portraitEmoji: '🐘',
    portraitColor: COLORS.skyBlue,
    lines: ['Rabbit hopped off with a whole bunch of balloons!', "This one's trickier — good luck!"],
  },
  'level-6': {
    speaker: 'Rabbit',
    portraitEmoji: '🐰',
    portraitColor: COLORS.bubblePink,
    lines: ["Panda's too shy to come out...", 'Maybe if everyone eats together, Panda will join us!'],
  },
  'level-7': {
    speaker: 'Panda',
    portraitEmoji: '🐼',
    portraitColor: COLORS.ink,
    lines: ['Penguin waddled all the way to the pond!', "Count closely, this one's sneaky."],
  },
  'level-8': {
    speaker: 'Penguin',
    portraitEmoji: '🐧',
    portraitColor: COLORS.skyBlue,
    lines: ['Fox is the cleverest of us all.', 'This match will be your trickiest yet!'],
  },
  'level-9': {
    speaker: 'Fox',
    portraitEmoji: '🦊',
    portraitColor: COLORS.tangerine,
    lines: ["Almost everyone's home!", 'One more windy round before we celebrate — stay sharp!'],
  },
  'level-10': {
    speaker: 'Dino',
    portraitEmoji: '🦕',
    portraitColor: COLORS.grassGreen,
    lines: ['This is it — the whole gang is cheering you on!', "One last count and we're all together again!"],
  },
  finale: {
    speaker: 'Dino',
    portraitEmoji: '🎉',
    portraitColor: COLORS.sunYellow,
    lines: [
      'You found everyone! Grassland is whole again!',
      "Thank you for helping all of my friends — you're a counting hero!",
    ],
  },
};
