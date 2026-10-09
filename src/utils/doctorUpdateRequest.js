// doctorUpdateRequest.js
// Pure helpers behind the super-admin "doctor profile change requests" screen
// (src/components/superAdminComponent/ViewAllDocUpdateReqComp.js).
//
// A request is a DoctorDetailsChangeReq document:
//   { _id, doctorId, name, updatedFields: {...}, status, requestedAt, approvedAt, rejectedAt }
//
// `updatedFields` is written by the doctor panel (lib/doctorProfileSubmit.js) and
// is NOT a flat mirror of the doctor document: repeatable fields arrive as
// *indexed keys* ("consultationType[0]", "consultationType[1]", ...) because
// FormData can only repeat a name. Printing those keys raw is what the old screen
// did, which is how "consultationType[0]" ended up on screen three times.
// `groupFields()` folds them back into one row, `FIELD_LABELS` gives every key a
// human name and `buildDiff()` lines the requested value up against what the
// doctor document holds right now - so a reviewer reads
// "Video, Clinic" -> "Video, Clinic, Audio" instead of three opaque keys.
//
// No React and no fetch in here: everything is a pure function, so the screen
// stays a thin renderer (same split as utils/doctorName.js and
// utils/consultationFee.js).

import { convertDateIntoTime } from "../helper";

export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

// Rows created before the status field existed carry no status; they are still
// waiting for a decision, so they are read as pending rather than as "unknown".
export const requestStatus = (request) => {
  const value = String(request?.status || "").toLowerCase();
  return STATUS_LABELS[value] ? value : REQUEST_STATUS.PENDING;
};

export const statusLabel = (request) => STATUS_LABELS[requestStatus(request)];

export const isPending = (request) =>
  requestStatus(request) === REQUEST_STATUS.PENDING;

// Human names for every key the doctor profile form can submit. The wording
// follows the super-admin "Add Doctor" form (AddDoctorForm.js MANDATORY_TEXT_FIELDS)
// so the review screen and the registration screen call a field the same thing.
export const FIELD_LABELS = {
  name: "Full name",
  email: "Email",
  mobileNumber: "Mobile number",
  expertise: "Area of expertise",
  workExperience: "Work experience",
  workDays: "Work days",
  overview: "Overview",
  doctorRegistrationNo: "Registration no.",
  gender: "Gender",
  location: "Location",
  doctorType: "Doctor type",
  doctorShare: "Doctor share",
  price: "Consultation price",
  slotStartTime: "Slot start time",
  slotEndTime: "Slot end time",
  consultationType: "Consultation types",
  serviceOffered: "Services offered",
  language: "Languages",
  educationTraining: "Education & training",
  joiningDate: "Joining date",
  unavailableDates: "Unavailable dates",
  profilePictureUrl: "Profile picture",
  diplomasCertificatesUrls: "Certificates",
  doctorSignatureUrl: "Signature",
  doctorStampUrl: "Stamp",
  isActive: "Active",
};

/** Unknown key -> camelCase split + capitalised, so nothing ever prints raw. */
const humanizeKey = (key) =>
  String(key || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

export const fieldLabel = (key) => FIELD_LABELS[key] || humanizeKey(key);

// "consultationType[2]" -> { name: "consultationType", index: 2 }
const INDEXED_KEY = /^([^[\]]+)\[(\d+)\]$/;

export const parseFieldKey = (key) => {
  const match = INDEXED_KEY.exec(String(key));
  if (!match) return { name: String(key), index: null };
  return { name: match[1], index: Number(match[2]) };
};

// A string that holds a list ("Video, Clinic"), an array, or nothing at all -
// always as an array of non-empty scalars.
const toList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(
      (item) => item !== null && item !== undefined && item !== ""
    );
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * One row per *field*, not per storage key: every `consultationType[i]` (and a
 * plain `consultationType`, which older requests carry alongside) collapses into
 * a single entry whose `value` is the ordered list.
 *
 * @returns {Array<{key: string, label: string, value: unknown, rawKeys: string[], isList: boolean}>}
 */
export const groupFields = (updatedFields) => {
  if (!updatedFields || typeof updatedFields !== "object") return [];

  const groups = new Map();

  Object.keys(updatedFields).forEach((rawKey) => {
    const { name, index } = parseFieldKey(rawKey);
    const group = groups.get(name) || {
      key: name,
      label: fieldLabel(name),
      rawKeys: [],
      indexed: {},
      plain: undefined,
      hasPlain: false,
    };

    group.rawKeys.push(rawKey);
    if (index === null) {
      group.plain = updatedFields[rawKey];
      group.hasPlain = true;
    } else {
      group.indexed[index] = updatedFields[rawKey];
    }

    groups.set(name, group);
  });

  return [...groups.values()].map((group) => {
    const indexes = Object.keys(group.indexed)
      .map(Number)
      .sort((a, b) => a - b);
    const isList = indexes.length > 0;

    let value = group.plain;
    if (isList) {
      const ordered = indexes.map((index) => group.indexed[index]);
      const extra = group.hasPlain ? toList(group.plain) : [];
      value = [...new Set([...extra, ...ordered].filter((item) => item !== ""))];
    }

    return {
      key: group.key,
      label: group.label,
      value,
      rawKeys: group.rawKeys,
      isList,
    };
  });
};

/** How many fields a request touches - what the card's "+N changes" counts. */
export const changedFieldCount = (request) =>
  groupFields(request?.updatedFields).length;

/* ── Value formatting ────────────────────────────────────────────────────── */

const TIME_FIELDS = new Set(["slotStartTime", "slotEndTime"]);
const MONEY_FIELDS = new Set(["price", "doctorShare"]);
const FILE_FIELDS = new Set([
  "profilePictureUrl",
  "diplomasCertificatesUrls",
  "doctorSignatureUrl",
  "doctorStampUrl",
]);

export const isFileField = (key) => FILE_FIELDS.has(key);

/** The last path segment of a storage URL - "Ashima narula196fba26.jpg". */
export const fileLabel = (url) => {
  const last = String(url || "").split("?")[0].split("/").pop();
  try {
    return decodeURIComponent(last || "") || "Open file";
  } catch {
    return last || "Open file";
  }
};

export const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return `₹${new Intl.NumberFormat("en-IN").format(amount)}`;
};

