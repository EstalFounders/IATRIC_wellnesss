import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { load } from "@cashfreepayments/cashfree-js";
import { Typography, Box, CircularProgress } from "@mui/material";
import { ConsultationButton } from "../Common/commonUi";
import { price_symbol } from "../../constant";
import styles from "./css/appointmentPage.module.css";

/**
 * PaymentModal - Opens Cashfree Checkout after creating/retrieving
 * a server-side Cashfree order. Never receives the Cashfree secret.
 *
 * Uses the official @cashfreepayments/cashfree-js SDK:
 *   import { load } from "@cashfreepayments/cashfree-js";
 *   const cashfree = await load({ mode: "sandbox" | "production" });
 *   cashfree.checkout({ paymentSessionId, returnUrl, redirectTarget: "_self" });
 *
 * The paymentSessionId is returned by /api/payment/create-order (which
 * creates/validates the order server-side and always derives the amount
 * from the database - never from the client). The user is redirected to
 * Cashfree's official hosted checkout page where they select their method
 * (UPI / card / net banking etc.).
 *
 * Verification is always server-side via /api/payment/status (never trusts
 * the checkout redirect alone). Two modes:
 *   - Normal: click Pay -> create order -> checkout via SDK
 *   - Verify-only: when returning from checkout with ?appointmentId=<orderId>,
 *     auto-polls /api/payment/status and shows the result.
 */
