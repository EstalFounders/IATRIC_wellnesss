#!/usr/bin/env node
/**
 * Upgrade the `consultationfees` collection to the keyed, rename-safe shape the
 * new /superAdmin/consultationFee page manages.
 *
 *   node scripts/seedConsultationTypes.js                          # dry run (default)
 *   node scripts/seedConsultationTypes.js --apply --backup=/tmp/types.json
 *   node scripts/seedConsultationTypes.js --restore=/tmp/types.json --apply
 *   node scripts/seedConsultationTypes.js --uri="mongodb+srv://..."  # override .env
 *
 * The legacy rows held only `{ name, fee (String), isActive }`:
 *
 *   Call "198" active | Video "399" active | Clinic "700" off | Home Visit "1000" off
 *
 * and the page matched on `name`, so renaming "Other" (or "Call") would have
 * broken every fee lookup. This script gives each row a stable `key`:
 *
 *   audio | video | clinic | home_visit | other
 *
 * `name` becomes free display copy, `fee` becomes a Number (or null = no type
 * default, which resolves to a free-but-bookable ₹0 - see
 * src/utils/consultationFee.js), and the four fixed types are flagged
 * `isSystem: true` so the page offers rename but not delete.
 *
 * Matching is canonical (lowercase, non-alphanumerics dropped), so both
 * "Home Visit" and "home_visit" resolve to the same type. If *two* legacy rows
 * map to one type the lowest `_id` survives and the extras are kept, re-keyed as
 * custom (non-system) types so the unique `key` index holds and no row is lost.
 *
 * Rows are written with the raw MongoDB driver and a single `$set`, so
 * pre-existing documents that are missing other fields are not rejected by
 * schema validation and nothing outside the fields above is touched. Pass
 * `--backup=PATH` first - it holds the previous values of every field and new
 * documents so `--restore=PATH` can undo the run exactly.
 *
 * npm run db:seed-consultation-types        # dry run
 * npm run db:seed-consultation-types:apply  # write
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COLLECTION = "consultationfees"; // mongoose pluralises ConsultationFees
const WRITE_CHUNK_SIZE = 200;

// Keep in sync with SYSTEM_CONSULTATION_TYPES in src/utils/consultationFee.js
// (that file is ESM and cannot be `require`d from this CommonJS script).
const SYSTEM_TYPES = [
  {
    key: "audio",
    name: "Audio call consultation",
    sortOrder: 10,
    legacyNames: ["call", "audio", "audio call", "audio consultation"],
  },
  {
    key: "video",
    name: "Video call consultation",
    sortOrder: 20,
    legacyNames: ["video", "video call", "video consultation"],
  },
  {
    key: "clinic",
    name: "Clinic visit",
    sortOrder: 30,
    legacyNames: ["clinic", "clinic visit", "clinic consultation"],
  },
  {
    key: "home_visit",
    name: "Home visit",
    sortOrder: 40,
    legacyNames: ["home visit", "home_visit", "homevisit", "doctor home visit"],
  },
  {
    key: "other",
    name: "Other",
    sortOrder: 50,
    legacyNames: ["other", "others", "custom"],
  },
];

const SEEDED_FIELDS = ["key", "name", "fee", "isActive", "sortOrder", "isSystem"];

const USAGE = `Usage: node scripts/seedConsultationTypes.js [options]

  --apply              write the upgraded rows (without it the script is a dry run)
  --backup=PATH        save the previous values of every field to PATH before writing
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

// "Home Visit" / "home_visit" / "HOMEVISIT" all collapse to "homevisit".
const canonical = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Same coercion as `toFee` in src/utils/consultationFee.js.
const toFee = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
};

const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Which system type (if any) does a stored row describe? */
function systemTypeFor(doc) {
  if (doc.key) {
    const byKey = SYSTEM_TYPES.find((type) => type.key === canonical(doc.key));
    if (byKey) return byKey;
  }
  const name = canonical(doc.name);
  return (
    SYSTEM_TYPES.find((type) =>
      type.legacyNames.some((legacy) => canonical(legacy) === name)
    ) || null
  );
}

function describe(value) {
  if (value === undefined) return "(missing)";
  return JSON.stringify(value);
}

/** Snapshot of the fields this script owns, for --backup / --restore. */
const pick = (doc) => {
  const snapshot = {};
  for (const field of SEEDED_FIELDS) {
    if (doc[field] !== undefined) snapshot[field] = doc[field];
  }
  return snapshot;
};

/**
 * Plan (and optionally write) the upgrade. Returns the change list that
 * --backup stores and --restore replays.
 */
