import mongoose from "mongoose";
import {
  INVOICE_SOURCE,
  INVOICE_WHATSAPP_STATUS,
} from "../constants/invoice";
const { Schema } = mongoose;

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  hsn: { type: Number, required: true },
  discount: { type: Number, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  serviceType: { type: String, required: true },
});

const invoiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobNo: { type: Number, required: true },
  doctorName: { type: String, default: "" },
  address: { type: String, default: "" },
  // Entity the bill is raised from: a preset ("Ttanshe health path pvt.ltd") or
  // a name the admin typed in the "+ Add new Bill From..." entry of the create
  // modal. Empty on rows written before the field existed (and on cron bills),
  // so the preview/HTML template fall back to the registered company name.
  billFrom: { type: String, default: "" },
  invoiceNumber: { type: String, required: true, unique: true }, // Added unique constraint
  subTotal: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  gst: { type: Number, required: true },
  freight: { type: Number, required: true },
  tax: { type: Number, required: true },
  item: [itemSchema], // Array of itemSchema
  // The patient-facing document: a Firebase PDF (SuperAdmin "Generate & Send")
  // or the server-rendered invoice page URL written by the midnight cron.
  // Optional because the cron stores the invoice BEFORE any document exists -
  // saving must never depend on rendering/upload/WhatsApp.
  invoiceUrl: { type: String, default: "" },
  // Set from the panel dropdown, or automatically ("SENT") by POST
  // /api/helper/invoices after the PDF + WhatsApp send succeeded. Documents
  // written before this field existed have no `status` and fall back to the
  // value derived from their linked services (see helper/invoices.js).
  status: { type: String },
  statusUpdatedAt: { type: Date },
  // Delivery state of the invoice WhatsApp message - independent of `status`.
  // Values come from src/constants/invoice.js (PENDING / SENT / FAILED /
  // NOT_SENT). Rows written before this field existed have no value;
  // resolveInvoiceWhatsAppStatus() treats them as "not sent".
  whatsappStatus: {
    type: String,
    default: INVOICE_WHATSAPP_STATUS.pending,
  },
  whatsappStatusUpdatedAt: { type: Date, default: null },
  // AUTO = created by the midnight cron, MANUAL = "+ Create Invoice" in the panel.
  source: { type: String, default: INVOICE_SOURCE.manual },
});

// Use a unique model identifier
const modelName = "Invoice";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Invoice = mongoose.model(modelName, invoiceSchema);

export default Invoice;
