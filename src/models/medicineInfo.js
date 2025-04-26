// models/Medicine.js

import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
 // Define your schema fields here
 name: String,
 // Add other fields as necessary
 salt: String
});

// Use a unique model identifier
const modelName = 'Medicine';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

const Medicine = mongoose.model(modelName, medicineSchema);

export default Medicine;
