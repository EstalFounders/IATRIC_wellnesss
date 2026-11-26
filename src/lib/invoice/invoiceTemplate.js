// Server-rendered invoice HTML - the same layout, styling and wording as the
// SuperAdmin preview (src/components/superAdminComponent/invoice/InvoicePreview.js),
// without React so it can be produced by the cron / a plain API route.
//
// Used by:
//   * pages/api/invoice/[id].js  - the link WhatsApps to the patient,
//   * src/lib/invoice/billing.js - the URL stored on a cron-created invoice.
// Keep the markup in sync with InvoicePreview.js when the design changes.
import {
  company_registrated_name,
  contact_no,
  gst_no,
  invoice_bill_yellow_color,
} from "../../constant";
import { priceToWords } from "../../components/superAdminComponent/utility/helper";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (value) => `₹ ${Number(value) || 0}`;

/** Line total: stored `totalPrice` wins, else price * qty - discount. */
const lineTotal = (line) => {
  if (line.totalPrice != null) return Number(line.totalPrice) || 0;
  const quantity = Number(line.quantity ?? line.qty ?? 1) || 0;
  return Math.max(
    0,
    (Number(line.price) || 0) * quantity - (Number(line.discount) || 0),
  );
};

const formatDate = (value) => {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * @param {object} invoice  an `invoices` document (lean object is fine)
 * @param {object} [options]
 * @param {string} [options.logoUrl]  absolute URL of the invoice logo
 * @param {boolean} [options.print]   add the "Print / Save as PDF" helper bar
 * @returns {string} a complete HTML document
 */
export const renderInvoiceHtml = (invoice = {}, options = {}) => {
  const items = Array.isArray(invoice.item) ? invoice.item : [];
  const rows = items
    .map((line, index) => {
      const quantity = Number(line.quantity ?? line.qty ?? 1) || 0;
      return `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(line.name)}</td>
        <td>${escapeHtml(line.hsn ?? 0)}</td>
        <td>${quantity}</td>
        <td>${escapeHtml(line.discount ?? 0)}</td>
        <td>${money(line.price)}</td>
        <td>${money(lineTotal(line))}</td>
      </tr>`;
    })
    .join("");

  const logo = options.logoUrl
    ? `<img class="logo" src="${escapeHtml(options.logoUrl)}" alt="Logo" />`
    : "";

  const styles = `
      * { box-sizing: border-box; }
      body {
        margin: 0; padding: 24px 12px; background: #f1f3f5;
        font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #212529;
      }
      .sheet {
        background: #fff; max-width: 900px; margin: 0 auto; padding: 32px 40px;
        border: 1px solid #dee2e6; border-radius: 4px;
      }
      @media (max-width: 640px) { .sheet { padding: 18px 14px; } }
      .row { display: flex; flex-wrap: wrap; gap: 16px; }
      .col-main { flex: 1 1 60%; }
      .col-side { flex: 1 1 30%; display: flex; align-items: center; justify-content: center; }
      .col-third { flex: 1 1 30%; }
      .col-right { flex: 1 1 45%; text-align: right; }
      h1 { font-size: 42px; margin: 4px 0 0; letter-spacing: 2px; }
      h3 { font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
      h4 { font-size: 15px; margin: 0 0 8px; text-transform: uppercase; }
      .logo { width: 100%; max-width: 260px; height: auto; }
      .block { margin-bottom: 20px; }
      .meta div { margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { border: 1px solid #dee2e6; padding: 8px 6px; text-align: center; vertical-align: middle; }
      thead th { background: ${invoice_bill_yellow_color}; font-weight: 600; }
      .summary { margin-left: auto; width: 100%; max-width: 340px; font-size: 14px; }
      .summary div { display: flex; justify-content: space-between; margin-bottom: 4px; }
      .summary .total { font-size: 17px; font-weight: 700; border-top: 2px solid #000; padding-top: 6px; }
      .words { display: flex; gap: 12px; font-size: 14px; text-transform: uppercase; margin-bottom: 18px; }
      .words b { white-space: nowrap; }
      .terms { font-size: 12px; color: #343a40; }
      .terms ol { margin: 6px 0 0; padding-left: 20px; }
      .footer {
        display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;
        background: ${invoice_bill_yellow_color}; padding: 16px; margin-top: 18px;
      }
      .footer .thanks { font-size: 22px; font-weight: 700; }
      .footer .contact { text-align: right; font-weight: 600; font-size: 13px; }
      .toolbar { max-width: 900px; margin: 0 auto 12px; text-align: right; }
      .toolbar button {
        background: #0d6efd; color: #fff; border: 0; border-radius: 4px;
        padding: 8px 16px; font-size: 14px; cursor: pointer;
      }
      @media print {
        body { background: #fff; padding: 0; }
        .toolbar { display: none; }
        .sheet { border: 0; max-width: none; padding: 0; }
      }`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(invoice.invoiceNumber || "Invoice")} - ${escapeHtml(
      company_registrated_name,
    )}</title>
    <style>${styles}</style>
  </head>
  <body>
    ${
      options.print
        ? `<div class="toolbar"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>`
        : ""
    }
    <div class="sheet">
      <div class="row block">
        <div class="col-main">
          <h3>${escapeHtml(company_registrated_name)}</h3>
          <h1>INVOICE</h1>
        </div>
        <div class="col-side">${logo}</div>
      </div>

      <div class="row block meta">
        <div class="col-third">
          <h4>Bill To:</h4>
          <div><b>Name:</b> ${escapeHtml(invoice.name)}</div>
          <div><b>Address:</b> ${escapeHtml(invoice.address || "-")}</div>
          <div><b>Contact:</b> ${escapeHtml(invoice.mobNo)}</div>
        </div>
        <div class="col-third">
          <h4>From:</h4>
          <div><b>${escapeHtml(
            invoice.billFrom || company_registrated_name,
          )}</b></div>
          <div>
            HEALTHPATH RIGROSS COMPLEX C, BLOCK SECTOR 57 GURGAON, HARYANA
            CONTACT : ${escapeHtml(contact_no)}
          </div>
          <div>GSTIN : ${escapeHtml(gst_no)}</div>
        </div>
        <div class="col-right">
          <div><b>Invoice No:</b> ${escapeHtml(invoice.invoiceNumber)}</div>
          <div><b>Date:</b> ${escapeHtml(formatDate(invoice.createdAt))}</div>
          ${
            invoice.status
              ? `<div><b>Status:</b> ${escapeHtml(invoice.status)}</div>`
              : ""
          }
        </div>
      </div>

      <div class="block">
        <table>
          <thead>
            <tr>
              <th>S.NO.</th>
              <th>Description</th>
              <th>HSN</th>
              <th>QTY</th>
              <th>DISCOUNT</th>
              <th>PRICE</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="7">No items</td></tr>`}</tbody>
        </table>
      </div>

      <div class="row block">
        <div class="summary">
          <div><b>Subtotal:</b> <span>${money(invoice.subTotal)}</span></div>
          <div><b>GST:</b> <span>${money(invoice.gst)}</span></div>
          <div><b>Freight:</b> <span>${money(invoice.freight)}</span></div>
          <div><b>Tax:</b> <span>${money(invoice.tax)}</span></div>
          <div class="total"><b>TOTAL:</b> <span>${money(invoice.totalPrice)}</span></div>
        </div>
      </div>

      <div class="words">
        <b>Total in words:</b>
        <span>${escapeHtml(priceToWords(invoice.totalPrice) || "Zero")}</span>
      </div>

      <div class="terms">
        <hr />
        <b>Terms &amp; Conditions:</b>
        <ol>
          <li>INTEREST 18% P.A. WILL BE CHARGED IF PAYMENT IS NOT MADE WITHIN STIPULATED TIME.</li>
          <li>ALL DISPUTES SUBJECTED TO GURGAON JURISDICTION ONLY.</li>
          <li>THIS IS A COMPUTER GENERATED INVOICE. NO SIGNATURE REQUIRED.</li>
          <li>FREE FOLLOW-UP IS AVAILABLE ONLY WITHIN 48 HOURS OF THE CONSULTATION AND ONLY FOR THE SAME OR A RELATED PROBLEM.</li>
        </ol>
        <hr />
      </div>

      <div class="footer">
        <div>
          <div class="thanks">Thank you!</div>
          <div>TTANSHE HEALTH PATH PVT. LTD</div>
        </div>
        <div class="contact">
          <div>Contact: ${escapeHtml(contact_no)}</div>
          <div>www.healthpath.co.in</div>
          <div>customercare@healthpath.co.in</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

export default renderInvoiceHtml;
