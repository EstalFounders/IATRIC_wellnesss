// scripts/generateDoctorDetailsSheet.js
//
// Generates / re-syncs the "Doctor Details" Google Sheet template so its columns
// match the super-admin "Add Doctor" form exactly, and applies dropdown data
// validation plus a frozen, formatted header row. Safe to re-run: it only writes
// the header row and validation rules, never the data rows.
//
// There is no "Timestamp" or "Joining Date" column: the hire date is not sheet
// data. A doctor's joiningDate is set automatically - to the import time for
// sheet-imported rows and to the creation time for the Add Doctor form. The only
// columns written back by the import are "Doctor ID" (link to the Mongo record)
// and the admin-driven "Status".
//
// Usage:  node scripts/generateDoctorDetailsSheet.js
// Env:    DOCTOR_SHEET_ID   (default 10stn51J9AnTj0BK3sbRIcAwZaEX4lJhmUKBVsV_55xM)
//         DOCTOR_SHEET_NAME (default "Doctor Details")

const fs = require("fs");
const path = require("path");
const { JWT } = require("google-auth-library");

const SHEET_ID =
  process.env.DOCTOR_SHEET_ID ||
  "10stn51J9AnTj0BK3sbRIcAwZaEX4lJhmUKBVsV_55xM";
const SHEET_NAME = process.env.DOCTOR_SHEET_NAME || "Doctor Details";

// Header order mirrors the Add Doctor form fields. "Doctor ID" is written back
// by the import; "Status" drives which rows get onboarded.
const HEADERS = [
  "Doctor ID",
  "Name",
  "Email",
  "Mobile Number",
  "Gender",
  "Area of Expertise",
  "Registration No",
  "Doctor Type",
  "Work Days",
  "Languages",
  "Education & Training",
  "Work Experience",
  "Consultation Types",
  "Services Offered",
  "Location (State)",
  "Location (City)",
  "Doctor Share",
  "Slot Start Time",
  "Slot End Time",
  "Overview",
  "Profile Picture URL",
  "Certificates URLs",
  "Stamp URL",
  "Signature URL",
  "Is Active",
  "Status",
];

// Single-select columns: the cell must contain one of these exact values.
const SINGLE_SELECT = {
  Gender: ["Male", "Female", "Other"],
  "Doctor Type": ["Individual", "Company"],
  "Is Active": ["Yes", "No"],
  Status: ["Ready to onboard", "Not ready to onboard"],
};

// Multi-select columns: show the valid options as a dropdown hint, but allow a
// comma-separated list (e.g. "Audio, Video") because Google Sheets has no native
// multi-select dropdown.
const MULTI_SELECT = {
  "Consultation Types": ["Audio", "Video", "Home visit", "Clinic"],
  "Services Offered": [
    "Doctor Consultation",
    "Nursing Care",
    "Home Care",
    "Lab Investigation",
    "Community Care",
    "Corporate Healthcare",
    "Physiotherapy",
    "Medicine Delivery",
    "Healthcamp",
    "Nutritionist",
  ],
  Languages: [
    "English",
    "Hindi",
    "Marathi",
    "Tamil",
    "Telugu",
    "Bengali",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Punjabi",
    "Urdu",
    "Assamese",
    "Oriya",
  ],
  "Work Days": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
};

/** Minimal .env reader (no dotenv dependency). Handles quoted values with \n. */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    value = value
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t");
    values[key] = value;
  }
  return values;
}

/**
 * Prefer the current key in `.env` (FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL)
 * and fall back to the checked-in serviceAccountKey.json.
 */
function resolveCredentials() {
  const env = {
    ...loadEnvFile(path.join(process.cwd(), ".env.production")),
    ...loadEnvFile(path.join(process.cwd(), ".env")),
  };

  let email = env.FIREBASE_CLIENT_EMAIL || "";
  let privateKey = env.FIREBASE_PRIVATE_KEY || "";

  if (!email || !privateKey) {
    const keyPath = path.join(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(keyPath)) {
      const sa = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      email = email || sa.client_email || "";
      privateKey = privateKey || sa.private_key || "";
    }
  }

  if (!email || !privateKey) {
    throw new Error(
      "Missing service-account credentials (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env, or serviceAccountKey.json)"
    );
  }

  return { email, privateKey };
}

const toOptionValues = (options) =>
  options.map((userEnteredValue) => ({ userEnteredValue }));

