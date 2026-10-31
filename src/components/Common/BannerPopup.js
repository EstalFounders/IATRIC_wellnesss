import React, { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import { POPUP_FALLBACK_IMAGE, popupBanner } from "../../../data/popupBanner";
import { api, imageBlurDataUrl } from "../../constant";
import {
  getBannerImageUrl,
  withCacheBuster,
} from "../../services/firebaseStorage";
import { useLanguage } from "../../i18n/LanguageContext";

// Shown once per browser session (survives reloads, resets with a new tab/session).
const SESSION_KEY = "popup_banner_shown";
// Safety net only: the modal normally opens the moment the banner image has
// decoded, so this is the worst-case wait when the download is slow or fails.
const SHOW_MAX_WAIT_MS = 2500;

/**
 * Homepage popup.
 *
 * The image comes from `initialBanner` (the marketing panel banner, read server-side
 * in pages/index.js via getStaticProps), then /api/marketing/banner/metadata, then
 * Firebase Storage, then the static values in data/popupBanner.js. When nothing is
 * configured the popup is not shown at all. An empty/failing URL renders
 * POPUP_FALLBACK_IMAGE.
 *
 * Performance: the image is served straight from Firebase Storage (Google's CDN) via
 * `unoptimized` - no /_next/image transform on our own VPS, which is what made the
 * popup lag, especially right after a deploy cleared the optimiser cache. The URL is
 * known at build time, so <Head> preloads it while the HTML is still parsing, and the
 * modal opens only once that image has actually decoded.
 */
const BannerPopup = ({ initialBanner = null }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [broken, setBroken] = useState(false);
  const [managedBanner, setManagedBanner] = useState(initialBanner);
  const [resolved, setResolved] = useState(false);
  const [warmUp, setWarmUp] = useState(false);
  // True once the banner image has decoded (or fallen back to the local placeholder).
  // The modal waits for this instead of a fixed delay, so it never opens empty.
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    let alive = true;

    // The banner URL is already in the page HTML - no request needed.
    if (initialBanner?.url) {
      setResolved(true);
      return undefined;
    }

    const loadBanner = async () => {
      try {
        const response = await fetch(api.marketingBannerMetadata, {
          cache: "no-store",
        });
        const data = await response.json();

        if (data?.found && data.banner?.url) {
          if (alive) setManagedBanner(data.banner);
          return; // panel record wins
        }
      } catch (error) {
        // offline or blocked - fall through to Firebase Storage below
      }

      // Fallback: the fixed banner path in Firebase Storage (metadata/img.png).
      const directUrl = await getBannerImageUrl();
      if (alive && directUrl) {
        setManagedBanner({ url: directUrl, alt: "HealthPath", href: "" });
      }
    };

    loadBanner().finally(() => {
      if (alive) setResolved(true);
    });

    return () => {
      alive = false;
    };
  }, [initialBanner]);

  const banner = managedBanner || (popupBanner?.url ? popupBanner : null);
  const imageSrc =
    broken || !banner?.url
      ? POPUP_FALLBACK_IMAGE
      : withCacheBuster(banner.url, banner.lastUpdated);

  // Warm the image up before the modal opens. Skipped when this session already saw
  // the popup, so repeat visits download nothing.
  useEffect(() => {
    if (!banner?.url || warmUp) return;

    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch (err) {
      // storage blocked (private mode) - the popup still shows once, so warm it up
    }

    setWarmUp(true);
  }, [banner?.url, warmUp]);

  useEffect(() => {
    if (!resolved || !banner?.url) return undefined;

    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (err) {
      alreadyShown = false; // storage blocked (private mode) - still show once
    }
    if (alreadyShown) return undefined;

    // Only opened after mount (so SSR and the first client paint agree) and as soon as
    // the image is ready to paint - no fixed delay, so the picture is already there
    // when the modal appears.
    const openPopup = () => {
      setShow(true);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch (err) {
        // ignore storage errors
      }
    };

    if (imageReady) {
      openPopup();
      return undefined;
    }

    // A slow or failing download must never keep the popup closed forever.
    const timer = setTimeout(openPopup, SHOW_MAX_WAIT_MS);

    return () => clearTimeout(timer);
  }, [resolved, banner?.url, imageReady]);

  // Nothing configured in the panel (and no static URL) -> no popup.
  if (!banner?.url) return null;

  const handleClose = () => setShow(false);

  // Navigating from the banner must NOT dismiss the popup - only the × button closes it.
  const handleBannerClick = () => {
    const href = banner.href;
    if (!href) return;
    if (/^https?:\/\//i.test(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  return (
    <>
      {/* The banner URL is versioned (withCacheBuster), so preloading it is safe to
          repeat: a cached copy is reused and only a replaced banner is re-fetched.
          Only rendered for a deterministic (versioned) URL so SSR and hydration agree. */}
      {banner.lastUpdated ? (
        <Head>
          <link rel="preload" as="image" href={imageSrc} />
        </Head>
      ) : null}

      {/* Off-screen warm-up copy of the banner: it starts the download and its onLoad
          is what tells us the image is decodable (which opens the popup). */}
      {warmUp && !show && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: 0,
            width: "1px",
            height: "1px",
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <Image
            placeholder="blur"
            blurDataURL={imageBlurDataUrl}
            src={imageSrc}
            alt=""
            width={1200}
            height={630}
            priority
            unoptimized
            onLoad={() => setImageReady(true)}
            onError={() => setBroken(true)}
          />
        </div>
      )}

      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        backdrop="static"
        keyboard={false}
      >
      {/* backdrop="static" + keyboard={false}: clicking outside or pressing ESC keeps
          the popup open - it closes only via the × button. */}
      <Modal.Body className="p-0 position-relative">
        <button
          type="button"
          aria-label={t("popup.close", "Close")}
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "-14px",
            right: "-14px",
            zIndex: 4,
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "none",
            background: "#ffffff",
            color: "#333333",
            fontSize: "1.25rem",
            lineHeight: 1,
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
          }}
        >
          ×
        </button>

        <div
          onClick={handleBannerClick}
          style={{ cursor: banner.href ? "pointer" : "default" }}
        >
          <Image
            placeholder="blur"
            blurDataURL={imageBlurDataUrl}
            src={imageSrc}
            alt={banner.alt || t("popup.bannerAlt", "HealthPath")}
            width={1200}
            height={630}
            priority
            unoptimized
            style={{ width: "100%", height: "auto", display: "block" }}
            onLoad={() => setImageReady(true)}
            onError={() => setBroken(true)}
          />
        </div>
      </Modal.Body>
    </Modal>
    </>
  );
};

export default BannerPopup;
