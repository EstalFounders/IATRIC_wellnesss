// doctorProfileSession.js
// The doctor-panel session blob is written by
// pages/api/auth/doctorauthenticatedcomponent.js as
// `sessionStorage[doctor_info_local_storage] = { user: { ...doctor } }`.
//
// Both doctor-facing pages behind that guard read it through this one helper
// (DoctorProfilePage and DoctorContractPage) so the `{ user }` shape and the
// failure handling cannot drift: an unreadable / missing blob returns null and
// the page renders its "please sign in again" state instead of crashing.
import { doctor_info_local_storage } from "../../../../constant";

/** The logged-in doctor from the panel session, or null. */
export function readSessionDoctor() {
  if (typeof window === "undefined") return null;

  try {
    const stored = JSON.parse(sessionStorage.getItem(doctor_info_local_storage));
    // `stored.user` is the doctor document the NextAuth session callback stored;
    // a few older sessions stored the doctor document itself, so accept both.
    const doctor = stored?.user || stored;
    return doctor && typeof doctor === "object" ? doctor : null;
  } catch (error) {
    console.error("Could not read the doctor session:", error);
    return null;
  }
}

export default readSessionDoctor;
