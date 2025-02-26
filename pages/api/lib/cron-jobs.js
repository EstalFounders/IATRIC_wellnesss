// cron-jobs.js
import cron from "node-cron";
import Doctor from "../../../src/models/doctorModel";
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";

const generateSlotsForDoctor = async (doctor, start, numDays) => {
  let slots = [];

  if (!doctor.slotStartTime || !doctor.slotEndTime) {
    console.warn(
      `Doctor ${doctor._id} (${doctor.name}) has no slotStartTime or slotEndTime`
    );
    return;
  }

  // Convert slotStartTime and slotEndTime to UTC to avoid timezone mismatches
  const slotStartTime = new Date(doctor.slotStartTime);
  const slotEndTime = new Date(doctor.slotEndTime);

  const slotStartHour = slotStartTime.getUTCHours(); // Get correct start hour in UTC
  const slotStartMinute = slotStartTime.getUTCMinutes(); // Get correct start minute
  const slotEndHour = slotEndTime.getUTCHours();

  for (let i = 0; i < numDays; i++) {
    let date = new Date(start);
    date.setDate(start.getDate() + i);

    for (let hour = slotStartHour; hour < slotEndHour; hour++) {
      for (
        let minute = hour === slotStartHour ? slotStartMinute : 0;
        minute < 60;
        minute += 20
      ) {
        // Ensure slots start exactly from slotStartTime
        const slotStart = new Date(
          Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hour,
            minute
          )
        );
        const slotEnd = new Date(
          Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hour,
            minute + 20
          )
        );

        slots.push({
          doctorId: doctor._id,
          startTime: slotStart,
          endTime: slotEnd,
          date: new Date(date),
          isBooked: false,
        });
      }
    }
  }

  if (slots.length > 0) {
    await Slot.insertMany(slots);
    console.log(
      `${slots.length} slots created for doctor ${doctor._id} (${doctor.name})`
    );
  }
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
