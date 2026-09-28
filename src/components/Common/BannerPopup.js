import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import { POPUP_FALLBACK_IMAGE, popupBanner } from "../../../data/popupBanner";
import { api } from "../../constant";
import {
  getBannerImageUrl,
  withCacheBuster,
} from "../../services/firebaseStorage";
import { useLanguage } from "../../i18n/LanguageContext";

// Shown once per browser session (survives reloads, resets with a new tab/session).
const SESSION_KEY = "popup_banner_shown";
const SHOW_DELAY_MS = 800;
// Identical for the warm-up copy and the modal copy so both resolve to the same
// /_next/image URL: one network request, cached for the modal to reuse.
const POPUP_SIZES = "(max-width: 768px) 100vw, 800px";

/**
 * Homepage popup.
 *
 * The image comes from `initialBanner` (the marketing panel banner, read server-side
 * in pages/index.js via getStaticProps), then /api/marketing/banner/metadata, then
 * Firebase Storage, then the static values in data/popupBanner.js. When nothing is
 * configured the popup is not shown at all. An empty/failing URL renders
 * POPUP_FALLBACK_IMAGE.
 *
 * Performance: as soon as we know the popup will be shown, the image is rendered
 * off-screen with `priority`, so the browser downloads the exact optimised URL the
 * modal needs while the show delay runs. The modal then paints from cache instead of
 * starting a download when it opens.
 */
const BannerPopup = ({ initialBanner = null }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [broken, setBroken] = useState(false);
  const [managedBanner, setManagedBanner] = useState(initialBanner);
  const [resolved, setResolved] = useState(false);
  const [warmUp, setWarmUp] = useState(false);

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

    // Only opened after mount so SSR/first paint match the client markup.
    const timer = setTimeout(() => {
      setShow(true);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch (err) {
        // ignore storage errors
      }
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [resolved, banner?.url]);

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
      {/* Off-screen warm-up copy of the banner. `priority` makes Next emit the
          <link rel="preload" as="image"> hint and fetches it immediately, so opening
          the popup paints from cache instead of waiting for the download. */}
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
            src={imageSrc}
            alt=""
            width={1200}
            height={630}
            sizes={POPUP_SIZES}
            priority
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
            src={imageSrc}
            alt={banner.alt || t("popup.bannerAlt", "HealthPath")}
            width={1200}
            height={630}
            sizes={POPUP_SIZES}
            priority
            style={{ width: "100%", height: "auto", display: "block" }}
            onError={() => setBroken(true)}
          />
        </div>
      </Modal.Body>
    </Modal>
    </>
  );
};

export default BannerPopup;
