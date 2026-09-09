import mongoose from "mongoose";

const AppLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    level: {
      type: String,
      enum: ["debug", "info", "warn", "error", "fatal"],
      default: "info",
    },
    message: { type: String, default: "", maxlength: 4000 },
    source: { type: String, default: "app" },
    type: { type: String, enum: ["out", "error"], default: "out" },
    raw: { type: String, default: "", maxlength: 8000 },
    // Unique fingerprint of the raw line - prevents duplicate imports/restarts.
    uid: { type: String },
  },
  { timestamps: true }
);

// Indexes tuned for date-range filtering, sorting and pagination.
AppLogSchema.index({ timestamp: -1 });
AppLogSchema.index({ level: 1, timestamp: -1 });
AppLogSchema.index({ type: 1, timestamp: -1 });
AppLogSchema.index({ source: 1, timestamp: -1 });
AppLogSchema.index({ uid: 1 }, { unique: true, sparse: true });

export { AppLogSchema };

const modelName = "AppLog";
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}
const AppLog = mongoose.model(modelName, AppLogSchema);

export default AppLog;
