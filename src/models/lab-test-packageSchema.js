import mongoose from "mongoose";
// Removed 'title' import from 'process' as it's not used and can cause confusion.
const { Schema } = mongoose;
const { ObjectId } = Schema.Types; // Import ObjectId from Schema.Types

// Sub-schema for FAQs
const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const test_included = new Schema(
  {
    testName: { type: String, required: true },
    parameters: { type: Array, required: true },
  },
  { _id: false }
);

const labTestPackagesScehma = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    sample_required: [String],
    preparation_required: [String],
    faqs: [faqSchema], // ⬅️ Array of FAQs
    test_included: [test_included],
    price: { type: String, required: true },
    discount: { type: String, required: true },
    reports_within: { type: String, required: true },
    why_this_test: { type: String, default: true }, // Consider changing default to a string or removing if not always true
    isActive: { type: Boolean, default: true },
    // --- UPDATED: Reference to LabTestPackagesCategorySchema ---
    category_id: {
      type: ObjectId,
      ref: "labTestPackegesCategory", // IMPORTANT: This should be the exact model name of your category schema
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Use a unique model identifier
const modelName = "labTestPackeges";

// Check if the model already exists and delete if it does (common in Next.js dev)
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model
const LabTestPackages = mongoose.model(modelName, labTestPackagesScehma); // Renamed to LabTestPackages for clarity

export default LabTestPackages;
