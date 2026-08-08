/**
 * AdMob configuration for Kid Number Adventure.
 *
 * IMPORTANT — read before flipping USE_TEST_ADS to false:
 * Tapping/loading your own REAL ad units repeatedly while developing is
 * against AdMob policy and can get the account suspended. Google's test ad
 * unit IDs below always serve a placeholder "Test Ad" — safe to load and
 * tap as much as you want. Keep USE_TEST_ADS = true for all day-to-day
 * development and internal testing. Only set it to false for the build
 * you actually submit/release, and even then, add your own device as a
 * "Test device" in the AdMob console (Settings → Test devices) so ads on
 * your own phone during final checks still don't count as real traffic.
 */
export const USE_TEST_ADS = true;

// Google's official sample ad unit IDs (same for every AdMob account) —
// https://developers.google.com/admob/android/test-ads
const TEST_AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

// Real Kid Number Adventure ad units, created in their own dedicated AdMob
// app entry (separate from any other app), tagged child-directed.
const LIVE_AD_UNITS = {
  banner: 'ca-app-pub-2830006716687955/7341497022',
  interstitial: 'ca-app-pub-2830006716687955/4937594889',
};

export const AD_UNITS = USE_TEST_ADS ? TEST_AD_UNITS : LIVE_AD_UNITS;

// How many Story Mode levels between interstitials. 1 = every level,
// 2 = every other level (current setting, matches "every level or two").
export const LEVELS_PER_INTERSTITIAL = 2;
