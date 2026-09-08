import { dbConnect } from "../../../src/lib/db";
import AppLog from "../../../src/models/appLogSchema";
import { requireAuth } from "../../../src/lib/requireLogAuth";
import mongoose from "mongoose";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  const id = String(req.query.id || "");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid log id" });
  }
  try {
    const result = await AppLog.deleteOne({ _id: id });
    return res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("[logs] delete error", err.message);
    await logErrorToGoogleSheet({
      apiName: "logs/[id] - DELETE",
      errorMessage: err.message || "Failed to delete log",
      errorCode: "500",
      stackTrace: err.stack,
    });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
