#!/usr/bin/env node
/**
 * One-time migration for the removed doctor `degree` field.
 *
 * `degree` was dropped from the Doctor model (`src/models/doctorModel.js`) and
 * from every super-admin form, but the documents written before that change
 * still carry the column. This script unsets it so the stored shape matches the
 * schema and the API payloads (`pages/api/addDoctor.js` strips the field as a
 * safety net for older clients).
 *
 *   node scripts/removeDoctorDegree.js                 # dry run (default, writes nothing)
 *   node scripts/removeDoctorDegree.js --apply         # write the changes
 *   node scripts/removeDoctorDegree.js --apply --backup=/tmp/degree.json
 *   node scripts/removeDoctorDegree.js --limit=5       # only the first N documents
 *   node scripts/removeDoctorDegree.js --uri="mongodb+srv://..."   # override .env
 *
 * Two collections are cleaned:
 *   - `doctors`                  -> `degree` is unset.
 *   - `docdetailschangerequests` -> a pending doctor-panel change request keeps a
 *     snapshot of the edited fields; a `degree` entry there is unset too, because
 *     the approval PUT in `pages/api/registerDoc/doctorUpdateReq.js` replays that
 *     snapshot verbatim.
 *
 * The script writes with the raw MongoDB driver (no mongoose schema), so
 * pre-existing documents that miss other (now required) fields are not rejected.
 *
 * npm run db:remove-degree        # dry run
 * npm run db:remove-degree:apply  # write
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COLLECTION = "doctors"; // mongoose pluralises the `Doctor` model
const CHANGE_REQUESTS = "docdetailschangerequests"; // mongoose pluralises DoctorDetailsChangeReq
const FIELD = "degree";
const WRITE_CHUNK_SIZE = 200;

const USAGE = `Usage: node scripts/removeDoctorDegree.js [options]

  --apply              write the changes (without it the script is a dry run)
  --limit=N            only process the first N documents per collection
  --backup=PATH        save the removed values to PATH (JSON) before writing
  --uri=URI            MongoDB connection string (default: MONGO_URI from env/.env)
  --quiet              only print the summary
  -h, --help           show this help
`;

function parseArgs(argv) {
  const options = {
    apply: false,
    quiet: false,
    limit: null,
    backup: null,
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

function describe(value) {
  if (value === undefined) return "missing";
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  return `${typeof value} ${JSON.stringify(value)}`;
}

/** Every document (plus the change requests) that still carries the field. */
async function collectTargets(connection, { limit, quiet }) {
  const doctors = await connection
    .collection(COLLECTION)
    .find(
      { [FIELD]: { $exists: true } },
      { projection: { name: 1, [FIELD]: 1 } }
    )
    .sort({ _id: 1 })
    .limit(limit || 0)
    .toArray();

  const requests = await connection
    .collection(CHANGE_REQUESTS)
    .find(
      { [`updatedFields.${FIELD}`]: { $exists: true } },
      { projection: { name: 1, [`updatedFields.${FIELD}`]: 1 } }
    )
    .sort({ _id: 1 })
    .limit(limit || 0)
    .toArray()
    .catch(() => []);

  if (!quiet) {
    for (const doc of doctors) {
      console.log(`  - doctor  ${doc.name || "(no name)"} (${doc._id})`);
      console.log(`      removing: ${describe(doc[FIELD])}`);
    }
    for (const request of requests) {
      console.log(`  - request ${request.name || "(no name)"} (${request._id})`);
      console.log(
        `      removing: updatedFields.${FIELD} = ${describe(
          request.updatedFields?.[FIELD]
        )}`
      );
    }
  }

  return { doctors, requests };
}

/** `$unset`s one path on every given document id, in chunks. */
async function unsetMany(collection, ids, field) {
  let modified = 0;
  for (let index = 0; index < ids.length; index += WRITE_CHUNK_SIZE) {
    const chunk = ids.slice(index, index + WRITE_CHUNK_SIZE);
    const result = await collection.bulkWrite(
      chunk.map((_id) => ({
        updateOne: { filter: { _id }, update: { $unset: { [field]: "" } } },
      })),
      { ordered: false }
    );
    modified += result.modifiedCount;
  }
  return modified;
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

  console.log("HealthPath - remove the doctor `degree` field");
  console.log(
    `db: ${connection.name} | host: ${connection.host} | field: ${FIELD} | mode: ${
      options.apply ? "APPLY" : "DRY RUN (nothing is written)"
    }`
  );

  try {
    const { doctors, requests } = await collectTargets(connection, options);

    console.log(
      `scanned: ${COLLECTION} -> ${doctors.length} document(s), ` +
        `${CHANGE_REQUESTS} -> ${requests.length} request(s) to clean`
    );

    if (!options.apply) {
      console.log("Nothing written. Re-run with --apply to save these changes.");
    } else if (doctors.length === 0 && requests.length === 0) {
      console.log("Nothing to write - no document still carries the field.");
    } else {
      if (options.backup) {
        const backupPath = path.resolve(options.backup);
        fs.writeFileSync(
          backupPath,
          JSON.stringify(
            {
              generatedAt: new Date().toISOString(),
              database: connection.name,
              field: FIELD,
              doctors: doctors.map((doc) => ({
                _id: doc._id,
                name: doc.name,
                [FIELD]: doc[FIELD],
              })),
              changeRequests: requests.map((request) => ({
                _id: request._id,
                name: request.name,
                [FIELD]: request.updatedFields?.[FIELD],
              })),
            },
            null,
            2
          )
        );
        console.log(`backup written: ${backupPath}`);
      }

      const doctorsModified = await unsetMany(
        connection.collection(COLLECTION),
        doctors.map((doc) => doc._id),
        FIELD
      );
      const requestsModified = await unsetMany(
        connection.collection(CHANGE_REQUESTS),
        requests.map((request) => request._id),
        `updatedFields.${FIELD}`
      );
      console.log(
        `updated: ${doctorsModified} doctor(s), ${requestsModified} change request(s)`
      );
    }

    // Verification pass: the field must be gone everywhere.
    const doctorsLeft = await connection
      .collection(COLLECTION)
      .countDocuments({ [FIELD]: { $exists: true } });
    const requestsLeft = await connection
      .collection(CHANGE_REQUESTS)
      .countDocuments({ [`updatedFields.${FIELD}`]: { $exists: true } })
      .catch(() => 0);

    console.log(
      options.apply
        ? `verification: ${doctorsLeft} doctor(s) / ${requestsLeft} request(s) still carry \`${FIELD}\``
        : `verification (dry run): ${doctorsLeft} doctor(s) / ${requestsLeft} request(s) would still carry \`${FIELD}\``
    );

    if (options.apply && (doctorsLeft > 0 || requestsLeft > 0)) {
      // Only a real run fails the exit code when something is left behind.
      process.exitCode = 1;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`FAILED: ${error.message}`);
  process.exitCode = 1;
});


