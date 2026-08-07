'use client';

import { useEffect } from 'react';

/**
 * Runs once, app-wide. On the web this does nothing — `isNativePlatform()`
 * is false in a regular browser tab, so the dynamic import of
 * @capacitor/status-bar never even happens there. On the Android build
 * (Capacitor WebView) it hides the status bar and lets the WebView draw
 * behind it, so the game fills the whole screen instead of starting below
 * the status bar.
 *
 * Dynamically imported and guarded like this (rather than a static import)
 * so the web build never pulls in Capacitor plugin code it doesn't need.
 */
export default function NativeFullscreenBootstrap() {
  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;
        const { StatusBar } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.hide();
      } catch {
        // Plugin not available or platform doesn't support it — the app is
        // still fully playable, just not edge-to-edge. Never block startup.
      }
    })();
  }, []);

  return null;
}
