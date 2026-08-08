import { AD_UNITS, USE_TEST_ADS } from '@/game/adsConfig';

/**
 * All functions here are safe to call unconditionally from anywhere
 * (React or Phaser code) — each one checks isNativePlatform() itself and
 * silently does nothing on plain web, where the native AdMob SDK doesn't
 * exist. Errors are swallowed rather than thrown: a failed/unfilled ad
 * should never break gameplay for a kid mid-level.
 */

async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

let initialized = false;

/** Call once, early (app layout mount). Sets the child-directed / non-personalized flags for every ad request this session. */
export async function initializeAdMob() {
  if (initialized || !(await isNative())) return;
  try {
    const { AdMob, MaxAdContentRating } = await import('@capacitor-community/admob');
    await AdMob.initialize({
      // Never treat requests as personalized/remarketing — required
      // alongside child-directed treatment for a kids' app.
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
      maxAdContentRating: MaxAdContentRating.General,
      initializeForTesting: USE_TEST_ADS,
    });
    initialized = true;
  } catch {
    // AdMob failed to init (offline, plugin unavailable, etc). Ads just
    // won't show this session — not worth surfacing to a kid player.
  }
}

/** Shows the home-screen banner, pinned to the bottom. Call once when the home screen mounts. */
export async function showHomeBanner() {
  if (!(await isNative())) return;
  try {
    const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
    await initializeAdMob();
    await AdMob.showBanner({
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS,
    });
  } catch {
    // No fill / offline — leave the screen without a banner rather than error.
  }
}

/** Removes the banner. Call when navigating away from the home screen. */
export async function hideHomeBanner() {
  if (!(await isNative())) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.removeBanner();
  } catch {
    // Nothing to remove, or plugin unavailable — fine either way.
  }
}

/**
 * Loads + shows a full-screen interstitial. Fire-and-forget from the
 * caller's point of view — awaiting isn't necessary since gameplay should
 * never block on an ad network round trip. If the ad fails to load (no
 * fill, offline), this just silently does nothing and the player carries
 * on to the next screen as normal.
 */
export async function showInterstitial() {
  if (!(await isNative())) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await initializeAdMob();
    await AdMob.prepareInterstitial({
      adId: AD_UNITS.interstitial,
      isTesting: USE_TEST_ADS,
    });
    await AdMob.showInterstitial();
  } catch {
    // No fill / offline / not loaded in time — skip this one, try again
    // next cadence trigger. Never blocks level transition.
  }
}
