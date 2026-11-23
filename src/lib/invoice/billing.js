// Invoice billing - builds bills from completed, not-yet-invoiced services.
//
// Shared by the midnight cron (src/cron/jobs.js -> /api/helperApi?action=
// generateInvoices) and the SuperAdmin "+ Create Invoice" modal (GET
// /api/helper/invoices?unbilled=1), so a manual bill and an automatic one are
// always computed the same way.
//
// Design rules:
//  * Idempotent - a service is billed once; after the invoice is stored its
//    `invoiceId` is stamped on the service and it is never picked up again.
//  * Extensible - add another collection to BILLABLE_SOURCES and it joins the
//    nightly run; nothing else needs to change.
//  * Never throws on missing config - a service with no matching
//    `servicesoffereds` row is billed with 0% GST/HSN and reported as
//    `needsReview` instead of failing the whole run.
//  * Store first, send later - the invoice row is committed before any WhatsApp
//    call, so a failed message can never lose a bill.
import mongoose from "mongoose";
import Appointment from "../../models/appointmentSchema";
import BookLabTest from "../../models/bookLabTestSchema";
import ServiceOffered from "../../models/serviceOffered";
import "../../models/doctorModel"; // registers the "Doctor" model used by populate()
import Invoice from "../../models/invoice";
import { appointment_status } from "../../constant";
import {
  INVOICE_SOURCE,
  INVOICE_STATUS,
  INVOICE_WHATSAPP_STATUS,
} from "../../constants/invoice";
import { applyWhatsAppResult, sendInvoiceWhatsApp } from "./deliver";

/** "no invoice yet" for both source collections (legacy rows may lack the key). */
const UNBILLED_FILTER = {
  $or: [{ invoiceId: "" }, { invoiceId: null }, { invoiceId: { $exists: false } }],
};

/** Collect columns, per source collection. */
export const BILLABLE_SOURCES = [
  {
    key: "appointment",
    serviceType: "Consultation",
    // Only completed consultations that were never billed.
    fetch: () =>
      Appointment.find({
        ...UNBILLED_FILTER,
        status: new RegExp(`^${appointment_status.completed}$`, "i"),
      })
        .populate("doctorId", "name")
        .lean(),
    toBillable: (doc) => {
      const listPrice = Number(doc.consultationprice) || 0;
      // Cashfree offers: `amountAfterOffer` is what actually arrived.
      const paidAmount =
        doc.amountAfterOffer != null
          ? Number(doc.amountAfterOffer) || 0
          : listPrice;
      const discount =
        Number(doc.discountAmount) > 0
          ? Number(doc.discountAmount)
          : Math.max(0, Number((listPrice - paidAmount).toFixed(2)));

      return {
        source: "appointment",
        serviceId: String(doc._id),
        serviceType: "Consultation",
        patientName: doc.name,
        mobile: doc.patientMobNo,
        address: doc.address || "",
        doctorName: String(doc.doctorId?.name || "").trim(),
        itemName: doc.consultationType || "Consultation",
        rateLabel: doc.consultationType || doc.serviceType || "Consultation",
        listPrice,
        paidAmount,
        discount,
      };
    },
  },
  {
    key: "labTest",
    serviceType: "LabTest",
    // Lab bookings keep their state in `bookingStatus` (not `status`).
    fetch: () =>
      BookLabTest.find({
        ...UNBILLED_FILTER,
        bookingStatus: /^completed$/i,
      }).lean(),
    toBillable: (doc) => {
      const paidAmount = Number(doc.totalPrice) || 0;
      return {
        source: "labTest",
        serviceId: String(doc._id),
        serviceType: "LabTest",
        patientName: doc.name,
        mobile: doc.mobileNumber,
        address: "",
        doctorName: "",
        itemName: doc.serviceOffered || doc.serviceType || "Lab Test",
        rateLabel: "Labtest",
        listPrice: paidAmount,
        paidAmount,
        discount: 0,
      };
    },
  },
];

/**
 * Every billable service, flat, across all registered sources.
 * @returns {Promise<Array<object>>}
 */
export const collectBillableServices = async (sources = BILLABLE_SOURCES) => {
  const collected = [];

  for (const source of sources) {
    const documents = await source.fetch();
    documents.forEach((doc) => {
      const billable = source.toBillable(doc);
      if (!billable.mobile) return; // cannot invoice without a contact
      collected.push(billable);
    });
  }

  return collected;
};

/** Rate card rows (`servicesoffereds`): name, gst %, hsn %. */
const loadRateRows = () =>
  ServiceOffered.find({}).select("name gst hsn_percentage").lean();

/**
 * GST / HSN for one service label (e.g. "Audio", "Video", "Labtest").
 * An unknown label is not an error: the bill gets 0 % and is flagged for review.
 */
