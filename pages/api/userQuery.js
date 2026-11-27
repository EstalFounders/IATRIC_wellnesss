import { dbConnect } from "../../src/lib/db";
import Query from "../../src/models/query";
import { sendWhatsAppConfirmation } from "./lib/communication";
import { formatPhoneNumber } from "./utils/commonmethod";
import {
  SUPPORT_NOTIFICATION_PHONE_NUMBER,
  WHATSAPP_CALLBACK_SUPPORT_TEMPLATE,
} from "./utils/constants";
import {
  getCallbackRequestContact,
  getCallbackSupportAlertBody,
} from "./utils/whatsappMessageBodies";
import { rateLimit } from "../../src/lib/rateLimiter";
import {
  isRedisAvailable,
  redisDel,
  redisGet,
  redisSetNX,
} from "../../src/lib/redis";
import { logErrorToGoogleSheet } from "./helper";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_REGEX = /^\d{6}$/;
const OTP_VERIFIED_TTL_SECONDS = 300; // matches the OTP endpoint's marker TTL

/**
 * Normalises a public query submission.
 *
 * The contacts page now collects only name + one "phone or email" field +
 * message, so the body may carry `contact` (the combined field), or the older
 * `email` / `mobile_number` pair. Removed fields (subject, patient, city,
 * address, ...) are ignored instead of being cast into the model, and
 * `mobile_number` is only forwarded when the value really is a phone number -
 * a raw `Number("abc")` used to surface as a Mongoose cast error (HTTP 500).
 *
 * Returns `{ payload }`, or `{ error }` when no usable contact method was sent.
 */
function normalizeQueryPayload(body) {
  const source = body && typeof body === "object" ? body : {};
  const asText = (value) =>
    value === undefined || value === null ? "" : String(value).trim();

  const payload = {};

  const name = asText(source.name);
  if (name) payload.name = name;

  const message = asText(source.message);
  if (message) payload.message = message;

  if (source.visited_before !== undefined) {
    payload.visited_before = source.visited_before;
  }

  const contact = asText(
    source.contact || source.phone_or_email || source.email || source.mobile_number
  );
  if (!contact) {
    return { error: "A phone number or email address is required" };
  }

  if (EMAIL_REGEX.test(contact)) {
    payload.email = contact.toLowerCase();
    return { payload };
  }

  // Accepts plain 10 digits or a 10-digit number with a +91/91 country prefix.
  const digits = contact.replace(/\D/g, "");
  const mobile = digits.slice(-10);
  if (digits.length >= 10 && digits.length <= 12 && /^\d{10}$/.test(mobile)) {
    payload.mobile_number = Number(mobile);
    return { payload };
  }

  return { error: "A valid phone number or email address is required" };
}

/**
 * Enforces "verify before save" for requests that carry an `otp`.
 *
 * The WhatsApp OTP endpoint stores `otp:appointment:verified:<mobile>:<otp>`
 * for 5 minutes after a successful verification; this function requires that
 * marker for the exact mobile number being saved and claims a one-time
 * consumption slot so a single verified code cannot create multiple queries.
 *
 * Requests without an `otp` field (contacts page, join-us, the demo-5 contact
 * section, ...) keep the legacy one-shot behaviour on purpose.
 *
 * Returns `{}` when the request is not OTP-gated, `{ errorStatus, error }`
 * when it must be rejected, or `{ verifiedKey, consumeKey }` when the caller
 * has to release the markers around the save.
 */
async function redeemCallbackOtp(body, payload) {
  const rawOtp = body?.otp;
  if (rawOtp === undefined || rawOtp === null || String(rawOtp).trim() === "") {
    return {};
  }

  const otp = String(rawOtp).trim();
  if (!OTP_REGEX.test(otp)) {
    return { errorStatus: 400, error: "A valid 6-digit OTP is required" };
  }

  const mobile = payload?.mobile_number;
  if (!mobile) {
    return {
      errorStatus: 400,
      error: "OTP verification is only available for mobile numbers",
    };
  }

  const verifiedKey = `otp:appointment:verified:${mobile}:${otp}`;
  const verified = await redisGet(verifiedKey);
  if (!verified) {
    // redisGet returns null both for a miss and for an outage; only treat it
    // as a missing verification when Redis is actually reachable.
    if (!isRedisAvailable()) {
      return {
        errorStatus: 503,
        error: "Number verification is temporarily unavailable. Please try again.",
      };
    }
    return {
      errorStatus: 400,
      error: "Verify the mobile number before submitting the request",
    };
  }

  const consumeKey = `otp:userquery:used:${mobile}:${otp}`;
  const claimed = await redisSetNX(consumeKey, "1", OTP_VERIFIED_TTL_SECONDS);
  if (!claimed) {
    return {
      errorStatus: 409,
      error: "This request has already been submitted",
    };
  }

  return { verifiedKey, consumeKey };
}

/**
 * Formats the submission time shown in the admin alert (IST, e.g.
 * "30 Oct 2026, 04:12 pm"). Falls back to "-" for an unparseable date so a bad
 * value can never produce "Invalid Date" inside the template variable.
 */
