import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layouts from "../../src/layout/Layouts";
import PageBanner from "../../src/layout/PageBanner";
import { price_symbol, color_schema } from "../../src/constant";
import {
  PAYMENT_CANCELLED_MESSAGE,
  normalizeReturnPaymentStatus,
} from "../../src/lib/paymentStatus";

const MAX_ATTEMPTS = 12; // ~36s max, then show Retry instead of infinite spinner
const POLL_INTERVAL = 3000;

const ThankYou = () => {
  const router = useRouter();
  const { appointmentId, order_id, payment_status, status } = router.query;
  const single = (value) => (Array.isArray(value) ? value[0] : value);
  // Cashfree substitutes {order_id} in the return_url and may append
  // `payment_status`; plain `status` is accepted for older/other flows.
  const orderId = single(appointmentId) || single(order_id) || null;
  const returnStatus = normalizeReturnPaymentStatus(
    single(payment_status) || single(status)
  );

  const [paymentState, setPaymentState] = useState("verifying"); // verifying | success | cancelled | failed | pending
  const [resultMessage, setResultMessage] = useState("");
  const [orderInfo, setOrderInfo] = useState(null); // { orderId, amount }
  const pollTimerRef = useRef(null);
  const attemptCountRef = useRef(0);
  const hasVerifiedRef = useRef(false);

  const verifyPayment = () => {
    if (!orderId || hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;
    attemptCountRef.current = 0;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/payment/status?orderId=${encodeURIComponent(orderId)}`
        );
        const data = await res.json();

        setOrderInfo({
          orderId: data.orderId || orderId,
          amount: data.amount,
        });

        if (data.success && data.status === "PAID") {
          setPaymentState("success");
          setResultMessage(
            "Your payment was successful and your consultation has been confirmed."
          );
          return;
        }

        if (data.status === "FAILED") {
          setPaymentState("failed");
          setResultMessage(
            data.message || "Payment failed. Your appointment has not been confirmed."
          );
          return;
        }

        if (data.status === "CANCELLED") {
          // The patient closed the gateway (or the payment was cancelled).
          // "Not completed" was the wrong copy here - it reads like a failure
          // they should wait out instead of a dismissal they can simply retry.
          setPaymentState("cancelled");
          setResultMessage(PAYMENT_CANCELLED_MESSAGE);
          return;
        }

        // Still pending (PAYMENT_PENDING / INITIATED)
        attemptCountRef.current += 1;
        if (attemptCountRef.current >= MAX_ATTEMPTS) {
          setPaymentState("pending");
          setResultMessage(
            "We have not received payment confirmation yet. Your order is still pending. You can check again or retry payment."
          );
          return;
        }
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);
      } catch (err) {
        attemptCountRef.current += 1;
        if (attemptCountRef.current >= MAX_ATTEMPTS) {
          setPaymentState("pending");
          setResultMessage(
            "Unable to reach the payment status service. Please check again or retry payment."
          );
          return;
        }
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);
      }
    };

    poll();
  };

  useEffect(() => {
    // A terminal status in the return URL settles the page without polling:
    // Cashfree only appends it once the checkout was closed/failed, so waiting
    // for `pending` here was what produced the wrong "Payment Status Pending"
    // screen after a dismissed gateway.
    if (returnStatus === "cancelled") {
      setPaymentState("cancelled");
      setResultMessage(PAYMENT_CANCELLED_MESSAGE);
      if (orderId) setOrderInfo({ orderId, amount: undefined });
      return undefined;
    }

    if (returnStatus === "failed") {
      setPaymentState("failed");
      setResultMessage(
        "Payment failed. Your appointment has not been confirmed. Please try again with another payment method."
      );
      if (orderId) setOrderInfo({ orderId, amount: undefined });
      return undefined;
    }

    if (orderId) {
      verifyPayment();
    } else {
      setPaymentState("pending");
      setResultMessage(
        "We could not find your order. Please try again or contact customer care."
      );
    }
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, returnStatus]);

  const buttonStyle = {
    display: "inline-block",
    padding: "12px 28px",
    background: color_schema.green,
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "inherit",
  };

  const secondaryButtonStyle = {
    display: "inline-block",
    padding: "12px 28px",
    background: "#ffffff",
    color: color_schema.green,
    border: `2px solid ${color_schema.green}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "inherit",
  };

  const renderBody = () => {
    if (paymentState === "success") {
      return (
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "#e8f5e9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="#2e7d32"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 style={{ color: "#2e7d32", margin: "0 0 12px", fontSize: 28 }}>
            Payment Successful!
          </h2>
          <p style={{ color: "#4a5568", fontSize: 16, margin: "0 0 8px" }}>
            {resultMessage}
          </p>
          {orderInfo && (
            <div
              style={{
                background: "#f8faf5",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "20px 24px",
                margin: "24px 0",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <span style={{ color: "#718096", fontSize: 14 }}>Order ID</span>
                <span style={{ color: "#1a202c", fontSize: 14, fontWeight: 600 }}>
                  {orderInfo.orderId}
                </span>
              </div>
              {typeof orderInfo.amount === "number" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                  }}
                >
                  <span style={{ color: "#718096", fontSize: 14 }}>
                    Amount Paid
                  </span>
                  <span style={{ color: "#1a202c", fontSize: 14, fontWeight: 600 }}>
                    {price_symbol}
                    {orderInfo.amount}
                  </span>
                </div>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link legacyBehavior href="/appointment">
              <a style={secondaryButtonStyle}>Book Another Consultation</a>
            </Link>
            <Link legacyBehavior href="/">
              <a style={buttonStyle}>Go to Home</a>
            </Link>
          </div>
        </div>
      );
    }

    if (paymentState === "cancelled") {
      return (
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "#fff4e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#b45309"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 style={{ color: "#b45309", margin: "0 0 12px", fontSize: 28 }}>
            Payment Cancelled
          </h2>
          <p style={{ color: "#4a5568", fontSize: 16, margin: "0 0 24px" }}>
            {resultMessage || PAYMENT_CANCELLED_MESSAGE}
          </p>
          {orderInfo?.orderId && (
            <div
              style={{
                background: "#fffaf2",
                border: "1px solid #f1e0c6",
                borderRadius: 12,
                padding: "12px 24px",
                margin: "0 0 24px",
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#718096", fontSize: 14 }}>Order ID</span>
              <span style={{ color: "#1a202c", fontSize: 14, fontWeight: 600 }}>
                {orderInfo.orderId}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link legacyBehavior href="/appointment">
              <a style={buttonStyle}>Try Again</a>
            </Link>
            <Link legacyBehavior href="/">
              <a style={secondaryButtonStyle}>Go to Home</a>
            </Link>
          </div>
        </div>
      );
    }

    if (paymentState === "failed") {
      return (
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "#fdecea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#c62828"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 style={{ color: "#c62828", margin: "0 0 12px", fontSize: 28 }}>
            Payment Not Completed
          </h2>
          <p style={{ color: "#4a5568", fontSize: 16, margin: "0 0 24px" }}>
            {resultMessage}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link legacyBehavior href="/appointment">
              <a style={buttonStyle}>Try Again</a>
            </Link>
            <Link legacyBehavior href="/">
              <a style={secondaryButtonStyle}>Go to Home</a>
            </Link>
          </div>
        </div>
      );
    }

    // pending / verifying
    return (
      <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "#fdf6e3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "4px solid rgba(142,131,51,0.2)",
              borderTopColor: color_schema.yellow,
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <h2 style={{ color: color_schema.yellow, margin: "0 0 12px", fontSize: 26 }}>
          {paymentState === "pending"
            ? "Payment Status Pending"
            : "Verifying Your Payment"}
        </h2>
        <p style={{ color: "#4a5568", fontSize: 16, margin: "0 0 24px" }}>
          {resultMessage ||
            "We are confirming your payment with the bank. Please wait..."}
        </p>
        {orderInfo && (
          <div
            style={{
              background: "#f8faf5",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "12px 24px",
              margin: "0 0 24px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#718096", fontSize: 14 }}>Order ID</span>
            <span style={{ color: "#1a202c", fontSize: 14, fontWeight: 600 }}>
              {orderInfo.orderId}
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {paymentState === "pending" && (
            <button
              style={buttonStyle}
              onClick={() => {
                hasVerifiedRef.current = false;
                verifyPayment();
              }}
            >
              Check Status Again
            </button>
          )}
          <Link legacyBehavior href="/appointment">
            <a style={secondaryButtonStyle}>Try Payment Again</a>
          </Link>
          <Link legacyBehavior href="/">
            <a style={secondaryButtonStyle}>Go to Home</a>
          </Link>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  };

  return (
    <Layouts>
      <PageBanner pageTitle="Payment Status" />
      <div
        style={{
          padding: "60px 20px",
          background: "#ffffff",
          minHeight: "50vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {renderBody()}
      </div>
    </Layouts>
  );
};

export default ThankYou;