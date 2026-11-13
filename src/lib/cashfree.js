import crypto from "crypto";
import { getSameSiteOrigin } from "./appOrigin";

const isProductionEnv = () => {
  return (
    process.env.CASHFREE_ENVIRONMENT &&
    process.env.CASHFREE_ENVIRONMENT.toUpperCase() === "PRODUCTION"
  );
};

export const CASHFREE_BASE_URL =
  process.env.CASHFREE_API_BASE_URL ||
  (isProductionEnv()
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com");

export const CASHFREE_API_VERSION =
  process.env.CASHFREE_API_VERSION || "2023-08-01";

export const CASHFREE_CHECKOUT_BASE_URL =
  process.env.CASHFREE_CHECKOUT_BASE_URL ||
  (isProductionEnv()
    ? "https://payments.cashfree.com"
    : "https://sandbox.cashfree.com");

/**
 * Which environment the browser checkout SDK must be loaded for.
 *
 * A payment_session_id is only valid in the environment that created it: loading the
 * SDK for the other one makes Cashfree's checkout answer
 * {"code":"payment_session_id_invalid","type":"request_failed"}.
 *
 * This is derived from CASHFREE_BASE_URL - the endpoint the server actually created the
 * order on - and NOT from CASHFREE_ENVIRONMENT or NEXT_PUBLIC_CASHFREE_ENVIRONMENT:
 * per-host overrides (e.g. the staging VPS runs Cashfree sandbox through
 * .env.production.local) and build-time inlining make those drift apart.
 */
export function getCashfreeCheckoutMode() {
  return /^https:\/\/api\.cashfree\.com/i.test(CASHFREE_BASE_URL)
    ? "production"
    : "sandbox";
}

export function getCashfreeCheckoutUrl(paymentSessionId) {
  return `${CASHFREE_CHECKOUT_BASE_URL}/pg/checkout?payment_session_id=${encodeURIComponent(
    paymentSessionId
  )}`;
}

export function getCashfreeConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Cashfree credentials not configured on the server");
  }

  return { clientId, clientSecret };
}

/**
 * Public base URL (`https://host/`) used for the Cashfree `return_url` and
 * `notify_url` below.
 *
 * The thank-you page - and therefore the server that verifies the payment - runs
 * on whichever deployment Cashfree redirects to, so the redirect MUST land on the
 * deployment that created the order: a checkout started on localhost has to come
 * back to localhost, a staging checkout to staging. `requestOrigin` (the origin of
 * the inbound create-order/pay request) is that deployment; `getSameSiteOrigin`
 * keeps the value an absolute http(s) origin and prefers the configured public URL
 * when both name the same host, so a proxy that drops `x-forwarded-proto` cannot
 * downgrade https -> http.
 *
 * Resolution order: request origin / configured app URL -> legacy
 * NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL (what production is configured with
 * today, and the only signal a host-less caller - cron, script, test - can offer)
 * -> localhost fallback outside production.
 */
function resolveAppBase({ requestOrigin } = {}) {
  const sameSite = getSameSiteOrigin({ requestOrigin });
  if (sameSite) return `${sameSite.replace(/\/+$/, "")}/`;

  const legacyHost = String(
    process.env.NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL || "",
  )
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^\/+|\/+$/g, "");

  if (legacyHost) return `https://${legacyHost}/`;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Public app URL is not configured: set NEXT_PUBLIC_APP_URL (or NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL) so payment redirects stay on this domain",
    );
  }

  return "http://localhost:3000/";
}

export async function createCashfreeOrder({
  orderId,
  amount,
  customerDetails,
  // Optional tags echoed back on the order (and in the PAID webhook), used to
  // tie a Cashfree order to our appointment - and to carry the offer code when
  // one is known up front - without another lookup.
  orderTags,
  // Origin of the request that asked for this order (see resolveAppBase).
  requestOrigin,
}) {
  const { clientId, clientSecret } = getCashfreeConfig();

  const appBase = resolveAppBase({ requestOrigin });

  const body = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    order_note: "Healthpath consultation payment",
    customer_details: {
      customer_id: customerDetails.customerId,
      customer_name: customerDetails.customerName,
      customer_email: customerDetails.customerEmail,
      customer_phone: customerDetails.customerPhone,
    },
    order_meta: {
      return_url: `${appBase}payment/thankyou?appointmentId=${orderId}`,
      notify_url: `${appBase}api/payment/webhook`,
    },
  };

  if (orderTags && typeof orderTags === "object") {
    body.order_tags = orderTags;
  }

  const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": CASHFREE_API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Cashfree create order failed:", {
      status: response.status,
      response: data,
    });
    throw new Error(data?.message || "Unable to create Cashfree order");
  }

  return data;
}

/**
 * Cashfree Order Pay API (v2023-08-01) - POST /pg/orders/pay
 * Executes payment for an existing order using a concrete payment method.
 */
