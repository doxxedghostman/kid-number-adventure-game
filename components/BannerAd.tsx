'use client';

import { useEffect, useState } from 'react';
import { showHomeBanner, hideHomeBanner } from '@/lib/admob';

/**
 * On the Capacitor Android app, the real AdMob banner is a native Android
 * view that AdMob draws itself, positioned by the plugin — it doesn't
 * render into this component's DOM at all, so once it's showing this
 * component renders nothing (leaving the bottom strip clear for it).
 * On plain web, the native SDK doesn't exist, so it falls back to the
 * placeholder strip below instead of showing nothing.
 */
export default function BannerAd() {
  const [nativeBannerActive, setNativeBannerActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { Capacitor } = await import('@capacitor/core');
      if (cancelled || !Capacitor.isNativePlatform()) return;
      await showHomeBanner();
      if (!cancelled) setNativeBannerActive(true);
    })();
    return () => {
      cancelled = true;
      hideHomeBanner();
    };
  }, []);

  if (nativeBannerActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: 'rgba(74,55,40,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        color: '#4a3728aa',
      }}
    >
      Banner ad slot
    </div>
  );
}
