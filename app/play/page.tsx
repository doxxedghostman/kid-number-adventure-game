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

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <div
      style={{
        width: '100dvw',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#4fc3f7',
        overflow: 'hidden',
      }}
      ref={containerRef}
    />
  );
}
