// Slot generation for a single doctor.
//
// Extracted from `pages/api/lib/cron-jobs.js` so the same code runs in three
// places: the 00:00 cron (7-day rolling window for every doctor), "Add Doctor"
// and the sheet import. Without this, a newly created doctor had no rows in
// `slots` until the next midnight run and simply could not be booked - the panel
// showed an empty day, which looked like a doctor/profile problem.
//
// The window written is derived from the doctor's `slotStartTime`/`slotEndTime`,
// read as a UTC clock (the Add Doctor form stores the picked time as UTC).
import Slot from "../models/slots";

/** Length of one bookable slot, mirrored by `/api/slots/fetchWeekSlots`. */
export const SLOT_MINUTES = 20;

/** How many days ahead the rolling window is kept. */
export const SLOT_WINDOW_DAYS = 7;

/**
 * Upserts the 20-minute slots of one doctor for `numDays` days starting `start`.
 *
 * Idempotent: the unique (doctorId, startTime) index plus `$setOnInsert` mean a
 * re-run (cron after add, two overlapping runs, a run racing a booking) inserts
 * only what is missing and never touches a booked slot.
 *
 * Never throws for a doctor that cannot be scheduled (no window, or an end time
 * before the start time) - it warns and returns 0, so one bad document cannot
 * break a batch run.
 */
export async function generateSlotsForDoctor(
  doctor,
  start = new Date(),
  numDays = SLOT_WINDOW_DAYS
) {
  const slots = [];

  // Validate required fields
  if (!doctor.slotStartTime || !doctor.slotEndTime) {
    console.warn(
      `Doctor ${doctor._id} (${doctor.name}) has no slotStartTime or slotEndTime`
    );
    return 0;
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
    return 0;
  }

  // Generate slots for specified number of days
  for (let i = 0; i < numDays; i += 1) {
    const date = new Date(start.getTime() + i * 86400000);

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

      // Create end time (SLOT_MINUTES later)
      const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60000);

      slots.push({
        doctorId: doctor._id,
        startTime: slotStart,
        endTime: slotEnd,
        date: new Date(date),
        isBooked: false,
      });

      // Move to next interval
      currentMinute += SLOT_MINUTES;
    }
  }

  // Insert only what is missing, in a single atomic upsert per slot. The old
  // "findOne then create" pair was a race: two runs (or a run overlapping a
  // booking) could both see "no row" and insert two rows for the same instant.
  // The unique (doctorId, startTime) index makes the second upsert a no-op.
  let inserted = 0;
  for (const slot of slots) {
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
  return inserted;
}
