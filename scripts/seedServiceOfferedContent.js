#!/usr/bin/env node
/**
 * Seed the Tab-1 (homepage speciality tabs) copy into the `servicesoffereds`
 * collection, so `src/components/Common/Tabs-1.js` renders image / subheading /
 * description straight from the serviceOffered API instead of the hardcoded
 * `data/services.js` assets and the `subheading.*` / `tabdesc.*` i18n strings.
 *
 *   node scripts/seedServiceOfferedContent.js                     # dry run (default)
 *   node scripts/seedServiceOfferedContent.js --apply --backup=/tmp/tab1-backup.json
 *   node scripts/seedServiceOfferedContent.js --restore=/tmp/tab1-backup.json
 *   node scripts/seedServiceOfferedContent.js --limit=5 --quiet
 *   node scripts/seedServiceOfferedContent.js --uri="mongodb+srv://..."   # override .env
 *
 * Written fields per document: `description`, `subheading`, `image` and their
 * Hindi companions `descriptionHi` / `subheadingHi`. Rows are matched by
 * canonical service name (see `canonicalServiceKey`), so the static
 * "gynecology & obs" seeds the DB row "Gynaecology & Obstetrics".
 *
 * `description` is *replaced* on purpose: the DB used to hold the one-liners
 * from `data/serviceDescriptions.json` (still used by `src/customUtils/serviceLinks.js`)
 * while the live tab showed the longer paragraph. Pass `--backup=PATH` first —
 * the file holds the previous values of every field and can be replayed with
 * `--restore=PATH`.
 *
 * Documents are written with the raw MongoDB driver and a single `$set`, so
 * pre-existing rows that are missing other (now required) fields are not
 * rejected by schema validation, and nothing outside the fields above is
 * touched. Keep this data in sync with `scripts/data/serviceTabContent.json`.
 *
 * npm run db:seed-service-tab        # dry run
 * npm run db:seed-service-tab:apply  # write
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COLLECTION = "servicesoffereds"; // mongoose pluralises the `servicesoffered` model
const SEED_FILE = path.join(__dirname, "data", "serviceTabContent.json");
const WRITE_CHUNK_SIZE = 200;

// Seeded fields, in the order they are reported.
const FIELDS = ["description", "subheading", "image", "descriptionHi", "subheadingHi"];

const USAGE = `Usage: node scripts/seedServiceOfferedContent.js [options]

  --apply              write the seeded values (without it the script is a dry run)
  --backup=PATH        save the previous values of every field to PATH (JSON) before writing
  --restore=PATH       replay a backup file instead of seeding (undo a previous --apply)
  --limit=N            only process the first N documents of the collection
  --quiet              only print the summary
  --uri=URI            MongoDB connection string (default: MONGO_URI from env/.env)
  -h, --help           show this help
`;

function parseArgs(argv) {
  const options = {
    apply: false,
    quiet: false,
    limit: null,
    backup: null,
    restore: null,
    uri: null,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--quiet") options.quiet = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.slice("--limit=".length)) || null;
    } else if (arg.startsWith("--backup=")) {
      options.backup = arg.slice("--backup=".length);
    } else if (arg.startsWith("--restore=")) {
      options.restore = arg.slice("--restore=".length);
    } else if (arg.startsWith("--uri=")) {
      options.uri = arg.slice("--uri=".length);
    } else {
      console.error(`Unknown option: ${arg}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }

  if (options.apply && options.restore) {
    console.error("--apply and --restore are mutually exclusive.\n");
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

// Same rule as `canonicalServiceKey` in src/customUtils/serviceLinks.js, so
// "gynecology & obs", "Gynaecology & Obstetrics" and "Gynecology and Obs"
// all resolve to one key.
const canonicalServiceKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/gynecology/g, "gynaecology")
    .replace(/orthopedics/g, "orthopaedics")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const truncate = (value, max = 64) => {
  const text = String(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

const describe = (value) =>
  value === undefined ? "(missing)" : JSON.stringify(truncate(value));

function readSeedFile() {
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
  const services = Array.isArray(seed.services) ? seed.services : [];

  if (!services.length) throw new Error(`${SEED_FILE} contains no services.`);

  for (const service of services) {
    if (!service.dbName) throw new Error("every seed entry needs a dbName");
    for (const field of FIELDS) {
      if (!service[field]) {
        throw new Error(`seed entry "${service.dbName}" is missing "${field}"`);
      }
    }
  }

  return services;
}

/** Fields whose stored value differs from the seed, plus a snapshot of today's values. */
function diffDocument(doc, seed) {
  const next = {};
  const before = {};

  for (const field of FIELDS) {
    if (doc[field] !== undefined && doc[field] !== null) before[field] = doc[field];
    if (doc[field] !== seed[field]) next[field] = seed[field];
  }

  return { next, before };
}

