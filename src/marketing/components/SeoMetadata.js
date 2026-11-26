import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../constant";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  canonicalFor,
} from "../../seo/siteConfig";
import {
  departmentQueryFor,
  getServiceSeoFromQuery,
  serviceQueryFor,
} from "../../seo/servicesSeo";
import { ROUTE_SEO, isPrivateRoute } from "../../seo/staticPagesSeo";

// Panel/admin screens must never be re-titled by marketing metadata.
const SKIP_PREFIXES = [
  "/superAdmin",
  "/registerDoc",
  "/marketing",
  "/meeting",
  "/payment",
  "/api",
];

const asText = (value) => (Array.isArray(value) ? value[0] : value) || "";

const keywordsOf = (entry) =>
  String(entry?.keywords || "")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);
/**
 * The one writer of per-page metadata.
 *
 * Rendered from pages/_app.js *outside* <NoSsr>, so the tags are in the HTML a
 * crawler receives. Resolution order:
 *   1. pageProps.seoMetadata        - a marketing-panel row (highest priority)
 *   2. the speciality/service registry - /department-single, /service-details
 *   3. ROUTE_SEO[pathname]          - every standalone page
 *   4. the site name                - safe fallback
 *
 * Titles come from exactly one of those, so a page can never ship two <title>
 * tags - which is why pages/_app.js no longer sets a sitewide title.
 */
const SeoMetadata = ({ metadata = null }) => {
  const router = useRouter();
  const pathname = router.pathname || "/";
  // router.query is undefined while a page is being prerendered, so the default
  // lives inside the memo (an inline `|| {}` would re-run it every render).
  const query = router.query;
  const [fetched, setFetched] = useState(null);

  useEffect(() => {
    // Server props win - skip the client fetch entirely when they exist.
    if (metadata || !pathname) return undefined;

    if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      setFetched(null);
      return undefined;
    }

    const controller = new AbortController();

    const loadMetadata = async () => {
      try {
        const response = await fetch(
          `${api.marketingSeoMetadata}?path=${encodeURIComponent(pathname)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const data = await response.json();
        setFetched(data?.found ? data.metadata : null);
      } catch (error) {
        // aborted or offline - keep the page's own tags
      }
    };

    loadMetadata();

    return () => controller.abort();
  }, [metadata, pathname]);

  const tags = useMemo(() => {
    const q = query || {};
    const isServiceRoute =
      pathname === "/department-single" || pathname === "/service-details";
    const serviceEntry = isServiceRoute ? getServiceSeoFromQuery(q) : null;
    const routeEntry = ROUTE_SEO[pathname] || null;
    const panelEntry = metadata || fetched;

    // A speciality URL that matches no topic renders "Department Not Found",
    // so it is a soft 404 and must not be indexed.
    const unknownService = isServiceRoute && !serviceEntry;

    const title =
      panelEntry?.metaTitle ||
      serviceEntry?.title ||
      routeEntry?.title ||
      (unknownService ? "Department Not Found" : SITE_NAME);

    const description =
      panelEntry?.metaDescription ||
      serviceEntry?.description ||
      routeEntry?.description ||
      "";

    const keywords = panelEntry?.keywords?.length
      ? panelEntry.keywords
      : keywordsOf(serviceEntry || routeEntry);

    // Canonical: one normalised URL per topic, even though a topic is reachable
    // through several spellings of the query string.
    let canonical;
    if (pathname === "/department-single" && serviceEntry) {
      canonical = `${absoluteUrl(pathname)}?${departmentQueryFor(serviceEntry)}`;
    } else if (pathname === "/service-details" && serviceEntry) {
      canonical = `${absoluteUrl(pathname)}?${serviceQueryFor(serviceEntry)}`;
    } else if (asText(q.doctorId)) {
      canonical = `${absoluteUrl(pathname)}?doctorId=${encodeURIComponent(
        asText(q.doctorId)
      )}`;
    } else if (routeEntry?.canonicalPath) {
      canonical = absoluteUrl(routeEntry.canonicalPath);
    } else {
      canonical = canonicalFor({ pathname, asPath: router.asPath });
    }

    const noindex =
      isPrivateRoute(pathname) || Boolean(routeEntry?.noindex) || unknownService;

    return { title, description, keywords, canonical, noindex };
  }, [fetched, metadata, pathname, query, router.asPath]);

  const { title, description, keywords, canonical, noindex } = tags;

  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {keywords.length ? (
        <meta name="keywords" content={keywords.join(", ")} />
      ) : null}
      <meta
        name="robots"
        content={
          noindex ? "noindex, follow" : "index, follow, max-image-preview:large"
        }
      />
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {description ? (
        <meta property="og:description" content={description} />
      ) : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description ? (
        <meta name="twitter:description" content={description} />
      ) : null}
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      {canonical ? <meta name="twitter:url" content={canonical} /> : null}
    </Head>
  );
};

export default SeoMetadata;

