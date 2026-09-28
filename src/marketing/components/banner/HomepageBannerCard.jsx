import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Badge, Button } from "react-bootstrap";
import { api } from "../../../constant";
import { POPUP_FALLBACK_IMAGE } from "../../../../data/popupBanner";
import { BANNER_STORAGE_PATH, applyBannerCacheMetadata, getBannerImageUrl, withCacheBuster } from "../../../services/firebaseStorage";
import styles from "../css/marketingPanel.module.css";
import EditBannerModal from "./EditBannerModal";

const formatDate = (value) => {
  if (!value) return "never";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "never" : date.toLocaleString();
};

/**
 * Homepage banner block on the marketing dashboard.
 * Everything (preview, status, upload, edit) happens here - no page navigation.
 */
const HomepageBannerCard = ({ moduleInfo }) => {
  const [state, setState] = useState({
    loading: true,
    error: "",
    banner: null,
    liveNow: false,
  });
  const [storageImage, setStorageImage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [broken, setBroken] = useState(false);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const loadBanner = useCallback(async () => {
    try {
      const response = await fetch(api.marketingBanner, { cache: "no-store" });

      if (response.status === 401) {
        window.location.replace("/marketing/login");
        return;
      }

      const data = await response.json();

      setState({
        loading: false,
        error: data.ok ? "" : data.message || "Could not load the banner.",
        banner: data.banner || null,
        liveNow: Boolean(data.liveNow),
      });
      setBroken(false);

      // No URL saved in the panel yet? Show the image that actually sits at the
      // fixed Firebase path (metadata/img.png) instead of a generic placeholder.
      if (!data.banner?.bannerUrl) {
        const directUrl = await getBannerImageUrl();
        if (mountedRef.current) setStorageImage(directUrl || "");
      } else if (mountedRef.current) {
        setStorageImage("");
      }

      // Older uploads were stored with `no-cache`; give the existing object the same
      // long-lived headers the next upload would set (best effort, panel only).
      applyBannerCacheMetadata();
    } catch (error) {
      setState({
        loading: false,
        error: "Could not load the banner.",
        banner: null,
        liveNow: false,
      });
    }
  }, []);

  useEffect(() => {
    loadBanner();
  }, [loadBanner]);

  const { banner, liveNow, loading, error } = state;

  // The current banner: the URL saved in the panel, else the image stored at
  // metadata/img.png in Firebase, else the local placeholder (only if broken).
  const currentImage = banner?.bannerUrl
    ? withCacheBuster(banner.bannerUrl, banner.lastUpdated)
    : storageImage;

  const statusLabel = !banner?.bannerUrl
    ? storageImage
      ? "In Storage"
      : "Not set"
    : liveNow
    ? "Active"
    : "Paused";

  const statusVariant = liveNow
    ? "success"
    : banner?.bannerUrl || storageImage
    ? "secondary"
    : "warning";
  const previewSrc = broken || !currentImage ? POPUP_FALLBACK_IMAGE : currentImage;

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Homepage Banner</h2>
        <Badge bg={statusVariant}>{loading ? "Loading…" : statusLabel}</Badge>
      </div>

      <p className={styles.summary}>
        {moduleInfo?.summary ||
          "The homepage popup image, uploaded to Firebase Storage."}
      </p>

      <Image
        src={previewSrc}
        alt={banner?.altText || "Homepage banner"}
        width={420}
        height={208}
        className={styles.previewImg}
        onError={() => setBroken(true)}
        unoptimized
      />

      <p className={styles.muted}>
        <strong>Last updated:</strong> {formatDate(banner?.lastUpdated)}
      </p>
      <p className={styles.muted}>
        <strong>Storage path:</strong> <code>/{BANNER_STORAGE_PATH}</code>
      </p>

      {(error || notice) && (
        <div className={styles.notice} role="status">
          {error || notice}
        </div>
      )}

      <div className={styles.rowActions}>
        <Button
          size="sm"
          onClick={() => {
            setNotice("");
            setModalOpen(true);
          }}
          style={{ backgroundColor: "#3b5f1d", border: "none" }}
        >
          {banner?.bannerUrl || storageImage ? "Edit Banner" : "Upload New Image"}
        </Button>
      </div>

      <EditBannerModal
        show={modalOpen}
        banner={banner}
        onHide={() => setModalOpen(false)}
        onSaved={(message) => {
          setNotice(message);
          loadBanner();
        }}
      />
    </section>
  );
};

export default HomepageBannerCard;
