import mongoose from 'mongoose';
const { Schema } = mongoose;

const labTestScehma = new Schema({
  category_name: {
    type: String,
    required: true
  },
  category_description: {
    type: String,
    required: true
  },
  
});

// Use a unique model identifier
const modelName = 'labTest';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const LabTest = mongoose.model(modelName, labTestScehma);

export default LabTest;
