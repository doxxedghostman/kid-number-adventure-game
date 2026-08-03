'use client';

/**
 * Placeholder for the AdMob banner strip. Real AdMob only works inside the
 * Capacitor-wrapped native app (not plain web), via @capacitor-community/admob.
 * That plugin is intentionally NOT wired up yet — see README "Ads" section
 * for why, and do this last, after the game itself works and is fun.
 */
export default function BannerAd() {
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