export const resolveRateRow = (label, rateRows = []) => {
  const target = String(label || "").trim().toLowerCase();
  const row = target
    ? rateRows.find(
        (entry) => String(entry.name || "").trim().toLowerCase() === target,
      )
    : null;

  if (!row) {
    return { name: label || "", gst: 0, hsn: 0, matched: false };
  }
  return {
    name: row.name,
    gst: Number(row.gst) || 0,
    hsn: Number(row.hsn_percentage) || 0,
    matched: true,
  };
};

/** `INV-1234`, the format the panel and the old flow already use. */
export const nextInvoiceNumber = () =>
  `INV-${Math.floor(1000 + Math.random() * 9000)}`;

const mobileKey = (value) => String(value ?? "").replace(/\D/g, "");

/**
 * Groups billable services into invoice drafts - one draft per mobile number, so
 * a consultation and a lab test of the same patient end up on one bill.
 *
 * @param {Array<object>} billables  output of collectBillableServices()
 * @param {Array<object>} [rateRows] servicesoffereds rows (loaded when omitted)
 */
export const buildInvoiceDrafts = async (billables, rateRows) => {
  if (!billables.length) return [];
  const rows = rateRows || (await loadRateRows());

  const groups = new Map();
  billables.forEach((billable) => {
    const key = mobileKey(billable.mobile);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(billable);
  });

  const drafts = [];
  for (const [key, services] of groups) {
    const rateCache = new Map();
    const item = [];
    const needsReview = [];
    let subTotal = 0;
    let totalPrice = 0;
    let gst = 0;

    services.forEach((service) => {
      if (!rateCache.has(service.rateLabel)) {
        rateCache.set(service.rateLabel, resolveRateRow(service.rateLabel, rows));
      }
      const rate = rateCache.get(service.rateLabel);
      if (!rate.matched && !needsReview.includes(service.rateLabel)) {
        needsReview.push(service.rateLabel);
      }

      subTotal += service.listPrice;
      totalPrice += service.paidAmount;
      gst += rate.gst;

      item.push({
        id: service.serviceId,
        name: service.itemName,
        hsn: rate.hsn,
        discount: service.discount,
        quantity: 1,
        price: service.paidAmount,
        serviceType: service.serviceType,
      });
    });

    const names = [...new Set(services.map((s) => s.patientName).filter(Boolean))];
    const doctorName =
      services.map((s) => s.doctorName).find((name) => Boolean(name)) || "";
    const address = services.map((s) => s.address).find((a) => Boolean(a)) || "";
    const invoiceNumber = nextInvoiceNumber();

    drafts.push({
      key,
      invoiceNumber,
      needsReview,
      services: services.map(({ source, serviceId }) => ({ source, serviceId })),
      fields: {
        name: names.join(" + ") || "Patient",
        mobNo: Number(mobileKey(services[0].mobile)),
        address,
        doctorName,
        billFrom: "",
        invoiceNumber,
        subTotal: Number(subTotal.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        gst,
        freight: 0,
        tax: 0,
        item,
        invoiceUrl: "",
        status: INVOICE_STATUS.completed,
        statusUpdatedAt: new Date(),
        whatsappStatus: INVOICE_WHATSAPP_STATUS.pending,
        whatsappStatusUpdatedAt: null,
        source: INVOICE_SOURCE.auto,
      },
    });
  }

  return drafts;
};

/** Collection that owns each billable service type. */
const SERVICE_MODELS = {
  appointment: Appointment,
  labTest: BookLabTest,
};

/**
 * Stamps `invoiceId` on the billed services - this is what makes the nightly run
 * idempotent: the next run only looks at services with an empty `invoiceId`.
 */
export const stampServices = async (services, invoiceId) => {
  const stamped = [];
  for (const service of services) {
    const Model = SERVICE_MODELS[service.source];
    if (!Model) continue;
    if (!mongoose.isValidObjectId(service.serviceId)) continue;
    await Model.updateOne(
      { _id: service.serviceId, ...UNBILLED_FILTER },
      { $set: { invoiceId: String(invoiceId) } },
    );
    stamped.push(service.serviceId);
  }
  return stamped;
};

/** Creates one invoice, retrying with a fresh number on a duplicate key. */
const persistDraft = async (draft) => {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const invoiceNumber =
      attempt === 1 ? draft.fields.invoiceNumber : nextInvoiceNumber();
    try {
      return await Invoice.create({ ...draft.fields, invoiceNumber });
    } catch (error) {
      lastError = error;
      if (error?.code !== 11000) throw error; // 11000 = duplicate invoiceNumber
    }
  }
  throw lastError;
};

