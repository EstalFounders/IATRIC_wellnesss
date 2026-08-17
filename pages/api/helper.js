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

export async function findAvailableDoctorForNow(
  selectedDate,
  genericConsultationType,
  res,
) {
  await dbConnect();

  const selectedDateObj = new Date(selectedDate);
  const minutes = selectedDateObj.getMinutes();
  const nextSlotTime = new Date(selectedDateObj);

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

  let earliestSlotInfo = null;

  let slotsForEarliestDoctor = [];

  async function findEarliestSlotForDoctors(doctors) {
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
        .limit(3);

      console.log(`Available slots for doctor ${doctor._id}:`, availableSlots);

      if (availableSlots.length > 0) {
        const firstSlot = availableSlots[0];

        if (
          !earliestSlotInfo ||
          new Date(firstSlot.startTime) <
            new Date(earliestSlotInfo.slot.startTime)
        ) {
          earliestSlotInfo = {
            doctor,
            slot: firstSlot,
          };
          slotsForEarliestDoctor = availableSlots;
        }
      }
    }
  }

  // Step 3: First check company doctors
  await findEarliestSlotForDoctors(companyDoctors);

  // Step 4: Then check non-company doctors
  await findEarliestSlotForDoctors(nonCompanyDoctors);

  // Step 5: Return the doctor + slot with earliest start time (from any group)
  // if (earliestSlotInfo) {
  //   return {
  //     doctor: earliestSlotInfo.doctor,
  //     slot: earliestSlotInfo.slot,
  //     additionalSlots: slotsForEarliestDoctor,
  //   };
  // }

  // After the loop, earliestSlotInfo will hold the overall earliest slot across all doctors.
  // Now, determine nextSlots based on the final earliestSlotInfo
  let nextSlots = [];
  if (earliestSlotInfo && slotsForEarliestDoctor.length > 0) {
    // Check if the overall earliest slot is NOT for the selectedDateObj
    if (
      new Date(earliestSlotInfo.slot.startTime).toDateString() !==
      selectedDateObj.toDateString() // Assuming selectedDateObj is a Date object
    ) {
      // If the earliest slot is not today, collect the 2-3 slots from that doctor
      // that we previously stored in slotsForEarliestDoctor
      nextSlots = slotsForEarliestDoctor.map((slot) => ({
        doctorId: earliestSlotInfo.doctor._id, // Use the ID of the doctor with the earliest slot
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
    }
  }

  // Now you can use earliestSlotInfo and nextSlots
  console.log("Overall Earliest Slot Info:", earliestSlotInfo);
  console.log("Next Slots (if not today):", nextSlots);

  // If no slot was found at all, return immediately with a safe response
  if (!earliestSlotInfo) {
    return res.status(404).json({ message: "No slots found." });
  }

  console.log(
    "Next slot is not for today, returning next available slots.",
    selectedDateObj.toDateString(),
    earliestSlotInfo,
    earliestSlotInfo.slot.startTime.toDateString(),
  );

  const earlietslotdate = earliestSlotInfo.slot.date;
  const earlietsDoctor = earliestSlotInfo.doctor;

  // Check if the nextSlotTime is for today
  if (earlietslotdate.toDateString() !== selectedDateObj.toDateString()) {
    console.log(nextSlots, "next slots in helper 111");
    if (nextSlots.length > 0) {
      return res.status(200).json({
        message:
          "No slots available for today. Here are the next available slots.",
        nextSlots: nextSlots,
        status: SERVER_AVAILABLE_SLOTS_CODE,
      });
    }
  }

  if (earliestSlotInfo) {
    return {
      doctor: earliestSlotInfo.doctor,
      slot: earliestSlotInfo.slot,
    };
  }

  return res.status(404).json({ message: "No slots found." });
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
) => {
  await dbConnect();

  const selectedDateObj = new Date(selectedDate.toString());
  const minutes = selectedDateObj.getMinutes();
  const nextSlotTime = new Date(selectedDateObj);

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

  // Step 2: Find available slots for this doctor
  const availableSlots = await Slot.find({
    doctorId: doctor._id.toString(),
    startTime: { $gte: nextSlotTime },
    isBooked: false,
  })
    .sort({ startTime: 1 })
    .limit(3);

  console.log(`Available slots for doctor ${doctor._id}:`, availableSlots);

  // Check if all 3 available slots are for the next day
  if (
    availableSlots.length === 3 &&
    availableSlots.every(
      (slot) =>
        new Date(slot.startTime).toDateString() !== nextSlotTime.toDateString(),
    )
  ) {
    res.status(200).json({
      message:
        "No slots available for today. Here are the next available slots.",
      nextSlots: availableSlots.map((slot) => ({
        doctorId: doctor._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
      status: SERVER_AVAILABLE_SLOTS_CODE,
    });
    return; // Exit early to prevent further processing
  }

  if (availableSlots.length > 0) {
    const firstSlot = availableSlots[0];
    return {
      doctor,
      slot: firstSlot,
    };
  }

  res.status(404).json({ message: "No slots found." });

  // if (availableSlots.length > 0) {
  //   const firstSlot = availableSlots[0];
  //   return {
  //     doctor,
  //     slot: firstSlot,
  //     additionalSlots: availableSlots.slice(1), // Return the rest of the available slots
  //   };
  // }

  // return ""; // Return empty if no available slots are found
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
    patientMeetingUrl: ensureHttps(patientMeetingUrl),
    doctorMeetingUrl: ensureHttps(doctorMeetingUrl),
    prescriptionUrl,
  });

  console.log("start time 249", slot, "slot 249");

  const confirmMessageBody = getConfirmMessageBody(
    slot.startTime,
    docName,
    name,
    consultationType,
    contact_no,
  );
  const formattedReminderDate = extractDate(appointmentTime);
  const formattedReminderTime = formatTime(appointmentTime);

  const reminderMessageBodyPatient = getReminderMessageBodyPatient(
    docName,
    name,
    formattedReminderDate,
    formattedReminderTime,
    patientMeetingUrl,
  );

  const reminderMessageBodyDoctor = getReminderMessageBodyDoctor(
    docName,
    name,
    formattedReminderDate,
    formattedReminderTime,
    doctorMeetingUrl,
  );

  const patientMobileNo = appointment.patientMobNo?.toString() ?? "";
  const doctorMobileNumber = doctorMobileNo?.toString() ?? "";

  console.log(
    formatPhoneNumber(doctorMobileNumber),
    doctorMobileNumber,
    "line no 190",
  );
  await sendWhatsAppConfirmation(
    formatPhoneNumber(patientMobileNo),
    confirmMessageBody,
    WHATSAPP_CONFIRMATION_TEMPLATE,
  );
  await sendWhatsAppConfirmation(
    formatPhoneNumber(doctorMobileNumber),
    confirmMessageBody,
    WHATSAPP_CONFIRMATION_TEMPLATE,
  );

  console.log(
    clientSideAppointmentTime == IS_NOW,
    clientSideAppointmentTime == IN_TWENTY_MINUTES_NOW,
    "WhatsApp confirmation sent to patient and doctor successfully.",
  );

  if (
    clientSideAppointmentTime == IS_NOW ||
    clientSideAppointmentTime == IN_TWENTY_MINUTES_NOW
  ) {
    // Handle immediate appointment
    // await immediateCall(doctorId, patientMobNo, appointment._id);
    await sendWhatsAppConfirmation(
      formatPhoneNumber(patientMobileNo),
      reminderMessageBodyPatient,
      WHATSAPP_REMINDER_TEMPLATE_PATIENT,
    );
    await sendWhatsAppConfirmation(
      formatPhoneNumber(doctorMobileNumber),
      reminderMessageBodyDoctor,
      WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
    );
  }
  return appointment._id;
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
    session = await mongoose.startSession();
    session.startTransaction();
    let docName = doctorName == "" ? null : doctorName;
    let doctorMobileNo = doctorMobileNumber == "" ? null : doctorMobileNumber;
    let doctorId = selectedDoctorId === "" ? null : selectedDoctorId;
    console.log("111");
    let slot = selectedSlot === "" ? null : selectedSlot;

    // Determine current or specific time
    const now = new Date();
    const genericConsultationType = consultationType;
    const meetingId = uuidv4();

    // Find available doctor if needed right now
    if (doctorId && clientSideAppointmentTime == IS_NOW) {
      const result = await checkNbookSelectedDoctorForNow(
        selectedDate,
        doctorId,
        res,
      );
      slot = result ? result.slot : "";
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
    res.status(200).json({ message: "Consultation booked successfully" });
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