const PaymentModal = ({
  appointmentId,
  amount,
  consultationType,
  onPaymentDone,
  onClose,
  autoVerifyOrderId = null,
  // Terminal status handed back by the gateway in the return URL
  // (normalised: "cancelled" | "failed" | "paid" | null).
  initialStatus = null,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const { t } = useLanguage();
  const [initError, setInitError] = useState("");
  const [paymentState, setPaymentState] = useState("idle"); // idle | processing | verifying | success | failed | cancelled | pending
  const [resultMessage, setResultMessage] = useState("");
  const initializedRef = useRef(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Cache the loaded Cashfree SDK instance so retries don't reload it
  const cashfreeRef = useRef(null);

  // Dismissal detection: Cashfree's hosted checkout replaces the page (or opens an
  // overlay) and offers no "user closed me" callback, so the only observable signal
  // is "the document went away and came back". These refs track that window.
  const checkoutOpenRef = useRef(false);
  const pageHiddenRef = useRef(false);
  const currentOrderIdRef = useRef(null);

  // Auto-verify when returning from the Cashfree checkout page
  useEffect(() => {
    if (!autoVerifyOrderId) return;

    setCurrentOrderId(autoVerifyOrderId);
    currentOrderIdRef.current = autoVerifyOrderId;

    if (initialStatus === "cancelled") {
      // The gateway already told us the patient walked away - do not poll (the
      // order stays ACTIVE, which used to render as an endless "verifying").
      initializedRef.current = false;
      setIsInitializing(false);
      setPaymentState("cancelled");
      setResultMessage(t("pm.cancelledBody"));
      return;
    }

    if (initialStatus === "failed") {
      initializedRef.current = false;
      setIsInitializing(false);
      setPaymentState("failed");
      setResultMessage(t("pm.failed"));
      return;
    }

    verifyPayment(autoVerifyOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVerifyOrderId, initialStatus]);

  const handlePay = async () => {
    if (isInitializing || initializedRef.current) return;
    // Which environment the checkout SDK ends up using - logged when Cashfree rejects
    // the session, because that failure is a config mismatch, not a payment error.
    let sdkMode = "unknown";
    setIsInitializing(true);
    setInitError("");

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, consultationType }),
      });

      const data = await res.json();

      if (!data.success) {
        setInitError(data.message || t("pm.initError"));
        setIsInitializing(false);
        return;
      }

      if (data.alreadyPaid) {
        setPaymentState("success");
        setResultMessage(t("pm.success"));
        if (onPaymentDone) onPaymentDone();
        return;
      }

      // A missing session id must never reach Cashfree: it answers with an opaque
      // {"code":"payment_session_id_invalid"} body that reads like an outage.
      if (!data.paymentSessionId) {
        console.error("create-order returned no payment session", data);
        initializedRef.current = false;
        setInitError(t("pm.initError"));
        setIsInitializing(false);
        return;
      }

      // Load / ensure the Cashfree JS SDK is available (official npm package).
      // The mode comes from the server that minted the session (checkoutMode) so the
      // SDK always targets the same environment; NEXT_PUBLIC_CASHFREE_ENVIRONMENT is
      // inlined at build time and cannot be trusted per host.
      if (!cashfreeRef.current) {
        const mode =
          data.checkoutMode ||
          (process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT &&
          process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT.toUpperCase() === "PRODUCTION"
            ? "production"
            : "sandbox");
        sdkMode = mode;
        cashfreeRef.current = await load({ mode });
      }

      const paymentSessionId = data.paymentSessionId;
      const orderId = data.orderId;
      initializedRef.current = true;
      setCurrentOrderId(orderId);

      // Official hosted checkout - redirects the user to Cashfree's page where
      // they select their payment method (UPI / card / net banking etc.).
      // The user lands back on /payment/thankyou?appointmentId=<orderId> where
      // the thank-you page polls the backend status.
      const appBase =
        process.env.NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL || "staging.healthpath.co.in/";
      const base = appBase.endsWith("/") ? appBase : `${appBase}/`;

      // The gateway owns the screen from here on. Flag the window so that a
      // dismissal (back button from the hosted page / closed overlay) is read as a
      // cancel signal once the document becomes visible again.
      checkoutOpenRef.current = true;
      pageHiddenRef.current = false;

      const checkoutResult = await cashfreeRef.current.checkout({
        paymentSessionId,
        returnUrl: `https://${base}payment/thankyou?appointmentId={order_id}`,
        redirectTarget: "_self",
      });

      // Cashfree resolves instead of redirecting when the patient closes the
      // gateway: `{ error: "payment_cancelled" }` (or similar). That used to fall
      // through silently, leaving the booking on screen with no explanation.
      const checkoutError = String(checkoutResult?.error || "").toLowerCase();
      if (checkoutError) {
        checkoutOpenRef.current = false;
        initializedRef.current = false;
        setIsInitializing(false);
        if (
          checkoutError.includes("cancel") ||
          checkoutError.includes("clos") ||
          checkoutError.includes("dismiss")
        ) {
          setPaymentState("cancelled");
          setResultMessage(t("pm.cancelledBody"));
        } else {
          setPaymentState("failed");
          setResultMessage(t("pm.failed"));
        }
        return;
      }
      // No error: the browser navigated to Cashfree (this code will not run again
      // on this page load) or the checkout closed cleanly - the return listeners
      // below settle the final state from the backend.
    } catch (err) {
      checkoutOpenRef.current = false;
      console.error("Payment init error:", err);

      // --- Session expiry handling ---
      // Cashfree's payment_session_id has a limited TTL (typically ~15 min).
      // When it expires, checkout() rejects/errors. We cannot extend it, but we
      // can generate a FRESH session (same orderId - create-order is idempotent)
      // and let the user re-open checkout with one click.
      const rawMessage = err?.message || "";
      const msg = rawMessage.toLowerCase();

      // Cashfree rejects a session that belongs to the other environment (or an unknown
      // one) with {"code":"payment_session_id_invalid","type":"request_failed"}. That is
      // a deployment/config mismatch, NOT an expiry - and the "session" heuristic below
      // used to swallow it, telling the patient to "click Pay again" forever.
      if (rawMessage.includes("payment_session_id_invalid")) {
        console.error(
          "Cashfree checkout rejected the payment session - the SDK environment does not match the one that created the order",
          { sdkMode, error: rawMessage }
        );
        initializedRef.current = false;
        setPaymentState("idle");
        setInitError(t("pm.configError"));
        setIsInitializing(false);
        return;
      }

      const sessionExpired =
        msg.includes("expired") ||
        msg.includes("session") ||
        msg.includes("timeout") ||
        msg.includes("invalid payment session");
      if (sessionExpired) {
        // Allow a fresh session to be created on next Pay click
        initializedRef.current = false;
        setPaymentState("idle");
        setInitError(
          t("pm.expired")
        );
      } else {
        setInitError(
          err?.message
            ? `Unable to initialize payment. ${err.message}`
            : "Unable to initialize payment. Please try again."
        );
      }
      setIsInitializing(false);
    }
  };

  const verifyPayment = async (orderId) => {
    setPaymentState("verifying");
    setCurrentOrderId(orderId);
    currentOrderIdRef.current = orderId;
    // Poll the backend status endpoint until terminal (or max attempts)
    let attempts = 0;
    const maxAttempts = 12; // ~36s max, then show Retry instead of infinite spinner
    const poll = async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.success && data.status === "PAID") {
          setPaymentState("success");
          setResultMessage(t("pm.success"));
          if (onPaymentDone) onPaymentDone();
          return;
        }
        if (data.status === "FAILED") {
          setPaymentState("failed");
          setResultMessage(t("pm.failed"));
          setIsInitializing(false);
          initializedRef.current = false;
          return;
        }
        if (data.status === "CANCELLED") {
          setPaymentState("cancelled");
          setResultMessage(t("pm.cancelledBody"));
          setIsInitializing(false);
          initializedRef.current = false;
          return;
        }
        // Still pending (ACTIVE / PAYMENT_PENDING)
        attempts += 1;
        if (attempts >= maxAttempts) {
          setPaymentState("pending");
          setResultMessage(
            "We have not received payment confirmation yet. Your order is still pending. You can check again or retry payment."
          );
          setIsInitializing(false);
          return;
        }
        setTimeout(poll, 3000);
      } catch (err) {
        attempts += 1;
        if (attempts >= maxAttempts) {
          setPaymentState("pending");
          setResultMessage(
            t("pm.statusError")
          );
          setIsInitializing(false);
          return;
        }
        setTimeout(poll, 3000);
      }
    };
    poll();
  };

  /**
   * The checkout window is gone and the patient is back on this page. Ask the
   * backend a few times before calling it a cancellation: a UPI/card payment can
   * already be captured by the time the browser returns.
   */
  const settleDismissedCheckout = async (orderId) => {
    initializedRef.current = false;
    setIsInitializing(false);

    if (!orderId) {
      setPaymentState("cancelled");
      setResultMessage(t("pm.cancelledBody"));
      return;
    }

    setPaymentState("verifying");

    const attempts = 3;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const res = await fetch(
          `/api/payment/status?orderId=${encodeURIComponent(orderId)}`
        );
        const data = await res.json();

        if (data.success && data.status === "PAID") {
          setPaymentState("success");
          setResultMessage(t("pm.success"));
          if (onPaymentDone) onPaymentDone();
          return;
        }
        if (data.status === "FAILED") {
          setPaymentState("failed");
          setResultMessage(t("pm.failed"));
          return;
        }
        if (data.status === "CANCELLED") {
          setPaymentState("cancelled");
          setResultMessage(t("pm.cancelledBody"));
          return;
        }
      } catch (err) {
        console.error(
          "Payment status check after checkout dismissal failed:",
          err
        );
      }

      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Nothing was captured: the gateway was closed without completing the payment.
    setPaymentState("cancelled");
    setResultMessage(t("pm.cancelledBody"));
  };

  // The patient left this document for the gateway (or its overlay) and came back.
  // That is the only observable dismissal signal - Cashfree has no "closed" event -
  // so the return is settled against the backend instead of leaving the booking on
  // an unpaid "processing" screen.
  useEffect(() => {
    const settleIfReturned = () => {
      if (!checkoutOpenRef.current) return;
      checkoutOpenRef.current = false;
      settleDismissedCheckout(currentOrderIdRef.current);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (checkoutOpenRef.current) pageHiddenRef.current = true;
        return;
      }
      if (pageHiddenRef.current) {
        pageHiddenRef.current = false;
        settleIfReturned();
      }
    };

    // Restored from the back/forward cache after the hosted page: no
    // visibilitychange fires, only pageshow with persisted=true.
    const handlePageShow = (event) => {
      if (!event.persisted) return;
      pageHiddenRef.current = false;
      settleIfReturned();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box p={3} textAlign="center">
      <Typography variant="h5" className={styles.makeAppointmentText}>
        Consultation Fee: {price_symbol}
        {amount || 0}
      </Typography>

      {paymentState === "success" && (
        <Box mt={3}>
          <Typography variant="h6" style={{ color: "#2e7d32" }}>
            {resultMessage}
          </Typography>
        </Box>
      )}

      {paymentState === "failed" && (
        <Box mt={3}>
          <Typography variant="h6" style={{ color: "#c62828" }}>
            {resultMessage}
          </Typography>
          <Box mt={2}>
            <ConsultationButton onClick={handlePay} disabled={isInitializing}>
              {t("pm.tryAgain")}
            </ConsultationButton>
          </Box>
        </Box>
      )}

      {paymentState === "cancelled" && (
        <Box mt={3}>
          <Typography variant="h6" style={{ color: "#b45309", fontWeight: 700 }}>
            {t("pm.cancelledTitle")}
          </Typography>
          <Typography
            variant="body1"
            mt={1}
            style={{ maxWidth: 420, margin: "0 auto", color: "#4a5568" }}
          >
            {resultMessage || t("pm.cancelledBody")}
          </Typography>
          <Box
            mt={2}
            display="flex"
            justifyContent="center"
            gap={2}
            flexWrap="wrap"
          >
            {appointmentId ? (
              <ConsultationButton onClick={handlePay} disabled={isInitializing}>
                {t("pm.tryAgain")}
              </ConsultationButton>
            ) : (
              // Verify-only mode (returned from checkout): there is no appointment
              // id in this view, so a retry must start from the booking form.
              <ConsultationButton onClick={onClose}>
                {t("pm.bookAgain")}
              </ConsultationButton>
            )}
            {currentOrderId && (
              <ConsultationButton
                onClick={() => verifyPayment(currentOrderId)}
                disabled={isInitializing}
              >
                {t("pm.checkStatus")}
              </ConsultationButton>
            )}
          </Box>
        </Box>
      )}

      {paymentState === "pending" && (
        <Box mt={3}>
          <Typography variant="h6" style={{ color: "#f57c00" }}>
            {resultMessage}
          </Typography>
          <Box mt={2} display="flex" justifyContent="center" gap={2}>
            <ConsultationButton
              onClick={() => verifyPayment(currentOrderId)}
              disabled={isInitializing}
            >
              {t("pm.checkStatus")}
            </ConsultationButton>
            <ConsultationButton onClick={handlePay} disabled={isInitializing}>
              {t("pm.tryAgain")}
            </ConsultationButton>
          </Box>
        </Box>
      )}

      {(paymentState === "verifying" || paymentState === "processing") && (
        <Box mt={3}>
          <CircularProgress />
          <Typography variant="body1" mt={2}>
            {t("pm.verifying")}
          </Typography>
        </Box>
      )}

      {paymentState === "idle" && (
        <Box mt={3}>
          <Typography variant="body1" mb={2} style={{ maxWidth: 420, margin: "0 auto" }}>
            {initError
              ? initError
              : t("pm.payTitle")}
          </Typography>
          <ConsultationButton onClick={handlePay} disabled={isInitializing}>
            {isInitializing
              ? t("af.loading")
              : initError
              ? "Refresh & Pay Again"
              : `Pay ${price_symbol}${amount || 0}`}
          </ConsultationButton>
          {initError && (
            <Typography variant="body2" color="error" mt={2}>
              {initError}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PaymentModal;