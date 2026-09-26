// Queries for the homepage banner, stored in the "home" document of the
// marketingPanel collection under `bannerPopup`.
import MarketingPanel from "../../../models/marketingPanelSchema";

const HOME_IDENTIFIER = "home";

/** Shape stored in marketingPanel.bannerPopup. */
export const BANNER_DEFAULTS = {
  bannerUrl: "",
  altText: "HealthPath",
  href: "",
  isActive: true,
  lastUpdated: null,
};

/** Current banner configuration (never null - falls back to the defaults). */
export const getBannerConfig = async () => {
  const doc = await MarketingPanel.findOne({
    pageIdentifier: HOME_IDENTIFIER,
  }).lean();

  return { ...BANNER_DEFAULTS, ...(doc?.bannerPopup || {}) };
};

/** True when the homepage should render the banner right now. */
export const isBannerLiveNow = (banner) =>
  Boolean(banner?.isActive && banner.bannerUrl);

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