/**
 * Creates the invoices for every completed, unbilled service.
 *
 * @param {object} [options]
 * @param {boolean} [options.apply=true]  false = dry run, nothing is written
 * @param {Array} [options.sources]       override BILLABLE_SOURCES
 * @returns {Promise<{billables: number, created: Array, failed: Array,
 *                    needsReview: Array, preview: Array}>}
 */
export const createInvoicesFromBillables = async ({
  apply = true,
  sources = BILLABLE_SOURCES,
} = {}) => {
  const billables = await collectBillableServices(sources);
  const rateRows = billables.length ? await loadRateRows() : [];
  const drafts = await buildInvoiceDrafts(billables, rateRows);

  const report = {
    billables: billables.length,
    drafts: drafts.length,
    created: [],
    failed: [],
    needsReview: drafts
      .filter((draft) => draft.needsReview.length)
      .map((draft) => ({
        invoiceNumber: draft.invoiceNumber,
        name: draft.fields.name,
        mobNo: draft.fields.mobNo,
        unknownRates: draft.needsReview,
      })),
    preview: drafts.map((draft) => ({
      invoiceNumber: draft.fields.invoiceNumber,
      name: draft.fields.name,
      mobNo: draft.fields.mobNo,
      subTotal: draft.fields.subTotal,
      totalPrice: draft.fields.totalPrice,
      items: draft.fields.item,
      services: draft.services.length,
      needsReview: draft.needsReview,
    })),
  };

  if (!apply) return report;

  for (const draft of drafts) {
    try {
      const invoice = await persistDraft(draft);
      await stampServices(draft.services, invoice._id);
      report.created.push(invoice);
    } catch (error) {
      console.error(
        `[invoice] could not create invoice for ${draft.fields.mobNo}:`,
        error?.message,
      );
      report.failed.push({
        name: draft.fields.name,
        mobNo: draft.fields.mobNo,
        error: error?.message || "insert failed",
      });
    }
  }

  return report;
};

/**
 * Public origin used for the patient invoice link (no host is hardcoded).
 * Same env precedence as the auth flows: explicit app URL, then NEXTAUTH_URL,
 * then the deployment URL from src/constant.js.
 */
export const resolveAppOrigin = () => {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_DEVELOPMENT_PRODUCTION_URL ||
    "";
  const value = String(raw).trim().replace(/\/+$/, "");
  if (!value) return "http://localhost:3000";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

/**
 * The midnight job: create the bills, then WhatsApp each one.
 *
 * Order matters (see the file header):
 *   1. the invoice + its patient link are committed first,
 *   2. only then is WhatsApp called,
 *   3. the outcome is written to `whatsappStatus` (SENT / FAILED).
 * A failure on one invoice is logged and the loop continues with the next.
 */
export const runInvoiceGeneration = async ({ apply = true, baseUrl } = {}) => {
  const report = await createInvoicesFromBillables({ apply });

  const summary = {
    billables: report.billables,
    drafts: report.drafts,
    created: report.created.map((invoice) => ({
      id: String(invoice._id),
      invoiceNumber: invoice.invoiceNumber,
      name: invoice.name,
      mobNo: invoice.mobNo,
      totalPrice: invoice.totalPrice,
    })),
    failed: report.failed,
    needsReview: report.needsReview,
    delivered: [],
    deliveryFailed: [],
    preview: report.preview,
  };

  if (!apply) return summary;

  const origin = String(baseUrl || resolveAppOrigin()).replace(/\/+$/, "");

  for (const created of report.created) {
    const invoice = await Invoice.findById(created._id);
    if (!invoice) continue;

    const url = `${origin}/api/invoice/${invoice._id}`;

    try {
      // Store first: the patient link is persisted before any WhatsApp call.
      invoice.invoiceUrl = url;
      await invoice.save();
    } catch (error) {
      console.error(
        `[invoice] could not store link for ${invoice.invoiceNumber}:`,
        error?.message,
      );
    }

    let result = { sent: false, attempts: 0, reason: "send_failed" };
    try {
      result = await sendInvoiceWhatsApp(invoice, url, { origin });
    } catch (error) {
      console.error(
        `[invoice] WhatsApp error for ${invoice.invoiceNumber}:`,
        error?.message,
      );
      result = { sent: false, attempts: 0, reason: error?.message };
    }

    const whatsappStatus = await applyWhatsAppResult(invoice, result);
    const entry = {
      invoiceNumber: invoice.invoiceNumber,
      mobNo: invoice.mobNo,
      whatsappStatus,
    };
    if (result.sent) summary.delivered.push(entry);
    else summary.deliveryFailed.push({ ...entry, reason: result.reason });
  }

  return summary;
};
