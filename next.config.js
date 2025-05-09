/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { version } = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    newNextLinkBehavior: false,
    largePageDataBytes: 128 * 1000000,
    optimizeCss: true,
    optimizePackageImports: ['@chakra-ui/react', 'antd', 'rsuite', 'react-icons', '@emotion/react', '@emotion/styled'],
    outputFileTracingExcludes: {
      '*': [
        'node_modules/tailwindcss',
        `node_modules/tailwindcss-animate`,
        `node_modules/postcss`,
        `node_modules/postcss-import`,
        `node_modules/postcss-nesting`,
      ],
    },
  },
  typescript: { ignoreBuildErrors: true },
  publicRuntimeConfig: { version },
  pageExtensions: ['page.tsx'],
  output: 'standalone',
  compress: true,
  swcMinify: true,
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
