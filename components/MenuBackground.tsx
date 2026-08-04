'use client';

/**
 * Decorative toy-diorama backdrop for the main menu: glowing sun, drifting
 * clouds, scalloped candy hills, and a few twinkles. Pure inline SVG + CSS
 * animation — no image weight, scales crisply on any screen. aria-hidden
 * and pointer-events:none since it's decoration, not content.
 *
 * Swap-out note: if/when a painted full-scene AI background comes in for
 * the menu (same pipeline as the world backgrounds), this component can be
 * deleted and replaced with a single <img> — the layout in page.tsx doesn't
 * need to change either way.
 */
export default function MenuBackground() {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="xMidYMax slice"
      viewBox="0 0 400 800"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* sun glow */}
      <circle cx="322" cy="96" r="120" fill="#ffd93d" opacity="0.25" />
      <circle cx="322" cy="96" r="70" fill="#ffd93d" opacity="0.5" />
      <circle cx="322" cy="96" r="46" fill="#ffd93d" />
      <circle cx="322" cy="96" r="46" fill="#ff9f45" opacity="0.25" />

      {/* clouds — three depths, gentle independent drift */}
      <g className="cloud-drift-slow" opacity="0.85">
        <ellipse cx="70" cy="120" rx="34" ry="18" fill="#fff" />
        <ellipse cx="96" cy="112" rx="26" ry="16" fill="#fff" />
        <ellipse cx="46" cy="112" rx="22" ry="14" fill="#fff" />
      </g>
      <g className="cloud-drift-mid" opacity="0.8">
        <ellipse cx="250" cy="70" rx="26" ry="14" fill="#fff" />
        <ellipse cx="270" cy="64" rx="20" ry="12" fill="#fff" />
      </g>
      <g className="cloud-drift-fast" opacity="0.9">
        <ellipse cx="150" cy="180" rx="40" ry="20" fill="#fff" />
        <ellipse cx="182" cy="172" rx="28" ry="16" fill="#fff" />
        <ellipse cx="120" cy="172" rx="24" ry="14" fill="#fff" />
      </g>

      {/* sparkles near the hero area */}
      <g fill="#ff6fa5" className="twinkle-a">
        <path d="M60 260 L65 274 L79 279 L65 284 L60 298 L55 284 L41 279 L55 274 Z" />
      </g>
      <g fill="#a66cff" className="twinkle-b">
        <path d="M340 220 L344 231 L355 235 L344 239 L340 250 L336 239 L325 235 L336 231 Z" />
      </g>
      <g fill="#ffd93d" className="twinkle-c">
        <path d="M30 340 L33 348 L41 351 L33 354 L30 362 L27 354 L19 351 L27 348 Z" />
      </g>

      {/* back hill */}
      <path
        d="M0 620 C 60 590, 120 590, 180 610 C 240 630, 300 600, 400 615 L400 800 L0 800 Z"
        fill="#8fdba0"
      />
      {/* front hill */}
      <path
        d="M0 680 C 70 645, 140 660, 200 645 C 260 630, 330 655, 400 640 L400 800 L0 800 Z"
        fill="#6bcb77"
      />

      {/* candy flowers along the front hill edge */}
      {[
        { x: 34, y: 668, c: '#ff6fa5' },
        { x: 58, y: 660, c: '#ffd93d' },
        { x: 348, y: 654, c: '#a66cff' },
        { x: 372, y: 664, c: '#ff9f45' },
      ].map((f) => (
        <g key={`${f.x}-${f.y}`}>
          <circle cx={f.x} cy={f.y} r="5" fill={f.c} />
          <circle cx={f.x - 7} cy={f.y} r="4" fill={f.c} opacity="0.8" />
          <circle cx={f.x + 7} cy={f.y} r="4" fill={f.c} opacity="0.8" />
          <circle cx={f.x} cy={f.y - 7} r="4" fill={f.c} opacity="0.8" />
          <circle cx={f.x} cy={f.y + 7} r="4" fill={f.c} opacity="0.8" />
          <circle cx={f.x} cy={f.y} r="2.5" fill="#fff8e7" />
        </g>
      ))}
    </svg>
  );
}
