/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': path.resolve(__dirname, 'presentation/web/components'),
      '@/hooks': path.resolve(__dirname, 'presentation/web/hooks'),
    };
    return config;
  },
};

module.exports = nextConfig;
