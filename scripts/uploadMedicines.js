#!/usr/bin/env node
/**
 * Imports medicine records from the PDFs and JSON catalogues in data/ into MongoDB.
 *
 *   npm run medicines:upload              # scan data/, parse, upsert to BOTH DBs
 *   node scripts/uploadMedicines.js       # same thing
 *   node scripts/uploadMedicines.js --dry-run          # parse + print, no DB
 *   node scripts/uploadMedicines.js --envs=test        # test DB only
 *   node scripts/uploadMedicines.js --file=data/one.pdf
 *   node scripts/uploadMedicines.js --file=data/medicine-catalogue.json
 *   node scripts/uploadMedicines.js --collection=medicineInfo   # scratch import
 *
 * What it does
 * ------------
 * 1. Scans --data-dir (default `<repo>/data`, recursive) for `*.pdf` and
 *    `*.json`, or just the file passed with --file.
 * 2. For a PDF: extracts the text layer with pdfjs-dist (the copy `react-pdf`
 *    already installs - no extra download) and rebuilds the printed lines from
 *    the glyph positions, because the label parser needs real line breaks.
 * 3. Turns the text into records with label heuristics (`Name:`, `Marketed By -`,
 *    `Uses:` ...) and, for PDFs that carry no labels at all, a conservative
 *    one-product-per-line fallback.
 *    For a JSON catalogue (`[{ "name", "salt", "price" }]`, or an object holding
 *    a `medicines` / `records` / `data` array) the keys are mapped through the
 *    same FIELD_SYNONYMS, so `salt`/`composition` -> `generic_name` and
 *    `price`/`mrp` -> `price`; a numeric price is accepted as-is.
 * 4. Normalises every record to the schema the app already reads and writes it
 *    in chunked `bulkWrite` calls.
 *
 * Idempotent by design: each record carries a stable `dedupe_key`
 * (sha1 of name|generic|manufacturer|dosage). A row that already exists is
 * updated in place, a row whose stored values already match is skipped
 * completely (no write, `updated_at` untouched), and an empty field is never
 * written - so re-running after dropping new PDFs into data/ is cheap and can
 * never blank data an earlier PDF filled in.
 *
 * Configuration (`.env` in the repo root is loaded automatically)
 * -----------------------------------------------------------------
 *   MONGO_URI             required for a real run (never hardcoded)
 *   DB_NAME               optional, overrides the database inside MONGO_URI
 *   MEDICINE_COLLECTION   optional, defaults to `medicines`
 *
 * Dual-environment writes
 * -----------------------
 * A real run writes to **both** databases unless a target is pinned:
 *   test -> MONGO_URI from `.env`              (IATRIC_test)
 *   prod -> MONGO_URI from `.env.production`   (IATRIC)
 * `--envs=test` / `--envs=prod` limits the run to one environment, and
 * `--uri=` / `--db=` pin an arbitrary single target (those override the env
 * files). Every resolved database must be in ALLOWED_DATABASES.
 *
 * Collection note: the default target is `medicines`, the collection
 * `pages/api/medicineInfo.js` actually reads through the mongoose model
 * `Medicine` (model name -> `medicines`), so imported rows show up in the
 * prescription autocomplete and `/medicine/homepage` immediately. Pass
 * `--collection=medicineInfo` only for a scratch/staging import. The script
 * writes through the native driver, not the model, so the fields the model does
 * not declare (`generic_name`, `category`, `manufacturer`, ...) are stored
 * instead of being dropped.
 *
 * Exit codes: 0 = ok (or nothing to do), 1 = configuration/usage problem,
 * 2 = at least one PDF failed to parse or one bulk chunk failed.
 */

"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ quiet: true });

const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_DATA_DIR = path.join(REPO_ROOT, "data");
const DEFAULT_COLLECTION = "medicines";
const DEFAULT_CHUNK_SIZE = 500;
const INGEST_VERSION = "1.0";
const PDFJS_ENTRY = "pdfjs-dist/legacy/build/pdf.js";
// Files the importer understands: text PDFs and JSON catalogues.
const SOURCE_FILE_RE = /\.(pdf|json)$/i;

// Both environments are written on every real run (test first, then production).
// The connection strings come from the repo env files, never from source code.
const TARGETS = [
  { key: "test", label: "test", envFile: ".env", dbName: "IATRIC_test" },
  { key: "prod", label: "prod", envFile: ".env.production", dbName: "IATRIC" },
];
// Guard: a typo in --db/--uri or an env file pointing somewhere new must not
// silently write into an unknown database.
const ALLOWED_DATABASES = ["IATRIC", "IATRIC_test"];

// Fields every emitted record carries. The last four mirror the mongoose schema
// in src/models/medicineInfo.js so /api/medicineInfo can serve a row unchanged.
const FIELDS = [
  "name",
  "generic_name",
  "dosage",
  "type",
  "manufacturer",
  "category",
  "indications",
  "contraindications",
  "price",
  "pack_size_label",
  "source_file",
  "source_page",
  "source_excerpt",
];

// Fields compared when deciding whether an existing row needs a write at all.
const COMPARED_FIELDS = [
  ...FIELDS,
  "salt",
  "Is_discontinued",
  "short_composition1",
  "short_composition2",
];

// Label spellings found in supplier catalogues / patient information leaflets.
// Keys are the canonical field, values are lower-case label variants.
const FIELD_SYNONYMS = {
  name: [
    "name",
    "medicine",
    "medicine name",
    "brand",
    "brand name",
    "product",
    "product name",
    "drug",
    "drug name",
    "item",
    "item name",
  ],
  generic_name: [
    "generic",
    "generic name",
    "salt",
    "salts",
    "composition",
    "active ingredient",
    "active ingredients",
    "ingredients",
    "molecule",
    "api",
  ],
  dosage: ["dosage", "dose", "strength", "power", "potency", "label claim"],
  type: ["type", "dosage form", "form", "presentation type"],
  manufacturer: [
    "manufacturer",
    "manufactured by",
    "mfg",
    "mfg by",
    "made by",
    "marketed by",
    "marketed",
    "company",
    "brand owner",
    "principal",
  ],
  category: [
    "category",
    "class",
    "drug class",
    "therapeutic class",
    "therapeutic category",
    "schedule",
  ],
  indications: [
    "indications",
    "indication",
    "uses",
    "used for",
    "usage",
    "therapeutic uses",
    "purpose",
    "benefits",
  ],
  contraindications: [
    "contraindications",
    "contraindication",
    "warnings",
    "warning",
    "precautions",
    "precaution",
    "do not use",
    "avoid",
    "not recommended",
  ],
  price: ["price", "mrp", "cost", "rate", "selling price"],
  pack_size_label: [
    "pack",
    "pack size",
    "packing",
    "presentation",
    "pack size label",
  ],
};

