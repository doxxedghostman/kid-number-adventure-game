'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { getProgress } from '@/game/progress';

const BADGES = [
  { id: '10-levels', label: '10 Levels', emoji: '🎯', test: (p: ReturnType<typeof getProgress>) => p.stats.levelsCompleted >= 10 },
  { id: '100-coins', label: '100 Coins', emoji: '🪙', test: (p: ReturnType<typeof getProgress>) => p.coins >= 100 },
  { id: '7-days', label: '7 Days Played', emoji: '📅', test: (p: ReturnType<typeof getProgress>) => p.stats.daysPlayed >= 7 },
];

export default function AchievementsPage() {
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
      }}
    >
      <h1 style={{ color: 'white', textShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>🏆 Achievements</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%', maxWidth: 340 }}>
        {BADGES.map((badge) => {
          const unlocked = progress ? badge.test(progress) : false;
          return (
            <div
              key={badge.id}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '1rem 1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: unlocked ? 1 : 0.45,
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '2rem' }}>{badge.emoji}</span>
              {badge.label}
              {unlocked && <span style={{ marginLeft: 'auto' }}>✅</span>}
            </div>
          );
        })}
      </div>

      <Button color="pink" onClick={() => router.push('/')}>
        ⬅️ Back to Menu
      </Button>
    </main>
  );
}
