// GET /api/invoice/[id] - the patient-facing invoice page.
//
// This is the link the midnight cron WhatsApps (see src/lib/invoice/billing.js).
// It renders the exact same layout as the SuperAdmin preview through the shared
// template (src/lib/invoice/invoiceTemplate.js) and is read-only: no auth is
// needed because the URL carries the invoice id, like the Firebase PDF links.
import mongoose from "mongoose";
import { dbConnect } from "../../../src/lib/db";
import Invoice from "../../../src/models/invoice";
import { renderInvoiceHtml } from "../../../src/lib/invoice/invoiceTemplate";
import { resolveAppOrigin } from "../../../src/lib/invoice/billing";

const plainText = (res, status, message) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.status(status).send(message);
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return plainText(res, 405, "Method Not Allowed");
  }

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return plainText(res, 400, "Invalid invoice id");
  }

  try {
    await dbConnect();
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) return plainText(res, 404, "Invoice not found");

    const html = renderInvoiceHtml(invoice, {
      logoUrl: `${resolveAppOrigin()}/images/invoicelogo.png`,
      print: ["1", "true"].includes(String(req.query?.print || "").toLowerCase()),
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Patient-specific document - never cache at the CDN/proxy level.
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Error rendering invoice page:", error);
    return plainText(res, 500, "Could not load this invoice");
  }
}
