import { buildWhatsAppPayload } from "./model/smsTemplates";
import fast2Sms from "@api/fast2sms";
import {
  DOCTOR_CREDENTIALS_OVERRIDE_PHONE_NUMBER,
  SUPPORT_NOTIFICATION_PHONE_NUMBER,
  WHATSAPP_DELIVERY_FAILURE_ALERT_TEMPLATE,
  WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE,
  WHATSAPP_SEND_ATTEMPTS,
} from "../utils/constants";
import { getWhatsAppFailureAlertBody } from "../utils/whatsappMessageBodies";

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
 * Fast2SMS answers HTTP 200 with `return: false` for some rejections (bad
 * template id, unverified number, exhausted credits). Treat that as a failure
 * too - otherwise a rejected message looks delivered and is never retried.
 */
function isRejectedByFast2Sms(result) {
  if (!result || typeof result !== "object") return false;
  if (result.return === false) return true;
  const statusCode = Number(result.status_code);
  return Number.isFinite(statusCode) && statusCode >= 400;
}

/** Last 10 digits prefixed with 91 - the format Fast2SMS expects. */
function toFast2SmsNumber(value) {
  const last10 = String(value ?? "").replace(/\D/g, "").slice(-10);
  return last10.length === 10 ? `91${last10}` : "";
}

/**
 * Sends the internal "could not be delivered" alert
 * (WHATSAPP_DELIVERY_FAILURE_ALERT_TEMPLATE -> FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID,
 * the generic template) to SUPPORT_NOTIFICATION_PHONE_NUMBER. Never throws: this
 * runs while another send is already failing, so it must not mask that error.
 */
export async function sendWhatsAppFailureAlert(details = {}) {
  const number = toFast2SmsNumber(SUPPORT_NOTIFICATION_PHONE_NUMBER);
  if (!number) {
    console.error("[whatsapp] failure alert skipped: support number not set");
    return { sent: false, reason: "no_support_number" };
  }
  if (!process.env.FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID) {
    console.error(
      "[whatsapp] failure alert skipped: FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID is empty",
    );
    return { sent: false, reason: "template_not_configured" };
  }

  try {
    const result = await sendWhatsAppConfirmation(
      number,
      getWhatsAppFailureAlertBody({
        ...details,
        failedAt: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }),
      WHATSAPP_DELIVERY_FAILURE_ALERT_TEMPLATE,
    );
    if (isRejectedByFast2Sms(result)) {
      console.error("[whatsapp] failure alert rejected by Fast2SMS:", result);
      return { sent: false, reason: "rejected" };
    }
    return { sent: true, number };
  } catch (error) {
    console.error(
      "[whatsapp] failure alert could not be sent:",
      error?.data ?? error?.message,
    );
    return { sent: false, reason: error?.message || "send_failed" };
  }
}

/**
 * Sends one WhatsApp message and retries it immediately when it fails -
 * WHATSAPP_SEND_ATTEMPTS attempts back-to-back, no waiting. When every attempt
 * fails, the support number gets the generic-template alert so a human knows a
 * patient/doctor message never went out.
 *
 * Returns `{ sent, attempts, lastError, result }` instead of throwing, so a
 * caller can keep its existing "mark done only when sent" bookkeeping.
 *
 * @param {string} number  recipient, same format as sendWhatsAppConfirmation
 * @param {object|string} body  template variables
 * @param {string} template  one of WHATSAPP_*_TEMPLATE
 * @param {object} [context] `{ label, appointmentId }` used in the failure alert
 */
export async function sendWhatsAppWithRetry(
  number,
  body,
  template,
  context = {},
) {
  const attemptsAllowed = Math.max(
    1,
    Number(context.attempts) || WHATSAPP_SEND_ATTEMPTS,
  );
  const label = context.label || template;

  let lastError = null;
  for (let attempt = 1; attempt <= attemptsAllowed; attempt += 1) {
    try {
      const result = await sendWhatsAppConfirmation(number, body, template);
      if (isRejectedByFast2Sms(result)) {
        lastError = new Error(
          Array.isArray(result?.message)
            ? result.message.join(", ")
            : result?.message || "rejected by Fast2SMS",
        );
      } else {
        if (attempt > 1) {
          console.log(
            `[whatsapp] ${label} sent on attempt ${attempt}/${attemptsAllowed}`,
          );
        }
        return { sent: true, attempts: attempt, result };
      }
    } catch (error) {
      lastError = error;
    }

    console.error(
      `[whatsapp] ${label} attempt ${attempt}/${attemptsAllowed} failed:`,
      lastError?.data ?? lastError?.message,
    );
    // No wait between attempts: a transient blip is retried straight away.
  }

  await sendWhatsAppFailureAlert({
    label,
    recipient: number,
    appointmentId: context.appointmentId,
    error: lastError?.data?.message || lastError?.message,
    attempts: attemptsAllowed,
  });

  return { sent: false, attempts: attemptsAllowed, lastError };
}

export async function sendWhatsApp(number, message_id, variables_values) {
  // Core Fast2SMS WhatsApp sender: `message_id` is the approved template id and
  // `variables_values` the pipe-separated values for it.
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
