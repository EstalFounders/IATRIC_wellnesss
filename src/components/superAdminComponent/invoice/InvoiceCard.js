import { useState } from "react";
import {
  invoice_source,
  invoice_status_options,
  invoice_whatsapp_status,
  invoice_whatsapp_status_labels,
} from "../../../constant";
import styles from "../css/InvoiceList.module.css";

// Badge colours only - height, padding, radius and min-width live in
// css/InvoiceList.module.css so every pill has the same geometry.
const STATUS_STYLES = {
  COMPLETED: { background: "#d1e7dd", color: "#0f5132" },
  PENDING: { background: "#fff3cd", color: "#664d03" },
  CANCELLED: { background: "#f8d7da", color: "#842029" },
  SENT: { background: "#cfe2ff", color: "#084298" },
  MANUAL: { background: "#e2e3e5", color: "#41464b" },
};

// Delivery badge - values come from src/constants/invoice.js.
const WHATSAPP_STYLES = {
  [invoice_whatsapp_status.pending]: { background: "#fff3cd", color: "#664d03" },
  [invoice_whatsapp_status.sent]: { background: "#d1e7dd", color: "#0f5132" },
  [invoice_whatsapp_status.failed]: { background: "#f8d7da", color: "#842029" },
  [invoice_whatsapp_status.notSent]: { background: "#e2e3e5", color: "#41464b" },
};

/** Firebase-hosted PDF vs. the read-only invoice page vs. nothing stored yet. */
const documentLabel = (invoiceUrl) => {
  const value = String(invoiceUrl || "");
  if (/^https:\/\/firebasestorage\.googleapis\.com\//i.test(value))
    return "Invoice PDF stored";
  return value ? "Invoice page linked" : "Not linked yet";
};

// One saved invoice (`invoices` collection). `status` is the stored value when the
// admin picked one in the dropdown below, otherwise the status derived server-side
// by GET /api/helper/invoices from the services it was raised for.
const InvoiceCard = ({ invoice, openPreview, onStatusChange, highlight }) => {
  const [saving, setSaving] = useState(false);
  const statusStyle = STATUS_STYLES[invoice.status] || STATUS_STYLES.MANUAL;
  const whatsappStatus =
    invoice.whatsappStatus || invoice_whatsapp_status.notSent;
  const whatsappStyle =
    WHATSAPP_STYLES[whatsappStatus] ||
    WHATSAPP_STYLES[invoice_whatsapp_status.notSent];
  const whatsappLabel =
    invoice.whatsappStatusLabel ||
    invoice_whatsapp_status_labels[whatsappStatus] ||
    whatsappStatus;
  const items = (invoice.item || []).map((line) => line.name).join(", ");

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    if (!onStatusChange || nextStatus === invoice.status) return;
    setSaving(true);
    try {
      await onStatusChange(invoice, nextStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`${styles.row}${highlight ? ` ${styles.highlight}` : ""}`}
      data-invoice-id={invoice._id}
    >
      {/* Left: invoice id + fixed 2-column fact grid */}
      <div className={styles.info}>
        <p className={styles.invoiceNo}>{invoice.invoiceNumber}</p>
        <div className={styles.facts}>
          <div className={styles.fact}>
            <span className={styles.factLabel}>Patient Name</span>
            <p
              className={`${styles.factValue} ${styles.singleLine}`}
              title={invoice.name || ""}
            >
              {invoice.name || "-"}
            </p>
          </div>
          <div className={styles.fact}>
            <span className={styles.factLabel}>Mobile No</span>
            <p className={styles.factValue}>{invoice.mobNo || "-"}</p>
          </div>
          <div className={styles.fact}>
            <span className={styles.factLabel}>Total Price</span>
            <p className={styles.factValue}>
              {invoice.totalPrice != null ? `₹ ${invoice.totalPrice}` : "-"}
            </p>
          </div>
          <div className={styles.fact}>
            <span className={styles.factLabel}>Items</span>
            <p
              className={`${styles.factValue} ${styles.clamp2}`}
              title={items || ""}
            >
              {items || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Right: badges, meta, status dropdown and action - all on one right edge */}
      <div className={styles.side}>
        <div className={styles.badgeRow}>
          <span className={styles.badge} style={statusStyle}>
            {invoice.status}
          </span>
          <span className={styles.badge} style={whatsappStyle}>
            {whatsappLabel}
          </span>
        </div>

        <p className={styles.metaLine}>
          {invoice.source === invoice_source.auto ? "Auto (cron)" : "Manual"}
          {" · "}
          {documentLabel(invoice.invoiceUrl)}
        </p>

        <div className={styles.controls}>
          <span className={styles.saving}>{saving ? "Saving..." : ""}</span>
          <label
            className={styles.controlLabel}
            htmlFor={`status-${invoice._id}`}
          >
            Status:
          </label>
          <select
            id={`status-${invoice._id}`}
            className={styles.select}
            value={invoice.status || ""}
            onChange={handleStatusChange}
            disabled={saving || !onStatusChange}
          >
            {invoice_status_options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={styles.viewBtn}
          onClick={() => openPreview(invoice)}
        >
          VIEW INVOICE
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;
