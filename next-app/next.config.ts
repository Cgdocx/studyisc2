import type { NextConfig } from 'next';

const basePath = '/studyisc2';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: false,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
