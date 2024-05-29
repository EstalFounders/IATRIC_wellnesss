/** @type {import('next').NextConfig} */

module.exports = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};
