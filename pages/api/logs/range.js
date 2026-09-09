import { getAppLogModel } from "../../../src/lib/logDb";
import { requireAuth } from "../../../src/lib/requireLogAuth";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  const body = req.body || {};
  const start = new Date(body.start || "");
  const end = new Date(body.end || "");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ success: false, message: "Valid start and end dates are required" });
  }
  if (start.getTime() > end.getTime()) {
    return res.status(400).json({ success: false, message: "start must be <= end" });
  }
  try {
    const AppLog = await getAppLogModel();
    const result = await AppLog.deleteMany({ timestamp: { $gte: start, $lte: end } });
    return res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("[logs] range delete error", err.message);
    await logErrorToGoogleSheet({
      apiName: "logs/range - DELETE",
      errorMessage: err.message || "Failed to delete logs by range",
      errorCode: "500",
      stackTrace: err.stack,
    });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
