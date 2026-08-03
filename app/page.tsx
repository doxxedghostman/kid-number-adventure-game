'use client';

import { useRouter } from 'next/navigation';
import DinoMascot from '@/components/DinoMascot';
import Button from '@/components/Button';
import CoinCounter from '@/components/CoinCounter';
import BannerAd from '@/components/BannerAd';

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.2rem',
        padding: '2rem 1rem 5rem',
        textAlign: 'center',
      }}
    >
      <CoinCounter />

      <DinoMascot size={160} className="bounce" />

      <h1 style={{ fontSize: '2.2rem', margin: 0, color: 'white', textShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
        Dino&apos;s Number Adventure
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <Button color="green" onClick={() => router.push('/play')}>
          ▶️ PLAY
        </Button>
        <Button color="orange" onClick={() => router.push('/play?daily=1')}>
          🎁 Daily Reward
        </Button>
        <Button color="purple" onClick={() => router.push('/achievements')}>
          🏆 Achievements
        </Button>
        <Button color="pink" onClick={() => router.push('/settings')}>
          ⚙️ Settings
        </Button>
        <Button color="blue" onClick={() => router.push('/parent')}>
          👪 Parents
        </Button>
      </div>

      <BannerAd />
    </main>
  );
}
