import { useCallback, useEffect, useState } from "react";
import { api, company_registrated_name } from "../../../constant";
import { INVOICE_BILL_FROM_CUSTOM } from "../../../constants/invoice";

const inputStyle = {
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "100%",
  fontSize: "14px",
};

const labelStyle = {
  display: "block",
  marginBottom: "4px",
  fontSize: "13px",
  fontWeight: "500",
  color: "#444",
};

const emptyItem = () => ({
  name: "",
  hsn: 0,
  quantity: 1,
  discount: 0,
  price: 0,
  serviceType: "Manual",
});

const toAmount = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

// "+ Create Invoice" - manual bill on the SuperAdmin invoice panel.
//
// The dropdown at the top lists the completed appointments / lab tests that have
// no invoice yet (GET /api/helper/invoices?unbilled=1, the same grouping the
// midnight cron uses). Picking one prefills the patient + line items; the admin
// can still edit everything or start from a blank bill ("-- New bill --").
// POST /api/helper/invoices?action=create recomputes the totals server-side and
// stamps `invoiceId` on the linked services, so the cron will not bill them again.
const CreateInvoiceModal = ({ onClose, onCreated }) => {
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "",
    mobNo: "",
    address: "",
    doctorName: "",
    gst: 0,
    freight: 0,
    tax: 0,
  });
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // "Bill From": presets come from GET ?billFrom=1 (registered company + every
  // entity already used on an invoice); the last option lets the admin type a
  // new one, which is then stored on the invoice and reused as a preset.
  const [billFromOptions, setBillFromOptions] = useState([
    company_registrated_name,
  ]);
  const [billFrom, setBillFrom] = useState(company_registrated_name);
  const [customBillFrom, setCustomBillFrom] = useState("");

  const loadUnbilled = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch(`${api.getInvoices}?unbilled=1`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not load unbilled services");
      }
      setGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch (err) {
      console.error("Error loading unbilled services:", err);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    loadUnbilled();
  }, [loadUnbilled]);

  // "Bill From" presets. Failure is non-fatal: the registered company name is
  // always selectable and the "+ Add new..." entry still works.
  const loadBillFromOptions = useCallback(async () => {
    try {
      const response = await fetch(`${api.getInvoices}?billFrom=1`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not load Bill From options");
      }
      const values = Array.isArray(data.billFrom) ? data.billFrom : [];
      setBillFromOptions([
        ...new Set(
          [company_registrated_name, ...values]
            .map((value) => String(value || "").trim())
            .filter(Boolean),
        ),
      ]);
    } catch (err) {
      console.error("Error loading Bill From options:", err);
      setBillFromOptions([company_registrated_name]);
    }
  }, []);

  useEffect(() => {
    loadBillFromOptions();
  }, [loadBillFromOptions]);

  const applyGroup = (key) => {
    setSelectedKey(key);
    setError("");
    const group = groups.find((entry) => entry.key === key);

    if (!group) {
      setServices([]);
      setForm({
        name: "",
        mobNo: "",
        address: "",
        doctorName: "",
        gst: 0,
        freight: 0,
        tax: 0,
      });
      setItems([emptyItem()]);
      return;
    }

    setServices(group.services || []);
    setForm({
      name: group.patientName || "",
      mobNo: String(group.mobNo || ""),
      address: group.address || "",
      doctorName: group.doctorName || "",
      gst: 0,
      freight: 0,
      tax: 0,
    });
    setItems(
      (group.items || []).map((item) => ({
        name: item.name || "",
        hsn: item.hsn || 0,
        quantity: item.quantity || 1,
        discount: item.discount || 0,
        price: item.price || 0,
        serviceType: item.serviceType || "Manual",
      })),
    );
  };

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateItem = (index, field, value) =>
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, idx) => idx !== index));

  const subTotal = Number(
    items
      .reduce(
        (sum, item) =>
          sum +
          Math.max(
            0,
            toAmount(item.price) * (toAmount(item.quantity) || 1) -
              toAmount(item.discount),
          ),
        0,
      )
      .toFixed(2),
  );
  const totalPrice = Number(
    (
      subTotal +
      toAmount(form.gst) +
      toAmount(form.freight) +
      toAmount(form.tax)
    ).toFixed(2),
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const isCustomBillFrom = billFrom === INVOICE_BILL_FROM_CUSTOM;
    const billFromName = isCustomBillFrom
      ? customBillFrom.trim()
      : String(billFrom || "").trim();

    if (isCustomBillFrom && !billFromName) {
      setError("Enter the name of the new Bill From entity.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${api.getInvoices}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          billFrom: billFromName || company_registrated_name,
          mobNo: String(form.mobNo || "").trim(),
          gst: toAmount(form.gst),
          freight: toAmount(form.freight),
          tax: toAmount(form.tax),
          item: items.map((item) => ({
            ...item,
            quantity: toAmount(item.quantity) || 1,
            price: toAmount(item.price),
            discount: toAmount(item.discount),
            hsn: toAmount(item.hsn),
          })),
          services,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not create the invoice");
      }
      // Keep the new entity in the dropdown straight away (the next GET
      // ?billFrom=1 returns it from the saved invoices).
      if (isCustomBillFrom && billFromName) {
        setBillFromOptions((prev) => [...new Set([...prev, billFromName])]);
        setBillFrom(billFromName);
        setCustomBillFrom("");
      }
      if (onCreated) onCreated(data.invoice);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(err.message || "Could not create the invoice");
    } finally {
      setSaving(false);
    }
  };

  const selectedGroup = groups.find((group) => group.key === selectedKey);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 1050,
        overflowY: "auto",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "clamp(16px, 4vw, 28px)",
          width: "100%",
          maxWidth: "820px",
          margin: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ marginBottom: "16px" }}
        >
          <h5 style={{ margin: 0, fontSize: "clamp(16px, 4vw, 20px)" }}>
            Create Invoice
          </h5>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#666",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={labelStyle} htmlFor="invoice-unbilled">
              Bill from completed services{" "}
              {loadingGroups
                ? "(loading...)"
                : `(${groups.length} awaiting an invoice)`}
            </label>
            <select
              id="invoice-unbilled"
              style={inputStyle}
              value={selectedKey}
              onChange={(event) => applyGroup(event.target.value)}
            >
              <option value="">-- New bill (manual) --</option>
              {groups.map((group) => (
                <option key={group.key} value={group.key}>
                  {`${group.patientName} | ${group.mobNo} | ₹ ${group.totalPrice}`}
                </option>
              ))}
            </select>
            {selectedGroup && selectedGroup.needsReview.length ? (
              <div className="small mt-1" style={{ color: "#664d03" }}>
                No rate card row for: {selectedGroup.needsReview.join(", ")} -
                GST/HSN left at 0.
              </div>
            ) : null}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label style={labelStyle} htmlFor="invoice-bill-from">
                Bill From
              </label>
              <select
                id="invoice-bill-from"
                style={inputStyle}
                value={billFrom}
                onChange={(event) => {
                  setBillFrom(event.target.value);
                  setError("");
                }}
              >
                {billFromOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value={INVOICE_BILL_FROM_CUSTOM}>
                  + Add new Bill From...
                </option>
              </select>
            </div>
            {billFrom === INVOICE_BILL_FROM_CUSTOM ? (
              <div className="col-12 col-sm-6">
                <label style={labelStyle} htmlFor="invoice-bill-from-new">
                  New Bill From name *
                </label>
                <input
                  id="invoice-bill-from-new"
                  type="text"
                  style={inputStyle}
                  placeholder="Entity / clinic name"
                  value={customBillFrom}
                  onChange={(event) => setCustomBillFrom(event.target.value)}
                />
              </div>
            ) : null}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Patient Name *</label>
              <input
                required
                type="text"
                style={inputStyle}
                placeholder="Enter patient name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Mobile No *</label>
              <input
                required
                type="tel"
                inputMode="numeric"
                style={inputStyle}
                placeholder="10-digit mobile number"
                value={form.mobNo}
                onChange={(event) => updateField("mobNo", event.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Doctor Name</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Enter doctor name"
                value={form.doctorName}
                onChange={(event) =>
                  updateField("doctorName", event.target.value)
                }
              />
            </div>
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Enter address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive mb-2">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: "150px" }}>Description</th>
                  <th style={{ width: "70px" }}>HSN</th>
                  <th style={{ width: "60px" }}>Qty</th>
                  <th style={{ width: "85px" }}>Discount</th>
                  <th style={{ width: "95px" }}>Price</th>
                  <th style={{ width: "80px" }}>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const lineTotal = Math.max(
                    0,
                    toAmount(item.price) * (toAmount(item.quantity) || 1) -
                      toAmount(item.discount),
                  );
                  return (
                    <tr key={index}>
                      <td>
                        <input
                          required
                          type="text"
                          style={inputStyle}
                          placeholder="Service / test"
                          value={item.name}
                          onChange={(event) =>
                            updateItem(index, "name", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          style={inputStyle}
                          value={item.hsn}
                          onChange={(event) =>
                            updateItem(index, "hsn", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          style={inputStyle}
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, "quantity", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          style={inputStyle}
                          value={item.discount}
                          onChange={(event) =>
                            updateItem(index, "discount", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          style={inputStyle}
                          value={item.price}
                          onChange={(event) =>
                            updateItem(index, "price", event.target.value)
                          }
                        />
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>₹ {lineTotal}</td>
                      <td>
                        {items.length > 1 ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(index)}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addItem}
            >
              + Add item
            </button>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6 col-sm-3">
              <label style={labelStyle}>GST</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                value={form.gst}
                onChange={(event) => updateField("gst", event.target.value)}
              />
            </div>
            <div className="col-6 col-sm-3">
              <label style={labelStyle}>Freight</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                value={form.freight}
                onChange={(event) => updateField("freight", event.target.value)}
              />
            </div>
            <div className="col-6 col-sm-3">
              <label style={labelStyle}>Tax</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                value={form.tax}
                onChange={(event) => updateField("tax", event.target.value)}
              />
            </div>
            <div className="col-6 col-sm-3 d-flex flex-column justify-content-end">
              <div className="small text-muted">Subtotal: ₹ {subTotal}</div>
              <div className="font-weight-bold">Total: ₹ {totalPrice}</div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;


