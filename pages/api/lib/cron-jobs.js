// cron-jobs.js
import cron from "node-cron";
import mongoose from "mongoose";
import Doctor from "../../../src/models/doctorModel";
import Slot from "../../../src/models/slots";
import Appointment from "../../../src/models/appointmentSchema";
import Payment from "../../../src/models/paymentSchema";
import { dbConnect } from "../../../src/lib/db";
import { appointment_status } from "../../../src/constant";
import { releaseSlotForAppointment } from "../../../src/lib/paymentService";

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

  // Insert only what is missing, in a single atomic upsert per slot. The old
  // "findOne then create" pair was a race: two runs (or a run overlapping a
  // booking) could both see "no row" and insert two rows for the same instant.
  // The unique (doctorId, startTime) index makes the second upsert a no-op.
  let inserted = 0;
  for (let slot of slots) {
    const { doctorId, startTime, ...rest } = slot;
    // The equality keys below are copied into the inserted document by MongoDB
    // itself, so only the remaining fields are in `$setOnInsert`.
    const result = await Slot.updateOne(
      { doctorId, startTime },
      { $setOnInsert: rest },
      { upsert: true }
    );

    if (result.upsertedCount) inserted += 1;
  }

  console.log(
    `${slots.length} slots generated for doctor ${doctor._id} (${doctor.name}), ${inserted} new`
  );
};

/**
 * Slots held by a booking whose payment was never even started would stay blocked
 * forever: the appointment is created with the slot already locked, and only a
 * payment failure/cancel event (or a cancellation in the panel) releases it.
 * Any such hold older than STALE_HOLD_MINUTES is handed back here, so an
 * abandoned checkout cannot take a doctor's time off the market for good.
 *
 * Only appointments with NO payment record are touched. Once a Cashfree order
 * exists the payment flow owns the outcome (failure/cancel releases the slot,
 * success re-acquires it - see paymentService), so an in-flight checkout is
 * never disturbed here.
 */
const STALE_HOLD_MINUTES = 30;

const releaseStaleHolds = async (now) => {
  // Appointments carry no timestamps, so the creation time is read off the
  // ObjectId (it is the first 4 bytes).
  const cutoff = new Date(now.getTime() - STALE_HOLD_MINUTES * 60 * 1000);
  const cutoffId = mongoose.Types.ObjectId.createFromTime(
    Math.floor(cutoff.getTime() / 1000),
  );

  const staleHolds = await Appointment.find({
    _id: { $lt: cutoffId },
    status: {
      $in: [
        new RegExp(appointment_status.open, "i"),
        new RegExp(appointment_status.pending, "i"),
      ],
    },
  })
    .select("_id slotId")
    .limit(200);

  let released = 0;
  for (const appointment of staleHolds) {
    if (!appointment.slotId) continue;

    const paymentStarted = await Payment.exists({
      appointmentId: appointment._id,
    });
    if (paymentStarted) continue;

    await releaseSlotForAppointment({ appointmentId: appointment._id });
    released += 1;
  }

  if (released > 0) {
    console.log(`${released} stale slot hold(s) released.`);
  }
};

const performScheduledTasks = async () => {
  await dbConnect();

  console.log("Performing scheduled tasks...");
  const today = new Date();

  // Hand back slots held by abandoned bookings before generating new ones, so a
  // dropped checkout does not keep a doctor's time blocked.
  await releaseStaleHolds(today);

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
