import { getAppLogModel } from "../../../src/lib/logDb";
import { requireAuth } from "../../../src/lib/requireLogAuth";
import mongoose from "mongoose";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  const raw = req.body && req.body.ids;
  const ids = Array.isArray(raw) ? raw.map((x) => String(x)) : [];
  const valid = ids.filter((x) => mongoose.Types.ObjectId.isValid(x));
  if (!valid.length) {
    return res.status(200).json({ success: true, deletedCount: 0 });
  }
  try {
    const AppLog = await getAppLogModel();
    const result = await AppLog.deleteMany({ _id: { $in: valid } });
    return res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("[logs] bulk delete error", err.message);
    await logErrorToGoogleSheet({
      apiName: "logs/bulk - DELETE",
      errorMessage: err.message || "Failed to bulk delete logs",
      errorCode: "500",
      stackTrace: err.stack,
    });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
