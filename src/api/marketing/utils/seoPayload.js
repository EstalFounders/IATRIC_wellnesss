// Shared SEO payload helpers (used by the SEO API routes, the panel form and the
// public metadata lookup). Keep this file free of server-only imports - the
// client components import SEO_LIMITS and MARKETING_PAGES from here.
export const SEO_LIMITS = {
  title: 70,
  description: 180,
  keywords: 25,
};

/**
 * The site pages the panel can manage, keyed by `pageIdentifier`.
 * `path` is the real Next.js route the metadata is applied to.
 */
export const MARKETING_PAGES = {
  home: { label: "Home Page", path: "/" },
  about: { label: "About Us", path: "/about-us" },
  services: { label: "All Services", path: "/all-services" },
  departments: { label: "All Departments", path: "/all-departments" },
  doctors: { label: "All Doctors", path: "/all-doctors" },
  contact: { label: "Contact Us", path: "/contacts-1" },
  appointment: { label: "Book Appointment", path: "/appointment" },
  blog: { label: "Our Blog", path: "/our-blog" },
  demo5: { label: "Demo 5 Landing", path: "/demo-5" },
  faqs: { label: "FAQs", path: "/faqs" },
  pricing: { label: "Pricing", path: "/pricing-1" },
  gallery: { label: "Gallery", path: "/gallery" },
  joinUs: { label: "Join Us", path: "/join-us" },
  privacyPolicy: { label: "Privacy Policy", path: "/privacy-policy" },
  terms: { label: "Terms of Service", path: "/terms-of-service" },
};

export const PAGE_IDENTIFIERS = Object.keys(MARKETING_PAGES);

/** Path shown for an identifier (falls back to "/" for unknown keys). */
export const identifierToPath = (pageIdentifier) =>
  MARKETING_PAGES[pageIdentifier]?.path || "";

/** Resolve a route path ("/all-services") to its pageIdentifier ("services"). */
export const pathToPageIdentifier = (pathname) => {
  if (typeof pathname !== "string") return "";

  const normalised = pathname.trim().toLowerCase().replace(/\/+$/, "") || "/";
  const match = PAGE_IDENTIFIERS.find(
    (identifier) => MARKETING_PAGES[identifier].path.toLowerCase() === normalised
  );

  return match || "";
};

const toKeywordArray = (value) => {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(",")
    : [];

  return [
    ...new Set(
      list
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ].slice(0, SEO_LIMITS.keywords);
};

/** Validate + normalise the panel payload. Returns { values, errors }. */
export const sanitizeSeoPayload = (body = {}) => {
  const pageIdentifier =
    typeof body.pageIdentifier === "string"
      ? body.pageIdentifier.trim().toLowerCase()
      : "";
  const pageTitle =
    typeof body.pageTitle === "string"
      ? body.pageTitle.trim().slice(0, SEO_LIMITS.title)
      : "";
  const metaDescription =
    typeof body.metaDescription === "string"
      ? body.metaDescription.trim().slice(0, SEO_LIMITS.description)
      : "";
  const seoKeywords = toKeywordArray(body.seoKeywords);
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  const errors = [];
  if (!pageIdentifier) {
    errors.push("Choose the page this entry belongs to.");
  } else if (!MARKETING_PAGES[pageIdentifier]) {
    errors.push(
      `Unknown page "${pageIdentifier}". Allowed: ${PAGE_IDENTIFIERS.join(", ")}.`
    );
  }
  if (!pageTitle) errors.push("A page title is required (used as the meta title).");

  return {
    values: { pageIdentifier, pageTitle, seoKeywords, metaDescription, isActive },
    errors,
  };
};

