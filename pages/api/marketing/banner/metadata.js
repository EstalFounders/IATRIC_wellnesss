// GET /api/marketing/banner/metadata - PUBLIC: what the homepage banner should show.
// Returns found:false when the banner is missing or inactive.
import { dbConnect } from "../../../../src/lib/db";
import { allowMethods } from "../../../../src/api/marketing/helpers/apiHandler";
import {
  getBannerConfig,
  isBannerLiveNow,
} from "../../../../src/api/marketing/helpers/bannerQueries";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    await dbConnect();

    const banner = await getBannerConfig();

    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");

    if (!isBannerLiveNow(banner)) {
      return res.status(200).json({ ok: true, found: false, banner: null });
    }

    return res.status(200).json({
      ok: true,
      found: true,
      banner: {
        url: banner.bannerUrl,
        href: banner.href || "",
        alt: banner.altText || "HealthPath",
        lastUpdated: banner.lastUpdated || null,
      },
    });
  } catch (error) {
    console.error("marketing/banner/metadata error:", error);
    return res.status(200).json({ ok: true, found: false, banner: null });
  }
}
