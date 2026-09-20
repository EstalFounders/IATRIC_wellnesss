import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import { POPUP_FALLBACK_IMAGE, popupBanner } from "../../../data/popupBanner";
import { useLanguage } from "../../i18n/LanguageContext";

// Shown once per browser session (survives reloads, resets with a new tab/session).
const SESSION_KEY = "popup_banner_shown";
const SHOW_DELAY_MS = 800;

// Single banner image: an empty `url`, or an image that fails to load, renders the
// local POPUP_FALLBACK_IMAGE instead.
const BannerPopup = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [broken, setBroken] = useState(false);

  const banner = popupBanner || {};

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (err) {
      alreadyShown = false; // storage blocked (private mode) - still show once
    }
    if (alreadyShown) return;

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
  }, []);

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
    // backdrop="static" + keyboard={false}: clicking outside or pressing ESC keeps
    // the popup open - it closes only via the × button.
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
    >
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
            src={broken || !banner.url ? POPUP_FALLBACK_IMAGE : banner.url}
            alt={banner.alt || t("popup.bannerAlt", "HealthPath")}
            width={1200}
            height={630}
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ width: "100%", height: "auto", display: "block" }}
            onError={() => setBroken(true)}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BannerPopup;
