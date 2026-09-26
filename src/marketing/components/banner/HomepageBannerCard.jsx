import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Badge, Button } from "react-bootstrap";
import { api } from "../../../constant";
import { POPUP_FALLBACK_IMAGE } from "../../../../data/popupBanner";
import { BANNER_STORAGE_PATH, withCacheBuster } from "../../../services/firebaseStorage";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [broken, setBroken] = useState(false);

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

  const statusLabel = !banner?.bannerUrl
    ? "Not set"
    : liveNow
    ? "Active"
    : "Paused";

  const statusVariant = liveNow ? "success" : banner?.bannerUrl ? "secondary" : "warning";
  const previewSrc =
    broken || !banner?.bannerUrl
      ? POPUP_FALLBACK_IMAGE
      : withCacheBuster(banner.bannerUrl, banner.lastUpdated);

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
          {banner?.bannerUrl ? "Edit Banner" : "Upload New Image"}
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