// Reverse lookup: normalised label -> canonical field.
const LABEL_INDEX = new Map();
for (const [field, labels] of Object.entries(FIELD_SYNONYMS)) {
  for (const label of labels) LABEL_INDEX.set(label, field);
}

// "Name: value" / "Name - value" / "Name – value". A bare hyphen is deliberately
// not a separator so hyphenated product names ("Co-amoxiclav") stay intact.
const LABEL_RE =
  /^\s*[-*•·]?\s*([A-Za-z][A-Za-z0-9 ()/&.,'-]{0,39}?)\s*(?::|–|—|\s-\s)\s*(.+?)\s*$/;

const DOSAGE_RE =
  /\b\d+(?:\.\d+)?\s?(?:mg|mcg|µg|g|gm|ml|iu|%)(?:\s?\/\s?\d*\s?(?:ml|g|mg))?/i;
const PACK_RE =
  /\b\d+\s?(?:tablets?|tabs?|capsules?|caps?|ml|g|gm|sachets?|strips?|bottles?|vials?|ampoules?)\b/i;
const PRICE_RE =
  /(?:₹|rs\.?|inr)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)|([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:rs\.?|inr)/i;
const LIST_SPLIT_RE = /[;\n•·|]+|(?<!\d)\.\s+|,\s*(?=[A-Z])/;
// Brand names often carry the strength without a unit ("Azithral 500 Tablet").
const BARE_STRENGTH_RE = /\b(\d{1,4}(?:\.\d{1,2})?)\b/;

// A line that could be a product name on its own (fallback parser): starts with a
// capital, 3-80 chars, and carries a strength or a dosage form.
const FALLBACK_NAME_RE = /^[A-Z][A-Za-z0-9][A-Za-z0-9 .%+/(),'&–-]{1,79}$/;
const FALLBACK_SKIP_PREFIXES = [
  "page ",
  "note",
  "total",
  "sr",
  "sl",
  "batch",
  "mfg",
  "exp",
  "storage",
  "keep out",
  "for external",
];

// Dosage forms -> canonical `type` value (matched as whole words).
const FORM_TYPES = [
  ["tablet", "Tablet"],
  ["tab", "Tablet"],
  ["capsule", "Capsule"],
  ["cap", "Capsule"],
  ["syrup", "Syrup"],
  ["suspension", "Suspension"],
  ["solution", "Solution"],
  ["injection", "Injection"],
  ["infusion", "Infusion"],
  ["cream", "Cream"],
  ["ointment", "Ointment"],
  ["gel", "Gel"],
  ["lotion", "Lotion"],
  ["drops", "Drops"],
  ["inhaler", "Inhaler"],
  ["spray", "Spray"],
  ["powder", "Powder"],
  ["sachet", "Powder"],
  ["granules", "Powder"],
  ["patch", "Patch"],
  ["suppository", "Suppository"],
  ["shampoo", "Shampoo"],
  ["mouthwash", "Mouthwash"],
  ["soap", "Soap"],
];

// Keyword -> category. First match wins, so the specific rules come first.
// Adjust this table when a new catalogue uses different therapeutic wording.
const CATEGORY_RULES = [
  ["antibiotic", "Antibiotic"],
  ["amoxicillin", "Antibiotic"],
  ["azithromycin", "Antibiotic"],
  ["cefixime", "Antibiotic"],
  ["cephalosporin", "Antibiotic"],
  ["penicillin", "Antibiotic"],
  ["antifungal", "Antifungal"],
  ["antiviral", "Antiviral"],
  ["antimalarial", "Antimalarial"],
  ["anthelmintic", "Anthelmintic"],
  ["analgesic", "Analgesic"],
  ["antipyretic", "Analgesic"],
  ["pain", "Analgesic"],
  ["fever", "Analgesic"],
  ["paracetamol", "Analgesic"],
  ["ibuprofen", "Analgesic"],
  ["diclofenac", "Analgesic"],
  ["nsaid", "Analgesic"],
  ["antacid", "Gastrointestinal"],
  ["antiemetic", "Gastrointestinal"],
  ["antidiarrheal", "Gastrointestinal"],
  ["laxative", "Gastrointestinal"],
  ["acidity", "Gastrointestinal"],
  ["gastric", "Gastrointestinal"],
  ["stomach", "Gastrointestinal"],
  ["pantoprazole", "Gastrointestinal"],
  ["omeprazole", "Gastrointestinal"],
  ["antihistamine", "Antihistamine"],
  ["allergy", "Antihistamine"],
  ["cetirizine", "Antihistamine"],
  ["antidiabetic", "Antidiabetic"],
  ["diabetes", "Antidiabetic"],
  ["metformin", "Antidiabetic"],
  ["insulin", "Antidiabetic"],
  ["antihypertensive", "Cardiovascular"],
  ["hypertension", "Cardiovascular"],
  ["blood pressure", "Cardiovascular"],
  ["statin", "Cardiovascular"],
  ["cardiac", "Cardiovascular"],
  ["vitamin", "Vitamin & Supplement"],
  ["multivitamin", "Vitamin & Supplement"],
  ["calcium", "Vitamin & Supplement"],
  ["iron", "Vitamin & Supplement"],
  ["protein", "Vitamin & Supplement"],
  ["supplement", "Vitamin & Supplement"],
  ["cough", "Respiratory"],
  ["asthma", "Respiratory"],
  ["bronchial", "Respiratory"],
  ["respiratory", "Respiratory"],
  ["skin", "Dermatology"],
  ["derma", "Dermatology"],
  ["fungal", "Dermatology"],
  ["acne", "Dermatology"],
  ["eye", "Ophthalmic"],
  ["ophthalmic", "Ophthalmic"],
  ["ear", "Otic"],
  ["psychiatric", "Neuro & Psychiatry"],
  ["depression", "Neuro & Psychiatry"],
  ["anxiety", "Neuro & Psychiatry"],
  ["epilep", "Neuro & Psychiatry"],
  ["migraine", "Neuro & Psychiatry"],
  ["ayurvedic", "Ayurvedic"],
  ["herbal", "Ayurvedic"],
];

const TRIM_CHARS = /^[ \t\-\u2013\u2014\u2022\u00b7:;,]+|[ \t\-\u2013\u2014\u2022\u00b7:;,]+$/g;

/** Escape user text before it is placed inside a RegExp. */
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Collapse whitespace, strip bullets/plumbing punctuation. */
function cleanText(value) {
  if (value === null || value === undefined) return "";
  const text = String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ");
  return text.replace(TRIM_CHARS, "");
}

/** Split a free-text field into short, de-duplicated list items. */
function cleanList(value, limit = 25) {
  if (value === null || value === undefined) return [];
  const parts = Array.isArray(value) ? value : String(value).split(LIST_SPLIT_RE);

  const seen = new Set();
  const items = [];
  for (const part of parts) {
    const item = cleanText(part);
    if (item.length < 2) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= limit) break;
  }
  return items;
}

/** First strength token in the given texts ("500 mg", "5mg/5ml"). */
function matchDosage(...values) {
  for (const value of values) {
    const match = DOSAGE_RE.exec(cleanText(value));
    if (match) return match[0].trim();
  }
  return "";
}

/** Canonical dosage form inferred from the name/dosage/type text. */
function matchForm(...values) {
  const haystack = values.map((value) => cleanText(value).toLowerCase()).join(" ");
  for (const [needle, label] of FORM_TYPES) {
    if (new RegExp(`\\b${escapeRegExp(needle)}s?\\b`).test(haystack)) return label;
  }
  return "";
}

/** Category inferred from the generic name, indications or product name. */
function matchCategory(...values) {
  const haystack = values.map((value) => cleanText(value).toLowerCase()).join(" ");
  for (const [needle, label] of CATEGORY_RULES) {
    if (haystack.includes(needle)) return label;
  }
  return "";
}

/** Numeric price from "MRP Rs 45.50" / "45.50 INR" style text. */
function matchPrice(value) {
  const match = PRICE_RE.exec(cleanText(value));
  if (!match) return null;
  const raw = (match[1] || match[2] || "").replace(/,/g, "");
  const price = Number.parseFloat(raw);
  if (!Number.isFinite(price) || price <= 0 || price >= 1000000) return null;
  return Math.round(price * 100) / 100;
}

/** Pack description such as "10 tablets" or "100 ml". */
function matchPackSize(...values) {
  for (const value of values) {
    const match = PACK_RE.exec(cleanText(value));
    if (match) return match[0].trim();
  }
  return "";
}

/** First two components of a combination salt (mongoose short_composition1/2). */
function compositionParts(genericName) {
  const parts = String(genericName || "")
    .split(/\s*\+\s*/)
    .map((part) => cleanText(part))
    .filter(Boolean);
  return [parts[0] || "", parts[1] || ""];
}

/** Map a printed label ("Marketed By", "MRP") to its canonical field. */
function canonicalLabel(label) {
  return LABEL_INDEX.get(cleanText(label).toLowerCase()) || "";
}

/**
 * Split page text into records using "Label: value" heuristics.
 *
 * Returns `{ records, orphans }` - `orphans` counts labelled blocks that never
 * produced a name, which is the signal that the PDF layout is too irregular for
 * the label parser and the line fallback should be preferred.
 */
function parseLabeledRecords(text) {
  const records = [];
  let current = {};
  let active = "";
  let orphans = 0;
  // A wrapped line often continues right after a comma, and `cleanText` trims
  // that comma from the stored value - remember it so the join can restore it.
  const trimmedSeparators = {};

  const flush = () => {
    if (current.name) records.push(current);
    else if (Object.keys(current).length > 0) orphans += 1;
    current = {};
    active = "";
    for (const key of Object.keys(trimmedSeparators)) delete trimmedSeparators[key];
  };

  const appendValue = (field, rawChunk) => {
    const chunk = cleanText(rawChunk);
    if (!chunk) return;
    const existing = current[field] || "";
    current[field] = existing
      ? cleanText(`${existing}${trimmedSeparators[field] ? ", " : " "}${chunk}`)
      : chunk;
    trimmedSeparators[field] = /[,;]$/.test(String(rawChunk).trim());
  };

  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      active = ""; // a blank line closes a multi-line value
      continue;
    }

    const match = LABEL_RE.exec(line);
    const field = match ? canonicalLabel(match[1]) : "";

    if (field) {
      if (field === "name" && current.name) flush();
      appendValue(field, match[2]);
      active = field;
    } else if (active) {
      // Continuation of the previous label ("Uses:" -> several wrapped lines).
      appendValue(active, line);
    }
  }

  flush();
  return { records, orphans };
}

