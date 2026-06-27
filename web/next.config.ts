import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // This app lives in a subfolder of a larger repo (the Expo app is at the root).
  // Pin the tracing root to this folder so Next stops inferring the monorepo root
  // and warning about multiple lockfiles.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
