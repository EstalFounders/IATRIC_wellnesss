import mongoose from "mongoose";
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
  invoiceNumber: { type: String, required: true, unique: true }, // Added unique constraint
  subTotal: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  gst: { type: Number, required: true },
  freight: { type: Number, required: true },
  tax: { type: Number, required: true },
  item: [itemSchema], // Array of itemSchema
  invoiceUrl: { type: String, required: true },
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
