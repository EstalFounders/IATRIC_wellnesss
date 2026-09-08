import logBus from "../../../src/lib/logBus";
import { requireAuth } from "../../../src/lib/requireLogAuth";
import { getLogMonitorStatus } from "../../../src/lib/pm2LogMonitor";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();
  res.write("retry: 5000\n\n");

  const safeStatus = getLogMonitorStatus();
  delete safeStatus.dir;
  res.write(`event: connected\ndata: ${JSON.stringify(safeStatus)}\n\n`);

  const onLog = (doc) => {
    try {
      res.write(`event: log\ndata: ${JSON.stringify(doc)}\n\n`);
    } catch (err) {
      // connection already closed - listener removed below
    }
  };
  logBus.on("log", onLog);

  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch (err) {
      // connection died - cleaned up below
    }
  }, 20000);

  const cleanup = () => {
    clearInterval(heartbeat);
    logBus.off("log", onLog);
  };
  req.on("close", cleanup);
  req.on("error", cleanup);
}
