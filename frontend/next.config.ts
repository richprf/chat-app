import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // دو lockfile در ریپو هست؛ ریشه Turbopack باید خود frontend باشد
  // تا postcss.config.mjs و Tailwind درست پیدا شوند
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
