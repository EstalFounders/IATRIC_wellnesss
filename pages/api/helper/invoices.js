// /api/helper/invoices - the SuperAdmin invoice panel (`/superAdmin/invoice`).
//
//   GET   list every invoice; `status` is the stored `invoices.status` when the
//         admin already set one, otherwise a value derived from the services the
//         invoice was raised for. `whatsappStatus` is the delivery state
//         (src/constants/invoice.js).
//   GET   ?unbilled=1  completed services that still have no invoice, grouped by
//         mobile - exactly what the midnight cron would bill. Feeds the
//         "+ Create Invoice" modal.
//   GET   ?billFrom=1   the "Bill From" presets: the registered company plus
//         every entity already stored on an invoice (so a name added through
//         "+ Add new Bill From..." is reusable).
//   PATCH { id, status }  status dropdown in the panel.
//   POST  ?action=create  manual invoice ("+ Create Invoice"): totals are
//         recomputed server-side, linked services get `invoiceId` stamped,
//         `billFrom` is stored with the bill.
//   POST  { id, invoiceUrl }  "Send Invoice": stores the Firebase Storage PDF
//         URL the panel generated (`invoiceUrl`), falling back to a previously
//         stored URL and finally to `/api/invoice/<id>`, then WhatsApps it -
//         the same delivery path as the cron (src/lib/invoice/deliver.js).
//         Only COMPLETED invoices may be sent; a successful send flips the
//         status to SENT. `?dryRun=1` stores the link and skips WhatsApp.
//
// The midnight cron (src/lib/invoice/billing.js) creates the same invoices
// automatically and sends the same HTML invoice page (pages/api/invoice/[id].js).
//
// Two link styles exist in older rows:
//   * `item[].id`            - the Appointment / BookLabTest id,
//   * `.invoiceId` back-link - stamped on the service by the old upload flow.
// An invoice that links to nothing was created by hand -> "MANUAL".
import mongoose from "mongoose";
import { dbConnect } from "../../../src/lib/db";
import Invoice from "../../../src/models/invoice";
import Appointment from "../../../src/models/appointmentSchema";
import BookLabTest from "../../../src/models/bookLabTestSchema";
import {
  company_registrated_name,
  invoice_status,
  invoice_status_options,
} from "../../../src/constant";
import {
  INVOICE_SOURCE,
  INVOICE_WHATSAPP_STATUS,
  INVOICE_WHATSAPP_STATUS_LABELS,
  resolveInvoiceWhatsAppStatus,
} from "../../../src/constants/invoice";
import {
  buildInvoiceDrafts,
  collectBillableServices,
  nextInvoiceNumber,
  stampServices,
} from "../../../src/lib/invoice/billing";
import {
  applyWhatsAppResult,
  sendInvoiceWhatsApp,
} from "../../../src/lib/invoice/deliver";
import { formatPhoneNumber } from "../utils/commonmethod";

/** Origin of the current request - used to build the patient invoice link. */
const requestOrigin = (req) => {
  const proto = String(req.headers["x-forwarded-proto"] || "https")
    .split(",")[0]
    .trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "")
    .split(",")[0]
    .trim();
  return host ? `${proto}://${host}` : "http://localhost:3000";
};

/** Status of an invoice: cancelled > pending > completed, from its services. */
const deriveStatus = (services) => {
  if (!services.length) return invoice_status.manual;
  const statuses = services.map((service) =>
    String(service.status || "").toUpperCase(),
  );
  if (statuses.includes("CANCELLED")) return invoice_status.cancelled;
  if (statuses.every((status) => status === "COMPLETED"))
    return invoice_status.completed;
  return invoice_status.pending;
};

/** Services (Appointments + BookLabTests) this one invoice was raised for. */
const fetchLinkedServices = async (invoice) => {
  const invoiceId = String(invoice._id);
  const itemIds = (invoice.item || [])
    .map((item) => item && item.id)
    .filter((id) => id && mongoose.isValidObjectId(id));

  const [
    appointmentsById,
    labTestsById,
    appointmentsByInvoice,
    labTestsByInvoice,
  ] = await Promise.all([
    Appointment.find({ _id: { $in: itemIds } }).select("_id status").lean(),
    BookLabTest.find({ _id: { $in: itemIds } }).select("_id status").lean(),
    Appointment.find({ invoiceId }).select("_id status").lean(),
    BookLabTest.find({ invoiceId }).select("_id status").lean(),
  ]);

  const linked = new Map();
  [
    ...appointmentsById,
    ...labTestsById,
    ...appointmentsByInvoice,
    ...labTestsByInvoice,
  ].forEach((service) => {
    linked.set(String(service._id), {
      id: String(service._id),
      status: service.status,
    });
  });
  return [...linked.values()];
};

