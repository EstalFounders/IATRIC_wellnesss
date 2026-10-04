import { dbConnect } from "../../src/lib/db";
import Query from "../../src/models/query";
import { sendWhatsAppConfirmation } from "./lib/communication";
import { formatPhoneNumber } from "./utils/commonmethod";
import { company_number, WHATSAPP_USER_QUERY_TEMPLATE } from "./utils/constants";
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

      const newQuery = await Query.create(payload);

      const savedQuery = await newQuery.save();

// await sendWhatsAppConfirmation(
//     formatPhoneNumber(company_number),
//     payload,
//     WHATSAPP_USER_QUERY_TEMPLATE
//   );
 
      

      res.status(201).json(savedQuery);
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
