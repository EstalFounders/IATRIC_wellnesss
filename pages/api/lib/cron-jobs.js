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
    let date = new Date(start);
    date.setDate(start.getDate() + i);
    for (let hour = 9; hour < 21; hour += 0.5) {  // Assuming half-hour slots from 9 AM to 9 PM
      slots.push(new Slot({
        doctorId: doctorId,
        startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour),
        endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour + 0.5),
        date: date,
        isBooked: false
      }));
    }
  }
  await Slot.insertMany(slots);
};

export const performScheduledTasks = async () => {
    await dbConnect();

    console.log('Performing scheduled tasks...');
    const today = new Date();
  
    // Retrieve all doctors
    const doctors = await Doctor.find();
    
    // Generate new slots for each doctor
    for (const doctor of doctors) {
      await generateSlotsForDoctor(doctor._id, today, 30);
    }
  
    // After generating new slots, delete old slots
    const result = await Slot.deleteMany({ startTime: { $lt: today } });
    console.log(`${result.deletedCount} old slots were deleted.`);
};

const shouldExecuteTask = () => {
  const today = new Date();
  const diffTime = Math.abs(today - lastExecutionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 24;
};

const startCronJob = () => {
  cron.schedule(
    "0 0 * * *", // Every day at midnight
    async () => {
      if (shouldExecuteTask()) {
        await performScheduledTasks();
        lastExecutionDate = new Date(); // Update last execution date
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
};


export default startCronJob