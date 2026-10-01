#!/usr/bin/env node
/**
 * One-time cleanup for the doctor `educationTraining` field.
 *
 * `educationTraining` used to be a single free-text String; it is now `[String]`
 * in `src/models/doctorModel.js`, so the Add Doctor form / edit-doctor modal can
 * hold one entry per degree ("MBBS - Johns Hopkins University"). This script
 * upgrades every existing doctor document to the new shape so the SuperAdmin and
 * Doctor panels can read and re-save them without surprises.
 *
 *   node scripts/cleanDoctorEducation.js            # dry run (default, writes nothing)
 *   node scripts/cleanDoctorEducation.js --apply    # write the changes
 *   node scripts/cleanDoctorEducation.js --apply --reset          # blank every value to []
 *   node scripts/cleanDoctorEducation.js --apply --backup=/tmp/edu.json
 *   node scripts/cleanDoctorEducation.js --limit=5  # only the first N documents
 *   node scripts/cleanDoctorEducation.js --uri="mongodb+srv://..."  # override .env
 *
 * What counts as clean: an array of trimmed, non-empty strings. A legacy string
 * is converted (preserving its content, one entry per line/semicolon; a comma is
 * never a separator because a degree can contain one), null/undefined/"" becomes
 * []. Documents are written with the raw MongoDB driver and a single `$set`, so
 * pre-existing documents that are missing other (now required) fields are not
 * rejected by schema validation on the way in.
 *
 * Keep the splitting rules in sync with `parseEducationTraining` in
 * `src/customUtils/educationTraining.js` (that file is an ESM module and cannot
 * be `require`d from this CommonJS script).
 *
 * npm run db:clean-education        # dry run
 * npm run db:clean-education:apply  # write
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COLLECTION = "doctors"; // mongoose pluralises the `Doctor` model
const CHANGE_REQUESTS = "docdetailschangerequests"; // mongoose pluralises DoctorDetailsChangeReq
const WRITE_CHUNK_SIZE = 200;

const LEGACY_ENTRY_SEPARATOR = /\r?\n|;/;
const BULLET_PREFIX = /^\s*[-–—•*·●▪]\s*/;

const USAGE = `Usage: node scripts/cleanDoctorEducation.js [options]

  --apply              write the sanitised values (without it the script is a dry run)
  --reset              do not keep existing values: store [] for every doctor
  --limit=N            only process the first N documents
  --backup=PATH        save the previous values to PATH (JSON) before writing
  --uri=URI            MongoDB connection string (default: MONGO_URI from env/.env)
  --quiet              only print the summary
  -h, --help           show this help
`;

