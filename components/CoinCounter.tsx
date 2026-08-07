'use client';

import { useEffect, useState } from 'react';
import { getProgress } from '@/game/progress';

export default function CoinCounter() {
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    setCoins(getProgress().coins);
    // Same-tab updates (e.g. after a mini-game awards coins) dispatch this event.
    const onUpdate = () => setCoins(getProgress().coins);
    window.addEventListener('progress-updated', onUpdate);
    return () => window.removeEventListener('progress-updated', onUpdate);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 14,
        right: 14,
        background: 'white',
        borderRadius: 999,
        padding: '0.5rem 1rem',
        fontWeight: 600,
        fontSize: '1.2rem',
        boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: '#4a3728',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export + unoptimized images, plain <img> is fine here */}
      <img src="/assets/ui/icons/icon-coin.png" alt="coins" style={{ height: 24, width: 'auto' }} />
      {coins ?? '—'}
    </div>
  );
}
