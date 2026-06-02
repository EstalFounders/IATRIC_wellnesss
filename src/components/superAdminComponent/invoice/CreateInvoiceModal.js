import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

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
  id: uuidv4(),
  name: "",
  hsn: "",
  qty: "",
  discount: 0,
  price: "",
  serviceType: "Manual",
});

const CreateInvoiceModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    doctorName: "",
    mobNo: "",
    address: "",
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    gst: 0,
    freight: 0,
    tax: 0,
    item: [emptyItem()],
  });

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateItem = (index, field, value) =>
    setForm((prev) => ({
      ...prev,
      item: prev.item.map((it, i) =>
        i === index ? { ...it, [field]: value } : it
      ),
    }));

  const addItem = () =>
    setForm((prev) => ({ ...prev, item: [...prev.item, emptyItem()] }));

  const removeItem = (index) =>
    setForm((prev) => ({
      ...prev,
      item: prev.item.filter((_, i) => i !== index),
    }));

  const computedSubTotal = form.item.reduce((acc, it) => {
    const total =
      (parseFloat(it.price) || 0) * (parseFloat(it.qty) || 0) -
      (parseFloat(it.discount) || 0);
    return acc + Math.max(0, total);
  }, 0);

  const computedTotal =
    computedSubTotal +
    (parseFloat(form.gst) || 0) +
    (parseFloat(form.freight) || 0) +
    (parseFloat(form.tax) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      mobNo: parseFloat(form.mobNo),
      gst: parseFloat(form.gst) || 0,
      freight: parseFloat(form.freight) || 0,
      tax: parseFloat(form.tax) || 0,
      subTotal: computedSubTotal,
      totalPrice: computedTotal,
      item: form.item.map((it) => {
        const qty = parseFloat(it.qty) || 1;
        const price = parseFloat(it.price) || 0;
        const discount = parseFloat(it.discount) || 0;
        return {
          id: it.id,
          name: it.name,
          hsn: parseFloat(it.hsn) || 0,
          qty,
          quantity: qty,
          discount,
          price,
          totalPrice: Math.max(0, price * qty - discount),
          serviceType: "Manual",
        };
      }),
    };
    onSubmit(payload);
  };

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
          maxWidth: "720px",
          margin: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ marginBottom: "20px" }}
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

        <form onSubmit={handleSubmit}>
          {/* Row 1 — Name + Mobile */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Patient Name *</label>
              <input
                required
                type="text"
                style={inputStyle}
                placeholder="Enter patient name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Mobile No *</label>
              <input
                required
                type="number"
                style={inputStyle}
                placeholder="Enter mobile number"
                value={form.mobNo}
                onChange={(e) => updateField("mobNo", e.target.value)}
              />
            </div>
          </div>

          {/* Row 2 — Doctor Name */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Doctor Name</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Enter doctor name"
                value={form.doctorName}
                onChange={(e) => updateField("doctorName", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3 — Address */}
          <div className="row g-3 mb-3">
            <div className="col-12">
              <label style={labelStyle}>Address</label>
              <textarea
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Enter patient address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3 — Invoice Number */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label style={labelStyle}>Invoice Number *</label>
              <input
                required
                type="text"
                style={inputStyle}
                value={form.invoiceNumber}
                onChange={(e) => updateField("invoiceNumber", e.target.value)}
              />
            </div>
          </div>

          {/* Items */}
          <div className="mb-3">
            <p style={{ fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>
              Items
            </p>

            {form.item.map((it, index) => (
              <div
                key={it.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "10px",
                  backgroundColor: "#fafafa",
                }}
              >
                {/* Item top row: Name / HSN / Qty / Remove */}
                <div className="row g-2 mb-2">
                  <div className="col-12 col-sm-5">
                    <label style={labelStyle}>Name *</label>
                    <input
                      required
                      type="text"
                      style={inputStyle}
                      placeholder="Item name"
                      value={it.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-sm-3">
                    <label style={labelStyle}>HSN</label>
                    <input
                      type="number"
                      min="0"
                      style={inputStyle}
                      placeholder="HSN code"
                      value={it.hsn}
                      onChange={(e) => updateItem(index, "hsn", e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-sm-2">
                    <label style={labelStyle}>Qty *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      style={inputStyle}
                      placeholder="1"
                      value={it.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value)}
                    />
                  </div>
                  {form.item.length > 1 && (
                    <div className="col-12 col-sm-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger w-100"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Item bottom row: Price / Discount / Total */}
                <div className="row g-2">
                  <div className="col-12 col-sm-4">
                    <label style={labelStyle}>Price (₹) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      style={inputStyle}
                      placeholder="0"
                      value={it.price}
                      onChange={(e) => updateItem(index, "price", e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-sm-4">
                    <label style={labelStyle}>Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      style={inputStyle}
                      placeholder="0"
                      value={it.discount}
                      onChange={(e) =>
                        updateItem(index, "discount", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-6 col-sm-4">
                    <label style={labelStyle}>Item Total</label>
                    <input
                      readOnly
                      type="text"
                      style={{ ...inputStyle, backgroundColor: "#f0f0f0", color: "#333" }}
                      value={`₹ ${Math.max(
                        0,
                        (parseFloat(it.price) || 0) *
                          (parseFloat(it.qty) || 0) -
                          (parseFloat(it.discount) || 0)
                      ).toFixed(2)}`}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          {/* Taxes */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-4">
              <label style={labelStyle}>GST (₹)</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="0"
                value={form.gst}
                onChange={(e) => updateField("gst", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-4">
              <label style={labelStyle}>Freight (₹)</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="0"
                value={form.freight}
                onChange={(e) => updateField("freight", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-4">
              <label style={labelStyle}>Tax (₹)</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="0"
                value={form.tax}
                onChange={(e) => updateField("tax", e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div
            className="row g-2 mb-4"
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
              padding: "12px 8px",
              margin: "0 0 16px 0",
            }}
          >
            <div className="col-6">
              <span style={{ fontSize: "13px", color: "#555" }}>Subtotal</span>
              <div style={{ fontWeight: "600" }}>₹ {computedSubTotal.toFixed(2)}</div>
            </div>
            <div className="col-6 text-end">
              <span style={{ fontSize: "13px", color: "#555" }}>Total</span>
              <div style={{ fontWeight: "700", fontSize: "16px" }}>
                ₹ {computedTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex flex-column flex-sm-row justify-content-end" style={{ gap: "8px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minWidth: "100px" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minWidth: "140px" }}
            >
              Preview Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