export async function payCashfreeOrder({
  orderId,
  orderAmount,
  orderCurrency,
  customerDetails,
  paymentMethod,
  // Origin of the request that asked for this payment (see resolveAppBase).
  requestOrigin,
}) {
  const { clientId, clientSecret } = getCashfreeConfig();

  const appBase = resolveAppBase({ requestOrigin });

  const body = {
    order_id: orderId,
    order_amount: orderAmount,
    order_currency: orderCurrency || "INR",
    order_meta: {
      return_url: `${appBase}payment/thankyou?appointmentId=${orderId}`,
      notify_url: `${appBase}api/payment/webhook`,
    },
    payment_method: paymentMethod,
    customer_details: {
      customer_id: customerDetails.customerId,
      customer_name: customerDetails.customerName,
      customer_email: customerDetails.customerEmail,
      customer_phone: customerDetails.customerPhone,
    },
  };

  const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": CASHFREE_API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Cashfree Order Pay failed:", {
      status: response.status,
      orderId,
      response: data,
    });
    throw new Error(data?.message || "Unable to execute Cashfree Order Pay");
  }

  return data;
}

export async function getCashfreeOrderStatus(orderId) {
  const { clientId, clientSecret } = getCashfreeConfig();

  const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": CASHFREE_API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Cashfree order status failed:", {
      status: response.status,
      orderId,
      response: data,
    });
    throw new Error(data?.message || "Unable to fetch Cashfree order status");
  }

  return data;
}

export async function getCashfreePaymentStatus(orderId) {
  const { clientId, clientSecret } = getCashfreeConfig();

  const response = await fetch(
    `${CASHFREE_BASE_URL}/pg/orders/${orderId}/payments`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Cashfree payment status failed:", {
      status: response.status,
      orderId,
      response: data,
    });
    throw new Error(data?.message || "Unable to fetch Cashfree payment status");
  }

  return data;
}

export async function createCashfreeRefund({ orderId, refundAmount, refundNote }) {
  const { clientId, clientSecret } = getCashfreeConfig();

  const body = {
    refund_amount: refundAmount,
    refund_note: refundNote,
  };

  const response = await fetch(
    `${CASHFREE_BASE_URL}/pg/orders/${orderId}/refunds`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Cashfree refund failed:", {
      status: response.status,
      orderId,
      response: data,
    });
    throw new Error(data?.message || "Unable to create Cashfree refund");
  }

  return data;
}

/** Constant-time compare that tolerates different lengths instead of throwing. */
const safeEqual = (received, computed) => {
  const a = Buffer.from(String(received || ""), "utf8");
  const b = Buffer.from(String(computed || ""), "utf8");
  // `crypto.timingSafeEqual` throws "Input buffers must have the same byte
  // length" on a length mismatch, which a bogus/foreign signature always is.
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

// Reported once per process: a placeholder secret rejects every webhook, and the
// operator needs to see that instead of a per-request failure log.
let warnedAboutSecret = false;

const readWebhookSecret = () => {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret || /^<.*>$/.test(secret.trim())) {
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.error(
        "CASHFREE_WEBHOOK_SECRET is not configured (or is still the placeholder). " +
          "Every Cashfree webhook will be rejected until the real secret from the " +
          "Cashfree dashboard is set on the server."
      );
    }
    return "";
  }
  return secret;
};

/**
 * Verifies a Cashfree webhook signature (HMAC SHA-256, API version 2023-08-01).
 *
 * Cashfree signs `x-webhook-timestamp + rawBody` and sends the digest
 * **base64-encoded** in `x-webhook-signature`. This used to compute
 * `HMAC(rawBody)` as hex and hand both values to `crypto.timingSafeEqual`, which
 * threw `RangeError: Input buffers must have the same byte length` (64-byte hex
 * vs 44-byte base64) - the webhook answered 500 on every delivery.
 *
 * The body-only and hex forms are still accepted so an integration configured
 * against the older scheme keeps working; each candidate is an HMAC of data we
 * received with our own secret, so accepting them does not weaken the check.
 * Never throws - an unverifiable payload is simply `false`.
 */
export function verifyCashfreeWebhookSignature({ rawBody, signature, timestamp }) {
  try {
    const secret = readWebhookSecret();
    if (!secret || !rawBody || !signature) return false;

    const body = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(String(rawBody), "utf8");
    const received = String(signature).trim();
    // Cashfree sends "ts=...,v1=..." style values on some endpoints; keep the
    // base64 payload itself when the header is prefixed.
    const receivedSignature = received.includes(",")
      ? received
          .split(",")
          .map((part) => part.split("=").pop().trim())
          .filter(Boolean)
          .pop()
      : received;

    const digest = (payload) =>
      crypto.createHmac("sha256", secret).update(payload).digest();

    const signedBody = timestamp
      ? Buffer.concat([Buffer.from(String(timestamp), "utf8"), body])
      : null;

    const candidates = [];
    if (signedBody) {
      const hmac = digest(signedBody);
      candidates.push(hmac.toString("base64"), hmac.toString("hex"));
    }
    const bodyHmac = digest(body);
    candidates.push(bodyHmac.toString("base64"), bodyHmac.toString("hex"));

    const haystack = new Set(candidates.map((value) => value.toLowerCase()));
    const needle = String(receivedSignature).toLowerCase();

    for (const candidate of haystack) {
      if (safeEqual(needle, candidate)) return true;
    }
    return false;
  } catch (error) {
    console.error(
      "Cashfree webhook signature verification error:",
      error?.message || error
    );
    return false;
  }
}
