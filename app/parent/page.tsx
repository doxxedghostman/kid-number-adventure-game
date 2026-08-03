'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { getProgress } from '@/game/progress';

export default function ParentPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ReturnType<typeof getProgress> | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.2rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ color: 'white', textShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>👪 Parents</h1>

      <div style={{ background: 'white', borderRadius: 20, padding: '1.4rem 2rem', width: '100%', maxWidth: 340 }}>
        <p>Levels completed: <strong>{progress?.stats.levelsCompleted ?? 0}</strong></p>
        <p>Coins earned: <strong>{progress?.coins ?? 0}</strong></p>
        <p style={{ fontSize: '0.85rem', color: '#4a3728aa' }}>
          This app shows occasional ads (banner + between-level) to stay free.
          No purchases are required or offered.
        </p>
      </div>

      <Button color="blue" onClick={() => router.push('/')}>
        ⬅️ Back to Menu
      </Button>
    </main>
  );
}
