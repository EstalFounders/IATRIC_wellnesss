#!/usr/bin/env node
/**
 * Syncs the doctor + nursing-staff records from Mongo into the "Doctor Details"
 * Google Sheet, so the admin-facing list never drifts from the database.
 *
 * Spreadsheet: 10stn51J9AnTj0BK3sbRIcAwZaEX4lJhmUKBVsV_55xM
 * Tab:         "Doctor Details" (gid 0)
 * Layout:      A Name | B Specilization | C (unused) | D Qualifications / degree | E Profile Picture URL
 *
 * Rules:
 *   - rows are matched by a normalised name (lowercase, no "Dr."/"Dt.", no
 *     punctuation), so "Dr.Ashima Narula " and "Dr Ashima Narula" are the same
 *     person;
 *   - only columns B, D and E are written - the name in column A and the unused
 *     column C are never touched, and row order is preserved;
 *   - a row whose name has no matching doctor/staff document is reported as
 *     "KEEP (no DB match)" and left exactly as it is (e.g. doctors listed in the
 *     sheet but not registered in the app yet);
 *   - doctors/staff with no matching row are appended at the bottom, so the
 *     script is safe to re-run (a clean second run reports 0 differences).
 *
 * Auth note: the key inside `serviceAccountKey.json` is REVOKED - Google answers
 * the token exchange with `invalid_grant`, so every write fails. The live
 * service account credentials live in `.env` (`FIREBASE_CLIENT_EMAIL` +
 * `FIREBASE_PRIVATE_KEY`) and are used first; the JSON file is only a fallback.
 *
 *   node scripts/syncDoctorDetailsSheet.js                                   (dry run, .env)
 *   node scripts/syncDoctorDetailsSheet.js --apply
 *   node scripts/syncDoctorDetailsSheet.js --env=production                   (dry run, IATRIC)
 *   node scripts/syncDoctorDetailsSheet.js --only=staff --apply
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const SPREADSHEET_ID = "10stn51J9AnTj0BK3sbRIcAwZaEX4lJhmUKBVsV_55xM";
const SHEET_TITLE = "Doctor Details";
// Column indexes inside a row (0-based).
const COL_NAME = 0;
const COL_SPECIALITY = 1;
// Column 2 is an unused, header-less column: never written.
const COL_QUALIFICATIONS = 3;
const COL_PHOTO = 4;
const COLUMN_COUNT = 5;

const USAGE = `Usage: node scripts/syncDoctorDetailsSheet.js [options]

  --apply              write to the sheet (dry-run when omitted)
  --env=production     load .env.production instead of .env
  --only=doctors|staff sync only doctors or only nursing staff
  -h, --help           show this help
`;

function parseArgs(argv) {
  const options = { apply: false, env: "development", only: "all", help: false };
  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--env=")) options.env = arg.slice("--env=".length);
    else if (arg.startsWith("--only=")) {
      const only = arg.slice("--only=".length);
      if (!["doctors", "staff", "all"].includes(only)) {
        console.error(`Unknown --only value: ${only}\n`);
        console.error(USAGE);
        process.exit(1);
      }
      options.only = only;
    } else {
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

// Sheets are matched on a name "key" so formatting differences do not create
// duplicates: "Dr.Ashima Narula ", "Dr Ashima Narula" -> "ashimanarula".
function nameKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/(^|\s)(dr|dt)\.?/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

// Cell comparison: whitespace and case insensitive, so a trailing space or
// "MBBS " vs "mbbs" is not reported as a change.
function cellEquals(a, b) {
  const norm = (value) =>
    String(value === undefined || value === null ? "" : value)
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  return norm(a) === norm(b);
}

function cleanText(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/\s+/g, " ")
    .trim();
}

// `serviceOffered` is an array of strings in the current documents, but older
// ones hold `{ name }` objects - both shapes are accepted.
function serviceNames(doctor) {
  return (Array.isArray(doctor.serviceOffered) ? doctor.serviceOffered : [])
    .map((service) =>
      typeof service === "string" ? service : String(service?.name || "")
    )
    .map((service) => service.trim())
    .filter(Boolean);
}

// Sheet values for a row, in the same shape for doctors and nursing staff.
function doctorPayload(doctor) {
  return {
    kind: "doctor",
    name: cleanText(doctor.name),
    speciality: serviceNames(doctor).join(", "),
    qualifications: (Array.isArray(doctor.educationTraining)
      ? doctor.educationTraining
      : []
    )
      .map((item) => cleanText(item))
      .filter(Boolean)
      .join(", "),
    photo: cleanText(doctor.profilePictureUrl),
  };
}

function staffPayload(staff) {
  return {
    kind: "staff",
    name: cleanText(staff.name),
    speciality: cleanText(staff.jobTitle),
    qualifications: cleanText(staff.education),
    photo: cleanText(staff.profilePictureUrl),
  };
}

function resolveSheetAuth() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  if (key && email) {
    return {
      email,
      key: key.includes("\\n") ? key.replace(/\\n/g, "\n") : key,
      source: "env (FIREBASE_CLIENT_EMAIL)",
    };
  }

  const keyFile = path.resolve(__dirname, "..", "serviceAccountKey.json");
  if (fs.existsSync(keyFile)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyFile, "utf8"));
    return {
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      source: "serviceAccountKey.json (revoked key - may fail)",
    };
  }

  throw new Error(
    "No Google service account credentials: set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY"
  );
}

async function openSheet() {
  // google-spreadsheet v5 is ESM-only, hence the dynamic imports from CJS.
  const { GoogleSpreadsheet } = await import("google-spreadsheet");
  const { JWT } = await import("google-auth-library");

  const credentials = resolveSheetAuth();
  const auth = new JWT({
    email: credentials.email,
    key: credentials.key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[SHEET_TITLE];
  if (!sheet) {
    const tabs = Object.values(doc.sheetsById)
      .map((item) => item.title)
      .join(", ");
    throw new Error(`Tab "${SHEET_TITLE}" not found in "${doc.title}" (tabs: ${tabs})`);
  }
  await sheet.loadHeaderRow();
  return { doc, sheet, authSource: credentials.source };
}

function padRow(raw) {
  const cells = Array.isArray(raw) ? raw.slice() : [];
  while (cells.length < COLUMN_COUNT) cells.push("");
  return cells;
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
    `Sheet:  ${SPREADSHEET_ID} / "${SHEET_TITLE}"` +
      `\nDB:     ${dbName} (${options.env})` +
      `\nMode:   ${options.apply ? "APPLY" : "DRY RUN"} (only=${options.only})`
  );

  const { sheet, authSource } = await openSheet();
  console.log(`Auth:   ${authSource}`);

  await mongoose.connect(uri, { autoIndex: false });
  const db = mongoose.connection.db;

  const payloads = [];
  if (options.only !== "staff") {
    const doctors = await db
      .collection("doctors")
      .find(
        {},
        {
          projection: {
            name: 1,
            serviceOffered: 1,
            educationTraining: 1,
            profilePictureUrl: 1,
          },
        }
      )
      .toArray();
    payloads.push(...doctors.map(doctorPayload));
  }
  if (options.only !== "doctors") {
    const staff = await db.collection("staffs").find(
      {},
      {
        projection: {
          name: 1,
          jobTitle: 1,
          education: 1,
          profilePictureUrl: 1,
        },
      }
    ).toArray();
    payloads.push(...staff.map(staffPayload));
  }
  await mongoose.disconnect();

  const sourceByKey = new Map();
  for (const payload of payloads) {
    const key = nameKey(payload.name);
    if (!key) continue;
    if (sourceByKey.has(key)) {
      console.log(
        `WARN duplicate source name, keeping first: ${payload.name} / ${
          sourceByKey.get(key).name
        }`
      );
      continue;
    }
    sourceByKey.set(key, payload);
  }

  const rows = await sheet.getRows();
  // Header row is row 1, so the first data row is row 2.
  const rowByKey = new Map();
  rows.forEach((row, index) => {
    const key = nameKey(row._rawData?.[COL_NAME]);
    if (key && !rowByKey.has(key)) rowByKey.set(key, { row, rowNumber: index + 2 });
  });

  let matched = 0;
  let updatedRows = 0;
  let updatedCells = 0;
  const toAppend = [];
  const skipped = [];

  for (const [key, payload] of sourceByKey) {
    const found = rowByKey.get(key);
    if (!found) {
      toAppend.push(payload);
      continue;
    }

    matched += 1;
    const raw = padRow(found.row._rawData);
    const changes = [];

    if (cellEquals(raw[COL_SPECIALITY], payload.speciality) === false) {
      changes.push({
        column: COL_SPECIALITY,
        label: "B",
        from: raw[COL_SPECIALITY],
        to: payload.speciality,
      });
    }
    if (cellEquals(raw[COL_QUALIFICATIONS], payload.qualifications) === false) {
      changes.push({
        column: COL_QUALIFICATIONS,
        label: "D",
        from: raw[COL_QUALIFICATIONS],
        to: payload.qualifications,
      });
    }
    if (String(raw[COL_PHOTO] || "").trim() !== payload.photo) {
      changes.push({
        column: COL_PHOTO,
        label: "E",
        from: raw[COL_PHOTO],
        to: payload.photo,
      });
    }

    if (changes.length === 0) continue;

    updatedRows += 1;
    updatedCells += changes.length;
    console.log(
      `UPDATE row ${found.rowNumber} ${payload.name} (${payload.kind}): ` +
        changes
          .map(
            (change) =>
              `${change.label} ${JSON.stringify(change.from)} -> ${JSON.stringify(
                change.to
              )}`
          )
          .join(" | ")
    );

    if (!options.apply) continue;
    for (const change of changes) raw[change.column] = change.to;
    found.row._rawData = raw;
    await found.row.save({ raw: true });
  }

  rows.forEach((row, index) => {
    const name = row._rawData?.[COL_NAME];
    const key = nameKey(name);
    if (!key) return;
    if (sourceByKey.has(key)) return;
    skipped.push(`row ${index + 2} ${JSON.stringify(name)}`);
  });

  if (skipped.length) {
    console.log("\nKEEP (no DB match, left untouched):");
    for (const item of skipped) console.log(`  ${item}`);
  }

  for (const payload of toAppend) {
    console.log(`APPEND ${payload.name} (${payload.kind}): ${payload.speciality}`);
    if (!options.apply) continue;
    await sheet.addRow([
      payload.name,
      payload.speciality,
      "", // column C is unused
      payload.qualifications,
      payload.photo,
    ]);
  }

  console.log(
    `\nSource records: ${sourceByKey.size}` +
      `\n  matched rows: ${matched}` +
      `\n  updated rows: ${updatedRows} (${updatedCells} cells)` +
      `\n  to append:    ${toAppend.length}` +
      `\n  kept (no DB):  ${skipped.length}`
  );

  if (options.apply) {
    console.log("\nApplied. Re-run without --apply to confirm 0 differences.");
  } else {
    console.log("\nDry run - nothing was written. Re-run with --apply to commit.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
