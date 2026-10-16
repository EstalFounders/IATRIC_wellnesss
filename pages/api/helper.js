import mongoose from "mongoose";
import Slot from "../../src/models/slots";
import Doctor from "../../src/models/doctorModel";
import { dbConnect } from "../../src/lib/db";
import {
  contact_no,
  DoctorType,
  IN_TWENTY_MINUTES_NOW,
  SERVER_AVAILABLE_SLOTS_CODE,
  appointment_status,
  development_production_url,
  IS_NOW,
  CHOOSE_TIME,
} from "../../src/constant";
import Appointment from "../../src/models/appointmentSchema";
import Notification from "../../src/models/NotificationSchema";
import {
  getConfirmMessageBody,
  getReminderMessageBodyDoctor,
  getReminderMessageBodyPatient,
} from "./utils/whatsappMessageBodies";
import { extractDate, formatTime } from "../../src/components/helper";
import { formatPhoneNumber } from "./utils/commonmethod";
import { sendWhatsAppConfirmation } from "./lib/communication";
import {
  WHATSAPP_CONFIRMATION_TEMPLATE,
  WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
  WHATSAPP_REMINDER_TEMPLATE_PATIENT,
} from "./utils/constants";
import { sendAdminNotification } from "./lib/sendNotification";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

/**
 * How many alternative slots the "nothing free today" fallback offers. The
 * client renders one card + one direct "Book" button per entry
 * (src/components/Appointment/AvailableSlots.js).
 */
const FALLBACK_SLOT_LIMIT = 3;

/** Same calendar day in the server's timezone - the unit the room books in. */
const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

/**
 * Serialises a Slot document for the fallback list.
 *
 * `_id` is what makes the slot directly bookable: `bookConsultation` locks the
 * row with `Slot.findOneAndUpdate({ _id, doctorId, isBooked: false })`. The
 * doctor fields ride along so the client can book straight from the card
 * without the patient re-picking a doctor.
 */
const toFallbackSlot = (slot, doctor) => ({
  _id: slot._id,
  doctorId: doctor._id,
  doctorName: doctor.name,
  doctorMobileNumber: doctor.mobileNumber,
  startTime: slot.startTime,
  endTime: slot.endTime,
  date: slot.date,
});

export async function findAvailableDoctorForNow(
  selectedDate,
  genericConsultationType,
  res,
  floorTime,
) {
  await dbConnect();

  // `selectedDate` is the client's picked day anchored at 12:00 UTC (= 5:30 PM
  // IST), so it is only kept as a fallback search floor for callers that do not
  // pass `floorTime`. Using it as the floor matched slots hours in the past: an
  // 8:31 PM "Now" booking picked the first free slot after 5:30 PM (6:00 PM).
  // The "is this today?" checks below therefore use `nextSlotTime` (the real
  // clock, rounded up), never this value.
  const selectedDateObj = new Date(selectedDate);
  const searchFrom = floorTime ? new Date(floorTime) : new Date(selectedDateObj);
  const minutes = searchFrom.getMinutes();
  const nextSlotTime = new Date(searchFrom);

  // Round up to the next 20-minute slot
  if (minutes % 20 !== 0) {
    const roundedMinutes = Math.ceil(minutes / 20) * 20;
    nextSlotTime.setMinutes(roundedMinutes, 0, 0);
  }
  nextSlotTime.setMilliseconds(0);

  console.log("Searching slots from:", nextSlotTime);

  // Step 1: Get all company doctors
  const companyDoctors = await Doctor.find({
    consultationType: { $in: [genericConsultationType] },
    doctorType: "Company",
  });

  // Step 2: Get all non-company doctors (excluding company ones)
  const nonCompanyDoctors = await Doctor.find({
    consultationType: { $in: [genericConsultationType] },
    doctorType: "Individual",
  });

  // Every candidate doctor that still has at least one free slot from the
  // search floor onwards.
  const candidates = [];

  async function collectSlotsForDoctors(doctors) {
    for (const doctor of doctors) {
      console.log(
        `Checking available slots for doctor ${doctor._id} (${doctor.name})`,
      );
      const availableSlots = await Slot.find({
        doctorId: doctor._id.toString(),
        startTime: { $gte: nextSlotTime },
        isBooked: false,
      })
        .sort({ startTime: 1 })
        .limit(FALLBACK_SLOT_LIMIT);

      console.log(`Available slots for doctor ${doctor._id}:`, availableSlots);

      if (availableSlots.length > 0) {
        candidates.push({ doctor, slots: availableSlots });
      }
    }
  }

  // Step 3: First check company doctors
  await collectSlotsForDoctors(companyDoctors);

  // Step 4: Then check non-company doctors
  await collectSlotsForDoctors(nonCompanyDoctors);

  // Step 5: A free slot later today satisfies "Now" - book the earliest one.
  // Slots earlier today were already excluded by the `nextSlotTime` floor, so
  // "today" here means "still bookable today".
  const todaysOptions = candidates
    .flatMap(({ doctor, slots }) =>
      slots
        .filter((slot) => isSameDay(slot.startTime, nextSlotTime))
        .map((slot) => ({ doctor, slot })),
    )
    .sort((a, b) => new Date(a.slot.startTime) - new Date(b.slot.startTime));

  if (todaysOptions.length > 0) {
    return {
      doctor: todaysOptions[0].doctor,
      slot: todaysOptions[0].slot,
    };
  }

  // Step 6: Nothing is free today for any doctor - hand the client the next free
  // slots instead of silently booking a future one. Gathered from every
  // candidate doctor and ordered by start time, so a doctor whose only free slot
  // is tomorrow cannot leave the patient with fewer than FALLBACK_SLOT_LIMIT
  // alternatives.
  const nextSlots = candidates
    .flatMap(({ doctor, slots }) =>
      slots.map((slot) => toFallbackSlot(slot, doctor)),
    )
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, FALLBACK_SLOT_LIMIT);

  console.log("Next slots (none left today):", nextSlots);

  if (nextSlots.length === 0) {
    return res.status(404).json({ message: "No slots found." });
  }

  return res.status(200).json({
    message: "No slots available for today. Here are the next available slots.",
    nextSlots,
    status: SERVER_AVAILABLE_SLOTS_CODE,
  });
}

