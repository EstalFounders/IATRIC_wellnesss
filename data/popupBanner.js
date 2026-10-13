// Banner image for the homepage popup (BannerPopup).
//
// Paste a Google/Firebase Storage download URL into `url` (e.g. a
// https://firebasestorage.googleapis.com/... download URL). If `url` is empty, or the
// image fails to load, POPUP_FALLBACK_IMAGE is rendered instead.
// Optional `href` makes the banner clickable (internal route or http URL).
// The popup serves images unoptimized (straight from the source, no /_next/image
// transform), so the fallback ships pre-shrunk: this WebP is ~81 KB where the original
// popup-placeholder.png was 1.9 MB.
export const POPUP_FALLBACK_IMAGE = "/images/popup-placeholder.webp";

export const popupBanner = {
  url: "",
  alt: "HealthPath",
  href: "",
};
