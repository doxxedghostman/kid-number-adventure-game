// Same palette as app/globals.css, expressed as hex numbers for Phaser (0xRRGGBB).
export const COLORS = {
  sunYellow: 0xffd93d,
  skyBlue: 0x4fc3f7,
  grassGreen: 0x6bcb77,
  bubblePink: 0xff6fa5,
  grapePurple: 0xa66cff,
  tangerine: 0xff9f45,
  cream: 0xfff8e7,
  ink: 0x4a3728,
  white: 0xffffff,
};

export const PALETTE_CYCLE = [
  COLORS.bubblePink,
  COLORS.grassGreen,
  COLORS.skyBlue,
  COLORS.tangerine,
  COLORS.grapePurple,
  COLORS.sunYellow,
];

// Minimum tap-target size (px, at design resolution) — nothing in the game
// should require more precision than a toddler's finger can manage.
export const MIN_TAP_SIZE = 140;
