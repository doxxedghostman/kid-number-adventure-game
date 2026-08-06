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

// Matches progress.unlockedCharacters ids, unlocked one-per-Challenge-level
// (see game/levels.ts). 'dino' is unlocked by default for everyone.
const CHARACTERS = [
  { id: 'dino', label: 'Dino', img: '/assets/sprites/dino-happy.png' },
  { id: 'bear', label: 'Bear', img: '/assets/characters/bear.png' },
  { id: 'monkey', label: 'Monkey', img: '/assets/characters/monkey.png' },
  { id: 'cat', label: 'Cat', img: '/assets/characters/cat.png' },
  { id: 'elephant', label: 'Elephant', img: '/assets/characters/elephant.png' },
  { id: 'rabbit', label: 'Rabbit', img: '/assets/characters/rabbit.png' },
  { id: 'panda', label: 'Panda', img: '/assets/characters/panda.png' },
  { id: 'penguin', label: 'Penguin', img: '/assets/characters/penguin.png' },
  { id: 'fox', label: 'Fox', img: '/assets/characters/fox.png' },
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

      <h2 style={{ color: 'white', textShadow: '0 2px 0 rgba(0,0,0,0.15)', marginTop: '0.6rem', fontSize: '1.3rem' }}>
        🐾 Friends Found {progress && `(${progress.unlockedCharacters.length}/${CHARACTERS.length})`}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.7rem',
          width: '100%',
          maxWidth: 380,
        }}
      >
        {CHARACTERS.map((char) => {
          const unlocked = progress ? progress.unlockedCharacters.includes(char.id) : char.id === 'dino';
          return (
            <div
              key={char.id}
              style={{
                background: 'white',
                borderRadius: 18,
                padding: '0.6rem 0.4rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.3rem',
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={char.img}
                alt={char.label}
                style={{
                  width: '100%',
                  aspectRatio: '5 / 7',
                  objectFit: 'contain',
                  filter: unlocked ? 'none' : 'grayscale(1) brightness(0.7)',
                  opacity: unlocked ? 1 : 0.5,
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a3728' }}>{char.label}</span>
              {!unlocked && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    fontSize: '1.1rem',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  🔒
                </span>
              )}
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
