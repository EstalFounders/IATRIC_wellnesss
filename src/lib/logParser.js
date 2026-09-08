import crypto from "crypto";

// Recognised ISO / [YYYY-MM-DD HH:mm:ss] prefixes PM2 may write when --time is used.
const TS_RE =
  /^\[?(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})?)/;

const LEVEL_RULES = [
  ["fatal", /\bfatal\b/i],
  ["error", /\berror\b|\bexception\b|\bunhandledrejection\b|\bfailed\b|\benoent\b|\beconnrefused\b/i],
  ["warn", /\bwarn(ing)?\b/i],
  ["debug", /\bdebug\b/i],
];

export function parseTimestamp(raw) {
  const m = String(raw || "").match(TS_RE);
  if (!m) return null;
  const t = new Date(m[1]);
  return Number.isNaN(t.getTime()) ? null : t;
}

export function detectLevel(raw, fromErrorFile) {
  const line = String(raw || "");
  for (const [lvl, re] of LEVEL_RULES) {
    if (re.test(line)) return lvl;
  }
  return fromErrorFile ? "error" : "info";
}

export function buildLogEntry({ raw, source, type }) {
  const text = String(raw == null ? "" : raw).replace(/\s+$/, "");
  const fromErrorFile = type === "error";
  return {
    timestamp: parseTimestamp(text) || new Date(),
    level: detectLevel(text, fromErrorFile),
    message: text.slice(0, 4000) || " ",
    source: String(source || "app").slice(0, 200),
    type,
    raw: text.slice(0, 8000),
    uid: crypto
      .createHash("sha1")
      .update(String(source) + "|" + type + "|" + text)
      .digest("hex"),
  };
}

export function splitLines(bufferText, remainder) {
  const combined = (remainder || "") + bufferText;
  const parts = combined.split("\n");
  return { complete: parts.slice(0, -1), remainder: parts[parts.length - 1] };
}
