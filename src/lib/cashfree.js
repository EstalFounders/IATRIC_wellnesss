import crypto from "crypto";
import { getConfiguredAppUrl } from "./appOrigin";

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

export async function createCashfreeOrder({ orderId, amount, customerDetails }) {
  const { clientId, clientSecret } = getCashfreeConfig();

  // Public host used in the return/notify URLs below - these are where Cashfree
  // sends the patient after paying, so a localhost fallback would strand them.
  // Resolution order: dedicated env -> configured public app URL -> dev only.
  const appHost = (
    process.env.NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL ||
    getConfiguredAppUrl().replace(/^https?:\/\//, "") ||
    (process.env.NODE_ENV === "production" ? "" : "localhost:3000")
  )
    .trim()
    .replace(/^\/+|\/+$/g, "");

  if (!appHost) {
    throw new Error(
      "Public app URL is not configured: set NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL (or NEXTAUTH_URL) so payment redirects stay on this domain"
    );
  }

  const appBase = `${appHost}/`;

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
      return_url: `https://${appBase}payment/thankyou?appointmentId=${orderId}`,
      notify_url: `https://${appBase}api/payment/webhook`,
    },
  };

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
}) {
  const { clientId, clientSecret } = getCashfreeConfig();

  const baseUrl = process.env.NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL || "staging.healthpath.co.in/";
  const appBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const body = {
    order_id: orderId,
    order_amount: orderAmount,
    order_currency: orderCurrency || "INR",
    order_meta: {
      return_url: `https://${appBase}payment/thankyou?appointmentId=${orderId}`,
      notify_url: `https://${appBase}api/payment/webhook`,
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

/**
 * Verifies the Cashfree webhook signature using HMAC SHA-256 as described
 * in Cashfree's official webhook documentation.
 */
export function verifyCashfreeWebhookSignature({ rawBody, signature }) {
  if (!process.env.CASHFREE_WEBHOOK_SECRET) {
    console.error("CASHFREE_WEBHOOK_SECRET is not configured");
    return false;
  }

  if (!rawBody || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const actual = String(signature).toLowerCase();
  const expectedHmac = expected.toLowerCase();

  return crypto.timingSafeEqual(
    Buffer.from(actual, "utf8"),
    Buffer.from(expectedHmac, "utf8")
  );
}
