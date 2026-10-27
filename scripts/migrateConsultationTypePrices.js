#!/usr/bin/env node
/**
 * One-off migration for the consultation-type pricing change.
 *
 * `consultationType` now stores `[{ name, price }]` (price embedded with the
 * type) instead of a separate `servicePrices` map. This script:
 *   * rewrites every doctor's `consultationType` entries to `{ name, price }`,
 *     taking the price from the legacy `servicePrices` map when present;
 *   * removes the now-obsolete `servicePrices` field.
 *
 * Legacy string entries ("Audio") are converted to `{ name: "Audio", price }`.
 * Idempotent and safe to re-run.
 *
 *   node scripts/migrateConsultationTypePrices.js
 *   node scripts/migrateConsultationTypePrices.js --apply
 *   node scripts/migrateConsultationTypePrices.js --apply --env=production
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const USAGE = `Usage: node scripts/migrateConsultationTypePrices.js [options]

  --apply            write the updates (dry-run when omitted)
  --env=production   load .env.production (IATRIC) instead of .env (IATRIC_test)
  -h, --help         show this help
`;

function parseArgs(argv) {
  const options = { apply: false, env: "development", help: false };
  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--env=")) options.env = arg.slice("--env=".length);
    else {
      console.error(`Unknown option: ${arg}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }
  return options;
}

function loadEnvFile(file, { override = false } = {}) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    if (!override && process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function toNum(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function planUpdate(doc) {
  const hasServicePrices = Object.prototype.hasOwnProperty.call(
    doc,
    "servicePrices"
  );
  const sp =
    doc.servicePrices &&
    typeof doc.servicePrices === "object" &&
    !Array.isArray(doc.servicePrices)
      ? doc.servicePrices
      : {};

  const raw = doc.consultationType;
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];

  const next = list
    .map((entry) => {
      if (typeof entry === "string") {
        const name = entry.trim();
        return name ? { name, price: toNum(sp[name]) } : null;
      }
      const name = String(entry?.name || "").trim();
      if (!name) return null;
      const price = toNum(sp[name] !== undefined ? sp[name] : entry?.price);
      return { name, price };
    })
    .filter(Boolean);

  const op = {};
  if (JSON.stringify(next) !== JSON.stringify(list)) {
    op.$set = { consultationType: next };
  }
  if (hasServicePrices) {
    op.$unset = { servicePrices: "" };
  }
  if (!Object.keys(op).length) return null;
  return { update: op, next };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return;
  }

  const envFile =
    options.env === "production"
      ? path.resolve(__dirname, "..", ".env.production")
      : path.resolve(__dirname, "..", ".env");
  loadEnvFile(envFile);

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error(`No MONGO_URI in ${envFile}`);
    process.exit(1);
  }

  const dbName = (uri.match(/\/([^/?]+)(?:\?|$)/) || [])[1] || "unknown";
  console.log(
    `Target: ${dbName} (${options.env}) - ${options.apply ? "APPLY" : "DRY RUN"}`
  );

  await mongoose.connect(uri, { autoIndex: false });
  const collection = mongoose.connection.collection("doctors");

  const docs = await collection
    .find({}, { projection: { consultationType: 1, servicePrices: 1, name: 1 } })
    .toArray();

  const planned = [];
  for (const doc of docs) {
    const result = planUpdate(doc);
    if (result) planned.push({ doc, ...result });
  }

  console.log(`Doctors scanned: ${docs.length}`);
  console.log(`  to migrate: ${planned.length}`);
  console.log(`  no change:  ${docs.length - planned.length}`);

  if (planned.length) {
    console.log("\nSample (first 10):");
    for (const { doc, next } of planned.slice(0, 10)) {
      console.log(
        `  ${String(doc.name || doc._id).slice(0, 40)}  ${JSON.stringify(next)}`
      );
    }
  }

  if (!options.apply) {
    console.log("\nDry run - nothing was written. Re-run with --apply to commit.");
    await mongoose.disconnect();
    return;
  }

  if (!planned.length) {
    console.log("\nNothing to update.");
    await mongoose.disconnect();
    return;
  }

  const bulk = planned.map(({ doc, update }) => ({
    updateOne: { filter: { _id: doc._id }, update },
  }));
  const result = await collection.bulkWrite(bulk, { ordered: false });
  console.log(
    `\nApplied: ${result.modifiedCount + result.upsertedCount} modified, ` +
      `${result.matchedCount} matched.`
  );
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
