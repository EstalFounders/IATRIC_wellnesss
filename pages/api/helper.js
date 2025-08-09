import Slot from "../../src/models/slots";
import Doctor from "../../src/models/doctorModel";
import { dbConnect } from "../../src/lib/db";
import {
  contact_no,
  DoctorType,
  IN_TWENTY_MINUTES_NOW,
  SERVER_AVAILABLE_SLOTS_CODE,
} from "../../src/constant";
import Appointment from "../../src/models/appointmentSchema";
import {
  getConfirmMessageBody,
  getReminderMessageBodyDoctor,
  getReminderMessageBodyPatient,
} from "./utils/whatsappMessageBodies";
import { extractDate, formatTime } from "../../src/components/helper";
import { formatPhoneNumber } from "./utils/commonmethod";
import { sendWhatsAppConfirmation } from "./lib/communication";
import {
  IS_NOW,
  WHATSAPP_CONFIRMATION_TEMPLATE,
  WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
  WHATSAPP_REMINDER_TEMPLATE_PATIENT,
} from "./utils/constants";

export async function findAvailableDoctorForNow(
  selectedDate,
  genericConsultationType,
  res
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
    doctorType: DoctorType.Company,
  });

  // Step 2: Get all non-company doctors (excluding company ones)
  const nonCompanyDoctors = await Doctor.find({
    consultationType: { $in: [genericConsultationType] },
    doctorType: { $ne: DoctorType.Company },
  });

  let earliestSlotInfo = null;

  let slotsForEarliestDoctor = [];

  async function findEarliestSlotForDoctors(doctors) {
    for (const doctor of doctors) {
      console.log(
        `Checking available slots for doctor ${doctor._id} (${doctor.name})`
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

  console.log(
    "Next slot is not for today, returning next available slots.",
    selectedDateObj.toDateString(),
    earliestSlotInfo,
    earliestSlotInfo.slot.startTime.toDateString()
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
      // Directly return the API result, preventing further processing
    }
  }

  if (earliestSlotInfo) {
    return {
      doctor: earliestSlotInfo.doctor,
      slot: earliestSlotInfo.slot,
    };
  }

  res.status(404).json({ message: "No slots found." });
}

export async function findAvailableDoctorForSpecificTimeSlot(
  selectedDate,
  genericConsultationType,
  slot
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
        `Checking available slots for doctor ${doctor._id} (${doctor.name})`
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
    doctorType: DoctorType.Company,
  });

  let result = await findDoctorWithSlot(companyDoctors);
  if (result) {
    return result;
  }

  // Step 2: If no company doctor is available, find non-company doctors
  let nonCompanyDoctors = await Doctor.find({
    consultationType: { $in: [genericConsultationType] },
    doctorType: { $ne: DoctorType.Company },
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
  res
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
        new Date(slot.startTime).toDateString() !== nextSlotTime.toDateString()
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

    // Find the slot where current time is between start and end, and not booked
    const currentSlot = await Slot.findOne({
      doctorId,
      isBooked: false,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).sort({ startTime: 1 });

    console.log(currentSlot, "current slot");

    if (!currentSlot) {
      throw new Error("No current slot found for this time.");
    }

    // Step 2: Find the next available slot after the current slot’s end time
    const nextSlot = await Slot.findOneAndUpdate(
      {
        doctorId,
        isBooked: false,
        startTime: { $gt: currentSlot.endTime },
      },
      { isBooked: true },
      { new: true }
    );

    console.log(nextSlot, "next slot");

    if (!nextSlot) {
      throw new Error("No next available slot found.");
    }

    selectedSlot = nextSlot;
    // ._id;
  } else {
    // Book the selected slot if it's not already booked
    const updatedSlot = await Slot.findOneAndUpdate(
      { _id: slot._id, doctorId, isBooked: false },
      { isBooked: true },
      { new: true }
    );

    if (!updatedSlot) {
      throw new Error("Selected slot is already booked or not found.");
    }

    selectedSlot = updatedSlot;
    // ._id;
  }

  console.log(slot, "updated slot");

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
    patientMeetingUrl,
    doctorMeetingUrl,
    prescriptionUrl,
  });

  console.log("start time 249", slot, "slot 249");

  const confirmMessageBody = getConfirmMessageBody(
    slot.startTime,
    docName,
    name,
    consultationType,
    contact_no
  );
  const reminderMessageBodyPatient = getReminderMessageBodyPatient(
    docName,
    name,
    formatTime(appointmentTime), // Pass formatted time
    patientMeetingUrl
  );

  const reminderMessageBodyDoctor = getReminderMessageBodyDoctor(
    docName,
    name,
    formatTime(appointmentTime), // Pass formatted time
    doctorMeetingUrl
  );

  const patientMobileNo = appointment.patientMobNo.toString();
  const doctorMobileNumber = doctorMobileNo.toString();

  console.log(
    formatPhoneNumber(doctorMobileNumber),
    doctorMobileNumber,
    "line no 190"
  );
  await sendWhatsAppConfirmation(
    formatPhoneNumber(patientMobileNo),
    confirmMessageBody,
    WHATSAPP_CONFIRMATION_TEMPLATE
  );
  await sendWhatsAppConfirmation(
    formatPhoneNumber(doctorMobileNumber),
    confirmMessageBody,
    WHATSAPP_CONFIRMATION_TEMPLATE
  );

  console.log(
    clientSideAppointmentTime == IS_NOW,
    clientSideAppointmentTime == IN_TWENTY_MINUTES_NOW,
    "WhatsApp confirmation sent to patient and doctor successfully."
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
      WHATSAPP_REMINDER_TEMPLATE_PATIENT
    );
    await sendWhatsAppConfirmation(
      formatPhoneNumber(doctorMobileNumber),
      reminderMessageBodyDoctor,
      WHATSAPP_REMINDER_TEMPLATE_DOCTOR
    );
  }
  return appointment._id;
};
