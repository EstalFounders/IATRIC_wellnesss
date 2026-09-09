import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import os from "os";
import logBus from "./logBus";
import { parseTimestamp, detectLevel, splitLines } from "./logParser";

const LOG_DIR = process.env.PM2_LOG_PATH || path.join(os.homedir(), ".pm2", "logs");
const ENABLED = process.env.LOG_MONITOR_ENABLED === "true";
const TAIL_LIMIT = parseInt(process.env.LOG_FILE_TAIL_LIMIT || "2000", 10) || 2000;
const SCAN_MS = parseInt(process.env.LOG_SCAN_INTERVAL_MS || "10000", 10) || 10000;
const SELF_MARKER = "[log-monitor]";
const ALLOWED_SOURCES = new Set(
  String(process.env.LOG_SOURCES || "").split(",").map((s) => s.trim()).filter(Boolean)
);

let started = false;
let dirWatcher = null;
let scanTimer = null;
let scanQueued = false;
const tracked = new Map(); // filePath -> { pos, remainder }

function fileInfo(filePath) {
  const base = path.basename(filePath);
  const m = base.match(/^(.*)-(out|error)\.log$/);
  return m ? { source: m[1] || "app", type: m[2] } : null;
}

function allowed(filePath) {
  const info = fileInfo(filePath);
  if (!info) return false;
  if (ALLOWED_SOURCES.size === 0) return true;
  return ALLOWED_SOURCES.has(info.source);
}

async function listFilePaths() {
  try {
    const entries = await fsp.readdir(LOG_DIR);
    return entries.map((n) => path.join(LOG_DIR, n)).filter(allowed);
  } catch {
    return [];
  }
}

async function statOrNull(file) {
  try {
    return await fsp.stat(file);
  } catch {
    return null;
  }
}

// Read only the last `limit` lines by walking backwards in chunks.
async function readTail(file, limit) {
  const fh = await fsp.open(file, "r");
  try {
    const st = await fh.stat();
    if (st.size === 0) return [];
    let offset = st.size;
    let buf = "";
    let newlines = 0;
    while (offset > 0 && newlines < limit) {
      const chunk = Math.min(64 * 1024, offset);
      offset -= chunk;
      const b = Buffer.alloc(chunk);
      await fh.read(b, 0, chunk, offset);
      buf = b.toString("utf8") + buf;
      newlines = (buf.match(/\n/g) || []).length;
    }
    const lines = buf.split("\n");
    lines.pop();
    return newlines >= limit ? lines.slice(-limit) : lines;
  } finally {
    await fh.close();
  }
}

function makeEntry(raw, source, type, mtimeMs) {
  const text = String(raw == null ? "" : raw).replace(/\s+$/, "");
  if (!text || text.indexOf(SELF_MARKER) === 0) return null;
  const parsedTs = parseTimestamp(text);
  return {
    timestamp: parsedTs || new Date(mtimeMs || Date.now()),
    level: detectLevel(text, type === "error"),
    message: text.slice(0, 4000),
    source,
    type,
  };
}

export async function listFiles() {
  const out = [];
  for (const file of await listFilePaths()) {
    const info = fileInfo(file);
    const st = await statOrNull(file);
    if (!info || !st) continue;
    out.push({
      id: path.basename(file),
      source: info.source,
      type: info.type,
      size: st.size,
      mtimeMs: st.mtimeMs,
    });
  }
  return out.sort((a, b) => a.source.localeCompare(b.source));
}

