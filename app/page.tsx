'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import CoinCounter from '@/components/CoinCounter';
import BannerAd from '@/components/BannerAd';
import MenuBackground from '@/components/MenuBackground';

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.2rem',
        padding: '2rem 1rem 5rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <MenuBackground />

      <CoinCounter />

      {/* Hero: soft glow anchors the eye on Dino before anything else on screen */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{ position: 'relative' }}>
          <div className="menu-hero-glow" />
          {/* eslint-disable-next-line @next/next/no-img-element -- static export + unoptimized images, plain <img> is fine here */}
          <img
            src="/assets/sprites/dino-wave.png"
            alt="Dino waving hello"
            className="bounce"
            style={{ position: 'relative', height: 190, width: 'auto' }}
          />
        </div>

        <h1 className="menu-title-badge" style={{ fontSize: '2.2rem', margin: 0, color: 'white', textShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
          Dino&apos;s Number Adventure
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginTop: '0.6rem',
            width: 'min(340px, 80vw)',
          }}
        >
          <Button variant="square" color="green" icon="▶️" onClick={() => router.push('/play')}>
            PLAY
          </Button>
          <Button variant="square" color="orange" icon="🎁" onClick={() => router.push('/play?daily=1')}>
            Daily Reward
          </Button>
          <Button variant="square" color="purple" icon="🏆" onClick={() => router.push('/achievements')}>
            Achievements
          </Button>
          <Button variant="square" color="pink" icon="⚙️" onClick={() => router.push('/settings')}>
            Settings
          </Button>
        </div>
      </div>

      <BannerAd />
    </main>
  );
}
