import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api, marketing_info_local_storage } from "../../constant";
import styles from "./css/marketingPanel.module.css";

/**
 * Client-side guard for the marketing panel.
 * The session cookie is httpOnly, so access is confirmed through
 * GET /api/marketing/auth/session (same idea as the other panel guards).
 */
const MarketingAuthGuard = ({ children }) => {
  const router = useRouter();
  const [state, setState] = useState("checking");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch(api.marketingSession, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!active) return;

        if (response.ok && data.authenticated) {
          try {
            sessionStorage.setItem(
              marketing_info_local_storage,
              JSON.stringify(data.user)
            );
          } catch (error) {
            // storage can be unavailable (private mode) - the cookie still guards the API
          }
          setState("authenticated");
        } else {
          setState("unauthenticated");
          router.replace("/marketing/login");
        }
      } catch (error) {
        if (!active) return;
        setState("unauthenticated");
        router.replace("/marketing/login");
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (state !== "authenticated") {
    return <div className={styles.checkingWrap}>Checking marketing session…</div>;
  }

  return children;
};

export default MarketingAuthGuard;
