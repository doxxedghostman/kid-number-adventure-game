'use client';

import { useEffect, useRef } from 'react';

export default function PlayPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let game: any = undefined;
    let cancelled = false;

    (async () => {
      try {
        const PhaserModule: any = await import('phaser');
        // Phaser exports vary by bundler. Prefer Game constructor if available.
        const PhaserClass = PhaserModule.Game ?? PhaserModule.default ?? PhaserModule;
        const { createGameConfig } = await import('@/game/config');
        if (cancelled || !containerRef.current) return;
        const cfg = typeof createGameConfig === 'function' ? createGameConfig(containerRef.current) : (createGameConfig as any);
        // If PhaserClass is a namespace, try to use its Game constructor
        const GameCtor = PhaserClass && PhaserClass.prototype && PhaserClass.prototype.constructor ? PhaserClass : (PhaserClass.Game ?? PhaserClass.default ?? PhaserClass);
        game = new (GameCtor as any)(cfg);
      } catch (e) {
        // Fail quietly in environments where Phaser isn't available at build time.
        // Console log for debugging only.
        // eslint-disable-next-line no-console
        console.warn('Phaser load failed:', e);
      }
    })();

    return () => {
      cancelled = true;
      try { game?.destroy(true); } catch (e) { /* ignore */ }
    };
  }, []);

  return (
    <div className="play-root">
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="menu-hero-glow" />
        <img
          src="/assets/sprites/dino-wave.png"
          alt="Dino waving hello"
          className="bounce"
          style={{ position: 'relative', height: 190, width: 'auto' }}
        />
      </div>

      <div className="app-container" ref={containerRef}>
        <div className="menu-hero-glow" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 0 }}>
          <h1 className="menu-title-badge" style={{ fontSize: '2.2rem', margin: 0, color: 'white', textShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
            Dino’s Number Adventure
          </h1>

          <div className="world-menu" style={{ marginTop: '0.6rem' }}>
            <button className="big-button" onClick={() => (location.href = '/play')}>
              🎈 Balloon Pop
            </button>

            <button className="big-button" onClick={() => (location.href = '/play?daily=1')}>
              🦕 Feed Dino
            </button>

            <button className="big-button" onClick={() => (location.href = '/achievements')}>
              🐶 Count Animals
            </button>

            <button className="big-button" onClick={() => (location.href = '/settings')}>
              🔢 Number Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
