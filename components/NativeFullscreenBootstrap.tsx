'use client';

import { useEffect } from 'react';
import { initializeAdMob } from '@/lib/admob';

/**
 * Runs once, app-wide. On the web this does nothing — `isNativePlatform()`
 * is false in a regular browser tab, so the dynamic imports of Capacitor
 * plugin code never even happen there. On the Android build (Capacitor
 * WebView) this hides the status bar (edge-to-edge) and initializes the
 * AdMob SDK with child-directed / non-personalized ad settings so every
 * ad request this session is already tagged correctly.
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
    initializeAdMob();
  }, []);

  return null;
}