/** One record per product-looking line, for PDFs with no usable labels. */
function parseLineFallback(text) {
  const records = [];
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = cleanText(rawLine);
    if (line.length < 3 || line.length > 80) continue;
    const lower = line.toLowerCase();
    if (FALLBACK_SKIP_PREFIXES.some((prefix) => lower.startsWith(prefix))) continue;
    if (!FALLBACK_NAME_RE.test(line)) continue;
    if (!DOSAGE_RE.test(line) && !matchForm(line)) continue;
    records.push({ name: line });
  }
  return records;
}

/** Stable dedupe key: same product => same key on every run and every PDF. */
function naturalKey(name, genericName, manufacturer, dosage) {
  const normalised = [name, genericName, manufacturer, dosage]
    .map((part) => cleanText(part).toLowerCase())
    .join("|");
  return crypto.createHash("sha1").update(normalised, "utf8").digest("hex");
}

/**
 * Normalise one parsed block into the document shape written to MongoDB.
 * Returns null when the block has no usable product name.
 */
function buildRecord(
  raw,
  { sourceFile, sourcePage, excerpt = "", minNameLength = 3 } = {},
) {
  const name = cleanText(raw.name);
  if (name.length < minNameLength) return null;

  const genericName = cleanText(raw.generic_name);
  let dosage = cleanText(raw.dosage) || matchDosage(name, genericName);
  const form = cleanText(raw.type) || matchForm(name, dosage, genericName);
  if (!dosage && form) {
    // "Azithral 500 Tablet": a unitless strength still beats an empty field.
    const bare = BARE_STRENGTH_RE.exec(name);
    if (bare) dosage = bare[1];
  }
  const indications = cleanList(raw.indications);
  const contraindications = cleanList(raw.contraindications);
  const category =
    cleanText(raw.category) ||
    matchCategory(genericName, name, indications.join(" "));
  const packSize =
    cleanText(raw.pack_size_label) || matchPackSize(name, raw.pack_size_label);
  const [composition1, composition2] = compositionParts(genericName);
  const manufacturer = cleanText(raw.manufacturer);

  return {
    name,
    generic_name: genericName,
    dosage,
    type: form,
    manufacturer,
    category,
    indications,
    contraindications,
    price: matchPrice(raw.price || ""),
    pack_size_label: packSize,
    source_file: sourceFile || "",
    source_page: sourcePage || 0,
    source_excerpt: cleanText(excerpt).slice(0, 400),
    // Mirrors of the mongoose schema (src/models/medicineInfo.js) so
    // /api/medicineInfo can serve the row without extra mapping.
    salt: genericName,
    Is_discontinued: /discontinu/i.test(String(excerpt)) ? "1" : "0",
    short_composition1: composition1,
    short_composition2: composition2,
    dedupe_key: naturalKey(name, genericName, manufacturer, dosage),
  };
}

