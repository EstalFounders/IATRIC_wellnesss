// cron-jobs.js
import cron from "node-cron";
import Doctor from "../../../src/models/doctorModel";
import Slot from "../../../src/models/slots";
import mongoose from "mongoose";
import { dbConnect } from "../../../src/lib/db";

let lastExecutionDate = new Date(); // This should ideally be persisted somewhere

const generateSlotsForDoctor = async (doctorId, start, numDays) => {
  let slots = [];

  for (let i = 0; i < numDays; i++) {
    // Create a new date for each day
    let date = new Date(start);
    date.setDate(start.getDate() + i);

    for (let hour = 9; hour < 21; hour++) {
      // Assuming 15-minute slots from 9 AM to 9 PM
      for (let minute = 0; minute < 60; minute += 15) {
        // Create a fresh date object for each slot's start and end time
        const slotStartTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour,
          minute
        );
        const slotEndTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour,
          minute + 15
        );

        slots.push(
          new Slot({
            doctorId: doctorId,
            startTime: slotStartTime,
            endTime: slotEndTime,
            date: new Date(date), // Ensure date remains the same for this day
            isBooked: false,
          })
        );
      }
    }
  }

  await Slot.insertMany(slots);
  console.log(`${slots.length} slots created for doctor with ID: ${doctorId}`);
};

export const performScheduledTasks = async () => {
  await dbConnect();

  console.log("Performing scheduled tasks...");
  const today = new Date();

  // Retrieve all doctors
  const doctors = await Doctor.find();

  // Generate new slots for each doctor
  for (const doctor of doctors) {
    await generateSlotsForDoctor(doctor._id, today, 30);
  }

  // After generating new slots, delete old slots
  const result = await Slot.deleteMany({
    startTime: { $lt: today },
    isBooked: false, // Only delete unbooked slots
  });
  console.log(`${result.deletedCount} old slots were deleted.`);
};

export default performScheduledTasks;
