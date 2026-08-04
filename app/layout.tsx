import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kid Number Adventure',
  description: 'Learn numbers 1-10 with Dino!',
};

// Using Next's dedicated `viewport` export rather than a manual <meta> tag —
// Next.js App Router already auto-injects a viewport meta tag, so a manual
// one in <head> below would just create a duplicate.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Loaded at runtime (in the browser/WebView), not at build time —
          keeps `npm run build` working even with no internet access, and
          falls back to the system rounded sans-serif below if the request
          fails (e.g. offline in the Android WebView).
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
