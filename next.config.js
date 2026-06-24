/** @type {import('next').NextConfig} */

module.exports = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};
