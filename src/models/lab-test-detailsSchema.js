import mongoose from 'mongoose';
const { Schema } = mongoose;

// Sub-schema for FAQs
const faqSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

// Main schema for Lab Test with FAQs
const labTestFaqSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  sample_required: [String],
  preparation_required: [String],
  faqs: [faqSchema], // ⬅️ Array of FAQs
  price: { type: String, required: true },
  discount: { type: String, required: true },
  report_within: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Export model with hot-reload support
const modelName = 'LabTestDetails';
const LabTestDetails = mongoose.models[modelName] || mongoose.model(modelName, labTestFaqSchema);

export default LabTestDetails;
