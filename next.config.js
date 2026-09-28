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
    // Optimised images are cached for a year. Safe because every banner/blog URL is
    // versioned (`&v=<lastUpdated>` via withCacheBuster), so a replaced image is a
    // new URL and a new cache entry - repeat visits render the popup from cache.
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  // The public blog moved to /our-blog; keep old /blog links working.
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/our-blog",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/our-blog/:slug",
        permanent: true,
      },
    ];
  },
};
