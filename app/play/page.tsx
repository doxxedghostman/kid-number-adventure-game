'use client';

import { useEffect, useRef } from 'react';

export default function PlayPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import('phaser').Game | undefined;
    let cancelled = false;

    // Phaser touches `window`/`document` at import time, so it must be loaded
    // dynamically, client-side only — never at the top of this file.
    (async () => {
      const Phaser = (await import('phaser')).default;
      const { createGameConfig } = await import('@/game/config');
      if (cancelled || !containerRef.current) return;
      game = new Phaser.Game(createGameConfig(containerRef.current));
    })();

    // Mobile browsers resize the visual viewport (address bar hiding/
    // showing on scroll, keyboard opening, orientation change) without
    // firing a full page reload. If Phaser's Scale Manager doesn't get
    // told to recompute, its internal pointer-to-canvas coordinate
    // mapping can go stale relative to where the canvas is actually
    // drawn on screen — taps then land a few dozen pixels off from where
    // they visually appear, which reads as "the wrong tile responded".
    // Forcing a refresh on every resize/orientation event keeps input
    // mapping in sync with the real, current canvas position and size.
    const handleResize = () => game?.scale.refresh();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      game?.destroy(true);
    };
  }, []);

  // Plain block, no flex here on purpose: Phaser's own `autoCenter: CENTER_BOTH`
  // centers the canvas by writing margin styles onto it directly. Adding
  // flexbox centering on this parent as well double-applies the centering
  // (flex + Phaser's margin math stack) and shoves the canvas off-center —
  // worse the more the design aspect ratio (portrait 720x1280) differs from
  // the window's. Let Phaser own centering entirely; this div just needs to
  // be a full-bleed, statically-positioned box for it to measure against.
  //
  // This route renders ONLY the Phaser canvas — it is not a place for
  // duplicate HTML menu buttons. The actual world/level menu lives inside
  // WorldSelectScene and ChallengeHubScene (Phaser scenes), not here.
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100dvw',
        height: '100dvh',
        background: '#4fc3f7',
        overflow: 'hidden',
      }}
      ref={containerRef}
    />
  );
}