export async function findAvailableDoctorForSpecificTimeSlot(
  selectedDate,
  genericConsultationType,
  slot,
) {
  await dbConnect();

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { startTime, endTime } = slot;

  async function findDoctorWithSlot(doctors) {
    for (const doctor of doctors) {
      console.log(
        `Checking available slots for doctor ${doctor._id} (${doctor.name})`,
      );
      const availableSlot = await Slot.findOne({
        doctorId: doctor._id,
        startTime: { $gte: new Date(startTime), $lte: new Date(endTime) },
        isBooked: false,
      });
      console.log(`Available slot for doctor ${doctor._id}:`, availableSlot);
      if (availableSlot) {
        return { doctor, slotId: availableSlot };
      }
    }
    return null;
  }

  // Step 1: Find company doctors
  let companyDoctors = await Doctor.find({
    consultationType: { $in: [genericConsultationType] },
    doctorType: "Company",
  });

  let result = await findDoctorWithSlot(companyDoctors);
  if (result) {
    return result;
  }

  // Step 2: If no company doctor is available, find non-company doctors
  let nonCompanyDoctors = await Doctor.find({
    consultationType: { $in: [genericConsultationType] },
    doctorType: { $ne: "Individual" },
  });

  result = await findDoctorWithSlot(nonCompanyDoctors);
  if (result) {
    return result;
  }

  // Step 3: If no doctor is available for the specific slot, find the nearest slot
  async function findNearestSlot(doctors) {
    let nearestSlotInfo = null;

    for (const doctor of doctors) {
      const nearestSlot = await Slot.findOne({
        doctorId: doctor._id,
        startTime: { $gte: new Date(startTime) },
        isBooked: false,
      }).sort({ startTime: 1 });

      if (
        nearestSlot &&
        (!nearestSlotInfo ||
          new Date(nearestSlot.startTime) <
            new Date(nearestSlotInfo.slot.startTime))
      ) {
        nearestSlotInfo = { doctor, slot: nearestSlot };
      }
    }

    return nearestSlotInfo;
  }

  // Check for nearest slot among company doctors first
  let nearestSlotInfo = await findNearestSlot(companyDoctors);
  if (nearestSlotInfo) {
    return { doctor: nearestSlotInfo.doctor, slotId: nearestSlotInfo.slot };
  }

  // If no nearest slot is found among company doctors, check non-company doctors
  nearestSlotInfo = await findNearestSlot(nonCompanyDoctors);
  if (nearestSlotInfo) {
    return { doctor: nearestSlotInfo.doctor, slotId: nearestSlotInfo.slot };
  }

  // Step 4: If no slots are found at all, return an empty result
  return "";
}

