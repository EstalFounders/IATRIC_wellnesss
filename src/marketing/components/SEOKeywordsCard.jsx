import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../constant";
import styles from "./css/marketingPanel.module.css";

/**
 * Dashboard card for the SEO Keywords module.
 * Pure navigation tile - no form elements here; the editing UI lives on
 * /marketing/seo (see src/marketing/seo/index.jsx + EditSEOModal.jsx).
 */
const SEOKeywordsCard = ({ moduleInfo }) => {
  const router = useRouter();
  const [summary, setSummary] = useState({ loading: true, total: 0, active: 0 });

  useEffect(() => {
    let alive = true;

    const loadSummary = async () => {
      try {
        const response = await fetch(api.marketingSeo, { cache: "no-store" });
        const data = await response.json();
        const entries = Array.isArray(data.entries) ? data.entries : [];

        if (alive) {
          setSummary({
            loading: false,
            total: entries.length,
            active: entries.filter((entry) => entry.isActive !== false).length,
          });
        }
      } catch (error) {
        if (alive) setSummary({ loading: false, total: 0, active: 0 });
      }
    };

    loadSummary();

    return () => {
      alive = false;
    };
  }, []);

  const openManager = () => router.push("/marketing/seo");
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openManager();
    }
  };

  const isLive = moduleInfo?.status === "live";

  return (
    <section
      className={`${styles.card} ${styles.clickable}`}
      role="button"
      tabIndex={0}
      aria-label="Open SEO keywords management"
      onClick={openManager}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>SEO Keywords</h2>
        <span className={styles.badge}>
          {isLive ? "Live" : `Phase ${moduleInfo?.phase || 2}`}
        </span>
      </div>

      <p className={styles.summary}>
        {moduleInfo?.summary ||
          "Manage page titles, meta descriptions and keywords for every site page."}
      </p>

      <p className={styles.muted}>
        {summary.loading
          ? "Loading…"
          : `${summary.total} ${
              summary.total === 1 ? "page" : "pages"
            } configured · ${summary.active} published`}
      </p>

      <span className={styles.clickableHint}>Manage SEO keywords →</span>
    </section>
  );
};

export default SEOKeywordsCard;