/** How much information a record carries (used to pick the better duplicate). */
function recordRichness(record) {
  return Object.values(record).filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0),
  ).length;
}

/** True when a stored value counts as "empty" (arrays included). */
function isEmptyValue(value) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/**
 * Collapse records that describe the same product across (or inside) PDFs.
 *
 * Two PDFs rarely share a layout, so the same medicine can arrive once with a
 * generic name and once bare. Records are merged when the brand name matches and
 * the compositions are equal or one of them is missing; the richer record wins
 * and the gaps are filled from the other one.
 */
function mergeRecords(records) {
  const merged = [];
  const positionByName = new Map();
  let collapsed = 0;

  for (const record of records) {
    const nameKey = cleanText(record.name).toLowerCase();
    const position = positionByName.get(nameKey);

    if (position === undefined) {
      positionByName.set(nameKey, merged.length);
      merged.push({ ...record });
      continue;
    }

    const target = merged[position];
    const saltA = cleanText(target.salt).toLowerCase();
    const saltB = cleanText(record.salt).toLowerCase();
    if (saltA && saltB && saltA !== saltB) {
      // Same brand, different composition - these are distinct products.
      positionByName.set(nameKey, merged.length);
      merged.push({ ...record });
      continue;
    }

    const [base, extra] =
      recordRichness(record) > recordRichness(target)
        ? [record, target]
        : [target, record];
    const combined = { ...base };
    for (const [field, value] of Object.entries(extra)) {
      if (isEmptyValue(combined[field]) && !isEmptyValue(value)) {
        combined[field] = value;
      }
    }

    combined.dedupe_key = naturalKey(
      combined.name,
      combined.salt,
      combined.manufacturer,
      combined.dosage,
    );
    merged[position] = combined;
    collapsed += 1;
  }

  return { records: merged, collapsed };
}

let VERBOSE = false;

function info(...args) {
  console.log(...args);
}

function warn(...args) {
  console.warn(...args);
}

function debug(...args) {
  if (VERBOSE) console.log("  [debug]", ...args);
}


/**
 * Every `*.pdf` / `*.json` under dataDir (sorted, de-duplicated), or just one
 * file. The extension decides which reader runs later (`processPdf` /
 * `processJson`).
 */
function discoverSources(dataDir, singleFile) {
  if (singleFile) {
    const absolute = path.resolve(singleFile);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      const error = new Error(`Source file not found: ${absolute}`);
      error.code = "EUSAGE";
      throw error;
    }
    if (!SOURCE_FILE_RE.test(absolute)) {
      const error = new Error(
        `Unsupported file type: ${path.basename(absolute)} (expected .pdf or .json)`,
      );
      error.code = "EUSAGE";
      throw error;
    }
    return [absolute];
  }

  if (!fs.existsSync(dataDir)) return [];

  const found = [];
  const walk = (dir) => {
    const entries = fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") walk(full);
      } else if (
        entry.isFile() &&
        SOURCE_FILE_RE.test(entry.name) &&
        // `._foo.pdf` are macOS AppleDouble stubs, not real documents.
        !entry.name.startsWith("._")
      ) {
        found.push(full);
      }
    }
  };

  walk(dataDir);
  return found;
}

/**
 * Rebuild the printed lines of one PDF page from the glyph positions.
 *
 * pdfjs hands out text runs, not lines: `hasEOL` marks the end of a line and the
 * horizontal gap between two runs is what separates two words, which is exactly
 * what the label parser needs to see.
 */
function pageTextFromItems(items) {
  let text = "";
  let previousEnd = null;
  let previousSize = 10;

  for (const item of items) {
    const str = typeof item.str === "string" ? item.str : "";
    if (!str) continue;

    const transform = item.transform || [];
    const x = Number(transform[4]) || 0;
    const size = Math.abs(Number(transform[3]) || Number(transform[0]) || 10) || 10;
    const width = Number(item.width) || 0;

    if (previousEnd !== null && str.trim() && !/\s$/.test(text) && !/^\s/.test(str)) {
      const gap = x - previousEnd;
      if (gap > Math.max(Math.min(previousSize, size) * 0.25, 1)) text += " ";
    }

    text += str;

    if (item.hasEOL) {
      text += "\n";
      previousEnd = null;
    } else {
      previousEnd = x + width;
    }
    previousSize = size;
  }

  return text;
}

/**
 * Text layer of every page (`[]` for a PDF with no text layer at all).
 * Throws an error with `code === "ENCRYPTED"` for password-protected files.
 */
async function extractPdfPages(pdfPath) {
  let pdfjs;
  try {
    // pdfjs's Node build warns about the missing optional `canvas` polyfills
    // (DOMMatrix/Path2D). Text extraction never touches them, so keep the noise
    // out of the import log.
    const originalLog = console.log;
    console.log = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].startsWith("Warning: Cannot polyfill")
      ) {
        return;
      }
      originalLog(...args);
    };
    try {
      pdfjs = require(PDFJS_ENTRY);
    } finally {
      console.log = originalLog;
    }
  } catch (error) {
    const missing = new Error(
      `pdfjs-dist is missing (${error.message}). Run: npm install`,
    );
    missing.code = "EUSAGE";
    throw missing;
  }

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  let document;
  try {
    document = await pdfjs.getDocument({
      data,
      isEvalSupported: false,
      useSystemFonts: true,
      disableFontFace: true,
      verbosity: 0,
    }).promise;
  } catch (error) {
    if (error && error.name === "PasswordException") {
      const encrypted = new Error("password protected");
      encrypted.code = "ENCRYPTED";
      throw encrypted;
    }
    throw error;
  }

  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      let text = "";
      try {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        text = pageTextFromItems(content.items || []);
        page.cleanup();
      } catch (error) {
        warn(`  page ${pageNumber} could not be read (${error.message || error})`);
        continue;
      }
      if (text.trim().length < 10) continue; // heading-only / blank page
      debug(`page ${pageNumber}: ${text.length} chars`);
      pages.push({ pageNumber, text });
    }
  } finally {
    await document.destroy().catch(() => {});
  }

  return pages;
}

/**
 * Parse one PDF into normalised records plus per-file statistics.
 * `limit` caps how many records this file contributes (`null` = no cap).
 */
