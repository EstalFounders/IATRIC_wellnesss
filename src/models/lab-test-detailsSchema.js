import mongoose from 'mongoose';
const { Schema } = mongoose;

const testIncludedSchema = new Schema({
  testName: { type: String, required: true },
  description: { type: String, required: false },
  parameters: [String]
});

const labTestDetailsSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sample_required: [String],
  preparation_required: [String],
  test_included: [testIncludedSchema],
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "LabTest",
    required: true,
  },
  price: {
    type: String,
    required: true
  },
  discount: {
    type: String,
    required: true
  },
  report_within: {
    type: String,
    required: true
  }
});

// Use a unique model identifier
const modelName = 'labTestDetails';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const LabTestDetails = mongoose.model(modelName, labTestDetailsSchema);

export default LabTestDetails