function formatCallbackRequestedAt(value) {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Sends the "Get a Call Back" alert to SUPPORT_NOTIFICATION_PHONE_NUMBER
 * (8130654581) with the generic WhatsApp template
 * (FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID):
 *   "You got a call back request from <phone>. Please call them back ASAP."
 *
 * Never throws: a missing template id, a Fast2SMS rejection (HTTP 400/401, or
 * HTTP 200 with `return: false`) or a network error is reported as `{ sent: false, reason }`
 * so the query that was already saved is still returned to the caller.
 */
async function notifyAdminOfCallback(savedQuery) {
  const templateId = process.env.FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID;
  const number = formatPhoneNumber(SUPPORT_NOTIFICATION_PHONE_NUMBER);

  // A blank id means the env is not configured: skip the send instead of
  // failing a request that is already persisted.
  if (!templateId) {
    console.warn(
      "userQuery: FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID is empty, skipping the support WhatsApp alert."
    );
    return { sent: false, reason: "template_not_configured" };
  }

  try {
    const result = await sendWhatsAppConfirmation(
      number,
      getCallbackSupportAlertBody(
        getCallbackRequestContact(savedQuery),
        formatCallbackRequestedAt(savedQuery?.createdAt)
      ),
      WHATSAPP_CALLBACK_SUPPORT_TEMPLATE
    );

    if (result && result.return === false) {
      const reason = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "fast2sms_rejected";
      console.error("userQuery: support WhatsApp rejected:", reason);
      return { sent: false, reason, number };
    }

    return { sent: true, number };
  } catch (error) {
    // The SDK throws a FetchError that carries the Fast2SMS body on `error.data`
    // ({ status_code, message }); error.message is only the HTTP status text
    // ("Bad Request"), so read the body first and keep it in the logs and sheet.
    const body = error?.data;
    const detail =
      body?.message ||
      body?.status_code ||
      (typeof body === "string" ? body : error.message);
    const reason = Array.isArray(detail)
      ? detail.join(", ")
      : String(detail || "whatsapp_error");

    console.error("userQuery: support WhatsApp failed:", error?.status || "", reason);

    await logErrorToGoogleSheet({
      apiName: "userQuery - support WhatsApp",
      errorMessage: reason,
      errorCode: String(error?.status || 500),
      stackTrace: error.stack,
      requestPayload: {
        queryId: savedQuery?._id ? String(savedQuery._id) : undefined,
        templateId,
        number,
      },
    });
    return { sent: false, reason, number };
  }
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const query = await Query.find();
      res.status(200).json(query);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "userQuery - GET",
        errorMessage: error.message || "Failed to fetch user queries",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res.status(500).json({ message: "Error fetching lab tests" });
    }
  }
//   if (req.method === "PUT") {
//     console.log(req.query, "req query");
//     const { id } = req.query;

//     try {
//       // Find the lab test by ID and update with the request body
//       const updatedLabTest = await LabTest.findByIdAndUpdate(id, req.body, {
//         new: true, // Return the updated document
//         runValidators: true, // Enforce schema validation
//       });

//       if (!updatedLabTest) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Lab test not found" });
//       }

//       res.status(200).json({ success: true, data: updatedLabTest });
//     } catch (error) {
//       res.status(400).json({ success: false, error: error.message });
//     }
//   }

  if (req.method === "POST") {
    // Released again when the save fails, so a transient database error does
    // not force the visitor through a second OTP round.
    let otpConsumeKey = null;
    try {
      // Rate limit user queries per IP to prevent spam
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
      const queryLimit = await rateLimit({
        key: `rl:userquery:ip:${ip}`,
        limit: 10,
        windowSeconds: 600,
      });
      if (!queryLimit.allowed) {
        return res.status(429).json({
          message: "Too many queries. Please try again later.",
          retryAfter: queryLimit.retryAfter,
        });
      }

      const { payload, error: validationError } = normalizeQueryPayload(
        req.body
      );

      console.log(payload, "payload");

      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      // Popup callback requests must prove phone ownership before the query is
      // persisted. Legacy callers send no `otp` and skip this block.
      const otpCheck = await redeemCallbackOtp(req.body, payload);
      if (otpCheck.errorStatus) {
        return res
          .status(otpCheck.errorStatus)
          .json({ message: otpCheck.error });
      }
      otpConsumeKey = otpCheck.consumeKey || null;

      const savedQuery = await Query.create(payload);

      // The verification is now spent: it can never be replayed for a second
      // request. The consumption slot stays for its TTL as the idempotency guard.
      if (otpCheck.verifiedKey) {
        await redisDel(otpCheck.verifiedKey);
      }

      // Notify the admin on WhatsApp. Deliberately isolated: the request is already
      // persisted, so a rejected or skipped send must not turn the 201 into an error -
      // the outcome is reported in `whatsapp` and logged instead.
      const whatsapp = await notifyAdminOfCallback(savedQuery);

      res.status(201).json({ ...savedQuery.toObject(), whatsapp });
    } catch (error) {
      console.log(error, "error");
      if (otpConsumeKey) {
        await redisDel(otpConsumeKey);
      }
      await logErrorToGoogleSheet({
        apiName: "userQuery - POST",
        errorMessage: error.message || "Failed to create user query",
        errorCode: "500",
        stackTrace: error.stack,
        // Never copy the OTP itself into the error sheet.
        requestPayload: req.body
          ? { ...req.body, otp: req.body.otp ? "[redacted]" : undefined }
          : undefined,
      });
      res
        .status(500)
        .json({ message: "Error creating category", error: error.message });
    }
  }

//   if (req.method === "DELETE") {
//     const { id } = req.query;
//     console.log(id, "id on server");
//     try {
//       const deletedItem = await LabTest.deleteOne({ _id: id });

//       if (!deletedItem) {
//         return res.status(404).json({ message: "Item not found" });
//       }

//       res
//         .status(200)
//         .json({ message: "Item successfully deleted", deletedItem });
//     } catch (error) {
//       console.error("Delete error:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }
}