/** Stored status wins; invoices saved before the field existed fall back. */
const resolveStatus = async (invoice) =>
  invoice.status || deriveStatus(await fetchLinkedServices(invoice));

const toPanelInvoice = (invoice, status) => {
  const whatsappStatus = resolveInvoiceWhatsAppStatus(invoice);
  return {
    _id: String(invoice._id),
    invoiceNumber: invoice.invoiceNumber,
    name: invoice.name,
    mobNo: invoice.mobNo,
    billFrom: invoice.billFrom || "",
    totalPrice: invoice.totalPrice,
    invoiceUrl: invoice.invoiceUrl || "",
    status,
    source: invoice.source || INVOICE_SOURCE.manual,
    whatsappStatus,
    whatsappStatusLabel:
      INVOICE_WHATSAPP_STATUS_LABELS[whatsappStatus] || whatsappStatus,
  };
};

const badRequest = (res, message, extra = {}) =>
  res.status(400).json({ success: false, error: message, ...extra });


/**
 * GET ?unbilled=1 - every completed service that has no invoice yet, grouped by
 * mobile exactly the way the cron groups them. Feeds the "+ Create Invoice"
 * modal so an admin bills the same lines the nightly job would.
 */
async function handleUnbilled(res) {
  const billables = await collectBillableServices();
  const drafts = await buildInvoiceDrafts(billables);

  const groups = drafts.map((draft) => ({
    key: draft.key,
    patientName: draft.fields.name,
    mobNo: draft.fields.mobNo,
    address: draft.fields.address,
    doctorName: draft.fields.doctorName,
    subTotal: draft.fields.subTotal,
    totalPrice: draft.fields.totalPrice,
    needsReview: draft.needsReview,
    services: draft.services,
    items: draft.fields.item.map((item) => ({
      ...item,
      total: Math.max(
        0,
        Number(item.price || 0) * Number(item.quantity || 1) -
          Number(item.discount || 0),
      ),
    })),
  }));

  res.status(200).json({
    success: true,
    billables: billables.length,
    groups,
  });
}

/**
 * GET ?billFrom=1 - the "Bill From" options for the create modal: the registered
 * company first, then every entity already used on an invoice. Because the list
 * comes from the invoices themselves, a name typed through "+ Add new Bill
 * From..." becomes a reusable preset for every admin/browser - no extra
 * collection and no localStorage.
 */
async function handleBillFrom(res) {
  const used = await Invoice.distinct("billFrom");
  const values = [company_registrated_name, ...used]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  res.status(200).json({
    success: true,
    default: company_registrated_name,
    billFrom: [...new Set(values)],
  });
}

async function handleGet(req, res) {
  const unbilled = ["1", "true"].includes(
    String(req.query?.unbilled || "").toLowerCase(),
  );
  if (unbilled) return handleUnbilled(res);

  const billFrom = ["1", "true"].includes(
    String(req.query?.billFrom || "").toLowerCase(),
  );
  if (billFrom) return handleBillFrom(res);

  const invoices = await Invoice.find({}).sort({ _id: -1 }).lean();

  const invoiceIds = invoices.map((invoice) => String(invoice._id));

  // Only real ObjectIds can be queried; hand-typed invoices carry uuid ids.
  const itemIds = [
    ...new Set(
      invoices.flatMap((invoice) =>
        (invoice.item || [])
          .map((item) => item && item.id)
          .filter((id) => id && mongoose.isValidObjectId(id)),
      ),
    ),
  ];

  const [
    appointmentsById,
    labTestsById,
    appointmentsByInvoice,
    labTestsByInvoice,
  ] = await Promise.all([
    Appointment.find({ _id: { $in: itemIds } }).select("_id status").lean(),
    BookLabTest.find({ _id: { $in: itemIds } }).select("_id status").lean(),
    Appointment.find({ invoiceId: { $in: invoiceIds } })
      .select("_id status invoiceId")
      .lean(),
    BookLabTest.find({ invoiceId: { $in: invoiceIds } })
      .select("_id status invoiceId")
      .lean(),
  ]);

  const serviceById = new Map();
  [...appointmentsById, ...labTestsById].forEach((service) => {
    serviceById.set(String(service._id), {
      id: String(service._id),
      status: service.status,
    });
  });

  const servicesByInvoiceId = new Map();
  [...appointmentsByInvoice, ...labTestsByInvoice].forEach((service) => {
    const key = String(service.invoiceId || "");
    if (!key) return;
    const list = servicesByInvoiceId.get(key) || [];
    list.push({ id: String(service._id), status: service.status });
    servicesByInvoiceId.set(key, list);
  });

  const payload = invoices.map((invoice) => {
    const linked = new Map();
    (invoice.item || []).forEach((item) => {
      const service = item && serviceById.get(String(item.id));
      if (service) linked.set(service.id, service);
    });
    (servicesByInvoiceId.get(String(invoice._id)) || []).forEach((service) => {
      linked.set(service.id, service);
    });

    const services = [...linked.values()];

    return {
      _id: String(invoice._id),
      invoiceNumber: invoice.invoiceNumber,
      name: invoice.name,
      doctorName: invoice.doctorName || "",
      mobNo: invoice.mobNo,
      address: invoice.address || "",
      billFrom: invoice.billFrom || "",
      subTotal: invoice.subTotal,
      totalPrice: invoice.totalPrice,
      gst: invoice.gst,
      freight: invoice.freight,
      tax: invoice.tax,
      item: invoice.item || [],
      invoiceUrl: invoice.invoiceUrl || "",
      status: invoice.status || deriveStatus(services),
      source: invoice.source || INVOICE_SOURCE.manual,
      whatsappStatus: resolveInvoiceWhatsAppStatus(invoice),
      whatsappStatusLabel:
        INVOICE_WHATSAPP_STATUS_LABELS[resolveInvoiceWhatsAppStatus(invoice)],
      serviceCount: services.length,
    };
  });

  res.status(200).json({ success: true, invoices: payload });
}