async function main() {
  const { email, privateKey } = resolveCredentials();
  const auth = new JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // google-spreadsheet v5 is ESM-only -> dynamic import().
  const { GoogleSpreadsheet } = await import("google-spreadsheet");

  const doc = new GoogleSpreadsheet(SHEET_ID, auth);
  await doc.loadInfo();

  let sheet = doc.sheetsByTitle[SHEET_NAME];
  if (!sheet) {
    const defaultSheet = doc.sheetsByIndex.find((s) => s.title === "Sheet1");
    if (defaultSheet) {
      sheet = defaultSheet;
      await sheet.updateProperties({ title: SHEET_NAME });
    } else {
      sheet = await doc.addSheet({ title: SHEET_NAME });
    }
  }

  await sheet.loadHeaderRow();
  await sheet.resize({
    rowCount: Math.max(sheet.rowCount || 1000, 1000),
    columnCount: Math.max(sheet.columnCount || HEADERS.length, HEADERS.length),
  });
  await sheet.setHeaderRow(HEADERS);

  // Removing / reordering columns shifts every index, so drop all existing
  // validation rules first - otherwise a stale dropdown (e.g. "Gender") would
  // keep sitting on whichever column now occupies its old position. `false`
  // clears the rule for the range.
  await sheet.setDataValidation(
    {
      startRowIndex: 1,
      endRowIndex: Math.max(sheet.rowCount || 1000, 1000),
      startColumnIndex: 0,
      endColumnIndex: sheet.columnCount,
    },
    false
  );

  // Strict single-select dropdowns.
  for (const [header, options] of Object.entries(SINGLE_SELECT)) {
    const index = HEADERS.indexOf(header);
    if (index === -1) continue;
    await sheet.setDataValidation(
      {
        startRowIndex: 1,
        endRowIndex: 1000,
        startColumnIndex: index,
        endColumnIndex: index + 1,
      },
      {
        condition: { type: "ONE_OF_LIST", values: toOptionValues(options) },
        strict: true,
        showCustomUi: true,
      }
    );
  }

  // Non-strict hint dropdowns for comma-separated multi-select columns.
  for (const [header, options] of Object.entries(MULTI_SELECT)) {
    const index = HEADERS.indexOf(header);
    if (index === -1) continue;
    await sheet.setDataValidation(
      {
        startRowIndex: 1,
        endRowIndex: 1000,
        startColumnIndex: index,
        endColumnIndex: index + 1,
      },
      {
        condition: { type: "ONE_OF_LIST", values: toOptionValues(options) },
        strict: false,
        showCustomUi: true,
      }
    );
  }

  // Format the header row (bold white on brand green) and freeze it.
  await sheet.loadCells({
    startRowIndex: 0,
    endRowIndex: 1,
    startColumnIndex: 0,
    endColumnIndex: HEADERS.length,
  });
  for (let column = 0; column < HEADERS.length; column += 1) {
    const cell = sheet.getCell(0, column);
    cell.textFormat = {
      bold: true,
      foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } },
    };
    cell.backgroundColorStyle = {
      rgbColor: { red: 0.231, green: 0.373, blue: 0.114 },
    };
  }
  await sheet.saveUpdatedCells();
  await sheet.updateGridProperties({ frozenRowCount: 1 });

  // Trim any columns beyond the new header (e.g. the removed "Password Set"
  // column). This is a template, so the extra column only holds a stale header
  // cell — clear it so the grid can shrink back to HEADERS.length columns.
  if (sheet.columnCount > HEADERS.length) {
    await sheet.loadCells({
      startRowIndex: 0,
      endRowIndex: Math.max(sheet.rowCount, 1),
      startColumnIndex: HEADERS.length,
      endColumnIndex: sheet.columnCount,
    });
    for (let r = 0; r < Math.max(sheet.rowCount, 1); r += 1) {
      for (let c = HEADERS.length; c < sheet.columnCount; c += 1) {
        sheet.getCell(r, c).value = "";
      }
    }
    await sheet.saveUpdatedCells();
    await sheet.resize({
      rowCount: Math.max(sheet.rowCount, 1000),
      columnCount: HEADERS.length,
    });
  }

  console.log("Configured spreadsheet:");
  console.log("  id      :", doc.spreadsheetId);
  console.log("  sheet   :", SHEET_NAME);
  console.log("  columns :", HEADERS.length);
  console.log("  single-select dropdowns:", Object.keys(SINGLE_SELECT).length);
  console.log("  multi-select hints      :", Object.keys(MULTI_SELECT).length);
}

main().catch((error) => {
  console.error("Failed to generate sheet:", error?.message || error);
  process.exit(1);
});

