// models/Medicine.js

import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
 // Define your schema fields here
 name: String,
 // Add other fields as necessary
 salt: String
});

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