async function processPdf(pdfPath, { minNameLength = 3, limit = null } = {}) {
  const stats = {
    file: path.basename(pdfPath),
    pages: 0,
    textPages: 0,
    records: 0,
    skipped: 0,
    mode: "-",
  };
  const records = [];

  const pages = await extractPdfPages(pdfPath);
  stats.pages = pages.length;

  for (const { pageNumber, text } of pages) {
    const labelled = parseLabeledRecords(text);
    let blocks;
    if (labelled.records.length > 0) {
      stats.mode = "labels";
      blocks = labelled.records;
    } else {
      stats.mode = "lines";
      blocks = parseLineFallback(text);
    }
    if (blocks.length > 0) stats.textPages += 1;

    for (const raw of blocks) {
      const excerpt = Object.entries(raw)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" | ");
      const record = buildRecord(raw, {
        sourceFile: stats.file,
        sourcePage: pageNumber,
        excerpt,
        minNameLength,
      });
      if (!record) {
        stats.skipped += 1;
        continue;
      }
      records.push(record);
      if (limit !== null && records.length >= limit) {
        stats.records = records.length;
        info(`  reached the record limit, stopping ${stats.file} early`);
        return { records, stats };
      }
    }
  }

  stats.records = records.length;
  return { records, stats };
}

/**
 * Map one JSON catalogue entry onto the raw label-parser field names.
 *
 * Keys go through the same FIELD_SYNONYMS reverse lookup the PDF labels use, so
 * `salt` / `composition` -> `generic_name`, `mrp` / `price` -> `price`,
 * `pack` / `pack size` -> `pack_size_label`; snake_case keys (`generic_name`)
 * work too. Unknown keys are ignored, because `buildRecord` only reads known
 * fields.
 */
function jsonEntryToRaw(entry) {
  const raw = {};

  for (const [key, value] of Object.entries(entry)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object" && !Array.isArray(value)) continue;
    const label = String(key).trim();
    const field =
      canonicalLabel(label) || canonicalLabel(label.replace(/[_-]+/g, " "));
    if (!field) continue;
    if (!isEmptyValue(raw[field])) continue; // first non-empty spelling wins
    raw[field] = value;
  }

  if (isEmptyValue(raw.generic_name) && typeof entry.salt === "string") {
    raw.generic_name = entry.salt;
  }
  if (!isEmptyValue(raw.price)) raw.price = jsonPriceToText(raw.price);

  return raw;
}

/**
 * `matchPrice()` only understands printed money ("Rs 45.50", "45.50 INR"), so a
 * JSON `price: 990` becomes "Rs 990" first. Empty/null stays empty, which keeps
 * the field out of the written document.
 */
function jsonPriceToText(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? `Rs ${value}` : "";
  }
  const text = cleanText(value);
  if (!text) return "";
  return PRICE_RE.test(text) ? text : `Rs ${text}`;
}

/**
 * Parse one JSON catalogue into normalised records plus per-file statistics.
 *
 * Accepted shapes: an array of objects, or an object holding that array under
 * `medicines` / `records` / `data` / `items`. Every entry is fed through the
 * same `buildRecord()` the PDF path uses, so both sources produce identical
 * documents (dosage/form/category inference, `salt` mirror, `dedupe_key`).
 */
function processJson(jsonPath, { minNameLength = 3, limit = null } = {}) {
  const stats = {
    file: path.basename(jsonPath),
    pages: 0,
    textPages: 0,
    entries: 0,
    records: 0,
    skipped: 0,
    mode: "json",
  };

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (error) {
    throw new Error(`invalid JSON: ${error.message || error}`);
  }

  let entries = parsed;
  if (!Array.isArray(entries) && parsed && typeof parsed === "object") {
    for (const key of ["medicines", "records", "data", "items"]) {
      if (Array.isArray(parsed[key])) {
        entries = parsed[key];
        break;
      }
    }
  }
  if (!Array.isArray(entries)) {
    const error = new Error(
      'not a medicine catalogue: expected an array of medicines (or an object ' +
        'with a "medicines" / "records" / "data" array)',
    );
    // A folder scan may contain unrelated JSON (service names, seeds, ...);
    // those are skipped instead of failing the whole run.
    error.code = "ENOTCATALOGUE";
    throw error;
  }
  stats.entries = entries.length;

  const records = [];
  entries.forEach((entry, index) => {
    if (limit !== null && records.length >= limit) return;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      stats.skipped += 1;
      return;
    }

    const raw = jsonEntryToRaw(entry);
    const excerpt = Object.entries(raw)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
    const record = buildRecord(raw, {
      sourceFile: stats.file,
      // JSON has no pages; the entry index is the closest equivalent.
      sourcePage: index + 1,
      excerpt,
      minNameLength,
    });
    if (!record) {
      stats.skipped += 1;
      return;
    }
    records.push(record);
    if (limit !== null && records.length === limit) {
      info(`  reached the record limit, stopping ${stats.file} early`);
    }
  });

  stats.records = records.length;
  return { records, stats };
}

/** Hide the credentials of a Mongo URI before it is logged. */
function maskUri(uri) {
  return String(uri || "").replace(/\/\/([^:/@]+):([^@]*)@/, "//$1:***@");
}

/**
 * Unique sparse index on dedupe_key: unique so two runs cannot create the same
 * product twice, sparse so documents written before the importer existed (which
 * have no dedupe_key at all) do not collide on a missing field.
 */
async function ensureIndexes(collection) {
  try {
    await collection.createIndex(
      { dedupe_key: 1 },
      { unique: true, sparse: true, name: "dedupe_key_unique" },
    );
    info("Index ready: dedupe_key_unique");
  } catch (error) {
    warn(
      `Could not create the dedupe_key index (${error.message || error}). ` +
        "Continuing: re-runs still update existing rows, they are just slower " +
        "and two records with the same product could both be inserted.",
    );
  }
}

/**
 * Look up the rows this chunk may already own.
 *
 * Two indexes are returned: `byKey` (rows written by this importer) and `byPair`
 * (rows written earlier by the app - matched on name+salt, the natural identity
 * of a catalogue entry). Matching the second set is what keeps the script from
 * cloning an existing catalogue on the first run.
 *
 * The full comparable field set is projected so unchanged rows can be skipped
 * without a write.
 */
