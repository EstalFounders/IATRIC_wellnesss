import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, invoice_status_options } from "../../../constant";
import InvoiceCard from "./InvoiceCard";
import InvoicePreview from "./InvoicePreview";
import CreateInvoiceModal from "./CreateInvoiceModal";
import NotifcationPreviewModel from "../model/NotificationPreviewModel";
import styles from "../css/InvoiceList.module.css";

const STATUS_FILTERS = ["ALL", ...invoice_status_options];

const InvoiceComp = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [show, setShow] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Just-created invoice: scrolled into view and flashed so the admin sees it in
  // the list without having to hunt for it.
  const [highlightId, setHighlightId] = useState("");
  const listRef = useRef(null);
  const highlightTimer = useRef(null);

  // List of saved invoices (GET /api/helper/invoices). New bills are created
  // with the "+ Create Invoice" modal, the cron adds the automatic ones.
  // `keepOnError` is used by the post-create refresh: a transient failure (dev
  // recompile, flaky network) must not wipe the row that was just prepended.
  const loadInvoices = useCallback(async (options = {}) => {
    const { keepOnError = false } = options || {};
    setLoading(true);
    setError("");
    try {
      const response = await fetch(api.getInvoices, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Could not load invoices");
      }
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      if (!keepOnError) {
        setInvoices([]);
        setError(err.message || "Could not load invoices");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Clear the flash timer if the panel unmounts mid-highlight.
  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus =
        statusFilter === "ALL" || invoice.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      return [invoice.name, invoice.invoiceNumber, invoice.mobNo]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [invoices, searchQuery, statusFilter]);

  const openPreview = (invoice) => {
    setSelectedInvoice(invoice);
    setShow(true);
  };

  const closePreview = () => {
    setShow(false);
    setSelectedInvoice(null);
  };

  // PATCH /api/helper/invoices - the status dropdown on each card.
  const changeStatus = async (invoice, status) => {
    try {
      const response = await fetch(api.getInvoices, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice._id, status }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Could not update status");
      }
      const updated = data.invoice;
      setInvoices((prev) =>
        prev.map((row) =>
          row._id === updated._id ? { ...row, ...updated } : row,
        ),
      );
      setSelectedInvoice((prev) =>
        prev && prev._id === updated._id ? { ...prev, ...updated } : prev,
      );
    } catch (err) {
      console.error("Error updating invoice status:", err);
      window.alert(err.message || "Could not update invoice status");
    }
  };

  // Called after "Send Invoice" stored the Firebase PDF URL and attempted the
  // WhatsApp delivery.
  const handleSent = (updated, whatsapp) => {
    if (updated) {
      setInvoices((prev) =>
        prev.map((row) =>
          row._id === updated._id ? { ...row, ...updated } : row,
        ),
      );
      setSelectedInvoice((prev) =>
        prev && prev._id === updated._id ? { ...prev, ...updated } : prev,
      );
    }

    if (whatsapp && whatsapp.sent) {
      window.alert(
        `Invoice sent to ${updated?.mobNo || "the patient"} on WhatsApp.`,
      );
      closePreview();
    } else {
      window.alert(
        "The invoice was saved, but the WhatsApp message could not be delivered. Please try again.",
      );
    }
  };

  const handleCreated = (invoice) => {
    setShowCreate(false);

    if (!invoice) {
      loadInvoices();
      return;
    }

    // A new bill is useless if it lands under an active filter/search, so clear
    // both before inserting it - the admin sees it straight away, exactly where
    // the panel puts it (top of the list).
    setSearchQuery("");
    setStatusFilter("ALL");
    setInvoices((prev) => [
      invoice,
      ...prev.filter((row) => row._id !== invoice._id),
    ]);
    setHighlightId(invoice._id);

    window.alert(
      `Invoice ${invoice.invoiceNumber} created. Open it to generate the PDF and send it on WhatsApp.`,
    );

    // Scroll the new row into view, then refresh in the background so the
    // derived status / service count are current (a failure keeps the row).
    window.requestAnimationFrame(() => {
      const row = listRef.current?.querySelector(
        `[data-invoice-id="${invoice._id}"]`,
      );
      if (row && typeof row.scrollIntoView === "function") {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    loadInvoices({ keepOnError: true });

    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightId(""), 5000);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Search + status filters + refresh */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by name, mobile or invoice no..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`btn btn-sm ${
              statusFilter === status ? "btn-primary" : "btn-outline-secondary"
            }`}
          >
            {status === "ALL" ? "All" : status}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-success"
          onClick={() => setShowCreate(true)}
        >
          + Create Invoice
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => loadInvoices()}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
        <span style={{ color: "#666", fontSize: "14px" }}>
          {filteredInvoices.length} of {invoices.length} invoices
        </span>
      </div>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !invoices.length ? (
        <div>Loading invoices...</div>
      ) : filteredInvoices.length > 0 ? (
        <div className={styles.list} ref={listRef}>
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              openPreview={openPreview}
              onStatusChange={changeStatus}
              highlight={invoice._id === highlightId}
            />
          ))}
        </div>
      ) : (
        <div>No invoice found</div>
      )}

      {/* Invoice preview modal - renders the invoice, uploads the PDF to
          Firebase and WhatsApps that link (COMPLETED invoices only) */}
      <NotifcationPreviewModel isOpen={show}>
        {selectedInvoice && (
          <InvoicePreview
            invoice={selectedInvoice}
            onClose={closePreview}
            onSent={handleSent}
          />
        )}
      </NotifcationPreviewModel>

      {/* Manual bill - prefilled from completed, unbilled services */}
      {showCreate ? (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      ) : null}
    </div>
  );
};

export default InvoiceComp;
