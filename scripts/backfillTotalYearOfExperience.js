#!/usr/bin/env node
/**
 * Backfills `totalyearofexperience` on doctor documents created before the
 * field existed.
 *
 * The mongoose schema declares `totalyearofexperience: { type: Number,
 * default: 0 }`, but a schema default is only applied when a document is
 * created/updated through the app - it is never written to documents that were
 * already stored, and `lean()`/raw reads do not surface it either. This script
 * sets the field to `0` (the schema default, editable later via the profile
 * form) on every doctor that lacks the key.
 *
 * Additive and idempotent: only `$set`s a missing field, never touches an
 * existing value, so it is safe to re-run.
 *
 *   node scripts/backfillTotalYearOfExperience.js                            (dry run, .env -> IATRIC_test)
 *   node scripts/backfillTotalYearOfExperience.js --apply
 *   node scripts/backfillTotalYearOfExperience.js --env=production           (dry run, IATRIC)
 *   node scripts/backfillTotalYearOfExperience.js --env=production --apply
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const USAGE = `Usage: node scripts/backfillTotalYearOfExperience.js [options]

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

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    if (process.env[match[1]] !== undefined) continue;
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

  const total = await collection.countDocuments({});
  const filter = { totalyearofexperience: { $exists: false } };
  const missing = await collection.countDocuments(filter);
  const present = total - missing;

  console.log(`Doctors scanned: ${total}`);
  console.log(`  missing field: ${missing}`);
  console.log(`  already set:   ${present}`);

  if (missing) {
    const sample = await collection
      .find(filter, { projection: { name: 1 } })
      .limit(10)
      .toArray();
    console.log("Sample (first 10):");
    for (const doc of sample) {
      console.log(`  ${String(doc.name || doc._id).slice(0, 40)}`);
    }
  }

  if (!options.apply) {
    console.log("\nDry run - nothing was written. Re-run with --apply to commit.");
    await mongoose.disconnect();
    return;
  }

  if (!missing) {
    console.log("\nNothing to update.");
    await mongoose.disconnect();
    return;
  }

  const result = await collection.updateMany(filter, {
    $set: { totalyearofexperience: 0 },
  });
  console.log(
    `\nApplied: ${result.modifiedCount} modified, ${result.matchedCount} matched.`
  );
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
