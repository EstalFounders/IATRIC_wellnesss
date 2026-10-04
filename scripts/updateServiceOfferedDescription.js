#!/usr/bin/env node
/**
 * Push a single service description from `data/serviceDescriptions.json` into the
 * matching `servicesoffereds` document.
 *
 * Why this exists: the homepage service cards (`Demo5Services1` / `Demo5Services2`)
 * render `item.description || getServiceDescription(item.name)`, so as soon as the
 * DB holds a description the static JSON is ignored. Editing card copy therefore
 * needs the DB row updated, not only the JSON.
 *
 *   node scripts/updateServiceOfferedDescription.js --service=Healthcamp           # dry run
 *   node scripts/updateServiceOfferedDescription.js --service=Healthcamp --apply
 *   node scripts/updateServiceOfferedDescription.js --service=Healthcamp --hi="..." --apply
 *   node scripts/updateServiceOfferedDescription.js --service=Healthcamp --restore=/tmp/hc.json --apply
 *
 * Only `description` (and, when `--hi` is passed, `descriptionHi`) is written - a
 * single `$set` through the raw driver, so missing-but-required fields on legacy
 * rows are not touched by schema validation. Pass `--backup=PATH` on the first
 * `--apply` run to keep the previous values.
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COLLECTION = "servicesoffereds"; // mongoose pluralises the `servicesoffered` model
const DESCRIPTIONS_FILE = path.join(REPO_ROOT, "data", "serviceDescriptions.json");

const USAGE = `Usage: node scripts/updateServiceOfferedDescription.js --service=NAME [options]

  --service=NAME       service name as used in data/serviceDescriptions.json (required)
  --apply              write the value (without it the script is a dry run)
  --hi=TEXT            also set descriptionHi (Hindi card text)
  --backup=PATH        save the previous values to PATH (JSON) before writing
  --restore=PATH       replay a backup file instead of reading the JSON
  --uri=URI            MongoDB connection string (default: MONGO_URI from env/.env)
  -h, --help           show this help
`;

function parseArgs(argv) {
  const options = {
    service: null,
    apply: false,
    hi: null,
    backup: null,
    restore: null,
    uri: null,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--service=")) options.service = arg.slice("--service=".length);
    else if (arg.startsWith("--hi=")) options.hi = arg.slice("--hi=".length);
    else if (arg.startsWith("--backup=")) options.backup = arg.slice("--backup=".length);
    else if (arg.startsWith("--restore=")) options.restore = arg.slice("--restore=".length);
    else if (arg.startsWith("--uri=")) options.uri = arg.slice("--uri=".length);
    else {
      console.error(`Unknown option: ${arg}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }

  if (!options.help && !options.service) {
    console.error("--service=NAME is required.\n");
    console.error(USAGE);
    process.exit(1);
  }

  return options;
}

// Values from the real environment always win over the file.
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

// Same rule as `canonicalServiceKey` in src/customUtils/serviceLinks.js.
const canonicalServiceKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/gynecology/g, "gynaecology")
    .replace(/orthopedics/g, "orthopaedics")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

function readTarget(options) {
  if (options.restore) {
    const backup = JSON.parse(fs.readFileSync(path.resolve(options.restore), "utf8"));
    if (!backup.before) throw new Error(`${options.restore} has no "before" snapshot.`);
    return { filter: backup.filter, next: backup.before, source: options.restore };
  }

  const descriptions = JSON.parse(fs.readFileSync(DESCRIPTIONS_FILE, "utf8"));
  const description = descriptions[options.service];
  if (!description) {
    throw new Error(`data/serviceDescriptions.json has no entry for "${options.service}".`);
  }

  const next = { description };
  if (options.hi) next.descriptionHi = options.hi;

  return { filter: { name: options.service }, next, source: DESCRIPTIONS_FILE };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return;
  }

  loadEnvFile(path.join(REPO_ROOT, ".env"));

  const uri = options.uri || process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set (checked the environment and ./.env).");
    process.exitCode = 1;
    return;
  }

  const service = options.service || "(restore)";
  const { filter, next, source } = readTarget(options);

  // Resolved from the repo, so the script runs from any working directory.
  const mongoose = require(require.resolve("mongoose", { paths: [REPO_ROOT] }));

  await mongoose.connect(uri, { autoIndex: false });
  const connection = mongoose.connection;
  const collection = connection.collection(COLLECTION);

  console.log("HealthPath - serviceOffered description");
  console.log(
    `db: ${connection.name} | host: ${connection.host} | collection: ${COLLECTION} | ` +
      `service: ${service} | mode: ${options.apply ? "APPLY" : "DRY RUN (nothing is written)"}`
  );
  console.log(`value from: ${source}`);

  try {
    const docs = await collection
      .find({})
      .project({ name: 1, description: 1, descriptionHi: 1 })
      .toArray();
    const wanted = canonicalServiceKey(service);
    let matches = docs.filter(
      (doc) => doc.name === service || canonicalServiceKey(doc.name) === wanted
    );

    if (options.restore) {
      matches = docs.filter((doc) => String(doc._id) === String(filter._id));
    }

    if (matches.length !== 1) {
      throw new Error(
        `expected exactly 1 document named "${service}", found ${matches.length} ` +
          `(available: ${docs.map((doc) => doc.name).join(", ")})`
      );
    }

    const doc = matches[0];
    const before = {};
    for (const field of Object.keys(next)) {
      if (doc[field] !== undefined) before[field] = doc[field];
    }

    let changed = false;
    for (const [field, value] of Object.entries(next)) {
      const current = doc[field] === undefined ? "(missing)" : JSON.stringify(doc[field]);
      if (doc[field] === value) {
        console.log(`  ${field}: already up to date`);
        continue;
      }
      changed = true;
      console.log(`  ${field}: ${current} -> ${JSON.stringify(value)}`);
    }

    if (!changed) {
      console.log("Nothing to write.");
      return;
    }

    if (!options.apply) {
      console.log("Nothing written. Re-run with --apply to save this change.");
      return;
    }

    if (options.backup) {
      const backupPath = path.resolve(options.backup);
      fs.writeFileSync(
        backupPath,
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            database: connection.name,
            collection: COLLECTION,
            filter: { _id: doc._id },
            before,
          },
          null,
          2
        )
      );
      console.log(`backup written: ${backupPath}`);
    }

    const result = await collection.updateOne({ _id: doc._id }, { $set: next });
    console.log(`updated: ${result.modifiedCount} document(s)`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
