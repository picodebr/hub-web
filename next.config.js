/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { version } = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { newNextLinkBehavior: false, largePageDataBytes: 128 * 1000000 },
  typescript: { ignoreBuildErrors: true },
  publicRuntimeConfig: { version },
  pageExtensions: ['page.tsx'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hub-files-hml.s3.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
