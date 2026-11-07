import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Google Analytics 4 (gtag.js), rendered once from pages/_app.js.
 *
 * Next.js is a single-page app: the browser loads the document once and every
 * later navigation is client side, so GA4 - which only reports the URL of the
 * initial load by itself - would see nothing but landing pages. The
 * `routeChangeComplete` hook below sends the follow-up `config` call that
 * records each new path as a page_view.
 *
 * The measurement ID is public by design (it ships in the page HTML).
 */
export const GA_MEASUREMENT_ID = "G-7HL3FQZ6QC";

// Internal screens must not pollute the property: the super-admin / marketing
// panels and the doctor register flow, plus the full-screen meeting room.
const SKIP_PREFIXES = ["/superAdmin", "/marketing", "/registerDoc", "/meeting/"];

const GoogleAnalytics = () => {
  const router = useRouter();
  const skipped = SKIP_PREFIXES.some((prefix) =>
    (router.pathname || "").startsWith(prefix)
  );

  useEffect(() => {
    if (skipped) return undefined;

    const handleRouteChange = (url) => {
      if (typeof window.gtag !== "function") return;
      window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events, skipped]);

  if (skipped) return null;

  return (
    <>
      <Script
        id="ga-gtag-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
