// Banner image for the homepage popup (BannerPopup).
//
// Paste a Google/Firebase Storage download URL into `url` (e.g. a
// https://firebasestorage.googleapis.com/... download URL). If `url` is empty, or the
// image fails to load, POPUP_FALLBACK_IMAGE is rendered instead.
// Optional `href` makes the banner clickable (internal route or http URL).
export const POPUP_FALLBACK_IMAGE = "/images/popup-placeholder.png";

export const popupBanner = {
  url: "",
  alt: "HealthPath",
  href: "",
};
