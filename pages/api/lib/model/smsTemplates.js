import {
  WHATSAPP_CONFIRMATION_TEMPLATE,
  WHATSAPP_REMINDER_TEMPLATE_PATIENT,
  WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
  WHATSAPP_PRESCRIPTION_TEMPLATE,
  WHATSAPP_INVOICE_TEMPLATE,
  WHATSAPP_NUMBER_CONFIRMATION,
  WHATSAPP_USER_QUERY_TEMPLATE,
} from "../../utils/constants";
import { doctorDisplayName } from "../../../../src/utils/doctorName";

/**
 * Double-encodes only the Firebase Storage object-path segment so it survives
 * one percent-decode pass by Fast2SMS/WhatsApp without corrupting the protocol,
 * domain, or query-string parts of the URL.
 *
 * Firebase Storage URLs have the form:
 *   https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded_path}?alt=media&token=...
 *
 * The {encoded_path} already contains %2F, %3D, %20 etc. for in-name slashes and
 * special chars. Fast2SMS decodes those once before template substitution, turning
 * %2F → / which breaks Firebase's single-token path resolution → 404.
 *
 * Fix: re-encode only the '%' characters inside the object path segment:
 *   %2F  →  %252F  →  (after one Fast2SMS decode)  →  %2F  ✓ Firebase receives correct path
 *
 * Non-Firebase URLs (e.g., meeting links) have no /o/ segment and pass through
 * completely unchanged — their protocol and slashes are never touched.
 */
function encodeFirebasePath(url) {
  if (!url) return "";
  const oIndex = url.indexOf("/o/");
  if (oIndex === -1) return url; // not a Firebase Storage URL — return verbatim
  const pathStart = oIndex + 3;
  const qIndex = url.indexOf("?", pathStart);
  const pathEnd = qIndex !== -1 ? qIndex : url.length;
  const before = url.slice(0, pathStart);            // https://...firebasestorage.../o/
  const objectPath = url.slice(pathStart, pathEnd);  // already-encoded object name
  const query = qIndex !== -1 ? url.slice(qIndex) : ""; // ?alt=media&token=...
  return before + objectPath.replace(/%/g, "%25") + query;
}

function capitalize(name) {
  if (!name) return name;
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Returns the Fast2SMS WhatsApp template ID and pipe-separated variable values
 * for the given template key and body object.
 * Variable order must match the {{1}}, {{2}}, ... placeholders in your approved Fast2SMS template.
 */
export function buildWhatsAppPayload(template, body) {
  switch (template) {
    case WHATSAPP_CONFIRMATION_TEMPLATE:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_BOOKING_ID,
        variables_values: [
          capitalize(body.patient_name),
          doctorDisplayName(capitalize(body.doctor_name)),
          body.appointment_date,
          body.appointment_time,
          body.consultation_type,
        ].join("|"),
      };
    case WHATSAPP_REMINDER_TEMPLATE_PATIENT:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_REMINDER_PATIENT_ID,
        variables_values: [
          capitalize(body.patient_name),
          doctorDisplayName(capitalize(body.doctor_name)),
          body.appointment_date,
          body.appointment_time,
          body.meeting_url || "",  // plain app URL — no special chars, no encoding needed
        ].join("|"),
      };

    case WHATSAPP_REMINDER_TEMPLATE_DOCTOR:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_REMINDER_DOCTOR_ID,
        variables_values: [
          doctorDisplayName(capitalize(body.doctor_name)),
          capitalize(body.patient_name),
          body.appointment_date,
          body.appointment_time,
          body.meeting_url || "",  // plain app URL — no special chars, no encoding needed
        ].join("|"),
      };

    case WHATSAPP_PRESCRIPTION_TEMPLATE:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_PRESCRIPTION_ID,
        variables_values: [
          capitalize(body.patient_name),
          encodeFirebasePath(body.prescription_url),
        ].join("|"),
      };

    case WHATSAPP_INVOICE_TEMPLATE:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_INVOICE_ID,
        variables_values: [
          capitalize(body.patient_name),  // {{1}} Dear [name]
          body.invoice_number,            // {{2}} Invoice No: [number]
          body.total_amount,              // {{3}} Amount Paid: [amount]
          encodeFirebasePath(body.invoice_url), // {{4}} Download [url]
        ].join("|"),
      };

    case WHATSAPP_NUMBER_CONFIRMATION:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_OTP_ID,
        variables_values: String(body.otp),
      };
    case WHATSAPP_USER_QUERY_TEMPLATE:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_OTP_ID,
        variables_values: String(body.mobile_number),
      };

    default:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_BOOKING_ID,
        variables_values: Object.values(body).join("|"),
      };
  }
}

