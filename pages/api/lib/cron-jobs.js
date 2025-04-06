// cron-jobs.js
import cron from "node-cron";
import Doctor from "../../../src/models/doctorModel";
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";

const generateSlotsForDoctor = async (doctor, start, numDays) => {
  let slots = [];

  // Validate required fields
  if (!doctor.slotStartTime || !doctor.slotEndTime) {
    console.warn(
      `Doctor ${doctor._id} (${doctor.name}) has no slotStartTime or slotEndTime`
    );
    return;
  }

  const slotStartTime = new Date(doctor.slotStartTime);
  const slotEndTime = new Date(doctor.slotEndTime);

  // Get start/end times in minutes from midnight
  const slotStartMinutes =
    slotStartTime.getUTCHours() * 60 + slotStartTime.getUTCMinutes();
  const slotEndMinutes =
    slotEndTime.getUTCHours() * 60 + slotEndTime.getUTCMinutes();

  // Validate time range
  if (slotStartMinutes >= slotEndMinutes) {
    console.warn(
      `Invalid time range for doctor ${doctor._id}: Start (${slotStartTime}) must be before End (${slotEndTime})`
    );
    return;
  }

  // Generate slots for specified number of days
  for (let i = 0; i < numDays; i++) {
    let date = new Date(start.getTime() + i * 86400000);

    // Calculate first available slot minute for today
    let currentMinute = slotStartMinutes;

    while (currentMinute < slotEndMinutes) {
      // Create start time for this slot
      const slotStart = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          Math.floor(currentMinute / 60),
          currentMinute % 60
        )
      );

      // Create end time (20 minutes later)
      const slotEnd = new Date(slotStart.getTime() + 20 * 60000);

      slots.push({
        doctorId: doctor._id,
        startTime: slotStart,
        endTime: slotEnd,
        date: new Date(date),
        isBooked: false,
      });

      // Move to next 20-minute interval
      currentMinute += 20;
    }
  }

  // Prevent duplicates before inserting into DB
  for (let slot of slots) {
    const existingSlot = await Slot.findOne({
      doctorId: slot.doctorId,
      startTime: slot.startTime,
    });

    if (!existingSlot) {
      await Slot.create(slot);
    }
  }

  console.log(
    `${slots.length} slots created for doctor ${doctor._id} (${doctor.name})`
  );
};

const performScheduledTasks = async () => {
  await dbConnect();

  console.log("Performing scheduled tasks...");
  const today = new Date();

  // Retrieve all doctors
  const doctors = await Doctor.find();

  // Generate new slots for each doctor
  for (const doctor of doctors) {
    await generateSlotsForDoctor(doctor, today, 7);
  }

  // After generating new slots, delete old slots
  const result = await Slot.deleteMany({
    startTime: { $lt: today },
    isBooked: false, // Only delete unbooked slots
  });
  console.log(`${result.deletedCount} old slots were deleted.`);
};

export default performScheduledTasks;