export const checkNbookSelectedDoctorForNow = async (
  selectedDate,
  doctorId,
  res,
  floorTime,
) => {
  await dbConnect();

  // The slot search must start from the real clock (`floorTime`), not from
  // `selectedDate` - that value is the picked day anchored at 12:00 UTC
  // (= 5:30 PM IST) and is only valid for *day* comparisons below. Searching
  // from it made an 8:31 PM "Now" booking lock the first free slot after
  // 5:30 PM (6:00 PM) and the WhatsApp confirmation quoted that past time.
  const selectedDateObj = new Date(selectedDate.toString());
  const searchFrom = floorTime ? new Date(floorTime) : new Date(selectedDateObj);
  const minutes = searchFrom.getMinutes();
  const nextSlotTime = new Date(searchFrom);

  // Round up to the next 20-minute slot
  if (minutes % 20 !== 0) {
    const roundedMinutes = Math.ceil(minutes / 20) * 20;
    nextSlotTime.setMinutes(roundedMinutes, 0, 0);
  }
  nextSlotTime.setMilliseconds(0);

  console.log("Searching slots from:", nextSlotTime);

  // Step 1: Get the specific doctor by ID
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Step 2: Find free slots for this doctor from the search floor onwards. A few
  // extra rows are fetched so the fallback below can still offer
  // FALLBACK_SLOT_LIMIT slots after the same-day ones are dropped.
  const upcomingSlots = await Slot.find({
    doctorId: doctor._id.toString(),
    startTime: { $gte: nextSlotTime },
    isBooked: false,
  })
    .sort({ startTime: 1 })
    .limit(FALLBACK_SLOT_LIMIT * 2);

  console.log(`Available slots for doctor ${doctor._id}:`, upcomingSlots);

  // "Now" means today: when the doctor is free later today, that slot is booked
  // directly (unchanged behaviour). Slots from earlier today are already gone -
  // `nextSlotTime` is the rounded-up real clock, so the query cannot return them.
  const todaysSlots = upcomingSlots.filter((slot) =>
    isSameDay(slot.startTime, nextSlotTime),
  );

  if (todaysSlots.length === 0) {
    // Nothing left today: answer with the doctor's next free slots instead of
    // silently booking one of them. The caller must not book anything once this
    // response is sent (see the `result.slot === undefined` guard in
    // handlePostConsultation).
    const nextSlots = upcomingSlots
      .slice(0, FALLBACK_SLOT_LIMIT)
      .map((slot) => toFallbackSlot(slot, doctor));

    if (nextSlots.length === 0) {
      res.status(404).json({ message: "No slots found." });
      return;
    }

    res.status(200).json({
      message: "No slots available for today. Here are the next available slots.",
      nextSlots,
      status: SERVER_AVAILABLE_SLOTS_CODE,
    });
    return; // Exit early to prevent further processing
  }

  return {
    doctor,
    slot: todaysSlots[0],
  };
};

