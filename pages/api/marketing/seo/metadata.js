// GET /api/marketing/seo/metadata?path=/ - PUBLIC read-only metadata for the site.
// Mounted once through src/marketing/components/SeoMetadata.js (in pages/_app.js).
import { dbConnect } from "../../../../src/lib/db";
import { allowMethods } from "../../../../src/api/marketing/helpers/apiHandler";
import { findActiveSeoEntryForPath } from "../../../../src/api/marketing/helpers/seoQueries";
import { pathToPageIdentifier } from "../../../../src/api/marketing/utils/seoPayload";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const pageIdentifier = pathToPageIdentifier(req.query.path || "/");

  if (!pageIdentifier) {
    return res.status(200).json({ ok: true, found: false, metadata: null });
  }

  try {
    await dbConnect();

    const row = await findActiveSeoEntryForPath(req.query.path);

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

    if (!row) {
      return res.status(200).json({ ok: true, found: false, metadata: null });
    }

    return res.status(200).json({
      ok: true,
      found: true,
      metadata: {
        pageIdentifier: row.pageIdentifier,
        metaTitle: row.pageTitle || "",
        metaDescription: row.metaDescription || "",
        keywords: row.seoKeywords || [],
      },
    });
  } catch (error) {
    console.error("marketing/seo/metadata error:", error);
    return res.status(200).json({ ok: true, found: false, metadata: null });
  }
}

