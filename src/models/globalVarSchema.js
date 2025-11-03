import mongoose from 'mongoose';
const { Schema } = mongoose;

const gloabalVarSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
});

// Use a unique model identifier
const modelName = 'GlobalVarSchema';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const GlobalVar = mongoose.model(modelName, gloabalVarSchema);

export default GlobalVar;
