import Doctor from "../../../src/models/doctorModel";
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";
import { defaultPinPermissions } from "stream-chat-react";

const generateSlotsForDoctor = async (doctorId, startTime, endTime, date) => {
  let slots = [];
  let currentTime = new Date(date);
  currentTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
  
  const endDateTime = new Date(date);
  endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

  while (currentTime < endDateTime) {
    let slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(currentTime.getMinutes() + 20);

    slots.push(
      new Slot({
        doctorId,
        startTime: new Date(currentTime),
        endTime: new Date(slotEndTime),
        date: new Date(date),
        isBooked: false,
      })
    );

    currentTime = new Date(slotEndTime);
  }

  await Slot.insertMany(slots);
  console.log(`${slots.length} slots created for doctor ID: ${doctorId}`);
};

export const generateDoctorSlots = async () => {
  await dbConnect();
  
  console.log("Deleting all unbooked slots...");
  const deleteResult = await Slot.deleteMany({ isBooked: false });
  console.log(`${deleteResult.deletedCount} unbooked slots deleted.`);

  console.log("Generating new slots...");
  const doctors = await Doctor.find();

  for (const doctor of doctors) {
    if (doctor.slotStartTime && doctor.slotEndTime) {
      await generateSlotsForDoctor(
        doctor._id,
        new Date(doctor.slotStartTime),
        new Date(doctor.slotEndTime),
        new Date()
      );
    }
  }

  console.log("Slot generation completed.");
};

export default generateDoctorSlots()