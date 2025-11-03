// models/Medicine.js

import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
 // Define your schema fields here
 name: String,
 // Add other fields as necessary
 salt: String,
 price: Number,
 Is_discontinued: String,
 type: String,
 pack_size_label: String,
 short_composition1: String,
 short_composition2: String,
});

// Use a unique model identifier
const modelName = 'Medicine';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

const Medicine = mongoose.model(modelName, medicineSchema);

export default Medicine;
