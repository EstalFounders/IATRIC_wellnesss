import { requireAuth, isLoopback } from "../../../src/lib/requireLogAuth";
import { startLogMonitor, getLogMonitorStatus } from "../../../src/lib/pm2LogMonitor";

export default async function handler(req, res) {
  // server.js calls this on boot from localhost to avoid an auth dependency.
  const isBootCall = req.headers["x-log-boot"] === "1" && isLoopback(req);

  if (req.method === "POST") {
    if (!isBootCall) {
      const user = await requireAuth(req, res);
      if (!user) return;
    }
    const status = await startLogMonitor();
    const safe = { ...status };
    delete safe.dir;
    return res.status(200).json({ success: true, ...safe });
  }
  if (req.method === "GET") {
    const user = await requireAuth(req, res);
    if (!user) return;
    const st = getLogMonitorStatus();
    delete st.dir;
    return res.status(200).json({ success: true, ...st });
  }
  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
