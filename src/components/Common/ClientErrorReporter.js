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
 *                              build's chunk names.
 */
const ClientErrorReporter = () => {
  const router = useRouter();
  // Kept in a ref so the listeners (registered once) always report the route the
  // patient is on *now*, not the one they were on when the effect ran.
  const routeRef = useRef("");

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

    const handleRouteChangeError = (error, url) => {
      reportClientError({
        message: error?.message || "routeChangeError",
        stack: error?.stack,
        route: url || routeRef.current,
        fatal: true,
      });
    };

    const handleRouteChangeComplete = (url) => {
      if (typeof url === "string" && url) routeRef.current = url;
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    router.events.on("routeChangeError", handleRouteChangeError);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      router.events.off("routeChangeError", handleRouteChangeError);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);

  return null;
};

export default ClientErrorReporter;
