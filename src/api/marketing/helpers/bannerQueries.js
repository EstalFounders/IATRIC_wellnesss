// Queries for the homepage banner, stored in the "home" document of the
// marketingPanel collection under `bannerPopup`.
import MarketingPanel from "../../../models/marketingPanelSchema";

const HOME_IDENTIFIER = "home";

/** Shape stored in marketingPanel.bannerPopup. */
export const BANNER_DEFAULTS = {
  bannerUrl: "",
  altText: "HealthPath",
  href: "",
  // OFF unless the panel says otherwise: a document written before the switch
  // existed has no `isActive` key, and defaulting that to "on" is what kept a
  // paused banner showing on the homepage.
  isActive: false,
  lastUpdated: null,
};

/** Current banner configuration (never null - falls back to the defaults). */
export const getBannerConfig = async () => {
  const doc = await MarketingPanel.findOne({
    pageIdentifier: HOME_IDENTIFIER,
  }).lean();

  const stored = doc?.bannerPopup || {};

  return {
    ...BANNER_DEFAULTS,
    ...stored,
    // Accept the keys used by the earlier implementation so existing documents
    // keep working (imageUrl/alt vs bannerUrl/altText).
    bannerUrl: stored.bannerUrl || stored.imageUrl || BANNER_DEFAULTS.bannerUrl,
    altText: stored.altText || stored.alt || BANNER_DEFAULTS.altText,
  };
};

/**
 * True when the homepage should render the banner right now.
 *
 * `=== true` on purpose: only the marketing panel's own switch can turn the
 * popup on. A missing/false flag never renders it (the previous truthy check,
 * plus the storage fallback in BannerPopup, is what kept a paused banner live).
 */
export const isBannerLiveNow = (banner) =>
  Boolean(banner?.isActive === true && banner.bannerUrl);

/** Persist the banner on the home document, creating it if the panel is empty. */
export const saveBannerConfig = async (values, updatedBy) => {
  const bannerPopup = {
    ...values,
    lastUpdated: new Date(),
    updatedBy,
  };

  return MarketingPanel.findOneAndUpdate(
    { pageIdentifier: HOME_IDENTIFIER },
    { $set: { bannerPopup, updatedBy } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  ).lean();
};
