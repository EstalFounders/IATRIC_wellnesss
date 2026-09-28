import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { api, marketing_info_local_storage } from "../../constant";
import styles from "./css/marketingPanel.module.css";

/** Shared chrome (top bar, logout, page heading) for every marketing screen. */
const MarketingShell = ({ title, subtitle, actions, children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(marketing_info_local_storage);
      if (raw) setUser(JSON.parse(raw));
    } catch (error) {
      // storage unavailable - the top bar simply omits the user name
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(api.marketingLogout, { method: "POST" });
    } catch (error) {
      // clearing the local marker is enough for Phase 1
    }

    try {
      sessionStorage.removeItem(marketing_info_local_storage);
    } catch (error) {
      // ignore
    }

    router.replace("/marketing/login");
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <span className={styles.brand}>Marketing Panel</span>
        <span className={styles.user}>
          {user?.username || "marketing"}
          <Button
            size="sm"
            variant="light"
            className="ms-3"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </span>
      </header>

      <main className={styles.container}>
        {actions && <div className={styles.toolbar}>{actions}</div>}
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
        {children}
      </main>
    </div>
  );
};

export default MarketingShell;
