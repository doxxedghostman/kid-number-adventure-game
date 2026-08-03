import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dinoadventure.kidnumbers',
  appName: 'Kid Number Adventure',
  // Next.js with `output: 'export'` builds a static site into ./out —
  // that's what Capacitor bundles into the native WebView.
  webDir: 'out',
  android: {
    allowMixedContent: false,
  },
};

export default config;
