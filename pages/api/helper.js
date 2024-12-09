// pages/api/sendWhatsAppMessage.js
import Slot from "../../src/models/slots";
import Doctor from "../../src/models/doctorModel";
import { dbConnect } from "../../src/lib/db";

export async function generateSlotsForMonth(doctorId, year, month) {
  let slots = [];
  for (let day = 0; day < days; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);
    for (let hour = 9; hour < 21; hour++) {
      slots.push({
        doctorId: doctorId,
        startTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour
        ),
        endTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour + 0.5
        ),
        isBooked: false,
      });
    }
  }
  await Slot.insertMany(slots);
}

export async function findAvailableDoctorForNow(
  selectedDate,
  genericConsultationType
) {
  await dbConnect();

  console.log(
    genericConsultationType,
    "generic consultation type",
    selectedDate,
    "selected date"
  );

  // Normalize the selectedDate to the nearest 15-minute interval
  const selectedDateObj = new Date(selectedDate);
  const minutes = selectedDateObj.getMinutes();
  const nextSlotTime = new Date(selectedDateObj);

  // Adjust to the next 15-minute slot (round up)
  if (minutes % 15 !== 0) {
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    nextSlotTime.setMinutes(roundedMinutes, 0, 0); // Round to next 15-minute interval
  }

  console.log(nextSlotTime, "nextSlotTime"); // Debug: Next 15-min slot start

  // Find doctors who can provide the requested consultation type
  const doctors = await Doctor.find({
    consultationType: genericConsultationType,
  });

  for (const doctor of doctors) {
    console.log(doctor._id.toString(), "doctor");

    // Find the slot starting from the normalized nextSlotTime
    const availableSlots = await Slot.find({
      doctorId: doctor._id.toString(),
      startTime: { $gte: nextSlotTime },
      isBooked: false,
    }).sort({ startTime: 1 }); // Sort slots by startTime

    // console.log(availableSlots, "available slots");

    // Check if there are two consecutive slots of 15 minutes
    for (let i = 0; i < availableSlots.length - 1; i++) {
      const currentSlot = availableSlots[i];
      const nextSlot = availableSlots[i + 1];

      const currentSlotEndTime = new Date(currentSlot.startTime);
      currentSlotEndTime.setMinutes(currentSlotEndTime.getMinutes() + 15);

      // Ensure the next slot starts immediately after the current slot
      if (
        currentSlotEndTime.getTime() === new Date(nextSlot.startTime).getTime()
      ) {
        return {
          doctor,
          slots: [nextSlot], // Return both consecutive slots
        };
      }
    }
  }

  return ""; // Return an empty result if no suitable doctor/slots are found
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

  // Use the startTime and endTime from the slot object
  const { startTime, endTime } = slot;

  // Find doctors who can provide the requested consultation type

  const doctors = await Doctor.find({
    consultationType: genericConsultationType,
  });
  console.log(doctors[0]._id, "doctors id in helper 85");
  for (const doctor of doctors) {
    // Check for available slots for this doctor within the specific time range
    const availableSlot = await Slot.findOne({
      doctorId: doctor._id,
      startTime: { $gte: new Date(startTime), $lte: new Date(endTime) },
      isBooked: false,
    });
    console.log(availableSlot, "available slot");
    if (availableSlot) {
      return { doctor, slotId: availableSlot }; // Return the first available doctor's ID with an available slot in the specific time range
    }
  }

  return ""; // Return empty if no available doctors are found within the specific time range
}

export async function checkSlotAvailability(doctorId, startDate, endDate) {
  try {
    // Ensure dates are Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find if there is any slot that overlaps with the given time range and is already booked
    const overlappingSlot = await Slot.findOne({
      doctorId: doctorId,
      startTime: { $lt: end },
      endTime: { $gt: start },
      isBooked: true,
    });

    // If there is an overlapping slot, return false
    if (overlappingSlot) {
      console.log(
        `Slot from ${overlappingSlot.startTime} to ${overlappingSlot.endTime} is already booked.`
      );
      return false;
    }

    return true; // No overlapping slots found, slot is available
  } catch (error) {
    console.error("Error checking slot availability:", error);
    throw error; // Rethrow the error or handle it as needed
  }
}

export function createAppointmentMessage(details) {
  return (
    `👩‍⚕️ *Appointment Confirmation*\n\n` +
    `Hello ${details.name},\n\n` +
    `Your upcoming consultation details are as follows:\n` +
    `- *Doctor ID:* ${details.selectedDoctorId}\n` +
    `- *Date:* ${details.selectedDate}\n` +
    `- *Time:* ${details.appointmentTime}\n` +
    `- *Slot:* ${details.selectedSlot}\n` +
    `- *Symptoms:* ${details.symptoms}\n` +
    `- *Consultation Type:* ${details.consultationType}\n` +
    `- *Email:* ${details.email}\n` +
    `- *Contact Number:* ${details.patientNo}\n\n` +
    `Please make sure to be available at the scheduled time. We look forward to assisting you.\n\n` +
    `Best regards,\n` +
    `Iatric Healthcare`
  );
}
