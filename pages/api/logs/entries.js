import { requireAuth } from "../../../src/lib/requireLogAuth";
import { queryEntries } from "../../../src/lib/pm2LogFileReader";

const LEVELS = ["debug", "info", "warn", "error", "fatal"];
const TYPES = ["out", "error"];

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const q = req.query;
    const sources = String(q.sources || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
    const type = TYPES.includes(String(q.type || "")) ? String(q.type) : "";
    const level = LEVELS.includes(String(q.level || "")) ? String(q.level) : "";
    const offset = Math.max(0, parseInt(q.offset || "0", 10) || 0);
    const limit = Math.min(200, Math.max(1, parseInt(q.pageSize || "100", 10) || 100));
    let startMs = 0;
    let endMs = 0;
    if (q.start) {
      const d = new Date(q.start);
      if (!Number.isNaN(d.getTime())) startMs = d.getTime();
    }
    if (q.end) {
      const d = new Date(q.end);
      if (!Number.isNaN(d.getTime())) endMs = d.getTime();
    }
    const result = await queryEntries({
      sources,
      type,
      level,
      search: String(q.search || ""),
      startMs,
      endMs,
      offset,
      limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("[logs] entries error", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
