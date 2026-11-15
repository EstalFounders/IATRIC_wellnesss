import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { reportClientError } from "../../lib/clientError";

/**
 * Listens for the three ways a client-side crash shows up in the browser and
 * forwards each one to `reportClientError`. Renders nothing.
 *
 *   - `error`                - an exception thrown outside React (event handlers,
 *                              timers, `undefined` property access on another
 *                              tab's stale state).
 *   - `unhandledrejection`   - an async call that rejected with no `catch`; these
 *                              never reach the `error` event, so without this
 *                              listener the most common failures are invisible.
 *   - `routeChangeError`     - Next.js could not load the next page. This is the
 *                              `Loading chunk ... failed` / `Failed to fetch
 *                              dynamically imported module` family, i.e. the usual
 *                              cause of the blank "Application error" screen after
 *                              a redeploy: the open tab still holds the previous
 *                              build's chunk names. A failed *navigation* of this
 *                              kind now self-heals with an auto-reload (capped and
 *                              loop-guarded); a failed hover-prefetch is harmless
 *                              and is only reported, never reloaded.
 */
const ClientErrorReporter = () => {
  const router = useRouter();
  // Kept in a ref so the listeners (registered once) always report the route the
  // patient is on *now*, not the one they were on when the effect ran.
  const routeRef = useRef("");
  // True only while a real client navigation is in flight (`routeChangeStart`).
  // Prefetches never set it, so a failed hover-prefetch (which also emits
  // `routeChangeError`) cannot trigger a reload.
  const navigatingRef = useRef(false);
  // Pending auto-reload timer, cancelled if a navigation recovers or unmounts.
  const reloadTimerRef = useRef(null);

  useEffect(() => {
    routeRef.current = router.asPath || router.pathname || "";
  }, [router.asPath, router.pathname]);

  useEffect(() => {
    const handleError = (event) => {
      const message = event?.message || event?.error?.message || "";
      // Resource failures (<img>, <link>, ...) bubble here with no message; a
      // missing image is not worth a report. Cross-origin scripts can only say
      // "Script error." - there is nothing to act on either.
      if (!message || /^Script error\.?$/.test(message)) return;
      // Chrome fires this for its own layout loop guard; harmless and very noisy.
      if (message.includes("ResizeObserver loop")) return;
      reportClientError({
        message,
        stack: event?.error?.stack,
        route: routeRef.current,
      });
    };

    const handleRejection = (event) => {
      const reason = event?.reason;
      const message =
        reason?.message || (typeof reason === "string" ? reason : "");
      if (!message) return;
      reportClientError({
        message,
        stack: reason?.stack,
        route: routeRef.current,
      });
    };

    // --- self-heal a navigation that died on a stale chunk -----------------
    // A failed chunk load (a redeploy while the tab was open) leaves the router
    // stuck on the old page. The only safe recovery is a full reload, which
    // re-fetches the HTML and its current chunk names. sessionStorage survives a
    // reload, so the counter caps consecutive attempts and stops the loop.
    const RELOAD_DELAY_MS = 1000;
    const MAX_RELOADS = 3;
    const RELOAD_RESET_MS = 15 * 1000;
    const RELOAD_KEY = "__iatric_chunk_reload";

    const cancelReload = () => {
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
    };

    const clearReloadState = () => {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch (_) {
        /* sessionStorage can be unavailable; the reload itself still works */
      }
    };

    const scheduleReload = () => {
      try {
        const now = Date.now();
        let attempts = 0;
        let firstAt = now;
        const raw = sessionStorage.getItem(RELOAD_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.n === "number") attempts = parsed.n;
          if (typeof parsed?.t === "number") firstAt = parsed.t;
        }
        if (now - firstAt > RELOAD_RESET_MS) {
          attempts = 0;
          firstAt = now;
        }
        if (attempts >= MAX_RELOADS) return; // already reloaded repeatedly - stop
        attempts += 1;
        sessionStorage.setItem(
          RELOAD_KEY,
          JSON.stringify({ n: attempts, t: firstAt }),
        );
        cancelReload();
        reloadTimerRef.current = setTimeout(() => {
          // Leave a background tab alone - reloading while hidden is just noise.
          if (
            typeof document !== "undefined" &&
            document.visibilityState === "hidden"
          ) {
            return;
          }
          window.location.reload();
        }, RELOAD_DELAY_MS);
      } catch (_) {
        /* never throw from the reporter */
      }
    };

    const handleRouteChangeStart = () => {
      navigatingRef.current = true;
    };

    const handleRouteChangeError = (error, url) => {
      // Capture before resetting: a dead <Link> prefetch also lands here but
      // never set `navigatingRef`, so only a real navigation gets reloaded.
      const wasNavigating = navigatingRef.current;
      navigatingRef.current = false;
      reportClientError({
        message: error?.message || "routeChangeError",
        stack: error?.stack,
        route: url || routeRef.current,
        fatal: true,
      });
      if (wasNavigating) scheduleReload();
    };

    const handleRouteChangeComplete = (url) => {
      navigatingRef.current = false;
      if (typeof url === "string" && url) routeRef.current = url;
      // A recovery (manual retry) while a reload was pending makes the reload moot.
      cancelReload();
      clearReloadState();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeError", handleRouteChangeError);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeError", handleRouteChangeError);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      cancelReload();
    };
  }, [router.events]);

  return null;
};

export default ClientErrorReporter;
