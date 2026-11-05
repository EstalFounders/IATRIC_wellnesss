import { buildWhatsAppPayload } from "./model/smsTemplates";
import fast2Sms from "@api/fast2sms";
import {
  DOCTOR_CREDENTIALS_OVERRIDE_PHONE_NUMBER,
  WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE,
} from "../utils/constants";

fast2Sms.auth(process.env.FASTSMS_API_TOKEN);

/**
 * Testing switch: the "doctor added" credentials message
 * (WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE / FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID)
 * is delivered to DOCTOR_CREDENTIALS_OVERRIDE_PHONE_NUMBER instead of the
 * doctor's own mobile. Nothing else is redirected — the caller passes the
 * template, so the guard cannot leak into another message type.
 *
 * Normalisation is done inline (last 10 digits + 91) rather than importing
 * formatPhoneNumber from utils/commonmethod, which would pull the mongoose
 * models into every bundle that sends a WhatsApp message.
 *
 * @param {string} number - Caller's intended recipient, e.g. "919876543210"
 * @returns {string} the override number, or `number` when the switch is off
 */
function redirectDoctorCredentials(number) {
  const raw =
    process.env.DOCTOR_CREDENTIALS_OVERRIDE_NUMBER ??
    DOCTOR_CREDENTIALS_OVERRIDE_PHONE_NUMBER;
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return number; // switch off → real doctor

  const last10 = digits.slice(-10);
  if (last10.length !== 10) return number; // misconfigured → real doctor
  const target = `91${last10}`;

  if (target !== number) {
    console.log(
      `[whatsapp] doctor-credentials redirected: ${number} -> ${target}`
    );
  }
  return target;
}

/**
 * Sends a WhatsApp template message via Fast2SMS WhatsApp Business API.
 * Signature kept identical to the old implementation for zero caller changes.
 */
export async function sendWhatsAppConfirmation(number, body, template) {
  const recipient =
    template === WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE
      ? redirectDoctorCredentials(number)
      : number;
  const { message_id, variables_values } = buildWhatsAppPayload(template, body);
  console.log("Built WhatsApp Payload:", { message_id, variables_values });
  return sendWhatsApp(recipient, message_id, variables_values);
}

/**
 * Core Fast2SMS WhatsApp sender.
 * @param {string} number           - Last 10 digits prefixed with country code, e.g. "919876543210"
 * @param {string|number} message_id - Fast2SMS approved WhatsApp template ID
 * @param {string} variables_values  - Pipe-separated template variable values, e.g. "John|4 PM"
 */
export async function sendWhatsApp(number, message_id, variables_values) {
  try {
    const response = await fast2Sms.sendWhatsappMessage({
      authorization: process.env.FASTSMS_API_TOKEN,
      message_id: String(message_id),
      phone_number_id: process.env.FASTSMS_WA_PHONE_NUMBER_ID,

      numbers: number,

      // Example: "Vinay|Dr Sharma|30 May 2026|5:30 PM"
      variables_values,
    });

    console.log("Fast2SMS WhatsApp Response:", response.data);

    return response.data;
  } catch (err) {
    // Fast2SMS answers 400/401 with { status_code, message }; the SDK throws a
    // FetchError that carries that body on `err.data` (there is no err.response)
    // while err.message is only the HTTP status text, e.g. "Bad Request".
    console.error(
      "Fast2SMS WhatsApp Error:",
      err?.status,
      err?.data ?? err?.message,
    );

    throw err;
  }
}