export async function queryEntries(opts) {
  const {
    sources = [],
    type = "",
    level = "",
    search = "",
    startMs = 0,
    endMs = 0,
    offset = 0,
    limit = 100,
  } = opts;
  const all = [];
  const files = (await listFilePaths()).filter((f) => {
    const info = fileInfo(f);
    if (!info) return false;
    if (type && info.type !== type) return false;
    if (sources.length && !sources.includes(info.source)) return false;
    return true;
  });
  const searchLower = search.toLowerCase();
  for (const file of files) {
    const info = fileInfo(file);
    const st = await statOrNull(file);
    if (!st) continue;
    const lines = await readTail(file, TAIL_LIMIT);
    for (const raw of lines) {
      const entry = makeEntry(raw, info.source, info.type, st.mtimeMs);
      if (!entry) continue;
      if (level && entry.level !== level) continue;
      if (searchLower && entry.message.toLowerCase().indexOf(searchLower) === -1) continue;
      if (startMs && entry.timestamp.getTime() < startMs) continue;
      if (endMs && entry.timestamp.getTime() > endMs) continue;
      all.push(entry);
    }
  }
  all.sort((a, b) => b.timestamp - a.timestamp || a.source.localeCompare(b.source));
  const start = Math.max(0, offset);
  const page = all.slice(start, start + limit);
  const data = page.map((e, i) => ({
    id: e.source + "|" + e.type + "|" + (start + i),
    timestamp: e.timestamp.toISOString(),
    level: e.level,
    source: e.source,
    type: e.type,
    message: e.message,
  }));
  return { data, hasMore: start + limit < all.length };
}

async function readAppended(file, pos) {
  const st = await fsp.stat(file);
  const size = st.size;
  if (size <= pos) return { text: "", pos: size, mtimeMs: st.mtimeMs };
  const len = Math.min(size - pos, 4 * 1024 * 1024);
  const fh = await fsp.open(file, "r");
  try {
    const b = Buffer.alloc(len);
    await fh.read(b, 0, len, pos);
    return { text: b.toString("utf8"), pos: pos + len, mtimeMs: st.mtimeMs };
  } finally {
    await fh.close();
  }
}

async function scanLive() {
  if (scanQueued) return;
  scanQueued = true;
  try {
    const files = await listFilePaths();
    const seen = new Set(files);
    for (const file of files) {
      try {
        const info = fileInfo(file);
        const state = tracked.get(file);
        const st = await statOrNull(file);
        if (!info || !st) continue;
        if (!state) {
          tracked.set(file, { pos: st.size, remainder: "" });
          continue;
        }
        if (st.size < state.pos) {
          state.pos = 0;
          state.remainder = "";
        }
        const { text, pos, mtimeMs } = await readAppended(file, state.pos);
        if (text) {
          const { complete, remainder } = splitLines(text, state.remainder);
          state.remainder = remainder;
          for (const raw of complete) {
            const entry = makeEntry(raw, info.source, info.type, mtimeMs);
            if (entry) logBus.emit("log", entry);
          }
        }
        state.pos = pos;
      } catch {
        // file disappeared / busy - next scan retries
      }
    }
    for (const key of tracked.keys()) if (!seen.has(key)) tracked.delete(key);
  } finally {
    scanQueued = false;
  }
}

function ensureWatcher() {
  if (dirWatcher) return;
  try {
    dirWatcher = fs.watch(LOG_DIR, { persistent: true }, () => {
      if (!scanQueued) scanLive();
    });
    dirWatcher.on("error", () => {
      dirWatcher = null;
    });
  } catch {
    dirWatcher = null;
  }
}

export async function startFileWatcher() {
  if (started) {
    return { started: true, enabled: ENABLED };
  }
  if (!ENABLED) {
    return { started: false, enabled: false };
  }
  started = true;
  try {
    await scanLive();
  } catch (err) {
    console.error("[log-monitor] initial scan failed", err.message);
  }
  ensureWatcher();
  scanTimer = setInterval(() => scanLive(), SCAN_MS);
  console.log("[log-monitor] file watcher started, dir=", LOG_DIR);
  return { started: true, enabled: true };
}

export function getReaderStatus() {
  return {
    enabled: ENABLED,
    started,
    dir: LOG_DIR,
    trackedFiles: tracked.size,
    tailLimit: TAIL_LIMIT,
  };
}

export default { listFiles, queryEntries, startFileWatcher, getReaderStatus };
