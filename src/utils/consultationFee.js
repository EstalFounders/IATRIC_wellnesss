// consultationFee.js
// The single place that answers "what does this consultation cost?".
//
// Two levels of pricing exist:
//   1. the type default  - ConsultationFees.fee, one optional number per type
//   2. the doctor override - a DoctorConsultationFee row for that doctor + type
// and the resolution order is: override -> type default -> ₹0.
//
// The last step is deliberate: a consultation with *no* fee configured anywhere
// is FREE and still bookable (the brief: "some cases may not have any fees at
// times"), so ₹0 is a normal answer, never an error.
//
// Type identity is always the stable `key` ("audio", "video", "clinic",
// "home_visit", "other", ...), never the display name, because the name is
// editable copy ("Other" -> "Diet advice"). `typeKeyFor()` translates the legacy
// vocabulary ("Call", "Audio", "Video", "Home Visit", ...) that older
// appointment and doctor documents still carry.

export const CONSULTATION_TYPE_KEY = {
  AUDIO: "audio",
  VIDEO: "video",
  CLINIC: "clinic",
  HOME_VISIT: "home_visit",
  OTHER: "other",
};

// The five types the panel seeds. `legacyNames` is the vocabulary already stored
// across the app (doctor docs carry "Audio"/"Video"/"Clinic"/"Home visit", the
// old ConsultationFees rows carried "Call"/"Home Visit", the booking form used
// "Audio"/"Video") - every one of them resolves to the same key.
export const SYSTEM_CONSULTATION_TYPES = [
  {
    key: CONSULTATION_TYPE_KEY.AUDIO,
    name: "Audio call consultation",
    sortOrder: 10,
    legacyNames: ["call", "audio", "audio call", "audio consultation"],
  },
  {
    key: CONSULTATION_TYPE_KEY.VIDEO,
    name: "Video call consultation",
    sortOrder: 20,
    legacyNames: ["video", "video call", "video consultation"],
  },
  {
    key: CONSULTATION_TYPE_KEY.CLINIC,
    name: "Clinic visit",
    sortOrder: 30,
    legacyNames: ["clinic", "clinic visit", "clinic consultation"],
  },
  {
    key: CONSULTATION_TYPE_KEY.HOME_VISIT,
    name: "Home visit",
    sortOrder: 40,
    legacyNames: ["home visit", "home_visit", "homevisit", "doctor home visit"],
  },
  {
    key: CONSULTATION_TYPE_KEY.OTHER,
    name: "Other",
    sortOrder: 50,
    legacyNames: ["other", "others", "custom"],
  },
];

/**
 * Coerce anything the admin (or an old document) hands us into a fee, or null.
 * `null` means "no fee recorded here" - it is *not* the same as ₹0, because the
 * resolution order keeps falling through to the next level.
 */
export const toFee = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
};

/**
 * legacy name / existing key -> stable key. Unknown values are slugified so a
 * custom type ("Diet advice") still maps to a stable "diet_advice"-shaped key.
 */
export const typeKeyFor = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";

  const system = SYSTEM_CONSULTATION_TYPES.find(
    (type) => type.key === normalized || type.legacyNames.includes(normalized)
  );
  if (system) return system.key;

  return normalized.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
};

/**
 * The pricing contract: per-doctor override, else the type default, else ₹0.
 * Always returns a finite number >= 0 so callers never have to guard for
 * "no fee" themselves.
 */
export const resolveFee = ({ doctorFee, type } = {}) => {
  const override = toFee(doctorFee);
  if (override !== null) return override;

  const fallback = toFee(type?.fee);
  return fallback === null ? 0 : fallback;
};

/**
 * Display copy for a resolved amount: ₹199, or "Free" when the consultation
 * resolves to ₹0, or a dash when there is nothing to show at all.
 */
export const formatFee = (value) => {
  const numeric = toFee(value);
  if (numeric === null) return "—";
  return numeric === 0 ? "Free" : `₹${numeric}`;
};
