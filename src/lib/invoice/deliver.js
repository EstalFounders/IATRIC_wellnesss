// WhatsApp delivery for invoices - one code path for the cron and for the
// SuperAdmin "Generate & Send" button.
//
// The invoice row is always saved BEFORE this module runs and the delivery
// result is written afterwards, so a Fast2SMS outage can never lose a bill.
// Errors are swallowed and reported as `{ sent: false }`: the cron loop must
// keep going for the remaining patients.
import mongoose from "mongoose";
import { sendWhatsAppWithRetry } from "../../../pages/api/lib/communication";
import { WHATSAPP_INVOICE_TEMPLATE } from "../../../pages/api/utils/constants";
import { formatPhoneNumber } from "../../../pages/api/utils/commonmethod";
import Appointment from "../../models/appointmentSchema";
import { getConfiguredAppUrl } from "../appOrigin";
import { INVOICE_WHATSAPP_STATUS } from "../../constants/invoice";

const FALLBACK_ORIGIN = "http://localhost:3000";

/** The appointment the feedback link points at, or "" when there is none. */
const resolveFeedbackAppointmentId = async (invoice, appointmentId) => {
  const explicit = String(appointmentId || "").trim();
  if (explicit && mongoose.isValidObjectId(explicit)) return explicit;

  // The link is stored the other way round: `appointment.invoiceId` is stamped
  // when the bill is raised (`stampServices()` in billing.js for the cron,
  // `?action=create` for the panel). Newest first, so a bill that covers
  // several consultations links to the latest one.
  try {
    const appointment = await Appointment.findOne({
      invoiceId: String(invoice?._id || ""),
    })
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();
    return appointment ? String(appointment._id) : "";
  } catch (error) {
    console.error(
      `[invoice] could not resolve the appointment for ${invoice?.invoiceNumber}:`,
      error?.message,
    );
    return "";
  }
};

/**
 * Sends the bill link + the feedback link to the patient.
 *
 * Approved Fast2SMS body (`WHATSAPP_INVOICE_TEMPLATE`, 3 slots - the amount is
 * printed in the invoice PDF, not in the message):
 *   {{1}} patient name, {{2}} invoice link (Firebase PDF, page URL as
 *   fallback), {{3}} `/feedback?bookingId=<appointment _id>` for the
 *   consultation that was just billed.
 *
 * An invoice with no linked appointment has no consultation to ask feedback
 * about, so nothing is sent and the row ends up FAILED (`applyWhatsAppResult`).
 *
 * @param {object} invoice                    invoice document
 * @param {string} url                        Firebase invoice PDF URL (or /api/invoice/<id> page)
 * @param {object} [options]
 * @param {string} [options.origin]           public app origin (request host or env)
 * @param {string} [options.appointmentId]    skip the lookup when the caller knows it
 * @returns {Promise<{sent: boolean, attempts: number, reason?: string}>}
 */
export const sendInvoiceWhatsApp = async (
  invoice,
  url,
  { origin, appointmentId } = {},
) => {
  const number = formatPhoneNumber(String(invoice?.mobNo || ""));
  if (!number) return { sent: false, attempts: 0, reason: "missing_mobile" };

  const link = String(url || "").trim();
  if (!/^https?:\/\//i.test(link)) {
    return { sent: false, attempts: 0, reason: "missing_url" };
  }

  const feedbackAppointmentId = await resolveFeedbackAppointmentId(
    invoice,
    appointmentId,
  );
  if (!feedbackAppointmentId) {
    return { sent: false, attempts: 0, reason: "missing_appointment" };
  }

  const base = String(origin || getConfiguredAppUrl() || FALLBACK_ORIGIN).replace(
    /\/+$/,
    "",
  );
  const feedbackUrl = `${base}/feedback?bookingId=${feedbackAppointmentId}`;

  try {
    const result = await sendWhatsAppWithRetry(
      number,
      {
        patient_name: invoice.name,
        // Firebase Storage URLs keep their double-encoded object path.
        invoice_url: link,
        feedback_url: feedbackUrl,
      },
      WHATSAPP_INVOICE_TEMPLATE,
      { label: `invoice ${invoice.invoiceNumber}` },
    );
    return { sent: Boolean(result.sent), attempts: result.attempts || 0 };
  } catch (error) {
    console.error(
      `[invoice] WhatsApp send failed for ${invoice?.invoiceNumber}:`,
      error?.message,
    );
    return { sent: false, attempts: 0, reason: error?.message };
  }
};

/**
 * Writes the delivery outcome on the invoice (statuses from
 * src/constants/invoice.js) and persists it. Never throws.
 */
export const applyWhatsAppResult = async (invoice, result) => {
  invoice.whatsappStatus = result?.sent
    ? INVOICE_WHATSAPP_STATUS.sent
    : INVOICE_WHATSAPP_STATUS.failed;
  invoice.whatsappStatusUpdatedAt = new Date();

  try {
    await invoice.save();
  } catch (error) {
    console.error(
      `[invoice] could not store WhatsApp status for ${invoice?.invoiceNumber}:`,
      error?.message,
    );
  }

  return invoice.whatsappStatus;
};
