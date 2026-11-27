// utils/doctorSpeciality.js
//
// The speciality names a doctor is listed under. Add Doctor step 2
// ("Qualifications & speciality") writes them into the free-text, comma-joined
// `expertise`; `serviceOffered` is the legacy source and stays empty for doctors
// added while that field is turned off (`SERVICES_OFFERED_ENABLED`), so it is
// only a fallback now. One accessor so the cards and the profile page can never
// disagree about what a doctor specialises in.
import { parseSpecialities } from "../customUtils/doctorSuggestions";

export const doctorSpecialities = (doctor) => {
  const expertise = parseSpecialities(doctor?.expertise);
  if (expertise.length) return expertise;

  return (Array.isArray(doctor?.serviceOffered) ? doctor.serviceOffered : [])
    .map((entry) => (typeof entry === "string" ? entry : entry?.name))
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean);
};

/** One-line label for the public cards ("Cardiology · Diabetology"). */
export const doctorSpecialityLabel = (doctor, separator = " · ") =>
  doctorSpecialities(doctor).join(separator);

export default doctorSpecialities;
