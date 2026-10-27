import { dbConnect } from "../../src/lib/db";
import Query from "../../src/models/query";
import { sendWhatsAppConfirmation } from "./lib/communication";
import { formatPhoneNumber } from "./utils/commonmethod";
import {
  admin_callback_number,
  WHATSAPP_CALLBACK_REQUEST_TEMPLATE,
} from "./utils/constants";
import { getCallbackRequestContact } from "./utils/whatsappMessageBodies";
import { rateLimit } from "../../src/lib/rateLimiter";
import { logErrorToGoogleSheet } from "./helper";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
 * Sends the "Get a Callback" alert to the admin's WhatsApp number.
 *
 * Never throws: a missing template id, a Fast2SMS rejection (HTTP 400/401, or
 * HTTP 200 with `return: false`) or a network error is reported as `{ sent: false, reason }`
 * so the query that was already saved is still returned to the caller.
 */
async function notifyAdminOfCallback(savedQuery) {
  const templateId = process.env.FASTSMS_WA_TEMPLATE_CALLBACK_ID;
  const number = formatPhoneNumber(admin_callback_number);

  // The id is filled in once the admin template is approved in Fast2SMS; until
  // then every submission stays silent instead of failing on a bad send.
  if (!templateId) {
    console.warn(
      "userQuery: FASTSMS_WA_TEMPLATE_CALLBACK_ID is empty, skipping the admin WhatsApp alert."
    );
    return { sent: false, reason: "template_not_configured" };
  }

  try {
    const result = await sendWhatsAppConfirmation(
      number,
      { contact: getCallbackRequestContact(savedQuery) },
      WHATSAPP_CALLBACK_REQUEST_TEMPLATE
    );

    if (result && result.return === false) {
      const reason = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "fast2sms_rejected";
      console.error("userQuery: admin WhatsApp rejected:", reason);
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

    console.error("userQuery: admin WhatsApp failed:", error?.status || "", reason);

    await logErrorToGoogleSheet({
      apiName: "userQuery - admin WhatsApp",
      errorMessage: reason,
      errorCode: String(error?.status || 500),
      stackTrace: error.stack,
      requestPayload: {
        queryId: savedQuery?._id ? String(savedQuery._id) : undefined,
        templateId,
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

      const savedQuery = await Query.create(payload);

      // Notify the admin on WhatsApp. Deliberately isolated: the request is already
      // persisted, so a rejected or skipped send must not turn the 201 into an error -
      // the outcome is reported in `whatsapp` and logged instead.
      const whatsapp = await notifyAdminOfCallback(savedQuery);

      res.status(201).json({ ...savedQuery.toObject(), whatsapp });
    } catch (error) {
      console.log(error, "error");
      await logErrorToGoogleSheet({
        apiName: "userQuery - POST",
        errorMessage: error.message || "Failed to create user query",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: req.body,
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
