import { requireAuth, isLoopback } from "../../../src/lib/requireLogAuth";
import { startFileWatcher, getReaderStatus } from "../../../src/lib/pm2LogFileReader";

export default async function handler(req, res) {
  // server.js calls this on boot from localhost to avoid an auth dependency.
  const isBootCall = req.headers["x-log-boot"] === "1" && isLoopback(req);

  if (req.method === "POST") {
    if (!isBootCall) {
      const user = await requireAuth(req, res);
      if (!user) return;
    }
    const status = await startFileWatcher();
    const safe = { ...status };
    delete safe.dir;
    return res.status(200).json({ success: true, ...safe });
  }
  if (req.method === "GET") {
    const user = await requireAuth(req, res);
    if (!user) return;
    const st = getReaderStatus();
    delete st.dir;
    return res.status(200).json({ success: true, ...st });
  }
  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
