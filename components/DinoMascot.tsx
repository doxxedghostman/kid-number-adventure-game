'use client';

/**
 * Dino — the game's original mascot. Kept as inline SVG (not an image asset)
 * so it costs nothing, scales crisply on any screen, and is trivial to
 * recolor/re-pose later once real art comes in from Kenney/OpenGameArt packs.
 */
export default function DinoMascot({ size = 180, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dino, the friendly dinosaur"
    >
      {/* body */}
      <ellipse cx="100" cy="130" rx="55" ry="45" fill="#6bcb77" />
      {/* belly */}
      <ellipse cx="100" cy="140" rx="34" ry="26" fill="#eafff0" />
      {/* head */}
      <circle cx="100" cy="70" r="42" fill="#6bcb77" />
      {/* snout */}
      <ellipse cx="100" cy="86" rx="26" ry="18" fill="#8ee89a" />
      {/* spikes */}
      <path d="M70 35 L80 15 L88 38 Z" fill="#ff9f45" />
      <path d="M95 28 L105 8 L113 32 Z" fill="#ff9f45" />
      <path d="M120 35 L130 18 L136 40 Z" fill="#ff9f45" />
      {/* eyes */}
      <circle cx="82" cy="62" r="11" fill="white" />
      <circle cx="118" cy="62" r="11" fill="white" />
      <circle cx="84" cy="64" r="6" fill="#4a3728" />
      <circle cx="120" cy="64" r="6" fill="#4a3728" />
      {/* smile */}
      <path d="M80 92 Q100 106 120 92" stroke="#4a3728" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="70" cy="82" r="7" fill="#ff9f8a" opacity="0.6" />
      <circle cx="130" cy="82" r="7" fill="#ff9f8a" opacity="0.6" />
      {/* arms */}
      <ellipse cx="52" cy="130" rx="12" ry="20" fill="#6bcb77" transform="rotate(-20 52 130)" />
      <ellipse cx="148" cy="130" rx="12" ry="20" fill="#6bcb77" transform="rotate(20 148 130)" />
      {/* feet */}
      <ellipse cx="78" cy="178" rx="18" ry="10" fill="#57b566" />
      <ellipse cx="122" cy="178" rx="18" ry="10" fill="#57b566" />
    </svg>
  );
}