async function handlePatch(req, res) {
  const { id, status } = req.body || {};

  if (!mongoose.isValidObjectId(id)) return badRequest(res, "Invalid invoice id");

  const nextStatus = String(status || "").toUpperCase();
  if (!invoice_status_options.includes(nextStatus)) {
    return badRequest(res, `Unknown invoice status: ${status}`, {
      allowed: invoice_status_options,
    });
  }

  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { status: nextStatus, statusUpdatedAt: new Date() },
    { new: true },
  ).lean();

  if (!invoice) {
    return res.status(404).json({ success: false, error: "Invoice not found" });
  }

  res.status(200).json({
    success: true,
    invoice: toPanelInvoice(invoice, invoice.status),
  });
}

const positiveNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

/**
 * POST ?action=create - "+ Create Invoice" in the SuperAdmin panel.
 *
 * Totals are always recomputed server-side from the items, so a tampered client
 * cannot store a wrong amount. The invoice is stored with status COMPLETED (it
 * can be sent right away), source MANUAL and whatsappStatus PENDING; the admin
 * still presses "Generate & Send" to WhatsApp the invoice page link.
 *
 * When the modal bills an existing appointment / lab test, `services` carries
 * `{ source, serviceId }` so those rows get stamped and the cron never bills
 * them a second time.
 */
async function handleCreate(req, res) {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const mobileDigits = String(body.mobNo ?? "").replace(/\D/g, "");
  // A name typed through "+ Add new Bill From..." arrives here verbatim and is
  // stored on the invoice, so it becomes a preset on the next GET ?billFrom=1.
  const billFrom = String(body.billFrom || "").trim().slice(0, 160);

  if (!name) return badRequest(res, "Patient name is required");
  if (mobileDigits.length < 10) {
    return badRequest(res, "A valid 10-digit mobile number is required");
  }

  const item = (Array.isArray(body.item) ? body.item : [])
    .filter((line) => String(line?.name || "").trim())
    .map((line, index) => ({
      id: String(line.id || `${Date.now()}-${index}`),
      name: String(line.name).trim(),
      hsn: positiveNumber(line.hsn),
      discount: positiveNumber(line.discount),
      quantity: positiveNumber(line.quantity ?? line.qty) || 1,
      price: positiveNumber(line.price),
      serviceType: String(line.serviceType || "Manual").trim() || "Manual",
    }));

  if (!item.length) return badRequest(res, "Add at least one invoice item");

  const subTotal = Number(
    item
      .reduce(
        (sum, line) =>
          sum + Math.max(0, line.price * line.quantity - line.discount),
        0,
      )
      .toFixed(2),
  );
  const gst = positiveNumber(body.gst);
  const freight = positiveNumber(body.freight);
  const tax = positiveNumber(body.tax);
  const totalPrice = Number((subTotal + gst + freight + tax).toFixed(2));

  const requestedNumber = String(body.invoiceNumber || "").trim();

  const create = (invoiceNumber) =>
    Invoice.create({
      name,
      mobNo: Number(mobileDigits.slice(-10)),
      address: String(body.address || "").trim(),
      doctorName: String(body.doctorName || "").trim(),
      billFrom,
      invoiceNumber,
      subTotal,
      totalPrice,
      gst,
      freight,
      tax,
      item,
      invoiceUrl: "",
      status: invoice_status.completed,
      statusUpdatedAt: new Date(),
      whatsappStatus: INVOICE_WHATSAPP_STATUS.pending,
      whatsappStatusUpdatedAt: null,
      source: INVOICE_SOURCE.manual,
    });

  let invoice;
  try {
    invoice = await create(requestedNumber || nextInvoiceNumber());
  } catch (error) {
    if (error?.code !== 11000) throw error; // duplicate invoiceNumber
    if (requestedNumber) {
      return res.status(409).json({
        success: false,
        error: `Invoice number ${requestedNumber} is already used`,
      });
    }
    invoice = await create(nextInvoiceNumber());
  }

  const services = (Array.isArray(body.services) ? body.services : []).filter(
    (service) => service && service.serviceId && service.source,
  );
  if (services.length) {
    try {
      await stampServices(services, invoice._id);
    } catch (error) {
      // The bill is already saved - report the stamping problem, keep the invoice.
      console.error("Could not stamp billed services:", error.message);
    }
  }

  res.status(201).json({
    success: true,
    invoice: toPanelInvoice(invoice, invoice.status),
  });
}

