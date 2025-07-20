import mongoose from "mongoose";
import { type } from "os";
import { title } from "process";
const { Schema } = mongoose;

const labTestPackagesCatgoryScehma = new Schema({
  category_name: {
    type: String,
    require: true,
  },
  category_description: {
    type: String,
    default: "",
  },
});

// Use a unique model identifier
const modelName = "labTestPackegesCategory";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const LabTestPackagesCatgoryScehma = mongoose.model(
  modelName,
  labTestPackagesCatgoryScehma
);

export default LabTestPackagesCatgoryScehma;
