/* eslint-disable no-undef */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { largePageDataBytes: 256 * 1000000 },
  typescript: { ignoreBuildErrors: true },
  pageExtensions: ['page.tsx'],
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
