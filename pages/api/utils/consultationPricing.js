// pages/api/utils/consultationPricing.js
//
// Where a consultation fee actually comes from - the server-side twin of what
// the booking form displays (src/components/Appointment/AppointmentPage.js):
//
//   * "Any Doctor"  -> the fee of the matching `serviceOffered` row
//                      (Audio / Video / Home visit / Clinic)
//   * a doctor      -> that doctor's own price for the type
//                      (`doctor.consultationType` = [{ name, price }])
//
// Only the consultation types defined in src/constant.js are priced, matched by
// their stable key ("Home Visit" == "Home visit" == "home_visit"), never by raw
// string equality.
//
// The client value is the last resort and is only used when neither source has a
// number, so an older payload/doctor record keeps booking exactly as before.
import mongoose from "mongoose";
import Doctor from "../../../src/models/doctorModel";
import ServiceOffered from "../../../src/models/serviceOffered";
import { superAdminConsultationtype } from "../../../src/constant";
import {
  toConsultationTypeEntries,
  toFee,
  typeKeyFor,
} from "../../../src/utils/consultationFee";

/** Stable keys of the bookable consultation types, in panel order. */
export const CONSULTATION_TYPE_KEYS = superAdminConsultationtype.map((type) =>
  typeKeyFor(type.name),
);

/** True when `value` (name or key) is one of the constant consultation types. */
export const isBookableConsultationType = (value) =>
  CONSULTATION_TYPE_KEYS.includes(typeKeyFor(value));

/**
 * `serviceOffered` holds the consultation modes ("Audio", "Video", "Home visit",
 * "Clinic") next to other MAJOR items (lab tests, packages). Match on the stable
 * key first ("Audio" -> "audio"), then on a containing key so a renamed row such
 * as "Audio consultation" still resolves.
 */
const findServiceForType = (services, consultationType) => {
  const key = typeKeyFor(consultationType);
  if (!key) return null;

  return (
    services.find((service) => typeKeyFor(service.name) === key) ||
    services.find((service) => typeKeyFor(service.name).includes(key)) ||
    null
  );
};

/** The serviceOffered fee for a consultation type, or null when unset. */
export const serviceOfferedFee = async (consultationType) => {
  const key = typeKeyFor(consultationType);
  if (!key) return null;

  const services = await ServiceOffered.find({});
  const active = services.filter((service) => service.isActive !== false);
  const service = findServiceForType(active, consultationType);
  return service ? toFee(service.fee) : null;
};

/** The doctor's own price for a consultation type, or null when unset. */
export const doctorFee = (doctor, consultationType) => {
  const key = typeKeyFor(consultationType);
  if (!key || !doctor) return null;

  const entries = toConsultationTypeEntries(doctor.consultationType);
  const entry = entries.find((item) => typeKeyFor(item.name) === key);
  return entry ? toFee(entry.price) : null;
};

/**
 * The amount to store (and charge) for this booking:
 *   doctor override -> serviceOffered fee -> the client's value -> 0.
 *
 * Never throws: a pricing lookup failure must not stop a valid booking, it just
 * leaves the fee the form sent in place.
 */
export const resolveBookingConsultationPrice = async ({
  doctorId,
  consultationType,
  fallback,
} = {}) => {
  const clientFee = toFee(fallback);

  try {
    const isBookable = isBookableConsultationType(consultationType);
    if (!isBookable) {
      return clientFee === null ? 0 : clientFee;
    }

    if (doctorId && mongoose.isValidObjectId(doctorId)) {
      const doctor = await Doctor.findById(doctorId).select(
        "consultationType",
      );
      const override = doctorFee(doctor, consultationType);
      if (override !== null) return override;
    }

    const serviceFee = await serviceOfferedFee(consultationType);
    if (serviceFee !== null) return serviceFee;
  } catch (error) {
    console.error(
      "Could not resolve the consultation fee, keeping the submitted one:",
      error.message,
    );
  }

  return clientFee === null ? 0 : clientFee;
};

export default resolveBookingConsultationPrice;