export const bookConsultation = async ({ bookConsultationParams }) => {
  console.log("bookConsultationParams in helper", bookConsultationParams);
  const {
    meetingId,
    doctorId,
    slot,
    symptoms,
    name,
    email,
    patientMobNo,
    consultationType,
    consultationprice,
    appointmentTime,
    patientMeetingUrl,
    doctorMeetingUrl,
    prescriptionUrl,
    docName,
    doctorMobileNo,
    clientSideAppointmentTime,
    bookingMode,
  } = bookConsultationParams;

  console.log(slot, "slot", doctorId, "doctor id");
  let selectedSlot = slot ? slot : null; // Ensure selectedSlot is null if not provided
  if (selectedSlot === null) {
    const now = new Date();

    // Find all future slots where startTime >= now, sorted chronologically
    // Try slots in order: if the nearest is booked, move to the next one
    const futureSlots = await Slot.find({
      doctorId,
      isBooked: false,
      startTime: { $gte: now },
    }).sort({ startTime: 1 });

    console.log(futureSlots, "future slots");

    if (!futureSlots || futureSlots.length === 0) {
      throw new Error("No future slots found for this time.");
    }

    // Book the first available future slot (sorted by startTime ascending)
    let bookedSlot = null;
    for (const futureSlot of futureSlots) {
      const updatedSlot = await Slot.findOneAndUpdate(
        { _id: futureSlot._id, doctorId, isBooked: false },
        { isBooked: true },
        { new: true },
      );
      if (updatedSlot) {
        bookedSlot = updatedSlot;
        break; // Successfully booked this slot
      }
    }

    if (!bookedSlot) {
      throw new Error("No available future slots found. All slots are booked.");
    }

    selectedSlot = bookedSlot;
  } else {
    // Defence in depth: a "Now" booking must never lock a slot that has already
    // gone by. The UI allows a client-picked slot up to 20 minutes in the past
    // (see the SELECTED_SLOT_MATCHES_NOW check in AppointmentPage), so only
    // slots older than that are treated as stale.
    const resolvedBookingMode = clientSideAppointmentTime || bookingMode;
    const isNowMode =
      resolvedBookingMode === IS_NOW ||
      resolvedBookingMode === IN_TWENTY_MINUTES_NOW;

    if (
      isNowMode &&
      new Date(slot.startTime).getTime() < Date.now() - 20 * 60 * 1000
    ) {
      throw new Error("Selected slot has already passed.");
    }

    // Book the selected slot if it's not already booked
    const updatedSlot = await Slot.findOneAndUpdate(
      { _id: slot._id, doctorId, isBooked: false },
      { isBooked: true },
      { new: true },
    );

    if (!updatedSlot) {
      throw new Error("Selected slot is already booked or not found.");
    }

    selectedSlot = updatedSlot;
    // ._id;
  }

  console.log(slot, "updated slot");

  // Ensure meeting URLs have https:// prefix before storing
  const ensureHttps = (url) => {
    if (!url || typeof url !== "string") return url;
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  // Step 2: Create the appointment
  const appointment = await Appointment.create({
    meetingId,
    doctorId,
    slotId: slot._id,
    symptoms,
    name,
    email,
    patientMobNo,
    consultationType,
    consultationprice,
    appointmentTime,
    bookingMode: bookingMode || clientSideAppointmentTime || null,
    patientMeetingUrl: ensureHttps(patientMeetingUrl),
    doctorMeetingUrl: ensureHttps(doctorMeetingUrl),
    prescriptionUrl,
  });

  console.log("start time 249", slot, "slot 249");

  // WhatsApp confirmation is NOT sent here anymore.
  // The appointment is created in a PAYMENT_PENDING state and the
  // confirmation message is sent only after the payment has been
  // verified by the backend (see paymentService.confirmAppointmentAfterPayment).
  return appointment;
};

/**
 * Reusable helper to log errors to Google Sheets.
 * Uses the local serviceAccountKey.json file for authentication.
 * Handles connection, row insertion, and error handling internally.
 * Failure to log does not throw - logs to console and returns false.
 *
 * @param {Object} data - Error data object
 * @param {string} data.apiName - Name of the API/endpoint where error occurred
 * @param {string} data.errorMessage - Error message description
 * @param {string} [data.errorCode] - Error code (HTTP status or custom code)
 * @param {Object} [data.requestPayload] - Request payload (will be JSON stringified)
 * @param {Object} [data.responsePayload] - Response payload (will be JSON stringified)
 * @param {string} [data.stackTrace] - Error stack trace
 * @param {string} [data.patientName] - Patient name (if applicable)
 * @param {string} [data.mobileNumber] - Patient mobile number (if applicable)
 * @param {string} [data.doctorName] - Doctor name (if applicable)
 * @param {string} [data.consultationType] - Consultation type (if applicable)
 * @param {string} [data.appointmentDate] - Appointment date (if applicable)
 * @returns {Promise<boolean>} - true if logged successfully, false otherwise
 */
export const logErrorToGoogleSheet = async (data) => {
  try {
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
    const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "ErrorLogs";

    if (!SPREADSHEET_ID) {
      console.error("logErrorToGoogleSheet: GOOGLE_SHEET_ID not configured");
      return false;
    }

    // Load service account key from local JSON file
    const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
    if (!fs.existsSync(serviceAccountPath)) {
      console.error("logErrorToGoogleSheet: serviceAccountKey.json not found at", serviceAccountPath);
      return false;
    }

    const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    // Initialize Google Auth using the service account key file
    // The universe_domain from the key file (googleapis.com) is used as the auth scope
    const serviceAccountAuth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

    await doc.loadInfo();
    let sheet = doc.sheetsByTitle[SHEET_NAME];

    if (!sheet) {
      sheet = await doc.addSheet({
        title: SHEET_NAME,
        headerValues: [
          "Timestamp",
          "Patient Name",
          "Mobile Number",
          "Doctor Name",
          "Consultation Type",
          "Appointment Date",
          "API Endpoint",
          "Error Code",
          "Error Message",
          "Request Payload",
          "Response Payload",
          "Stack Trace",
          "Environment",
        ],
      });
    }

    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      "Patient Name": data.patientName || "",
      "Mobile Number": data.mobileNumber || "",
      "Doctor Name": data.doctorName || "",
      "Consultation Type": data.consultationType || "",
      "Appointment Date": data.appointmentDate || "",
      "API Endpoint": data.apiName || "",
      "Error Code": data.errorCode || "",
      "Error Message": data.errorMessage || "Unknown error",
      "Request Payload": data.requestPayload
        ? (typeof data.requestPayload === "string"
            ? data.requestPayload
            : JSON.stringify(data.requestPayload))
        : "",
      "Response Payload": data.responsePayload
        ? (typeof data.responsePayload === "string"
            ? data.responsePayload
            : JSON.stringify(data.responsePayload))
        : "",
      "Stack Trace": data.stackTrace || "",
      Environment: process.env.NODE_ENV || "development",
    });

    console.log("logErrorToGoogleSheet: Error logged successfully to Google Sheets");
    return true;
  } catch (error) {
    console.error("logErrorToGoogleSheet: Failed to log error to Google Sheets:", error.message);
    // Fail silently - logging failure should not crash the application or affect API response
    return false;
  }
};

