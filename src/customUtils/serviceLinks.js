import { servicesData } from "../../data/services";
import { slugifyService } from "./useGlobalData";
import SERVICE_DESCRIPTIONS from "../../data/serviceDescriptions.json";
// Shared with data/faqs.js so a service resolves to the same topic key on the
// service page, the department page and the FAQ page.
import {
  canonicalServiceKey,
  isComingSoonService,
  isConsultationService,
  isLabService,
  LAB_SERVICE_KEY,
  LAB_SERVICE_NAME,
} from "./serviceKeys";

// Lab and consultation identity (aliases -> one name/key) are defined in the
// leaf module customUtils/serviceKeys and re-exported here so every existing
// import from serviceLinks keeps working.
export {
  isComingSoonService,
  isConsultationService,
  isLabService,
  LAB_SERVICE_KEY,
  LAB_SERVICE_NAME,
};

// Static presentation list (name + optional `service` key that maps to the
// rich content in ServiceDetailsComponent).
const STATIC_SERVICES = servicesData || [];

/** decodeURIComponent that never throws and never returns "undefined". */
const safeDecode = (value) => {
  if (value === undefined || value === null) return "";

  const raw = Array.isArray(value) ? value[0] : value;

  try {
    return decodeURIComponent(String(raw)).replace(/\+/g, " ").trim();
  } catch (error) {
    return String(raw).trim();
  }
};

const matchKey = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// The lab service is published under several names across the site: "Labtest"
// (the servicesoffereds MAJOR row that feeds the homepage card), "Lab
// Investigation" (the departments grid) and "Blood Test & Diagnostics" (the
// Demo5 highlight). They are one service, so every alias resolves to the same
// content key and the same display name - "Lab Investigation". The alias list
// lives in customUtils/serviceKeys (see the import above).

const DESCRIPTION_INDEX = Object.keys(SERVICE_DESCRIPTIONS || {}).reduce(
  (index, key) => {
    index[canonicalServiceKey(key)] = SERVICE_DESCRIPTIONS[key];
    return index;
  },
  {}
);

/** Short, human-readable description for a service name ("" when there is none). */
export const getServiceDescription = (name) =>
  DESCRIPTION_INDEX[
    canonicalServiceKey(isLabService(name) ? LAB_SERVICE_NAME : name)
  ] || "";

/** "general-physician" / "General%20Physician" -> "General Physician". */
export const prettifyServiceParam = (value) => {
  const decoded = safeDecode(value);
  if (!decoded) return "";

  return decoded
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
};

/**
 * Canonical service-detail URL. Always carries the clean service NAME (what the
 * page displays) and, when the service has one, its content key in `Service`
 * (kept for backwards compatibility with older links).
 */
export const serviceDetailsPath = ({ name, title, service } = {}) => {
  const cleanName = String(name || title || "").trim();
  const key = service || slugifyService(cleanName);
  const params = [];

  if (cleanName) params.push(`name=${encodeURIComponent(cleanName)}`);
  if (key) params.push(`Service=${encodeURIComponent(key)}`);

  return params.length
    ? `/service-details?${params.join("&")}`
    : "/service-details";
};

/** Department page URL (used by the speciality dropdowns) - clean name only. */
export const departmentPath = (name) => {
  const cleanName = String(name || "").trim();
  return cleanName
    ? `/department-single?serviceName=${encodeURIComponent(cleanName)}`
    : "/department-single";
};

/**
 * Human-readable service name for a query object.
 * Uses the `name` param, else resolves the `Service` key against the service
 * list, else prettifies whatever was passed (never shows a raw slug or an id).
 */
export const resolveServiceName = (query = {}) => {
  const fromName = safeDecode(query.name);
  // Lab aliases all display as the single merged name.
  if (fromName) return isLabService(fromName) ? LAB_SERVICE_NAME : fromName;

  const raw = safeDecode(query.Service || query.service);
  if (!raw) return "";
  if (isLabService(raw)) return LAB_SERVICE_NAME;

  const key = matchKey(raw);
  const known = STATIC_SERVICES.find(
    (item) => matchKey(item.name) === key || matchKey(item.service) === key
  );

  return known?.name || prettifyServiceParam(raw);
};

/**
 * Key used by ServiceDetailsComponent's content map, derived from whichever
 * param is present ("Nursing Services" -> "nursing-services").
 */
export const resolveServiceKey = (query = {}) => {
  const explicit = safeDecode(query.Service || query.service);
  if (explicit) {
    if (isLabService(explicit)) return LAB_SERVICE_KEY;
    return slugifyService(explicit).replace(/[^a-z0-9-]/g, "");
  }

  const name = safeDecode(query.name);
  if (!name) return "";
  if (isLabService(name)) return LAB_SERVICE_KEY;

  const key = matchKey(name);
  const known = STATIC_SERVICES.find(
    (item) => matchKey(item.name) === key || matchKey(item.service) === key
  );

  return slugifyService(known?.service || name).replace(/[^a-z0-9-]/g, "");
};