async function loadExisting(collection, chunk, { matchLegacyName }) {
  const keys = [...new Set(chunk.map((record) => record.dedupe_key))].sort();
  const filter = matchLegacyName
    ? {
        $or: [
          { dedupe_key: { $in: keys } },
          { name: { $in: [...new Set(chunk.map((record) => record.name))].sort() } },
        ],
      }
    : { dedupe_key: { $in: keys } };

  const projection = { name: 1, salt: 1, dedupe_key: 1 };
  for (const field of COMPARED_FIELDS) projection[field] = 1;

  const byKey = new Map();
  const byPair = new Map();
  const documents = await collection.find(filter, { projection }).toArray();

  for (const document of documents) {
    if (document.dedupe_key) byKey.set(document.dedupe_key, document);
    const pair = `${cleanText(document.name).toLowerCase()}\u0000${cleanText(
      document.salt,
    ).toLowerCase()}`;
    if (!byPair.has(pair)) byPair.set(pair, document);
  }

  return { byKey, byPair };
}

/** True when every non-empty incoming field is already stored unchanged. */
function documentsMatch(existing, incoming) {
  if (!existing) return false;

  for (const [field, value] of Object.entries(incoming)) {
    if (isEmptyValue(value)) continue; // not written at all

    const current = existing[field];
    if (Array.isArray(value)) {
      const currentList = Array.isArray(current) ? current : [];
      if (
        currentList.length !== value.length ||
        currentList.some((item, index) => item !== value[index])
      ) {
        return false;
      }
    } else if (typeof value === "number" && typeof current === "number") {
      if (current !== value) return false;
    } else if (current !== value) {
      return false;
    }
  }

  return true;
}

/** Turn a chunk of records into bulk upsert/update operations. */
async function planOps(collection, chunk, { matchLegacyName, timestamp }) {
  const { byKey, byPair } = await loadExisting(collection, chunk, {
    matchLegacyName,
  });

  const ops = [];
  const plan = { insert: 0, update: 0, unchanged: 0, duplicates: 0 };
  const seen = new Set();

  for (const record of chunk) {
    const key = record.dedupe_key;
    if (seen.has(key)) {
      plan.duplicates += 1;
      continue;
    }
    seen.add(key);

    // Empty values are dropped so a re-run never blanks a field that a previous
    // PDF filled in.
    const document = {};
    for (const [field, value] of Object.entries(record)) {
      if (!isEmptyValue(value)) document[field] = value;
    }

    let existing = byKey.get(key);
    if (existing && documentsMatch(existing, document)) {
      plan.unchanged += 1;
      continue;
    }

    if (!existing && matchLegacyName) {
      const pair = `${cleanText(document.name).toLowerCase()}\u0000${cleanText(
        document.salt,
      ).toLowerCase()}`;
      existing = byPair.get(pair);
      if (existing && documentsMatch(existing, document)) {
        plan.unchanged += 1;
        continue;
      }
    }

    document.updated_at = timestamp;
    document.ingest_version = INGEST_VERSION;

    if (existing && existing._id !== undefined) {
      // Own row, or an app row seen for the first time: stamp the dedupe_key onto
      // it instead of inserting a duplicate.
      ops.push({
        updateOne: {
          filter: { _id: existing._id },
          update: { $set: document },
        },
      });
      plan.update += 1;
      continue;
    }

    ops.push({
      updateOne: {
        filter: { dedupe_key: key },
        update: {
          $set: document,
          $setOnInsert: { created_at: timestamp },
        },
        upsert: true,
      },
    });
    plan.insert += 1;
  }

  return { ops, plan };
}

/**
 * Push every record in chunked bulk writes and return the write counters.
 *
 * The native collection is used on purpose: the mongoose model in
 * src/models/medicineInfo.js only declares eight fields, so writing through it
 * would silently drop generic_name/category/manufacturer/indications.
 */
async function uploadRecords(records, options) {
  const { uri, dbName, collectionName, chunkSize, matchLegacyName } = options;
  const totals = {
    chunks: 0,
    inserted: 0,
    modified: 0,
    matched: 0,
    unchanged: 0,
    errors: 0,
  };
  if (records.length === 0) return totals;

  const mongoose = require("mongoose");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    autoIndex: false,
  });

  try {
    const connection = dbName
      ? mongoose.connection.useDb(dbName, { useCache: true })
      : mongoose.connection;
    const collection = connection.collection(collectionName);
    const timestamp = new Date();

    await connection.db.admin().command({ ping: 1 });
    info(
      `Writing to ${maskUri(uri)}${dbName ? `/${dbName}` : ""} -> ` +
        `collection "${collectionName}"`,
    );
    await ensureIndexes(collection);

    const chunkTotal = Math.ceil(records.length / chunkSize);
    for (let start = 0; start < records.length; start += chunkSize) {
      const chunk = records.slice(start, start + chunkSize);
      const { ops, plan } = await planOps(collection, chunk, {
        matchLegacyName,
        timestamp,
      });
      totals.chunks += 1;
      totals.unchanged += plan.unchanged;

      if (ops.length === 0) {
        info(
          `  chunk ${totals.chunks}/${chunkTotal}: nothing to write ` +
            `(${plan.unchanged} row(s) already up to date)`,
        );
        continue;
      }

      let result;
      try {
        result = await collection.bulkWrite(ops, { ordered: false });
      } catch (error) {
        const writeErrors = Array.isArray(error.writeErrors)
          ? error.writeErrors.length
          : 0;
        totals.errors += writeErrors || 1;
        warn(
          `  chunk ${totals.chunks}/${chunkTotal} failed: ${error.message || error} ` +
            `(${writeErrors} write error(s)); the rest of the batch was still ` +
            "applied, fix the data and re-run - it is idempotent",
        );
        if (error.result) {
          totals.matched += error.result.matchedCount || 0;
          totals.modified += error.result.modifiedCount || 0;
          totals.inserted += error.result.upsertedCount || 0;
        }
        continue;
      }

      totals.matched += result.matchedCount || 0;
      totals.modified += result.modifiedCount || 0;
      totals.inserted += result.upsertedCount || 0;
      info(
        `  chunk ${totals.chunks}/${chunkTotal}: ${result.upsertedCount || 0} new, ` +
          `${result.matchedCount || 0} matched (${result.modifiedCount || 0} changed), ` +
          `${plan.unchanged} already current`,
      );
    }

    return totals;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

const USAGE = `Usage: node scripts/uploadMedicines.js [options]

Imports every PDF and JSON catalogue in data/ into MongoDB as medicine records.
Safe to re-run: existing rows are updated, unchanged rows are not written at all.

A real run writes to BOTH environments: test (.env -> IATRIC_test) and
production (.env.production -> IATRIC). Use --envs= to limit the run.

JSON catalogues are arrays of objects (or an object with a "medicines" /
"records" / "data" array) using any FIELD_SYNONYMS key, e.g.
  [{ "name": "ALTOPOD-100 DRY SYRUP", "salt": "Cefpodoxime ...", "price": null }]
"salt"/"composition" become generic_name, "price"/"mrp" become price.

Options:
  --file=<path>            import a single .pdf / .json instead of scanning
  --data-dir=<path>        folder to scan (default: <repo>/data)
  --collection=<name>      target collection (default: medicines - the one
                           /api/medicineInfo reads; use medicineInfo for scratch)
  --envs=<a,b>             environments to write (default: test,prod);
                           accepted values: test, prod
  --uri=<mongodb-uri>      pin a single target, overrides the env files
  --db=<name>              pin the database of that single target
  --chunk-size=<n>         records per bulk write (default: ${DEFAULT_CHUNK_SIZE})
  --limit=<n>              stop after n records (handy for a first test run)
  --min-name-length=<n>    ignore names shorter than this (default: 3)
  --no-legacy-match        do not match existing rows on name+salt
  --dry-run                parse and print the records, write nothing
  --verbose, -v            show per-page parsing details
  --help, -h               this text

Environment:
  .env is loaded automatically (MONGO_URI, DB_NAME, MEDICINE_COLLECTION);
  .env.production supplies MONGO_URI for the prod target.

Exit codes: 0 = ok, 1 = configuration/usage problem, 2 = parse or write failure.
`;

/** Error with `code === "EUSAGE"` -> printed without a stack trace, exit 1. */
function usageError(message) {
  const error = new Error(message);
  error.code = "EUSAGE";
  return error;
}

function positiveInt(raw, flag, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const value = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw usageError(`${flag} expects a number >= ${min}, got "${raw}"`);
  }
  return value;
}

