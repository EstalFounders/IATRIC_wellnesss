/**
 * Shared service-topic normaliser.
 *
 * Pure module (no imports) on purpose: data/faqs.js is pulled into the SSR
 * bundle through PageStructuredData, so it must not drag in react-redux/axios
 * via useGlobalData.
 *
 * Lower-cases, collapses the UK/US spelling variants and drops every character
 * that differs between the many ways a service is written across the app:
 * DB name "Dermatologist", static name "gynecology & obs", slug
 * "general-physician", URL param "Lab%20Tests".
 */
export const canonicalServiceKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/gynecology/g, "gynaecology")
    .replace(/orthopedics/g, "orthopaedics")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

/**
 * Lab service identity.
 *
 * The lab service is published under several names across the site: "Labtest"
 * (the servicesoffereds MAJOR row that feeds the homepage card), "Lab
 * Investigation" (a second MAJOR row / the departments grid) and "Blood Test &
 * Diagnostics" (the Demo5 highlight). They are one service, so every alias
 * resolves to the same content key and the same display name - "Lab
 * Investigation".
 *
 * Lives in this leaf module (no imports) so the redux globalData slice can use
 * isLabService to drop the duplicate DB rows without pulling in
 * axios/react-redux through customUtils/serviceLinks.
 */
export const LAB_SERVICE_KEY = "lab-test";
export const LAB_SERVICE_NAME = "Lab Investigation";
export const LAB_SERVICE_ALIASES = [
  "labtest",
  "labtests",
  "labinvestigation",
  "labtestanddiagnostics",
  "labtestsanddiagnostics",
  "bloodtestanddiagnostics",
  "bloodtestdiagnostics",
  "diagnostics",
];

/** True when a name, slug or content key refers to the merged lab service. */
export const isLabService = (value) =>
  LAB_SERVICE_ALIASES.includes(canonicalServiceKey(value));

/**
 * Audio / Video consultation identity.
 *
 * Two MAJOR servicesoffereds rows ("Audio", "Video") drive the doctor
 * consultation tiles and their fees on /appointment. The navigation however
 * shows them once, nested under "Book Doctor Consultation" ("Audio
 * Consultation" / "Video Consultation"), so the Quick Links lists drop the
 * standalone rows. Aliases are used so a future DB rename to "Audio
 * Consultation" keeps matching.
 */
export const CONSULTATION_SERVICE_ALIASES = [
  "audio",
  "video",
  "audioconsultation",
  "videoconsultation",
  "audiocall",
  "videocall",
];

/** True when a name or slug points at an online consultation service. */
export const isConsultationService = (value) =>
  CONSULTATION_SERVICE_ALIASES.includes(canonicalServiceKey(value));

/**
 * Services that are published but not bookable yet: they carry the "Coming
 * Soon" tag in the header mega-menu, the mobile drawer and the homepage cards,
 * and their detail page (flag-driven, see ServiceDetailsComponent) shows a
 * coming-soon notice instead of a booking CTA.
 *
 * Bare "medicine" / "pharmacy" are deliberately excluded so the pharmacy
 * module and unrelated medicine names never match.
 */
export const COMING_SOON_SERVICE_ALIASES = [
  ...LAB_SERVICE_ALIASES,
  "medicinedelivery",
  "medicinedeliveryathome",
  "medicinesathome",
  "pharmacydelivery",
];

/** True when a service name or slug is launched-but-not-bookable-yet. */
export const isComingSoonService = (value) =>
  COMING_SOON_SERVICE_ALIASES.includes(canonicalServiceKey(value));