/**
 * Handles the entire POST business logic for booking a consultation.
 * Extracted from bookConsultation.js to keep the API route as a thin HTTP shell.
 *
 * Manages doctor discovery, slot booking, appointment creation, WhatsApp notifications,
 * admin notifications, and error logging. Uses a MongoDB transaction for atomicity.
 *
 * @param {Object} reqBody - The parsed HTTP request body
 * @param {Object} res - The Express/Next.js response object (used by sub-helpers for early returns)
 * @returns {Promise<void>} - Sends response directly via `res`
 */
export async function handlePostConsultation(reqBody, res) {
  let session;
  const {
    selectedDoctorId,
    appointmentTime,
    selectedDate,
    selectedSlot,
    symptoms,
    name,
    doctorName,
    doctorMobileNumber,
    email,
    patientMobNo,
    consultationType,
    consultationprice,
  } = reqBody;

  const clientSideAppointmentTime = appointmentTime;

  try {
    console.log(reqBody);
    session = await mongoose.connection.startSession();
    session.startTransaction();
    let docName = doctorName == "" ? null : doctorName;
    let doctorMobileNo = doctorMobileNumber == "" ? null : doctorMobileNumber;
    let doctorId = selectedDoctorId === "" ? null : selectedDoctorId;
    console.log("111");
    let slot = selectedSlot === "" ? null : selectedSlot;

    // Determine current or specific time
    const now = new Date();
    // "Now" bookings must search slots from the real clock. The client's
    // `selectedDate` is the picked day anchored at 12:00 UTC (= 5:30 PM IST),
    // which is only good for *day* comparisons - using it as the search floor
    // made an 8:31 PM booking lock the first free slot after 5:30 PM (6:00 PM),
    // and the WhatsApp confirmation then quoted that already-passed time.
    // "in twenty minutes now" asks for a slot at least 20 minutes out.
    const nowSlotFloor =
      clientSideAppointmentTime === IN_TWENTY_MINUTES_NOW
        ? new Date(now.getTime() + 20 * 60 * 1000)
        : now;
    const genericConsultationType = consultationType;
    const meetingId = uuidv4();

    // Find available doctor if needed right now
    if (doctorId && clientSideAppointmentTime == IS_NOW) {
      const result = await checkNbookSelectedDoctorForNow(
        selectedDate,
        doctorId,
        res,
        nowSlotFloor,
      );
      // The helper answers the fallback itself ("no slots left today" -> next
      // slots, or 404) and then returns nothing. Without this guard the handler
      // kept going with an empty slot, which made `bookConsultation` lock an
      // arbitrary later slot for this doctor *and* write a second response on an
      // already-sent request.
      if (!result || result.slot === undefined) {
        return;
      }
      slot = result.slot;
    }
    if (
      doctorId == null &&
      (clientSideAppointmentTime == IS_NOW ||
        clientSideAppointmentTime == IN_TWENTY_MINUTES_NOW)
    ) {
      const result = await findAvailableDoctorForNow(
        selectedDate,
        genericConsultationType,
        res,
        nowSlotFloor,
      );
      console.log(result, "result 97");

      // Check if findAvailableDoctorForNow already sent a response
      // (e.g. "next 3 available slots" or "no slots found")
      if (
        !result ||
        result.doctor === undefined ||
        result.slot === undefined
      ) {
        // Response was already sent by findAvailableDoctorForNow (e.g. nextSlots response)
        // The function returned early with res.status().json(), so just exit the handler
        return;
      }

      console.log(
        result.doctor._id.toString(),
        "result doctor id",
        result.slot,
        "result slots",
      );
      doctorId = result ? result.doctor._id.toString() : "";
      docName = result ? result.doctor.name : "";
      doctorMobileNo = result ? result.doctor.mobileNumber : "";
      slot = result ? result.slot : "";
      if (!doctorId) {
        throw new Error("No available doctors at the selected time");
      }
    }

    // Find available doctor if needed at specific time
    if (doctorId == null && appointmentTime == CHOOSE_TIME) {
      const result = await findAvailableDoctorForSpecificTimeSlot(
        selectedDate,
        genericConsultationType,
        selectedSlot,
      );
      console.log(result, "result 111");
      docName = result.doctor.name;
      doctorMobileNo = result.doctor.mobileNumber;
      doctorId = result.doctor;
      slot = result.slotId;
      console.log(doctorId, "doctorid for specific time", slot, "slot");
      if (!doctorId && !slot) {
        throw new Error("No available doctors at the selected time");
      }
    }

    let patientMeetingUrl, doctorMeetingUrl;
    patientMeetingUrl = `${development_production_url}/meeting/patient/${meetingId}`;
    doctorMeetingUrl = `${development_production_url}/meeting/doctor/${meetingId}`;

    const bookConsultationParams = {
      meetingId,
      doctorId,
      slot,
      symptoms,
      name,
      email,
      patientMobNo,
      consultationType,
      consultationprice,
      appointmentTime: slot.startTime,
      status: appointment_status.open,
      patientMeetingUrl: patientMeetingUrl,
      doctorMeetingUrl: doctorMeetingUrl,
      prescriptionUrl: "",
      docName: docName,
      doctorMobileNo: doctorMobileNo,
      doctorId: doctorId,
      clientSideAppointmentTime: clientSideAppointmentTime,
      bookingMode: clientSideAppointmentTime,
    };

    console.log(meetingId, "meeting id");

    let result;
    // Handle consultation types
    switch (consultationType) {
      case "Audio":
      case "Video":
        // Store appointment details
        result = await bookConsultation({ bookConsultationParams });
        break;
      case "Home visit":
      case "Clinic":
        // Simply book the consultation
        // Store appointment details
        result = await bookConsultation({ bookConsultationParams });
        break;

      default:
        return res.status(400).json({
          message: "Invalid consultation type.",
        });
    }
    await Notification.create({
      title: "consultation-request",
      body: `Patient ${name} booked a ${consultationType} consultation.`,
      read: false,
    });
    try {
      await sendAdminNotification({
        title: "Consultation Booked",
        body: `Patient ${name} has booked a ${consultationType} consultation`,
      });
    } catch (notifErr) {
      console.error("FCM push notification failed:", notifErr.message);
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      message: "Consultation booked successfully",
      appointmentId: result?._id ? String(result._id) : undefined,
      amount: result?.consultationprice,
      consultationType,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Booking error:", error);
    // Log error to Google Sheets with full context
    await logErrorToGoogleSheet({
      apiName: "bookConsultation - POST",
      errorMessage: error.message || "Booking failed",
      errorCode: error.code || "500",
      stackTrace: error.stack,
      patientName: name || "",
      mobileNumber: patientMobNo || "",
      doctorName: doctorName || "",
      consultationType: consultationType || "",
      appointmentDate: selectedDate || "",
      requestPayload: {
        selectedDoctorId,
        appointmentTime,
        selectedDate,
        selectedSlot,
        symptoms,
        name,
        doctorName,
        patientMobNo,
        consultationType,
        consultationprice,
      },
      responsePayload: {
        message: "All doctor are busy right now, No slot is available",
      },
    });
    res.status(200).json({
      message: "All doctor are busy right now, No slot is available",
    });
  }
}