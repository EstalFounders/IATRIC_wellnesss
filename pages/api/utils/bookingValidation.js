// pages/api/utils/bookingValidation.js
//
// Server-side mirror of the rules the booking form already enforces in the
// browser (src/components/Appointment/AppointmentPage.js,
// Appointmentform.js). The API is reachable directly, so the same rules have to
// be re-checked here: a slot must never be locked, and an appointment must never
// be created, on input the form itself would have refused. The rules are kept
// deliberately identical to the client ones, so nothing the UI allows is
// rejected here.
import {
  CHOOSE_TIME,
  IN_TWENTY_MINUTES_NOW,
  IS_NOW,
} from "../../../src/constant";

/** The consultation types `handlePostConsultation` knows how to book. */
export const BOOKABLE_CONSULTATION_TYPES = [
  "Audio",
  "Video",
  "Home visit",
  "Clinic",
];

/** The literal booking modes the frontend sends (`appointmentTime`). */
export const BOOKING_MODES = [IS_NOW, IN_TWENTY_MINUTES_NOW, CHOOSE_TIME];

// Same rule as `isMobileValid` in src/helper.js (exactly 10 digits).
const MOBILE_PATTERN = /^[0-9]{10}$/;

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 120;
const MAX_SYMPTOMS_LENGTH = 1000;

const asText = (value) =>
  value === undefined || value === null ? "" : String(value);

/**
 * Trims/normalises the fields the booking flow stores. Kept separate from
 * validation so callers can persist the normalised values.
 */
export const normalizeBookingPayload = (body = {}) => {
  const rawPrice = body.consultationprice;
  const hasPrice = !(rawPrice === undefined || rawPrice === null || rawPrice === "");
  const price = hasPrice ? Number(rawPrice) : null;

  return {
    ...body,
    name: asText(body.name)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_NAME_LENGTH),
    email: asText(body.email).trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH),
    patientMobNo: asText(body.patientMobNo).replace(/\s+/g, ""),
    symptoms: asText(body.symptoms).trim().slice(0, MAX_SYMPTOMS_LENGTH),
    consultationType: asText(body.consultationType).trim(),
    consultationprice: Number.isNaN(price) ? NaN : price,
  };
};

/**
 * @returns {{ ok: boolean, message: string, payload: object }} `message` is the
 * first problem found, phrased for the patient (the booking form renders the
 * API's `message` verbatim).
 */
export function validateBookingPayload(body) {
  const payload = normalizeBookingPayload(body);
  const problems = [];

  if (!payload.name) {
    problems.push("Please enter the patient name.");
  }

  if (!MOBILE_PATTERN.test(payload.patientMobNo)) {
    problems.push("Please enter 10 digit in mobile number");
  }

  if (!payload.symptoms) {
    problems.push("Please describe the symptoms.");
  }

  if (!BOOKABLE_CONSULTATION_TYPES.includes(payload.consultationType)) {
    problems.push("Invalid consultation type.");
  }

  if (!BOOKING_MODES.includes(payload.appointmentTime)) {
    problems.push("Please select when you want the consultation.");
  }

  // `consultationprice` is required by the appointment schema; a non-numeric
  // value would otherwise surface as a generic "all doctors busy" error.
  if (Number.isNaN(payload.consultationprice)) {
    problems.push("Invalid consultation fee.");
  }

  // Optional for "Now" bookings, but it must be a real date when sent.
  if (payload.selectedDate) {
    const day = new Date(payload.selectedDate);
    if (Number.isNaN(day.getTime())) {
      problems.push("Invalid appointment date.");
    }
  }

  // The slot lock is keyed on `selectedSlot._id` and re-checked against its
  // `startTime`, so a malformed slot is rejected before anything is written.
  if (payload.selectedSlot) {
    const slotStart =
      typeof payload.selectedSlot === "object"
        ? new Date(payload.selectedSlot.startTime)
        : null;
    if (!slotStart || Number.isNaN(slotStart.getTime())) {
      problems.push("Invalid time slot.");
    }
  }

  return {
    ok: problems.length === 0,
    message: problems[0] || "",
    payload,
  };
}

export default validateBookingPayload;
