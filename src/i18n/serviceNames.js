import SERVICE_NAMES from "../../data/serviceNames.json";
import { canonicalServiceKey, isLabService } from "../customUtils/serviceKeys";

/**
 * Localized service names for the homepage cards.
 *
 * `data/serviceNames.json` is the single source of truth: one entry per service
 * id, one name per locale (en / hi). A card title is therefore always a single
 * lookup of ONE locale - the component never concatenates `title` + `t(key)`,
 * which is what produced "English Name + Hindi Name" tiles.
 *
 * Services that live in the shared speciality dictionary (`service.<Name>` in
 * i18n/translations.js, used by Tabs-1 and Demo5Services2) are intentionally not
 * repeated here: the resolver returns null for them and the caller falls back to
 * `t('service.<Name>')`.
 */
const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const LAB_ID = "lab-investigation";

/**
 * DB rows, static titles, content keys and URL slugs are all written
 * differently ("Labtest", "Home care", "nursing-services", "Audio"), so they are
 * normalised with the shared canonicalServiceKey before hitting the catalogue.
 */
const NAME_ID_ALIASES = {
  doctorconsultation: "doctor-consultation",
  consultation: "doctor-consultation",
  medicinedelivery: "medicine-delivery",
  medicinedeliveryathome: "medicine-delivery",
  medicinesathome: "medicine-delivery",
  audio: "audio",
  audioconsultation: "audio",
  audiocall: "audio",
  video: "video",
  videoconsultation: "video",
  videocall: "video",
  labinvestigation: LAB_ID,
  homecare: "home-care",
  nursingcare: "nursing-care",
  nursingservices: "nursing-care",
  corporatehealthcare: "corporate-healthcare",
  healthcamp: "healthcamp",
  communitycare: "community-care",
  physiotherapy: "physiotherapy",
};

/** Catalogue id ("home-care") for any service name/alias, or "" when unknown. */
export const getServiceNameId = (value) => {
  if (value === undefined || value === null) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  // Already a catalogue id: `nameId` from data/services.js.
  if (hasOwn(SERVICE_NAMES, raw)) return raw;

  // Every lab alias (Labtest, Lab Investigation, Blood Test & Diagnostics).
  if (isLabService(raw)) return LAB_ID;

  return NAME_ID_ALIASES[canonicalServiceKey(raw)] || "";
};

/** `{ en, hi }` for a service, or null when it is not in the home-page catalogue. */
export const getServiceNames = (value) => {
  const id = getServiceNameId(value);
  return id && hasOwn(SERVICE_NAMES, id) ? SERVICE_NAMES[id] : null;
};

/**
 * One localized title, or null when the service belongs to the speciality
 * dictionary. `lang` is the LanguageContext value ("en" | "hi"); an unknown or
 * missing locale value falls back to English, never to a concatenation.
 */
export const getServiceTitle = (value, lang) => {
  const names = getServiceNames(value);
  if (!names) return null;
  return names[lang] || names.en;
};

export default getServiceTitle;
