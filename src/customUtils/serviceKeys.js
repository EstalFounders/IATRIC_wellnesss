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
