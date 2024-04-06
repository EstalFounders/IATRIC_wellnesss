module.exports = {
  productionBrowserSourceMaps: true,
  future: {
    webpack5: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};
