import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../constant";
import styles from "./css/marketingPanel.module.css";
import MarketingShell from "./MarketingShell";
import SEOKeywordsCard from "./SEOKeywordsCard";
import PopupBannerCard from "./banner/HomepageBannerCard";
import BlogManagementCard from "./BlogManagementCard";

// Local render order for the three modules; live status comes from the guarded API.
const BLOCKS = [
  { id: "seo-keywords", Component: SEOKeywordsCard },
  { id: "popup-banner", Component: PopupBannerCard },
  { id: "blog-management", Component: BlogManagementCard },
];

const MarketingDashboard = () => {
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [moduleError, setModuleError] = useState("");

  const loadModules = useCallback(async () => {
    try {
      const response = await fetch(api.marketingModules, { cache: "no-store" });

      if (response.status === 401) {
        router.replace("/marketing/login");
        return;
      }

      const data = await response.json();
      setModules(Array.isArray(data.modules) ? data.modules : []);
      setModuleError("");
    } catch (error) {
      setModuleError("Could not load module status from the API.");
    }
  }, [router]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const moduleInfoFor = (id) => modules.find((module) => module.id === id);

  return (
    <MarketingShell
      title="Marketing dashboard"
      subtitle="Three modules are scaffolded below. Phase 1 covers authentication and navigation; each module's features arrive in the next phases."
    >
      {moduleError && <div className={styles.notice}>{moduleError}</div>}

      <div className={styles.grid}>
        {BLOCKS.map(({ id, Component }) => (
          <Component key={id} moduleInfo={moduleInfoFor(id)} />
        ))}
      </div>
    </MarketingShell>
  );
};

export default MarketingDashboard;