function parseArgs(argv) {
  const options = {
    apply: false,
    reset: false,
    quiet: false,
    limit: null,
    backup: null,
    uri: null,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--reset") options.reset = true;
    else if (arg === "--quiet") options.quiet = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.slice("--limit=".length)) || null;
    } else if (arg.startsWith("--backup=")) {
      options.backup = arg.slice("--backup=".length);
    } else if (arg.startsWith("--uri=")) {
      options.uri = arg.slice("--uri=".length);
    } else {
      console.error(`Unknown option: ${arg}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }

  if (options.reset && !options.apply) {
    console.error("--reset only makes sense together with --apply.\n");
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

const toText = (value) =>
  value === null || value === undefined ? "" : String(value);
const cleanEntry = (value) => toText(value).replace(BULLET_PREFIX, "").trim();

function splitLegacyText(value) {
  return toText(value)
    .split(LEGACY_ENTRY_SEPARATOR)
    .map(cleanEntry)
    .filter(Boolean);
}

/** Stored shape for one document: an array of trimmed, non-empty strings. */
function sanitize(value, reset) {
  if (reset) return [];
  if (Array.isArray(value)) {
    return value.map(cleanEntry).filter(Boolean).flatMap(splitLegacyText);
  }
  return splitLegacyText(value);
}

const sameList = (a, b) =>
  Array.isArray(a) &&
  Array.isArray(b) &&
  a.length === b.length &&
  a.every((item, index) => item === b[index]);

function describe(value) {
  if (value === undefined) return "missing";
  if (value === null) return "null";
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  return `${typeof value} ${JSON.stringify(value)}`;
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

  // Resolved from the repo, so the script runs from any working directory.
  const mongoose = require(require.resolve("mongoose", { paths: [REPO_ROOT] }));

  await mongoose.connect(uri, { autoIndex: false });
  const connection = mongoose.connection;

  console.log("HealthPath - educationTraining cleanup");
  console.log(
    `db: ${connection.name} | host: ${connection.host} | collection: ${COLLECTION} | mode: ${
      options.apply
        ? options.reset
          ? "APPLY (reset to [])"
          : "APPLY"
        : "DRY RUN (nothing is written)"
    }`
  );

  try {
    const collection = connection.collection(COLLECTION);
    const docs = await collection
      .find({}, { projection: { name: 1, educationTraining: 1 } })
      .sort({ _id: 1 })
      .limit(options.limit || 0)
      .toArray();

    const changes = [];
    let alreadyClean = 0;

    for (const doc of docs) {
      const before = doc.educationTraining;
      const after = sanitize(before, options.reset);

      if (sameList(before, after)) {
        alreadyClean += 1;
        continue;
      }

      changes.push({ _id: doc._id, name: doc.name, before, after });
    }

    console.log(
      `scanned: ${docs.length} | to update: ${changes.length} | already clean: ${alreadyClean}`
    );

    if (!options.quiet) {
      for (const change of changes) {
        console.log(`  - ${change.name || "(no name)"}`);
        console.log(`      before: ${describe(change.before)}`);
        console.log(`      after : ${describe(change.after)}`);
      }
    }

    // Pending doctor-panel change requests keep a snapshot of the old values and
    // are applied verbatim by pages/api/registerDoc/doctorUpdateReq.js, so a
    // string snapshot would re-introduce the old shape.
    const pendingWithString = await connection
      .collection(CHANGE_REQUESTS)
      .countDocuments({ "updatedFields.educationTraining": { $type: "string" } })
      .catch(() => 0);
    if (pendingWithString > 0) {
      console.log(
        `note: ${pendingWithString} pending doctor detail request(s) still hold a string value in` +
          " updatedFields.educationTraining - review them after this cleanup."
      );
    }


    if (!options.apply) {
      console.log("Nothing written. Re-run with --apply to save these changes.");
    } else if (changes.length === 0) {
      console.log("Nothing to write - every document already uses the array shape.");
    } else {
      if (options.backup) {
        const backupPath = path.resolve(options.backup);
        fs.writeFileSync(
          backupPath,
          JSON.stringify(
            {
              generatedAt: new Date().toISOString(),
              database: connection.name,
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
            updateOne: {
              filter: { _id: change._id },
              update: { $set: { educationTraining: change.after } },
            },
          })),
          { ordered: false }
        );
        modified += result.modifiedCount;
      }
      console.log(`updated: ${modified} document(s)`);
    }

    // Verification pass: every document must hold an array of clean strings.
    const after = await collection
      .find({}, { projection: { name: 1, educationTraining: 1 } })
      .toArray();
    const problems = [];

    for (const doc of after) {
      const value = doc.educationTraining;
      if (!Array.isArray(value)) {
        problems.push(`${doc._id} (${doc.name}): not an array -> ${describe(value)}`);
      } else if (
        value.some(
          (item) => typeof item !== "string" || item === "" || item !== item.trim()
        )
      ) {
        problems.push(
          `${doc._id} (${doc.name}): unclean entries -> ${JSON.stringify(value)}`
        );
      }
    }

    console.log(
      options.apply
        ? `verification: ${after.length - problems.length}/${after.length} document(s) clean`
        : `verification (dry run): ${after.length - problems.length}/${
            after.length
          } document(s) already clean`
    );
    if (problems.length) {
      problems.forEach((problem) => console.log(`  ! ${problem}`));
      // A dry run is allowed to report documents that still need the migration;
      // only a real run fails the exit code when something is left unclean.
      if (options.apply) process.exitCode = 1;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`FAILED: ${error.message}`);
  process.exitCode = 1;
});

