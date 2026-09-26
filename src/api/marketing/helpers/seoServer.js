// Server-only helper: reads the marketing panel SEO document for a route path.
// Used inside getStaticProps (ISR) so the tags are part of the page HTML, and
// by the panel API route to trigger revalidation. Never import this from client
// components - it pulls in mongoose.
import { dbConnect } from "../../../lib/db";
import MarketingPanel from "../../../models/marketingPanelSchema";
import { findActiveSeoEntryForPath } from "./seoQueries";

/**
 * Open the URI on the connection THIS MODEL owns.
 * In a production build the model can end up bundled with its own copy of
 * mongoose, while dbConnect() connects a different copy in the same process -
 * the model's queries then fail with "buffering timed out". Opening
 * `Model.db` (the connection the model actually uses) is copy-agnostic.
 */
const ensureModelConnection = async () => {
  const connection = MarketingPanel.db;

  if (connection.readyState === 1) return connection;

  return connection.openUri(process.env.MONGO_URI, { autoIndex: true });
};

/**
 * Metadata for a route path, or null when the page has no active panel entry.
 * One indexed lookup per build - no cache, so a panel save is always reflected
 * by the next (re)build.
 */
export const getSeoMetadataForPath = async (pathname) => {
  try {
    await dbConnect();
    await ensureModelConnection();

    const row = await findActiveSeoEntryForPath(pathname);

    if (!row) return null;

    return {
      pageIdentifier: row.pageIdentifier,
      metaTitle: row.pageTitle || "",
      metaDescription: row.metaDescription || "",
      keywords: row.seoKeywords || [],
    };
  } catch (error) {
    // A missing DB must never break a page build.
    console.error("seoServer.getSeoMetadataForPath:", error.message);
    return null;
  }
};


/** getStaticProps payload for a managed page (static + 60 s incremental refresh). */
export const getSeoStaticProps = async (pathname) => ({
  props: { seoMetadata: await getSeoMetadataForPath(pathname) },
  revalidate: 60,
});
