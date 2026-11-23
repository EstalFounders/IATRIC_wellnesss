// Single source of truth for every invoice status value.
//
// Imported by the invoice API (pages/api/helper/invoices.js), the cron billing
// utility (src/lib/invoice/billing.js), the model defaults
// (src/models/invoice.js) and the SuperAdmin panel - never hardcode one of these
// strings anywhere else. `src/constant.js` re-exports them as `invoice_status` /
// `invoice_status_options` so older imports keep working.
//
// Plain JS on purpose: the whole app is JS (tsconfig only covers tests) and this
// module is imported from both server routes and client components.

/**
 * `invoices.status` - the billing state of the invoice itself.
 *  - PENDING   : a linked service is not completed yet (or the bill is on hold)
 *  - COMPLETED : services are done, the bill can be sent to the patient
 *  - CANCELLED : bill voided
 *  - SENT      : the PDF + WhatsApp send went through (SuperAdmin action)
 *  - MANUAL    : raised by hand, not linked to any appointment / lab test
 */
export const INVOICE_STATUS = {
  pending: "PENDING",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  sent: "SENT",
  manual: "MANUAL",
};

/** Order used by the SuperAdmin dropdown / filter chips. */
export const INVOICE_STATUS_OPTIONS = [
  INVOICE_STATUS.completed,
  INVOICE_STATUS.pending,
  INVOICE_STATUS.cancelled,
  INVOICE_STATUS.sent,
  INVOICE_STATUS.manual,
];

/**
 * `invoices.whatsappStatus` - delivery state of the invoice WhatsApp message.
 * Kept separate from `status` so a failed delivery never hides the billing
 * state, and so the DB write never depends on Fast2SMS.
 */
export const INVOICE_WHATSAPP_STATUS = {
  pending: "PENDING",
  sent: "SENT",
  failed: "FAILED",
  notSent: "NOT_SENT",
};

export const INVOICE_WHATSAPP_STATUS_OPTIONS = [
  INVOICE_WHATSAPP_STATUS.pending,
  INVOICE_WHATSAPP_STATUS.sent,
  INVOICE_WHATSAPP_STATUS.failed,
  INVOICE_WHATSAPP_STATUS.notSent,
];

/** Human labels for the panel badge. */
export const INVOICE_WHATSAPP_STATUS_LABELS = {
  [INVOICE_WHATSAPP_STATUS.pending]: "WhatsApp pending",
  [INVOICE_WHATSAPP_STATUS.sent]: "WhatsApp sent",
  [INVOICE_WHATSAPP_STATUS.failed]: "WhatsApp failed",
  [INVOICE_WHATSAPP_STATUS.notSent]: "Not sent",
};

/**
 * Sentinel value of the "Bill From" dropdown in CreateInvoiceModal for the
 * "+ Add new Bill From..." entry. A real entity name can never equal it, so it
 * is safe to store the selected value as-is in component state.
 */
export const INVOICE_BILL_FROM_CUSTOM = "__new_bill_from__";

/**
 * Money string for the WhatsApp "Amount Paid" template variable.
 *
 * The template already prints "Amount Paid:" in front of {{3}}, so this returns
 * a plain number ("198", "198.5") - NOT a currency symbol and, above all, never
 * a URL. `Number.isFinite` also keeps a missing/garbage `totalPrice` from
 * reaching WhatsApp as "undefined"/"NaN".
 */
export const formatInvoiceAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return String(Number(amount.toFixed(2)));
};

/** How the invoice row was created. */
export const INVOICE_SOURCE = {
  auto: "AUTO", // midnight cron (src/lib/invoice/billing.js)
  manual: "MANUAL", // SuperAdmin "+ Create Invoice"
};

export const isInvoiceStatus = (value) =>
  INVOICE_STATUS_OPTIONS.includes(String(value || "").toUpperCase());

export const isInvoiceWhatsAppStatus = (value) =>
  INVOICE_WHATSAPP_STATUS_OPTIONS.includes(
    String(value || "").toUpperCase(),
  );

/**
 * WhatsApp status of a row, tolerant of documents saved before the field
 * existed: a legacy invoice only counts as delivered when its status is SENT.
 */
export const resolveInvoiceWhatsAppStatus = (invoice) => {
  const stored = String(invoice?.whatsappStatus || "").toUpperCase();
  if (isInvoiceWhatsAppStatus(stored)) return stored;

  return String(invoice?.status || "").toUpperCase() === INVOICE_STATUS.sent
    ? INVOICE_WHATSAPP_STATUS.sent
    : INVOICE_WHATSAPP_STATUS.notSent;
};