/** One field value as the reviewer reads it. "" means "nothing to show". */
export const formatFieldValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => formatFieldValue(key, item))
      .filter(Boolean)
      .join(", ");
  }
  if (isFileField(key)) return fileLabel(value);
  if (TIME_FIELDS.has(key)) return convertDateIntoTime(value) || "";
  if (MONEY_FIELDS.has(key)) return formatMoney(value);
  if (key === "joiningDate") return formatDate(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([nestedKey, nestedValue]) =>
          `${humanizeKey(nestedKey)}: ${nestedValue}`
      )
      .join(", ");
  }
  return String(value);
};

/* ── Diff against the doctor document ────────────────────────────────────── */

/**
 * The value the doctor document holds right now for one grouped field. The
 * doctor stores repeatable fields as real arrays (`consultationType: [...]`), so
 * the group key is enough to read it back.
 */
const currentValueFor = (doctor, key) => {
  const value = doctor?.[key];
  return value === undefined ? null : value;
};

const sameText = (a, b) =>
  String(a || "")
    .trim()
    .toLowerCase() ===
  String(b || "")
    .trim()
    .toLowerCase();

/**
 * `[{ key, label, currentText, requestedText, changed, hasCurrent }]` - the
 * request's fields side by side with the live doctor document. When the doctor
 * cannot be found (deleted, or the request predates the current DB) the current
 * side is left blank instead of pretending the request is a no-change.
 */
export const buildDiff = (updatedFields, doctor) =>
  groupFields(updatedFields).map((field) => {
    const currentText = doctor
      ? formatFieldValue(field.key, currentValueFor(doctor, field.key))
      : "";
    const requestedText = formatFieldValue(field.key, field.value);

    return {
      key: field.key,
      label: field.label,
      currentText,
      requestedText,
      hasCurrent: Boolean(doctor),
      changed: !sameText(currentText, requestedText),
    };
  });

/* ── List shaping ────────────────────────────────────────────────────────── */

// Pending first, newest request first - the rows that actually need a decision
// can never sink below the reviewed ones.
export const sortRequests = (requests) =>
  [...(Array.isArray(requests) ? requests : [])].sort((a, b) => {
    const aWait = isPending(a) ? 0 : 1;
    const bWait = isPending(b) ? 0 : 1;
    if (aWait !== bWait) return aWait - bWait;

    const aTime = new Date(a?.requestedAt || 0).getTime();
    const bTime = new Date(b?.requestedAt || 0).getTime();
    return bTime - aTime;
  });

export const countByStatus = (requests) => {
  const list = Array.isArray(requests) ? requests : [];
  const counts = { all: list.length, pending: 0, approved: 0, rejected: 0 };
  list.forEach((request) => {
    counts[requestStatus(request)] += 1;
  });
  return counts;
};

/** `GET /api/addDoctor` -> Map("_id", doctor) for photo + current-value lookups. */
export const indexDoctorsById = (doctors) =>
  new Map(
    (Array.isArray(doctors) ? doctors : [])
      .filter((doctor) => doctor && doctor._id)
      .map((doctor) => [String(doctor._id), doctor])
  );

export const findDoctorForRequest = (request, doctorsById) =>
  (request && doctorsById?.get(String(request.doctorId))) || null;

/** "AN" for "Ashima narula" - the avatar fallback when there is no picture. */
export const nameInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

