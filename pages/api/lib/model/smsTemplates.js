import {
  WHATSAPP_CONFIRMATION_TEMPLATE,
  WHATSAPP_REMINDER_TEMPLATE_PATIENT,
  WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
  WHATSAPP_PRESCRIPTION_TEMPLATE,
  WHATSAPP_INVOICE_TEMPLATE,
  WHATSAPP_NUMBER_CONFIRMATION,
  WHATSAPP_USER_QUERY_TEMPLATE,
  WHATSAPP_CALLBACK_REQUEST_TEMPLATE,
  WHATSAPP_CALLBACK_SUPPORT_TEMPLATE,
  WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE,
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
 * Guarantees a non-empty WhatsApp template variable.
 *
 * Fast2SMS substitutes "*" for a variable it receives empty, so a missing date
 * reached the doctor as "Date: *" instead of "Date: 31/10/2026". Anything that
 * is undefined/null/blank now travels as "-" so the delivered message can never
 * show a bare "*" in place of the appointment date or time.
 */
function orDash(value) {
  const text = value === undefined || value === null ? "" : String(value).trim();
  return text || "-";
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
          // Doctor names are sent exactly as stored in `doctors.name`: never
          // re-cased (`capitalize` rewrites the doctor's own spelling), never
          // stripped of "Dr"/"Dr." and never prefixed with it either.
          doctorDisplayName(body.doctor_name),
          orDash(body.appointment_date),
          orDash(body.appointment_time),
          body.consultation_type,
        ].join("|"),
      };
    case WHATSAPP_REMINDER_TEMPLATE_PATIENT:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_REMINDER_PATIENT_ID,
        variables_values: [
          capitalize(body.patient_name),
          doctorDisplayName(body.doctor_name),
          orDash(body.appointment_date),
          orDash(body.appointment_time),
          // Plain app URL — no special chars, no encoding needed. orDash keeps a
          // missing link from reaching WhatsApp as an empty {{5}} (rendered "*").
          orDash(body.meeting_url),
        ].join("|"),
      };

    case WHATSAPP_REMINDER_TEMPLATE_DOCTOR:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_REMINDER_DOCTOR_ID,
        variables_values: [
          // {{1}} doctor / {{2}} patient - the reminder template quotes the
          // doctor's own name back to them, so it must stay byte-identical to
          // `doctors.name` (see the note above).
          doctorDisplayName(body.doctor_name),
          capitalize(body.patient_name),
          orDash(body.appointment_date),
          orDash(body.appointment_time),
          // Plain app URL — no special chars, no encoding needed (see {{5}} note above).
          orDash(body.meeting_url),
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
    case WHATSAPP_CALLBACK_REQUEST_TEMPLATE:
      return {
        // {{1}} phone number - template 38125 ("user_callback_template") has a
        // single variable, so variables_values must hold ONE value with no "|":
        // sending three values was rejected by Fast2SMS with HTTP 400.
        message_id: process.env.FASTSMS_WA_TEMPLATE_CALLBACK_ID,
        variables_values: String(body.contact ?? ""),
      };
    case WHATSAPP_CALLBACK_SUPPORT_TEMPLATE:
      return {
        // "Get a Call Back" popup alert to SUPPORT_NOTIFICATION_PHONE_NUMBER.
        // The generic template (FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID) has
        // 8 variables, so all of them must be sent - Fast2SMS rejects a variable
        // count that differs from the template var_count.
        message_id: process.env.FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID,
        variables_values: [
          body.admin_name,    // {{1}} Hello {{1}},
          body.alert_line,    // {{2}} You got a call back request from 98XXXXXXXX.
          body.action_line,   // {{3}} Please call them back ASAP.
          body.details_label, // {{4}} Details: {{4}}: {{5}}
          body.details_value, // {{5}}
          body.time_label,    // {{6}} {{6}}: {{7}}
          body.time_value,    // {{7}}
          body.footer,        // {{8}}
        ].join("|"),
      };
    case WHATSAPP_USER_QUERY_TEMPLATE:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_OTP_ID,
        variables_values: String(body.mobile_number),
      };

    case WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE:
      return {
        // 8 placeholders of the generic "doctor credentials" template:
        //   Hello {{1}}, / {{2}} / {{3}} / Details: {{4}}: {{5}} / {{6}}: {{7}} / {{8}}
        message_id: process.env.FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID,
        variables_values: [
          doctorDisplayName(body.doctor_name),               // {{1}} verbatim, as stored
          body.greeting,                                    // {{2}}
          body.intro,                                       // {{3}}
          "Login URL",                                      // {{4}}
          body.doctor_url,                                  // {{5}}
          "Username",                                       // {{6}}
          body.username,                                    // {{7}}
          `Temporary Password: ${body.temp_password}`,      // {{8}}
        ].join("|"),
      };

    default:
      return {
        message_id: process.env.FASTSMS_WA_TEMPLATE_BOOKING_ID,
        variables_values: Object.values(body).join("|"),
      };
  }
}

