import { requireAuth } from "../../../src/lib/requireLogAuth";
import { listFiles } from "../../../src/lib/pm2LogFileReader";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const data = await listFiles();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[logs] files error", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