async function seed(collection, options) {
  const docs = await collection
    .find({})
    .sort({ _id: 1 })
    .limit(options.limit || 0)
    .toArray();

  const changes = [];
  const inserts = [];
  const survivors = new Map(); // key -> { doc, type }
  const usedKeys = new Set();

  // Pass 1: one survivor per system type, lowest _id first.
  for (const doc of docs) {
    const type = systemTypeFor(doc);
    if (!type || survivors.has(type.key)) continue;
    survivors.set(type.key, { doc, type });
    usedKeys.add(type.key);
  }

  // Pass 2: every other row keeps its data, re-keyed as a custom type.
  for (const doc of docs) {
    const type = systemTypeFor(doc);
    const survivor = type ? survivors.get(type.key) : null;

    if (survivor && survivor.doc._id.equals(doc._id)) {
      const next = {
        key: type.key,
        name: type.name,
        fee: toFee(doc.fee),
        isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
        sortOrder: type.sortOrder,
        isSystem: true,
      };
      changes.push({
        _id: doc._id,
        name: doc.name,
        action: "type",
        next,
        before: pick(doc),
      });
      continue;
    }

    // A duplicate of a system type, an orphan with an unknown name, or a row
    // with an unusable fee: give it a stable custom key and keep it.
    const base = type ? `custom_${type.key}` : `custom_${slug(doc.name) || "type"}`;
    let key = base;
    let suffix = 2;
    while (usedKeys.has(key)) key = `${base}_${suffix++}`;
    usedKeys.add(key);

    const next = {
      key,
      name: doc.name || (type ? type.name : "Custom"),
      fee: toFee(doc.fee),
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      sortOrder: type ? type.sortOrder + 1 : 100,
      isSystem: false,
    };
    changes.push({
      _id: doc._id,
      name: doc.name,
      action: type ? "duplicate" : "custom",
      next,
      before: pick(doc),
    });
  }

  // Pass 3: missing system types are created (a fresh DB, or "other" today).
  for (const type of SYSTEM_TYPES) {
    if (survivors.has(type.key)) continue;
    const next = {
      key: type.key,
      name: type.name,
      fee: null,
      isActive: true,
      sortOrder: type.sortOrder,
      isSystem: true,
    };
    inserts.push({ name: next.name, action: "insert", next, before: null });
  }

  console.log(
    `scanned ${docs.length} document(s) -> ${changes.length} to update, ${inserts.length} to insert`
  );

  if (!options.quiet) {
    for (const change of changes) {
      console.log(
        `  [${change.action}] ${change.name} | key ${describe(change.before.key)} -> ${
          change.next.key
        } | fee ${describe(change.before.fee)} -> ${describe(change.next.fee)}`
      );
    }
    for (const insert of inserts) {
      console.log(`  [insert] ${insert.next.name} (key: ${insert.next.key})`);
    }
  }

  if (!options.apply) {
    console.log("Nothing written. Re-run with --apply to write.");
    return [...changes, ...inserts];
  }

  if (options.backup) {
    const backupPath = path.resolve(options.backup);
    fs.writeFileSync(
      backupPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          collection: COLLECTION,
          changes: [...changes, ...inserts],
        },
        null,
        2
      )
    );
    console.log(`backup written: ${backupPath}`);
  }

  let modified = 0;
  let inserted = 0;

  for (let index = 0; index < changes.length; index += WRITE_CHUNK_SIZE) {
    const operations = changes
      .slice(index, index + WRITE_CHUNK_SIZE)
      .map((change) => {
        const $set = {};
        const $unset = {};
        for (const field of SEEDED_FIELDS) {
          if (change.next[field] === undefined) $unset[field] = "";
          else $set[field] = change.next[field];
        }
        const update = {};
        if (Object.keys($set).length) update.$set = $set;
        if (Object.keys($unset).length) update.$unset = $unset;
        return { updateOne: { filter: { _id: change._id }, update } };
      });

    const result = await collection.bulkWrite(operations, { ordered: false });
    modified += result.modifiedCount;
  }

  if (inserts.length) {
    const result = await collection.insertMany(inserts.map((insert) => insert.next));
    inserted = Object.keys(result.insertedIds).length;
  }

  console.log(`updated: ${modified} document(s) | inserted: ${inserted} document(s)`);
  return [...changes, ...inserts];
}

async function restore(collection, options) {
  const backupPath = path.resolve(options.restore);
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  const changes = Array.isArray(backup.changes) ? backup.changes : [];

  console.log(`restoring ${changes.length} document(s) from ${backupPath}`);
  console.log(
    `backup taken: ${backup.generatedAt || "(unknown)"} | collection: ${
      backup.collection || "(unknown)"
    }`
  );

  if (!options.apply) {
    for (const change of changes) {
      console.log(`  - ${change.name || change._id} (${change.action || "update"})`);
    }
    console.log("Nothing written. Re-run with --restore=PATH --apply to undo.");
    return;
  }

  const updated = changes.filter((change) => change.before);
  const inserted = changes.filter((change) => !change.before);

  if (updated.length) {
    const operations = updated.map((change) => {
      const before = change.before || {};
      const $set = {};
      const $unset = {};
      for (const field of SEEDED_FIELDS) {
        if (before[field] === undefined) $unset[field] = "";
        else $set[field] = before[field];
      }
      const update = {};
      if (Object.keys($set).length) update.$set = $set;
      if (Object.keys($unset).length) update.$unset = $unset;
      return { updateOne: { filter: { _id: change._id }, update } };
    });

    const result = await collection.bulkWrite(operations, { ordered: false });
    console.log(`restored: ${result.modifiedCount} document(s)`);
  }

  // Inserted rows have no stored _id (they did not exist when the backup was
  // taken), so they are identified by their seeded key.
  for (const change of inserted) {
    await collection.deleteOne({ key: change.next.key });
  }
  if (inserted.length) console.log(`removed ${inserted.length} seeded document(s)`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return;
  }

  if (options.apply && options.restore) {
    console.error("--apply and --restore are mutually exclusive.\n");
    console.error(USAGE);
    process.exitCode = 1;
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

  console.log("HealthPath - consultation types");
  console.log(
    `db: ${connection.name} | host: ${connection.host} | collection: ${COLLECTION} | mode: ${mode}`
  );

  try {
    const collection = connection.collection(COLLECTION);
    if (options.restore) await restore(collection, options);
    else await seed(collection, options);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
