// GET /api/slots/fetchWeekSlots?doctorId=<id>&start=YYYY-MM-DD
//
// One week of a doctor's timetable for the public `/timetable` page (reached
// from "View Timetable" on the doctor profile).
//
// `start` is the Monday the week begins on (the page computes it in IST); it is
// read as a UTC calendar day, the same day bucket `/api/slots/fetchSlot` and
// `ManageSlotsModal` use. The 7 days are answered in one request instead of
// seven `fetchSlot` calls.
//
// Every day reports:
//   isWorkDay     - the weekday is listed in `doctor.workDays`
//   isUnavailable - the date is in `doctor.unavailableDates` (doctor blocked it)
//   slots         - `{ startTime, endTime, isBooked }`, sorted by start time
//   generated     - the day had no stored Slot rows and the slots below were
//                   derived from the doctor's configured window
//
// `pages/api/lib/cron-jobs.js` is the only writer of `slots` rows and it skips
// doctors without a slot window, so a doctor can legitimately have an empty
// week. Instead of showing a blank table, those days fall back to the 20-minute
// grid cron would have created from `slotStartTime`/`slotEndTime` - on the same
// clock (getUTC* hours + Date.UTC) so the times match real slots exactly.
import Doctor from "../../../src/models/doctorModel";
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";
import { logErrorToGoogleSheet } from "../helper";
import { parseWorkDays } from "../../../src/customUtils/workDays";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_LENGTH = 7;
const SLOT_MINUTES = 20; // mirrors cron-jobs.js
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const startOfUtcDay = (value) => {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const isoDay = (date) => date.toISOString().slice(0, 10);

/** `slotStartTime` / `slotEndTime` are Dates whose UTC clock is the window. */
const windowMinutes = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

/**
 * The 20-minute slots cron-jobs.js would create for `day`, in the same order and
 * with the same `Date.UTC(...)` clock.
 */
const buildWindowSlots = (doctor, day) => {
  const from = windowMinutes(doctor.slotStartTime);
  const to = windowMinutes(doctor.slotEndTime);
  if (from === null || to === null || from >= to) return [];

  const slots = [];
  for (let minute = from; minute < to; minute += SLOT_MINUTES) {
    const startTime = new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        Math.floor(minute / 60),
        minute % 60
      )
    );
    slots.push({
      startTime,
      endTime: new Date(startTime.getTime() + SLOT_MINUTES * 60000),
      isBooked: false,
    });
  }
  return slots;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  await dbConnect();

  const { doctorId, start } = req.query;
  if (!doctorId) {
    return res
      .status(400)
      .json({ success: false, message: "doctorId is required" });
  }
  if (!/^[0-9a-fA-F]{24}$/.test(String(doctorId))) {
    return res.status(400).json({ success: false, message: "Invalid doctorId" });
  }

  try {
    const doctor = await Doctor.findById(doctorId).select(
      "name expertise workDays unavailableDates slotStartTime slotEndTime"
    );
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const requestedStart = start ? new Date(start) : new Date();
    const weekStart = Number.isNaN(requestedStart.getTime())
      ? startOfUtcDay(new Date())
      : startOfUtcDay(requestedStart);
    const weekEnd = new Date(weekStart.getTime() + WEEK_LENGTH * DAY_MS);

    const storedSlots = await Slot.find({
      doctorId: doctor._id,
      startTime: { $gte: weekStart, $lt: weekEnd },
    })
      .sort("startTime")
      .select("startTime endTime isBooked");

    const slotsByDay = storedSlots.reduce((acc, slot) => {
      const key = isoDay(new Date(slot.startTime));
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: Boolean(slot.isBooked),
      });
      return acc;
    }, {});

    const workDays = parseWorkDays(doctor.workDays);
    // Free-text rows no parser understands ("as per clinic") must not blank the
    // whole week - treat every day as a working day for them.
    const hasWorkDayRule = workDays.length > 0;
    const unavailableDates = doctor.unavailableDates || [];

    const days = [];
    for (let index = 0; index < WEEK_LENGTH; index += 1) {
      const day = new Date(weekStart.getTime() + index * DAY_MS);
      const date = isoDay(day);
      const dayName = DAY_NAMES[day.getUTCDay()];
      const isWorkDay = hasWorkDayRule ? workDays.includes(dayName) : true;
      const isUnavailable = unavailableDates.includes(date);

      const stored = slotsByDay[date] || [];
      const canGenerate = isWorkDay && !isUnavailable && stored.length === 0;
      const slots = canGenerate ? buildWindowSlots(doctor, day) : stored;

      days.push({
        date,
        dayName,
        isWorkDay,
        isUnavailable,
        generated: canGenerate && slots.length > 0,
        slots,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          expertise: doctor.expertise,
          workDays: doctor.workDays,
          slotStartTime: doctor.slotStartTime,
          slotEndTime: doctor.slotEndTime,
        },
        weekStart: isoDay(weekStart),
        days,
      },
    });
  } catch (error) {
    console.error("Failed to fetch week slots:", error);
    await logErrorToGoogleSheet({
      apiName: "fetchWeekSlots - GET",
      errorMessage: error.message || "Failed to fetch week slots",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: {
        doctorId: req.query?.doctorId,
        start: req.query?.start,
      },
    });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
