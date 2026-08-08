'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import CoinCounter from '@/components/CoinCounter';
import BannerAd from '@/components/BannerAd';
import MenuBackground from '@/components/MenuBackground';
import { enterFullscreen } from '@/lib/fullscreen';

export default function HomePage() {
  const router = useRouter();

  // Must fire inside the click handler (not e.g. after the route change) —
  // most browsers only grant fullscreen when requested synchronously inside
  // a user gesture.
  const goToPlay = (query?: string) => {
    enterFullscreen();
    router.push(query ? `/play?${query}` : '/play');
  };

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

        {/* eslint-disable-next-line @next/next/no-img-element -- static export + unoptimized images, plain <img> is fine here */}
        <img
          src="/assets/ui/logo.png"
          alt="Kids Number Adventure"
          style={{ width: 'min(300px, 78vw)', height: 'auto' }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.7rem',
            marginTop: '0.6rem',
            width: 'min(360px, 88vw)',
          }}
        >
          <Button
            variant="square"
            color="orange"
            icon={
              // eslint-disable-next-line @next/next/no-img-element -- static export + unoptimized images
              <img src="/assets/ui/icons/icon-play.png" alt="" style={{ height: '2.2rem', width: 'auto' }} />
            }
            onClick={() => goToPlay()}
          >
            PLAY
          </Button>
          <Button variant="square" color="purple" icon="🎁" onClick={() => goToPlay('daily=1')}>
            Daily Reward
          </Button>
          <Button variant="square" color="green" icon="🏆" onClick={() => router.push('/achievements')}>
            Achievements
          </Button>
          <Button variant="square" color="blue" icon="⚙️" onClick={() => router.push('/settings')}>
            Settings
          </Button>
        </div>
      </div>

      <BannerAd />
    </main>
  );
}
