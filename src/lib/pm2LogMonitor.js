import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import os from "os";
import { getAppLogModel } from "./logDb";
import logBus from "./logBus";
import { buildLogEntry, splitLines } from "./logParser";

const LOG_DIR = process.env.PM2_LOG_PATH || path.join(os.homedir(), ".pm2", "logs");
const ENABLED = process.env.LOG_MONITOR_ENABLED === "true";
const INITIAL_LIMIT = parseInt(process.env.LOG_INITIAL_IMPORT_LIMIT || "500", 10) || 500;
const SCAN_INTERVAL_MS = parseInt(process.env.LOG_SCAN_INTERVAL_MS || "10000", 10) || 10000;
const SELF_MARKER = "[log-monitor]";
// Optional comma-separated exact process names to watch (e.g. "HealthPath").
const ALLOWED_SOURCES = new Set(
  String(process.env.LOG_SOURCES || "").split(",").map((s) => s.trim()).filter(Boolean)
);

let started = false;
let dirWatcher = null;
let scanTimer = null;
let scanQueued = false;
let totalInserted = 0;
let lastScanMs = 0;
const files = new Map(); // filePath -> { pos, remainder, imported }

let AppLogModel = null;
async function logModel() {
  if (!AppLogModel) AppLogModel = await getAppLogModel();
  return AppLogModel;
}

// Find all PM2 output/error log files inside the configured directory.
async function listLogFiles() {
  try {
    const entries = await fsp.readdir(LOG_DIR);
    return entries
      .filter((n) => /-(out|error)\.log$/.test(n))
      .map((n) => path.join(LOG_DIR, n))
      .filter((p) => {
        const info = fileInfo(p);
        if (!info) return false;
        if (ALLOWED_SOURCES.size === 0) return true;
        return ALLOWED_SOURCES.has(info.source);
      });
  } catch {
    return []; // directory missing / unreadable - handled gracefully
  }
}

// Read only the last `limit` lines by walking backwards in chunks so we
// never load the whole file (which may be very large) into memory.
async function readTail(file, limit) {
  const fh = await fsp.open(file, "r");
  try {
    const st = await fh.stat();
    if (st.size === 0) return [];
    let offset = st.size;
    let buf = "";
    let newlineCount = 0;
    const chunkSize = 64 * 1024;
    while (offset > 0 && newlineCount < limit) {
      const readLen = Math.min(chunkSize, offset);
      offset -= readLen;
      const b = Buffer.alloc(readLen);
      await fh.read(b, 0, readLen, offset);
      buf = b.toString("utf8") + buf;
      newlineCount = (buf.match(/\n/g) || []).length;
    }
    const lines = buf.split("\n");
    lines.pop(); // drop trailing partial/empty
    return newlineCount >= limit ? lines.slice(-limit) : lines;
  } finally {
    await fh.close();
  }
}

function fileInfo(filePath) {
  const base = path.basename(filePath);
  const m = base.match(/^(.*)-(out|error)\.log$/);
  return m ? { source: m[1] || "app", type: m[2] } : null;
}

// Read the bytes appended since `pos`. Returns text + new end position.
async function readAppended(file, pos) {
  const st = await fsp.stat(file);
  const size = st.size;
  if (size <= pos) return { text: "", pos: size, size };
  const readLen = Math.min(size - pos, 4 * 1024 * 1024);
  const fh = await fsp.open(file, "r");
  try {
    const b = Buffer.alloc(readLen);
    await fh.read(b, 0, readLen, pos);
    return { text: b.toString("utf8"), pos: pos + readLen, size };
  } finally {
    await fh.close();
  }
}

async function importLines(rawLines, source, type) {
  const docs = [];
  for (const raw of rawLines) {
    const line = String(raw == null ? "" : raw).trim();
    if (!line || line.indexOf(SELF_MARKER) === 0) continue;
    docs.push(buildLogEntry({ raw: line, source, type }));
  }
  if (!docs.length) return 0;
  // Dedupe against existing records (unique uid) so restarts/overlap are safe.
  const M = await logModel();
  const seen = await M.find({ uid: { $in: docs.map((d) => d.uid) } },
    { uid: 1 }).lean();
  const skip = new Set(seen.map((s) => s.uid));
  let inserted = 0;
  for (const doc of docs) {
    if (skip.has(doc.uid)) continue;
    try {
      const created = await M.create(doc);
      inserted += 1;
      logBus.emit("log", toSse(created));
    } catch (err) {
      if (err && err.code !== 11000) throw err;
    }
  }
  return inserted;
}

function toSse(doc) {
  return {
    _id: String(doc._id || ""),
    timestamp: (doc.timestamp || new Date()).toISOString(),
    level: doc.level,
    message: (doc.message || "").slice(0, 4000),
    source: doc.source,
    type: doc.type,
  };
}

async function scanOneFile(filePath) {
  const info = fileInfo(filePath);
  if (!info) return;
  const st = await fsp.stat(filePath);
  const state = files.get(filePath);
  if (!state) {
    // First time we see this file: controlled import of the most recent lines.
    const tail = await readTail(filePath, INITIAL_LIMIT);
    const imported = await importLines(tail, info.source, info.type);
    files.set(filePath, { pos: st.size, remainder: "", imported });
    return;
  }
  if (st.size < state.pos) {
    // Truncated or rotated in place - restart from the beginning safely.
    state.pos = 0;
    state.remainder = "";
  }

  const { text, pos } = await readAppended(filePath, state.pos);
  if (text) {
    const { complete, remainder } = splitLines(text, state.remainder);
    state.remainder = remainder;
    if (complete.length) {
      const n = await importLines(complete, info.source, info.type);
      totalInserted += n;
    }
  }
  state.pos = pos;
}

async function scan() {
  if (scanQueued) return;
  scanQueued = true;
  try {
    await logModel();
    const filesNow = await listLogFiles();
    const seen = new Set(filesNow);
    for (const file of filesNow) {
      try {
        await scanOneFile(file);
      } catch (err) {
        console.error(SELF_MARKER, "file error", path.basename(file), err.message);
      }
    }
    for (const key of files.keys()) if (!seen.has(key)) files.delete(key);
    lastScanMs = Date.now();
  } catch (err) {
    console.error(SELF_MARKER, "scan failed", err.message);
  } finally {
    scanQueued = false;
  }
}

function ensureWatcher() {
  if (dirWatcher) return;
  try {
    dirWatcher = fs.watch(LOG_DIR, { persistent: true }, () => {
      if (!scanQueued) scan();
    });
    dirWatcher.on("error", () => {
      dirWatcher = null;
    });
  } catch {
    dirWatcher = null; // dir not present yet; interval scan will retry
  }
}

export async function startLogMonitor() {
  if (started) {
    return { started: true, enabled: ENABLED, dir: LOG_DIR };
  }
  if (!ENABLED) {
    return { started: false, enabled: false, dir: LOG_DIR };
  }
  started = true;
  try {
    await scan();
  } catch (err) {
    console.error(SELF_MARKER, "initial scan failed", err.message);
  }
  ensureWatcher();
  scanTimer = setInterval(() => scan(), SCAN_INTERVAL_MS);
  console.log(SELF_MARKER, "started, dir=", LOG_DIR);
  return { started: true, enabled: true, dir: LOG_DIR };
}

export function getLogMonitorStatus() {
  return {
    enabled: ENABLED,
    started,
    dir: LOG_DIR,
    trackedFiles: files.size,
    totalInserted,
    lastScanMs,
  };
}

export default { startLogMonitor, getLogMonitorStatus };