async function restore(collection, options) {
  const backupPath = path.resolve(options.restore);
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  const changes = Array.isArray(backup.changes) ? backup.changes : [];

  console.log(`restoring ${changes.length} document(s) from ${backupPath}`);
  console.log(
    `backup taken: ${backup.generatedAt || "(unknown)"} | collection: ${backup.collection || "(unknown)"}`
  );

  if (!options.apply) {
    for (const change of changes) {
      console.log(`  - ${change.name || change._id}`);
      for (const field of FIELDS) {
        console.log(`      ${field}: ${describe(change.before?.[field])}`);
      }
    }
    console.log("Nothing written. Re-run with --restore=PATH --apply to undo.");
    return;
  }

  const operations = changes.map((change) => {
    const before = change.before || {};
    const $set = {};
    const $unset = {};
    for (const field of FIELDS) {
      if (before[field] === undefined) $unset[field] = "";
      else $set[field] = before[field];
    }
    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;
    return { updateOne: { filter: { _id: change._id }, update } };
  });

  let modified = 0;
  for (let index = 0; index < operations.length; index += WRITE_CHUNK_SIZE) {
    const result = await collection.bulkWrite(
      operations.slice(index, index + WRITE_CHUNK_SIZE),
      { ordered: false }
    );
    modified += result.modifiedCount;
  }

  console.log(`restored: ${modified} document(s)`);
}

async function seed(collection, options, dbName) {
  const services = readSeedFile();
  const byKey = new Map(
    services.map((service) => [canonicalServiceKey(service.dbName), service])
  );

  const projection = { name: 1 };
  for (const field of FIELDS) projection[field] = 1;

  const docs = await collection
    .find({}, { projection })
    .sort({ _id: 1 })
    .limit(options.limit || 0)
    .toArray();

  const changes = [];
  const upToDate = [];
  const unmatched = [];
  const matched = new Set();

  for (const doc of docs) {
    const key = canonicalServiceKey(doc.name);
    const entry = byKey.get(key);

    if (!entry) {
      unmatched.push(doc.name || String(doc._id));
      continue;
    }

    matched.add(key);
    const { next, before } = diffDocument(doc, entry);

    if (Object.keys(next).length === 0) {
      upToDate.push(doc.name);
      continue;
    }

    changes.push({ _id: doc._id, name: doc.name, before, next });
  }

  const untouched = services.filter(
    (service) => !matched.has(canonicalServiceKey(service.dbName))
  );

  console.log(
    `scanned: ${docs.length} | to update: ${changes.length} | already up to date: ${upToDate.length}`
  );

  if (!options.quiet) {
    for (const change of changes) {
      console.log(`  - ${change.name || change._id}`);
      for (const field of FIELDS) {
        if (change.next[field] === undefined) continue;
        console.log(
          `      ${field}: ${describe(change.before[field])} -> ${describe(change.next[field])}`
        );
      }
    }
  }

  if (unmatched.length) {
    console.log(`document(s) without a seed entry (left untouched): ${unmatched.join(", ")}`);
  }
  if (untouched.length) {
    console.log(
      `seed entry(ies) without a DB document: ${untouched.map((s) => s.dbName).join(", ")}`
    );
  }

  if (!options.apply) {
    console.log("Nothing written. Re-run with --apply to save these changes.");
    return;
  }

  if (changes.length === 0) {
    console.log("Nothing to write - every seeded field already holds the expected value.");
    return;
  }

  if (options.backup) {
    const backupPath = path.resolve(options.backup);
    fs.writeFileSync(
      backupPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          database: dbName,
          collection: COLLECTION,
          changes,
        },
        null,
        2
      )
    );
    console.log(`backup written: ${backupPath}`);
  }

  let modified = 0;
  for (let index = 0; index < changes.length; index += WRITE_CHUNK_SIZE) {
    const chunk = changes.slice(index, index + WRITE_CHUNK_SIZE);
    const result = await collection.bulkWrite(
      chunk.map((change) => ({
        updateOne: { filter: { _id: change._id }, update: { $set: change.next } },
      })),
      { ordered: false }
    );
    modified += result.modifiedCount;
  }

  console.log(`updated: ${modified} document(s)`);
}

const connection0 = (collection) =>
  (collection.s && collection.s.dbName) || undefined;

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

  // Resolved from the repo, so the script runs from any working directory.
  const mongoose = require(require.resolve("mongoose", { paths: [REPO_ROOT] }));

  await mongoose.connect(uri, { autoIndex: false });
  const connection = mongoose.connection;

  const mode = options.restore
    ? options.apply
      ? "RESTORE"
      : "RESTORE (dry run)"
    : options.apply
      ? "APPLY"
      : "DRY RUN (nothing is written)";

  console.log("HealthPath - serviceOffered tab-1 content");
  console.log(
    `db: ${connection.name} | host: ${connection.host} | collection: ${COLLECTION} | mode: ${mode}`
  );

  try {
    const collection = connection.collection(COLLECTION);
    if (options.restore) await restore(collection, options);
    else await seed(collection, options, connection.name);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
