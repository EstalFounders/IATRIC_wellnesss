// /api/marketing/banner - homepage banner configuration (session required).
//   GET  current configuration (bannerUrl, lastUpdated, altText, isActive)
//   PUT  save configuration after the image was uploaded to Firebase Storage
import { dbConnect } from "../../../../src/lib/db";
import { allowMethods } from "../../../../src/api/marketing/helpers/apiHandler";
import { requireMarketingAuth } from "../../../../src/api/marketing/helpers/requireMarketingAuth";
import {
  getBannerConfig,
  isBannerLiveNow,
  saveBannerConfig,
} from "../../../../src/api/marketing/helpers/bannerQueries";

/** Normalise the submitted banner payload. */
const sanitizeBannerPayload = (body = {}) => {
  const asString = (value, limit) =>
    typeof value === "string" ? value.trim().slice(0, limit) : "";

  return {
    values: {
      bannerUrl: asString(body.bannerUrl, 600),
      altText: asString(body.altText, 120) || "HealthPath",
      href: asString(body.href, 300),
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    },
    errors: [],
  };
};

export default requireMarketingAuth(async (req, res) => {
  if (!allowMethods(req, res, ["GET", "PUT"])) return;

  await dbConnect();

  const author = req.marketingSession?.username || "marketing";

  try {
    if (req.method === "GET") {
      const banner = await getBannerConfig();

      return res.status(200).json({
        ok: true,
        banner,
        liveNow: isBannerLiveNow(banner),
      });
    }

    const { values, errors } = sanitizeBannerPayload(req.body);

    if (errors.length) {
      return res.status(400).json({ ok: false, message: errors.join(" ") });
    }

    const doc = await saveBannerConfig(values, author);
    const banner = doc?.bannerPopup || { ...values, lastUpdated: new Date() };

    // The homepage renders the banner URL from getStaticProps, so rebuild it now
    // instead of waiting up to 60s for the ISR window.
    try {
      await res.revalidate("/");
    } catch (error) {
      console.log(`[marketing] banner revalidate skipped: ${error.message}`);
    }

    return res.status(200).json({
      ok: true,
      banner,
      liveNow: isBannerLiveNow(banner),
    });
  } catch (error) {
    console.error("marketing/banner error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Banner request failed.",
    });
  }
});
