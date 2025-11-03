import mongoose from "mongoose";
import { type } from "os";

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

// Use a unique model identifier
const modelName = "Notification";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Notification = mongoose.model(modelName, NotificationSchema);

export default Notification;