async function handlePost(req, res) {
  const { id, invoiceUrl } = req.body || {};
  const dryRun = ["1", "true"].includes(
    String(req.query?.dryRun || "").toLowerCase(),
  );

  if (!mongoose.isValidObjectId(id)) return badRequest(res, "Invalid invoice id");

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    return res.status(404).json({ success: false, error: "Invoice not found" });
  }

  const status = await resolveStatus(invoice);
  if (status !== invoice_status.completed) {
    return res.status(409).json({
      success: false,
      error: `Only COMPLETED invoices can be sent (current status: ${status})`,
      status,
    });
  }

  const number = formatPhoneNumber(String(invoice.mobNo || ""));
  if (!number) return badRequest(res, "Invoice has no patient mobile number");

  // The patient link, in order of preference:
  //   1. the Firebase Storage PDF the panel just generated + uploaded
  //      (`sendInvoiceToFirebase` -> POST { id, invoiceUrl }),
  //   2. a URL already stored on the row (a previous Firebase upload),
  //   3. this app's own read-only invoice page - legacy rows and the case where
  //      the browser upload failed. A missing PDF must never block the send.
  // A URL is usable when it is absolute and not a leftover localhost link from a
  // dev run - those must never reach a patient's WhatsApp message.
  const isUsableUrl = (value) =>
    /^https?:\/\/\S+$/i.test(value) &&
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);

  const suppliedUrl = String(invoiceUrl || "").trim();
  const storedUrl = String(invoice.invoiceUrl || "").trim();
  const url =
    [suppliedUrl, storedUrl].find(isUsableUrl) ||
    `${requestOrigin(req)}/api/invoice/${invoice._id}`;

  // Store first - the patient link is persisted before any WhatsApp call, so a
  // Fast2SMS outage can never lose the bill or leave it without a URL.
  invoice.invoiceUrl = url;
  await invoice.save();

  // `?dryRun=1` stops here: the link is stored, nothing is sent. Used by the
  // panel smoke test and when an admin wants the link without messaging.
  if (dryRun) {
    return res.status(200).json({
      success: true,
      dryRun: true,
      invoiceUrl: url,
      invoice: toPanelInvoice(invoice, status),
    });
  }

  const whatsapp = await sendInvoiceWhatsApp(invoice, url, {
    origin: requestOrigin(req),
  });

  // SENT only after a real delivery, so a failed send stays retryable.
  if (whatsapp.sent) {
    invoice.status = invoice_status.sent;
    invoice.statusUpdatedAt = new Date();
  }
  // Delivery state is tracked separately from the billing state.
  await applyWhatsAppResult(invoice, whatsapp);

  res.status(200).json({
    success: true,
    invoiceUrl: url,
    whatsapp: {
      sent: Boolean(whatsapp.sent),
      attempts: whatsapp.attempts || 0,
      // `missing_appointment` = nothing to ask feedback about, so nothing was sent.
      reason: whatsapp.reason || "",
    },
    invoice: toPanelInvoice(invoice, status),
  });
}

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") return await handleGet(req, res);
    if (req.method === "PATCH") return await handlePatch(req, res);
    if (req.method === "POST") {
      if (String(req.query?.action || "") === "create") {
        return await handleCreate(req, res);
      }
      return await handlePost(req, res);
    }
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("Error handling invoices request:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
}

