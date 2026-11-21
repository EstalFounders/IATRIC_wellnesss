// src/lib/doctorSheetSync.js
//
// Append-only sync of the `doctors` + `staffs` (nursing staff) collections into
// the admin "Doctor Details" Google Sheet (the existing spreadsheet, tab gid 0).
// The cron job `doctorSheetSync` (src/cron/jobs.js) POSTs to
// /api/helperApi?action=syncDoctorSheet every night at 00:00, which calls
// `syncDoctorDetailsSheet()` below.
//
// What it does
//   1. loads the tab and reads its header row, so columns are found by their
//      *names* ("Specilization", "Qualifications / degree", "Profile Picture
//      URL", ...) instead of fixed indexes;
//   2. reads the names already in the sheet, the doctors in `doctors` and the
//      nursing staff in `staffs`;
//   3. appends one row for every record whose name is NOT in the sheet.
//
// Nursing staff reuse the same columns: B = `jobTitle`, C = `education`,
// D = `profilePictureUrl` (the mapping `scripts/syncDoctorDetailsSheet.js` uses).
//
// What it never does: update, reorder or delete an existing row, touch column C
// (header-less, unused), invent a missing column, or write when `apply` is false.
//
// Matching is on a normalised name (`nameKey`), exactly like
// `scripts/syncDoctorDetailsSheet.js`, so "Dr.Ashima Narula " and
// "Dr Ashima Narula" are the same person. That script stays the manual tool for
// refreshing existing cells; this module is append-only.
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { dbConnect } from "./db";

const DEFAULT_SPREADSHEET_ID = "10stn51J9AnTj0BK3sbRIcAwZaEX4lJhmUKBVsV_55xM";
const DEFAULT_SHEET_TAB = "Doctor Details";

// A sheet round-trip must never hang: the cron request itself gives up after
// 2 minutes (see the registry entry in src/cron/jobs.js).
const SHEET_TIMEOUT_MS = 30000;

// The roster is small, but the projection keeps a future change from pulling
// whole doctor documents into the nightly job.
const DOCTOR_PROJECTION = {
  name: 1,
  serviceOffered: 1,
  educationTraining: 1,
  profilePictureUrl: 1,
};

// Nursing staff carry a job title and a free-text education string instead of
// the doctor arrays (see `staffSheetPayload`).
const STAFF_PROJECTION = {
  name: 1,
  jobTitle: 1,
  education: 1,
  profilePictureUrl: 1,
};

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((resolve, reject) => {
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms,
      );
    }),
  ]);

/** PEM from an env var: surrounding quotes stripped, escaped "\n" made real. */
const asPem = (value) =>
  String(value || "")
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n")
    .trim();

/**
 * Credentials for the Sheets client - same precedence as
 * `pages/api/helper.js`: the live Firebase service account from the env first,
 * because the committed `serviceAccountKey.json` key is revoked (`invalid_grant`
 * on the token exchange), then `GOOGLE_APPLICATION_CREDENTIALS`, then that file.
 */
