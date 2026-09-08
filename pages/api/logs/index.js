import { dbConnect } from "../../../src/lib/db";
import AppLog from "../../../src/models/appLogSchema";
import { requireAuth } from "../../../src/lib/requireLogAuth";
import { logErrorToGoogleSheet } from "../helper";

const LEVELS = ["debug", "info", "warn", "error", "fatal"];
const TYPES = ["out", "error"];
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) || n < 1 ? fallback : n;
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const q = req.query;
    const filter = {};
    const start = toDate(q.start);
    const end = toDate(q.end);
    if (start && end && start.getTime() > end.getTime()) {
      return res.status(400).json({ success: false, message: "start must be <= end" });
    }
    const range = {};
    if (start) range.$gte = start;
    if (end) range.$lte = end;
    if (start || end) filter.timestamp = range;
    if (q.level && LEVELS.includes(String(q.level))) filter.level = q.level;
    if (q.type && TYPES.includes(String(q.type))) filter.type = q.type;
    const source = String(q.source || "").trim();
    if (source) filter.source = { $regex: escapeRegExp(source), $options: "i" };
    const search = String(q.search || "").trim();
    if (search) {
      const rx = { $regex: escapeRegExp(search), $options: "i" };
      filter.$or = [{ message: rx }, { raw: rx }];
    }
    const page = toInt(q.page, 1);
    const pageSize = Math.min(toInt(q.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const [total, docs] = await Promise.all([
      AppLog.countDocuments(filter),
      AppLog.find(filter, { _id: 1, timestamp: 1, level: 1, message: 1, source: 1, type: 1 })
        .sort({ timestamp: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);
    const data = docs.map((d) => ({
      id: String(d._id),
      timestamp: d.timestamp,
      level: d.level,
      message: d.message,
      source: d.source,
      type: d.type,
    }));
    return res.status(200).json({
      success: true,
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 0,
    });
  } catch (err) {
    console.error("[logs] list error", err.message);
    await logErrorToGoogleSheet({
      apiName: "logs/index - GET",
      errorMessage: err.message || "Failed to list logs",
      errorCode: "500",
      stackTrace: err.stack,
    });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
