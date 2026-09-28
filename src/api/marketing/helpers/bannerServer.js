// Server-only helper: the homepage banner for getStaticProps (ISR), so the popup
// image URL is part of the built HTML and can be preloaded before the popup opens.
// Never import this from client components - it pulls in mongoose.
import { dbConnect } from "../../../lib/db";
import MarketingPanel from "../../../models/marketingPanelSchema";
import { getBannerConfig, isBannerLiveNow } from "./bannerQueries";

/**
 * Open the URI on the connection THIS MODEL owns (same reason as seoServer.js):
 * in a production build the model can be bundled with its own mongoose copy while
 * dbConnect() connects a different one, which makes queries buffer forever.
 */
const ensureModelConnection = async () => {
  const connection = MarketingPanel.db;

  if (connection.readyState === 1) return connection;

  return connection.openUri(process.env.MONGO_URI, { autoIndex: true });
};

/** Public banner payload for the homepage (null when nothing is live). */
export const getBannerForStaticProps = async () => {
  try {
    await dbConnect();
    await ensureModelConnection();

    const banner = await getBannerConfig();

    if (!isBannerLiveNow(banner)) return null;

    return {
      url: banner.bannerUrl,
      href: banner.href || "",
      alt: banner.altText || "HealthPath",
      // Serialised for JSON props; withCacheBuster() turns it back into a timestamp.
      lastUpdated: banner.lastUpdated
        ? new Date(banner.lastUpdated).toISOString()
        : null,
    };
  } catch (error) {
    // A missing DB must never break the homepage build - the popup then falls back
    // to its client-side fetch.
    console.error("bannerServer.getBannerForStaticProps:", error.message);
    return null;
  }
};