export function resolveSheetServiceAccount() {
  const envEmail = String(process.env.FIREBASE_CLIENT_EMAIL || "").trim();
  const envKey = asPem(process.env.FIREBASE_PRIVATE_KEY);
  if (envEmail && envKey) {
    return {
      email: envEmail,
      key: envKey,
      source: "env:FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY",
    };
  }

  const jsonPath =
    String(process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim() ||
    path.join(process.cwd(), "serviceAccountKey.json");

  try {
    if (fs.existsSync(jsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      if (parsed?.client_email && parsed?.private_key) {
        return {
          email: parsed.client_email,
          key: asPem(parsed.private_key),
          source: path.basename(jsonPath),
        };
      }
    }
  } catch (error) {
    console.error(
      "[SHEET] unreadable service account file",
      jsonPath,
      error.message,
    );
  }

  return null;
}

/**
 * Name "key" used for matching: lowercase, no "Dr."/"Dt.", no punctuation, so
 * formatting differences never create a duplicate row.
 */
export function nameKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/(^|\s)(dr|dt)\.?/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

const cleanText = (value) =>
  String(value === undefined || value === null ? "" : value)
    .replace(/\s+/g, " ")
    .trim();

// `serviceOffered` holds plain strings in current documents and `{ name }`
// objects in older ones - both shapes are accepted (same rule as the script).
const serviceNames = (doctor) =>
  (Array.isArray(doctor.serviceOffered) ? doctor.serviceOffered : [])
    .map((service) =>
      typeof service === "string" ? service : String(service?.name || ""),
    )
    .map((service) => service.trim())
    .filter(Boolean);

/** Sheet values for one doctor, keyed by the column meanings we understand. */
export function doctorSheetPayload(doctor) {
  return {
    kind: "doctor",
    name: cleanText(doctor.name),
    speciality: serviceNames(doctor).join(", "),
    qualifications: (Array.isArray(doctor.educationTraining)
      ? doctor.educationTraining
      : [])
      .map((item) => cleanText(item))
      .filter(Boolean)
      .join(", "),
    photo: cleanText(doctor.profilePictureUrl),
  };
}

/**
 * Sheet values for one nursing-staff record: the same four columns, filled from
 * `jobTitle` / `education` (the mapping `scripts/syncDoctorDetailsSheet.js`
 * uses for the `staffs` collection).
 */
export function staffSheetPayload(staff) {
  return {
    kind: "staff",
    name: cleanText(staff.name),
    speciality: cleanText(staff.jobTitle),
    qualifications: cleanText(staff.education),
    photo: cleanText(staff.profilePictureUrl),
  };
}

const COLUMN_DEFS = [
  // `endsWith("name")` matches "Name" and "Doctor Name".
  ["name", (header) => header === "name" || header.endsWith("name")],
  ["speciality", (header) => header.includes("spec")],
  [
    "qualifications",
    (header) =>
      header.includes("qualif") ||
      header.includes("degree") ||
      header.includes("education"),
  ],
  [
    "photo",
    (header) =>
      header.includes("picture") ||
      header.includes("photo") ||
      header.includes("image"),
  ],
];

/**
 * Maps each column meaning to its index in the header row. A header is used at
 * most once; an unmatched meaning gets -1 and is reported, so the caller leaves
 * that cell blank instead of guessing or adding a column.
 */
export function mapSheetColumns(headerValues) {
  const normalise = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  const used = new Set();
  const columns = {};

  for (const [field, matches] of COLUMN_DEFS) {
    let index = -1;
    for (let i = 0; i < headerValues.length; i += 1) {
      if (used.has(i)) continue;
      if (matches(normalise(headerValues[i]))) {
        index = i;
        break;
      }
    }
    if (index >= 0) used.add(index);
    columns[field] = index;
  }

  return columns;
}

/**
 * Appends every doctor whose name is missing from the sheet.
 *
 * @param {{ apply?: boolean, spreadsheetId?: string, sheetTitle?: string }} options
 * @returns {Promise<object>} report used by the API response and the cron log
 */
export async function syncDoctorDetailsSheet({
  apply = true,
  spreadsheetId,
  sheetTitle,
} = {}) {
  const startedAt = Date.now();
  const SPREADSHEET_ID =
    String(spreadsheetId || process.env.DOCTOR_SHEET_ID || "").trim() ||
    DEFAULT_SPREADSHEET_ID;
  const SHEET_TITLE =
    String(sheetTitle || process.env.DOCTOR_SHEET_TAB || "").trim() ||
    DEFAULT_SHEET_TAB;

  const credentials = resolveSheetServiceAccount();
  if (!credentials) {
    throw new Error(
      "No Google service account credentials - set FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (or provide serviceAccountKey.json / GOOGLE_APPLICATION_CREDENTIALS)",
    );
  }

  const auth = new JWT({
    email: credentials.email,
    key: credentials.key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await withTimeout(doc.loadInfo(), SHEET_TIMEOUT_MS, "Google Sheets loadInfo");

  const sheet = doc.sheetsByTitle[SHEET_TITLE];
  if (!sheet) {
    const tabs = Object.values(doc.sheetsById)
      .map((item) => item.title)
      .join(", ");
    throw new Error(
      `Tab "${SHEET_TITLE}" not found in "${doc.title}" (tabs: ${tabs})`,
    );
  }

  await withTimeout(
    sheet.loadHeaderRow(),
    SHEET_TIMEOUT_MS,
    "Google Sheets loadHeaderRow",
  );
  const headers = Array.isArray(sheet.headerValues) ? sheet.headerValues : [];
  if (headers.length === 0) {
    throw new Error(
      `Tab "${SHEET_TITLE}" has no header row - refusing to write anything`,
    );
  }

  const columns = mapSheetColumns(headers);
  if (columns.name < 0) {
    throw new Error(
      `Tab "${SHEET_TITLE}" has no name column (headers: ${headers
        .map((header) => JSON.stringify(header))
        .join(", ")})`,
    );
  }
  const missingFields = COLUMN_DEFS.map(([field]) => field).filter(
    (field) => columns[field] < 0,
  );

  const rows = await withTimeout(
    sheet.getRows(),
    SHEET_TIMEOUT_MS,
    "Google Sheets getRows",
  );

  const sheetKeys = new Map();
  rows.forEach((row, index) => {
    const key = nameKey(row._rawData?.[columns.name]);
    // Row 1 is the header, so the first data row is row 2.
    if (key && !sheetKeys.has(key)) sheetKeys.set(key, index + 2);
  });

  await dbConnect();
  const db = mongoose.connection.db;
  const doctors = await db
    .collection("doctors")
    .find({}, { projection: DOCTOR_PROJECTION })
    .toArray();
  const staff = await db
    .collection("staffs")
    .find({}, { projection: STAFF_PROJECTION })
    .toArray();

  const sourceByKey = new Map();
  const skippedInvalid = [];
  // Doctors first: the roster and the sheet are both doctor-led, so on a name
  // collision (a nurse entered as "Dr. X") the doctor's values win.
  const sources = [
    ...doctors.map((doctor) => ({ kind: "doctor", payload: doctorSheetPayload(doctor) })),
    ...staff.map((member) => ({ kind: "staff", payload: staffSheetPayload(member) })),
  ];
  for (const { kind, payload } of sources) {
    const key = nameKey(payload.name);
    if (!key) {
      skippedInvalid.push(JSON.stringify(payload.name || `(unnamed ${kind})`));
      continue;
    }
    if (sourceByKey.has(key)) {
      console.log(
        `[SHEET] duplicate ${kind} name, keeping the first: ${payload.name} / ${sourceByKey.get(key).name}`,
      );
      continue;
    }
    sourceByKey.set(key, payload);
  }

  const sheetOnlyRows = [];
  for (const [key, rowNumber] of sheetKeys) {
    if (!sourceByKey.has(key)) sheetOnlyRows.push({ row: rowNumber, key });
  }

  const toAppend = [];
  for (const [key, payload] of sourceByKey) {
    if (!sheetKeys.has(key)) toAppend.push(payload);
  }

  // Arrays (not objects) keep a header-less column empty, and the width stops at
  // the last column we actually use: the tab has unused trailing columns (E/F)
  // that an append must not touch.
  const usedIndexes = Object.values(columns).filter((index) => index >= 0);
  const width = Math.max(...usedIndexes.map((index) => index + 1), headers.length);
  const appended = [];
  const errors = [];
  const appendedByKind = { doctor: 0, staff: 0 };

  for (const payload of toAppend) {
    const cells = new Array(width).fill("");
    cells[columns.name] = payload.name;
    if (columns.speciality >= 0) cells[columns.speciality] = payload.speciality;
    if (columns.qualifications >= 0) {
      cells[columns.qualifications] = payload.qualifications;
    }
    if (columns.photo >= 0) cells[columns.photo] = payload.photo;

    if (!apply) {
      appended.push(payload.name);
      appendedByKind[payload.kind] += 1;
      continue;
    }

    try {
      await withTimeout(
        sheet.addRow(cells),
        SHEET_TIMEOUT_MS,
        "Google Sheets addRow",
      );
      appended.push(payload.name);
      appendedByKind[payload.kind] += 1;
      console.log(
        `[SHEET] appended ${payload.kind} ${payload.name}: ${payload.speciality}`,
      );
    } catch (error) {
      errors.push({ name: payload.name, message: error.message });
      console.error(`[SHEET] failed to append ${payload.name}:`, error.message);
    }
  }

  const report = {
    apply,
    spreadsheetId: SPREADSHEET_ID,
    tab: SHEET_TITLE,
    authSource: credentials.source,
    headers,
    columns,
    missingFields,
    sheetRows: rows.length,
    sheetOnlyRows: sheetOnlyRows.length,
    dbDoctors: doctors.length,
    dbStaff: staff.length,
    matched: sourceByKey.size - toAppend.length,
    appended,
    appendedDoctors: appendedByKind.doctor,
    appendedStaff: appendedByKind.staff,
    skippedInvalid,
    errors,
    elapsedMs: Date.now() - startedAt,
  };

  console.log(
    `[SHEET] ${SHEET_TITLE}: ${rows.length} rows, ${sourceByKey.size} records ` +
      `(${doctors.length} doctors, ${staff.length} nursing staff), ` +
      `${report.matched} matched, ${toAppend.length} to append ` +
      `(${appendedByKind.doctor} doctors, ${appendedByKind.staff} staff), ` +
      `${errors.length} failed (${apply ? "applied" : "dry run"}) ` +
      `in ${report.elapsedMs}ms` +
      (missingFields.length
        ? ` | columns not found: ${missingFields.join(", ")}`
        : ""),
  );

  return report;
}



