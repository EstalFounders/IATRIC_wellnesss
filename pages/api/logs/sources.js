import { getAppLogModel } from "../../../src/lib/logDb";
import { requireAuth } from "../../../src/lib/requireLogAuth";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const AppLog = await getAppLogModel();
    const agg = await AppLog.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 200 },
    ]);
    const data = agg.map((d) => ({ source: d._id, count: d.count }));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[logs] sources error", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