/** Parse the CLI arguments (`--flag`, `--key=value`, `--key value`). */
function parseArgs(argv) {
  const options = {
    file: "",
    dataDir: process.env.MEDICINE_DATA_DIR
      ? path.resolve(process.env.MEDICINE_DATA_DIR)
      : DEFAULT_DATA_DIR,
    collection: process.env.MEDICINE_COLLECTION || DEFAULT_COLLECTION,
    envs: [],
    uri: process.env.MONGO_URI || "",
    dbName: process.env.DB_NAME || "",
    // True only when --uri / --db were passed: those pin a single target and
    // must beat the dual (test + prod) default.
    pinned: false,
    chunkSize: DEFAULT_CHUNK_SIZE,
    limit: null,
    minNameLength: 3,
    dryRun: false,
    matchLegacyName: true,
    verbose: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--dry-run":
        options.dryRun = true;
        continue;
      case "--no-legacy-match":
        options.matchLegacyName = false;
        continue;
      case "--legacy-match":
        options.matchLegacyName = true;
        continue;
      case "--verbose":
      case "-v":
        options.verbose = true;
        continue;
      case "--help":
      case "-h":
        options.help = true;
        continue;
      default:
        break;
    }

    if (!arg.startsWith("--")) throw usageError(`Unknown argument: ${arg}`);

    const separator = arg.indexOf("=");
    let name = separator === -1 ? arg.slice(2) : arg.slice(2, separator);
    let value = separator === -1 ? "" : arg.slice(separator + 1);

    if (separator === -1) {
      // Support the "--key value" spelling as well.
      const next = argv[index + 1];
      if (next !== undefined && !next.startsWith("-")) {
        value = next;
        index += 1;
      }
    }
    if (name === "dataDir" || name === "data_dir") name = "data-dir";

    switch (name) {
      case "file":
        if (!value) throw usageError("--file expects a path");
        options.file = value;
        break;
      case "data-dir":
        if (!value) throw usageError("--data-dir expects a path");
        options.dataDir = path.resolve(value);
        break;
      case "collection":
        if (!value) throw usageError("--collection expects a name");
        options.collection = value;
        break;
      case "envs": {
        if (!value) throw usageError("--envs expects a comma separated list (test,prod)");
        const keys = String(value)
          .split(",")
          .map((entry) => entry.trim().toLowerCase())
          .filter(Boolean);
        const unknown = keys.filter((key) => !TARGETS.some((target) => target.key === key));
        if (unknown.length > 0) {
          throw usageError(
            `Unknown environment(s) in --envs: ${unknown.join(", ")} ` +
              `(accepted: ${TARGETS.map((target) => target.key).join(", ")})`,
          );
        }
        options.envs = [...new Set(keys)];
        break;
      }
      case "uri":
        if (!value) throw usageError("--uri expects a MongoDB connection string");
        options.uri = value;
        options.pinned = true;
        break;
      case "db":
        options.dbName = value;
        options.pinned = true;
        break;
      case "chunk-size":
        options.chunkSize = positiveInt(value, "--chunk-size", { max: 5000 });
        break;
      case "limit":
        options.limit = positiveInt(value, "--limit");
        break;
      case "min-name-length":
        options.minNameLength = positiveInt(value, "--min-name-length", { min: 1 });
        break;
      default:
        throw usageError(`Unknown option: --${name}`);
    }
  }

  if (options.uri && !/^mongodb(\+srv)?:\/\//i.test(options.uri)) {
    throw usageError("MONGO_URI must start with mongodb:// or mongodb+srv://");
  }

  return options;
}

/** Read MONGO_URI without touching process.env (both env files are used). */
function readEnvUri(envFile) {
  const envPath = path.resolve(REPO_ROOT, envFile);
  if (!fs.existsSync(envPath)) return "";
  const parsed = require("dotenv").parse(fs.readFileSync(envPath));
  return parsed.MONGO_URI || "";
}

