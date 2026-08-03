/** @type {import('next').NextConfig} */
const nextConfig = {
  // Capacitor needs a static site it can bundle into the WebView.
  // Comment this out during `next dev` if you want normal SSR behavior in the browser.
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
