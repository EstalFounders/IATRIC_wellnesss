import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../constant";

// Panel/admin screens must never be re-titled by marketing metadata.
const SKIP_PREFIXES = ["/superAdmin", "/registerDoc", "/marketing"];

/**
 * Writes the marketing-managed SEO tags for the page being viewed.
 *
 * `metadata` comes from the page's getStaticProps (see
 * src/api/marketing/helpers/seoServer.js) so the tags are already in the HTML
 * that crawlers receive. Pages that have not been converted yet fall back to a
 * client-side fetch, so the panel keeps working everywhere.
 */
const SeoMetadata = ({ metadata = null }) => {
  const router = useRouter();
  const pathname = router.pathname;
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

  const seo = metadata || fetched;

  if (!seo) return null;

  // Canonical / og:url need an absolute origin; only emitted when configured.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const canonical = siteUrl
    ? `${siteUrl}${pathname === "/" ? "/" : pathname}`
    : "";

  return (
    <Head>
      {seo.metaTitle ? <title>{seo.metaTitle}</title> : null}
      {seo.metaDescription ? (
        <meta name="description" content={seo.metaDescription} />
      ) : null}
      {seo.keywords?.length ? (
        <meta name="keywords" content={seo.keywords.join(", ")} />
      ) : null}
      {seo.metaTitle ? (
        <meta property="og:title" content={seo.metaTitle} />
      ) : null}
      {seo.metaDescription ? (
        <meta property="og:description" content={seo.metaDescription} />
      ) : null}
      <meta property="og:type" content="website" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
    </Head>
  );
};

export default SeoMetadata;