/** Database encoded in the connection string (`.../IATRIC?retryWrites=true`). */
function databaseFromUri(uri) {
  try {
    const pathname = new URL(uri).pathname || "";
    return decodeURIComponent(pathname.replace(/^\//, ""));
  } catch (error) {
    return "";
  }
}

/**
 * Work out where a real run writes.
 *   --uri / --db  -> that single target only (their env file is not read)
 *   --envs=a,b    -> those environments (default: all of TARGETS, test first)
 * Every database is validated against ALLOWED_DATABASES.
 */
function resolveTargets(options) {
  const assertAllowed = (target) => {
    const dbName = target.dbName || databaseFromUri(target.uri);
    if (!dbName) {
      throw usageError(
        `${target.label}: no database found. Add /<db> to the connection string ` +
          "or pass --db=<name>.",
      );
    }
    if (!ALLOWED_DATABASES.includes(dbName)) {
      throw usageError(
        `${target.label}: database "${dbName}" is not allowed ` +
          `(allowed: ${ALLOWED_DATABASES.join(", ")}).`,
      );
    }
    return dbName;
  };

  if (options.pinned) {
    const uri = options.uri || readEnvUri(".env");
    if (!uri) {
      throw usageError(
        "No connection string. Put MONGO_URI in .env or pass --uri=<connection string>.",
      );
    }
    const target = { key: "custom", label: "custom", uri, dbName: options.dbName };
    return [{ ...target, dbName: assertAllowed(target) }];
  }

  const keys = options.envs.length > 0 ? options.envs : TARGETS.map((target) => target.key);
  return keys.map((key) => {
    const definition = TARGETS.find((target) => target.key === key);
    const uri = readEnvUri(definition.envFile);
    if (!uri) {
      throw usageError(
        `${definition.label}: MONGO_URI is missing in ${definition.envFile}. ` +
          "Add it, or run with --envs=" +
          TARGETS.filter((target) => target.key !== key)
            .map((target) => target.key)
            .join(",") +
          " to skip that environment.",
      );
    }
    const target = { ...definition, uri };
    return { ...target, dbName: assertAllowed(target) };
  });
}

async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    warn(error.message);
    info(USAGE);
    return 1;
  }

  if (options.help) {
    info(USAGE);
    return 0;
  }
  VERBOSE = options.verbose;

  let sources;
  try {
    sources = discoverSources(options.dataDir, options.file);
  } catch (error) {
    warn(error.message);
    return 1;
  }

  if (sources.length === 0) {
    info("No medicine files to import.");
    info(
      `Put the medicine PDFs or JSON catalogues in ${options.dataDir} ` +
        "(or pass --file=<path>.pdf|.json) and run again.",
    );
    return 0;
  }

  info(
    `Found ${sources.length} source file(s) in ${
      options.file ? path.dirname(path.resolve(options.file)) : options.dataDir
    }`,
  );

  const collected = [];
  const failures = [];
  let parsedFiles = 0;

  for (const sourcePath of sources) {
    const remaining =
      options.limit === null
        ? null
        : Math.max(options.limit - collected.length, 0);
    if (remaining === 0) {
      info(`Reached --limit=${options.limit}, skipping the remaining file(s).`);
      break;
    }

    const isJson = /\.json$/i.test(sourcePath);

    try {
      const { records, stats } = isJson
        ? processJson(sourcePath, {
            minNameLength: options.minNameLength,
            limit: remaining,
          })
        : await processPdf(sourcePath, {
            minNameLength: options.minNameLength,
            limit: remaining,
          });
      parsedFiles += 1;
      info(
        isJson
          ? `  ${stats.file}: entries=${stats.entries} records=${stats.records} ` +
              `skipped=${stats.skipped} parser=${stats.mode}`
          : `  ${stats.file}: pages=${stats.pages} text_pages=${stats.textPages} ` +
              `records=${stats.records} skipped=${stats.skipped} parser=${stats.mode}`,
      );
      collected.push(...records);
    } catch (error) {
      if (error.code === "ENCRYPTED") {
        warn(`  ${path.basename(sourcePath)} is password protected - skipped`);
        continue;
      }
      if (error.code === "ENOTCATALOGUE") {
        info(`  ${path.basename(sourcePath)}: skipped (not a medicine catalogue)`);
        continue;
      }
      if (error.code === "EUSAGE") {
        warn(error.message);
        return 1;
      }
      failures.push({ file: path.basename(sourcePath), message: error.message || String(error) });
      warn(`  ${path.basename(sourcePath)} could not be parsed: ${error.message || error}`);
    }
  }

  if (collected.length === 0) {
    warn(
      "No medicine records could be extracted. Run with --verbose to inspect the " +
        "parsed text, and adjust FIELD_SYNONYMS if your files use other labels.",
    );
    return failures.length > 0 ? 2 : 0;
  }

  const { records, collapsed } = mergeRecords(collected);
  info(
    `Parsed ${collected.length} record(s) from ${parsedFiles} file(s) ` +
      `(${collapsed} duplicate(s) collapsed, ${records.length} after merge)`,
  );

  let targets;
  try {
    targets = resolveTargets(options);
  } catch (error) {
    warn(error.message);
    return 1;
  }

  if (options.dryRun) {
    info(
      "DRY RUN targets: " +
        targets
          .map((target) => `${target.label} (${target.dbName}, "${options.collection}")`)
          .join(", "),
    );
    for (const record of records) info(JSON.stringify(record));
    info(`DRY RUN: ${records.length} record(s) printed, nothing written`);
    return failures.length > 0 ? 2 : 0;
  }

  const results = [];
  for (const [index, target] of targets.entries()) {
    info("");
    info(
      `--- ${target.label}: ${target.dbName} -> collection "${options.collection}" ` +
        `(${index + 1}/${targets.length})`,
    );
    try {
      const totals = await uploadRecords(records, {
        uri: target.uri,
        dbName: target.dbName,
        collectionName: options.collection,
        chunkSize: options.chunkSize,
        matchLegacyName: options.matchLegacyName,
      });
      results.push({ target, totals });
      info(
        `[${target.label}] ${totals.inserted} inserted, ${totals.modified} updated, ` +
          `${totals.unchanged} already current, ${totals.errors} error(s) ` +
          `in ${totals.chunks} chunk(s).`,
      );
    } catch (error) {
      // One environment failing must not stop the other one.
      results.push({ target, error });
      warn(`[${target.label}] upload failed: ${error.message || error}`);
    }
  }

  info("");
  info("Summary");
  for (const { target, totals, error } of results) {
    info(
      error
        ? `  ${target.label} (${target.dbName}): FAILED - ${error.message || error}`
        : `  ${target.label} (${target.dbName}): ${totals.inserted} inserted, ` +
            `${totals.modified} updated, ${totals.unchanged} already current, ` +
            `${totals.errors} error(s)`,
    );
  }

  if (failures.length > 0) {
    warn(`${failures.length} file(s) could not be parsed:`);
    for (const failure of failures) warn(`  - ${failure.file}: ${failure.message}`);
  }

  const failedTargets = results.filter((result) => result.error || result.totals.errors > 0);
  return failedTargets.length > 0 || failures.length > 0 ? 2 : 0;
}

if (require.main === module) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 2;
    });
}

module.exports = {
  buildRecord,
  cleanList,
  cleanText,
  // Backwards-compatible alias: the function used to be PDF-only.
  discoverPdfs: discoverSources,
  discoverSources,
  documentsMatch,
  extractPdfPages,
  jsonEntryToRaw,
  main,
  matchCategory,
  matchDosage,
  matchForm,
  matchPackSize,
  matchPrice,
  mergeRecords,
  naturalKey,
  pageTextFromItems,
  parseArgs,
  parseLabeledRecords,
  parseLineFallback,
  processJson,
  processPdf,
  readEnvUri,
  resolveTargets,
  uploadRecords,
};












