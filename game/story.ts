import { COLORS } from './theme';

/**
 * Story beats for Challenge Mode. Portraits use the real character art
 * loaded in BootScene (dino-*, char-*) — see StoryScene's portrait circle.
 *
 * Narrative: a gust of wind scattered Dino's animal friends across
 * Grassland. Each Challenge level "finds" one friend via that level's
 * mini-game, and arriving at the level also unlocks that character in
 * progress.unlockedCharacters (see game/levels.ts + ChallengeHubScene).
 */
export interface StoryBeat {
  speaker: string;
  /** Texture key loaded in BootScene (dino-*, char-*). */
  portraitImageKey: string;
  portraitColor: number;
  lines: string[];
}

export const STORY_BEATS: Record<string, StoryBeat> = {
  intro: {
    speaker: 'Dino',
    portraitImageKey: 'dino-wave',
    portraitColor: COLORS.grassGreen,
    lines: [
      'Oh no! A big gust of wind just blew through Grassland!',
      'All my animal friends got scattered everywhere!',
      'Will you help me find them? Each one needs your counting skills!',
    ],
  },
  'level-1': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.grassGreen,
    lines: ["I hear something behind those balloons...", 'Pop the right one to find Bear!'],
  },
  'level-2': {
    speaker: 'Bear',
    portraitImageKey: 'char-bear',
    portraitColor: COLORS.tangerine,
    lines: ['You found me! Thank you!', "But now I'm hungry — let's feed the whole gang together!"],
  },
  'level-3': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.grassGreen,
    lines: ["Someone's hiding in the grass...", 'Count carefully to spot Cat!'],
  },
  'level-4': {
    speaker: 'Cat',
    portraitImageKey: 'char-cat',
    portraitColor: COLORS.grapePurple,
    lines: ['Meow! Elephant left number clues before she wandered off.', 'Match the right group to find her!'],
  },
  'level-5': {
    speaker: 'Elephant',
    portraitImageKey: 'char-elephant',
    portraitColor: COLORS.skyBlue,
    lines: ['Rabbit hopped off with a whole bunch of balloons!', "This one's trickier — good luck!"],
  },
  'level-6': {
    speaker: 'Rabbit',
    portraitImageKey: 'char-rabbit',
    portraitColor: COLORS.bubblePink,
    lines: ["Panda's too shy to come out...", 'Maybe if everyone eats together, Panda will join us!'],
  },
  'level-7': {
    speaker: 'Panda',
    portraitImageKey: 'char-panda',
    portraitColor: COLORS.ink,
    lines: ['Penguin waddled all the way to the pond!', "Count closely, this one's sneaky."],
  },
  'level-8': {
    speaker: 'Penguin',
    portraitImageKey: 'char-penguin',
    portraitColor: COLORS.skyBlue,
    lines: ['Fox is the cleverest of us all.', 'This match will be your trickiest yet!'],
  },
  'level-9': {
    speaker: 'Fox',
    portraitImageKey: 'char-fox',
    portraitColor: COLORS.tangerine,
    lines: ["Almost everyone's home!", 'One more windy round before we celebrate — stay sharp!'],
  },
  'level-10': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.grassGreen,
    lines: ['This is it — the whole gang is cheering you on!', "One last count and we're all together again!"],
  },
  'grassland-finale': {
    speaker: 'Dino',
    portraitImageKey: 'dino-happy',
    portraitColor: COLORS.sunYellow,
    lines: [
      'You found everyone! Grassland is whole again!',
      "Thank you for helping all of my friends — you're a counting hero!",
      "There's a whole world beyond these hills — ready to see what's next?",
    ],
  },

  'forest-welcome': {
    speaker: 'Dino',
    portraitImageKey: 'dino-wave',
    portraitColor: COLORS.grassGreen,
    lines: [
      'Whoa, the trees just keep going! Welcome to the Forest!',
      'Something in here keeps rustling the leaves — I bet it wants to play a counting game.',
    ],
  },
  'forest-checkpoint': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.grassGreen,
    lines: ["You're halfway through the Forest already!", 'The path ahead gets a little trickier — I know you can handle it.'],
  },
  'forest-finale': {
    speaker: 'Dino',
    portraitImageKey: 'dino-happy',
    portraitColor: COLORS.sunYellow,
    lines: ['The Forest is all counted up!', 'Onward — I hear waves in the distance...'],
  },

  'ocean-welcome': {
    speaker: 'Dino',
    portraitImageKey: 'dino-wave',
    portraitColor: COLORS.skyBlue,
    lines: ['Splash! Welcome to the Ocean!', 'The tide pools are full of things to count — let\'s wade in.'],
  },
  'ocean-checkpoint': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.skyBlue,
    lines: ['Halfway across the Ocean already!', 'Keep your eyes sharp — the current picks up from here.'],
  },
  'ocean-finale': {
    speaker: 'Dino',
    portraitImageKey: 'dino-happy',
    portraitColor: COLORS.sunYellow,
    lines: ["You've counted every wave in the Ocean!", "I think I see stars twinkling up ahead..."],
  },

  'space-welcome': {
    speaker: 'Dino',
    portraitImageKey: 'dino-wave',
    portraitColor: COLORS.grapePurple,
    lines: ['3, 2, 1... blast off! Welcome to Space!', 'Numbers float differently up here — let\'s count our way among the stars.'],
  },
  'space-checkpoint': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.grapePurple,
    lines: ["Halfway through Space!", 'The asteroid field ahead needs your quickest counting yet.'],
  },
  'space-finale': {
    speaker: 'Dino',
    portraitImageKey: 'dino-happy',
    portraitColor: COLORS.sunYellow,
    lines: ["You've charted the whole galaxy!", 'Something smells sweet where we\'re headed next...'],
  },

  'candyland-welcome': {
    speaker: 'Dino',
    portraitImageKey: 'dino-wave',
    portraitColor: COLORS.bubblePink,
    lines: ['Yum! Welcome to Candyland!', 'Every lollipop and gumdrop here is just begging to be counted.'],
  },
  'candyland-checkpoint': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.bubblePink,
    lines: ['Halfway through Candyland — sweet work!', 'The sugar rush ahead moves fast, so stay focused.'],
  },
  'candyland-finale': {
    speaker: 'Dino',
    portraitImageKey: 'dino-happy',
    portraitColor: COLORS.sunYellow,
    lines: ["You counted every treat in Candyland!", "One last place left — and it's my favorite..."],
  },

  'dinoisland-welcome': {
    speaker: 'Dino',
    portraitImageKey: 'dino-wave',
    portraitColor: COLORS.tangerine,
    lines: ["This is it — Dino Island, where I'm from!", "My old dino friends love a good counting game. Let's go say hi!"],
  },
  'dinoisland-checkpoint': {
    speaker: 'Dino',
    portraitImageKey: 'dino-idle',
    portraitColor: COLORS.tangerine,
    lines: ["Halfway across Dino Island!", "This next stretch is the trickiest in the whole game — you've got this."],
  },
  'dinoisland-finale': {
    speaker: 'Dino',
    portraitImageKey: 'dino-happy',
    portraitColor: COLORS.sunYellow,
    lines: [
      "You did it — every world counted, every friend found!",
      "Thank you for the adventure. You're the best counting hero there is!",
    ],
  },
};
