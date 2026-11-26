/**
 * One place for the facts every metadata tag needs.
 *
 * The origin has to come from NEXT_PUBLIC_SITE_URL (not a hardcoded string) or
 * canonical / og:url / sitemap URLs disagree with each other - they did: the
 * sitemap said healthpath.co.in while PageStructuredData fell back to
 * www.healthpath.co.in. The fallback here matches public/robots.txt.
 *
 * Keep this module dependency-free apart from src/constant so it can be imported
 * from _app (SSR), pages/api routes and the sitemap without pulling in React.
 */
import {
  Linkdn_url,
  address,
  contact_no,
  email,
  facebook_page_url,
  instagram_page_url,
} from "../constant";

/** Absolute site origin, no trailing slash ("https://healthpath.co.in"). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://healthpath.co.in"
).replace(/\/+$/, "");

export const SITE_NAME = "HealthPath";

/** Shown in the og:title suffix and the WebSite schema. */
export const SITE_TAGLINE =
  "Doctors, Nursing, Lab Tests & Home Care Across India";

/** Used by og:image / twitter:image when a page has no image of its own. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;

/** Social profiles - the same URLs the footer links to. */
export const SOCIAL_PROFILES = [facebook_page_url, instagram_page_url, Linkdn_url];

export const SITE_CONTACT = {
  phone: contact_no,
  email,
  address,
};

/** Absolute URL for a site path ("/faqs" -> "https://.../faqs"). */
export const absoluteUrl = (path = "/") => {
  const clean = `/${String(path || "/").replace(/^\/+/, "")}`;
  return `${SITE_URL}${clean === "/" ? "/" : clean.replace(/\/+$/, "")}`;
};

/**
 * Canonical URL for a route.
 *
 * Query-driven routes (/department-single, /service-details, /doctor-info) get a
 * *normalised* query so one topic has one canonical: the value comes from the SEO
 * registry, not from whatever spelling the inbound link used.
 */
export const canonicalFor = ({ pathname = "/", asPath = "", canonicalQuery } = {}) => {
  const base = String(pathname || "/").split("?")[0];

  if (canonicalQuery) return `${absoluteUrl(base)}?${canonicalQuery}`;

  // Dynamic template (/our-blog/[slug]) - the real path is in asPath.
  if (base.includes("[") && asPath) {
    return absoluteUrl(String(asPath).split("?")[0]);
  }

  return absoluteUrl(base);
};
