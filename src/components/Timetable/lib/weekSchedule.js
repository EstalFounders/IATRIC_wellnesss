// Date + slot helpers for the public `/timetable` week grid.
//
// Everything that names a calendar day is pinned to a UTC calendar day, because
// `/api/slots/fetchWeekSlots` (and `/api/slots/fetchSlot`) bucket slot rows by
// the UTC day of `startTime`. The clock the patient reads is still IST, via
// `formatTime` (src/components/helper.js) - the same pair of conventions the
// appointment page uses, so a slot shown here is labelled exactly like it is in
// the booking form.

const IST_TIME_ZONE = "Asia/Kolkata";

const istDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: IST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const istClockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const SLOT_STATUS = {
  AVAILABLE: "available",
  BOOKED: "booked",
  PAST: "past",
};

/** Today in IST as `YYYY-MM-DD` (the day the doctor's panel edits). */
export const istTodayIso = (now = new Date()) => istDayFormatter.format(now);

/** The IST calendar day (`YYYY-MM-DD`) a slot starts on. */
export const istDateOf = (value) => istDayFormatter.format(new Date(value));

/**
 * The IST clock time (`HH:MM`, 24h) a slot starts at. Together with `istDateOf`
 * this is the `?date=&time=` pair the timetable hands to `/appointment`, where
 * the booking form rebuilds the same instant (IST is a fixed +05:30 offset).
 */
export const istTimeOf = (value) => istClockFormatter.format(new Date(value));

export const addDaysIso = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Monday of the week `iso` falls in (`getUTCDay()` is 0 on Sunday). */
export const mondayOfIso = (iso) => addDaysIso(iso, -((new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7));

export const isoWeekday = (iso) => weekdayFormatter.format(new Date(`${iso}T00:00:00Z`));

export const isoShortDate = (iso) => shortDateFormatter.format(new Date(`${iso}T00:00:00Z`));

export const isoLongDate = (iso) => longDateFormatter.format(new Date(`${iso}T00:00:00Z`));

/** "10 Nov 2026 - 16 Nov 2026" for the week that starts on `startIso`. */
export const weekRangeLabel = (startIso) =>
  `${isoLongDate(startIso)} - ${isoLongDate(addDaysIso(startIso, 6))}`;

/** Booked wins over the clock: a booked slot never becomes "available" again. */
export const slotStatus = (slot, now = Date.now()) => {
  if (slot.isBooked) return SLOT_STATUS.BOOKED;
  const end = new Date(slot.endTime).getTime();
  if (Number.isFinite(end) && end <= now) return SLOT_STATUS.PAST;
  return SLOT_STATUS.AVAILABLE;
};

/**
 * Collapses the 20-minute grid into readable bands ("09:00 am - 11:00 am,
 * Available, 6 slots"). Consecutive slots merge only when they share a status
 * and touch end-to-start, so a booked stretch always breaks the run.
 *
 * Long live runs are split into balanced bands of at most `maxSlotsPerBlock`
 * (6 slots = 2 hours), otherwise a 15-hour day would print as one single line.
 * Elapsed time is never split: one grey "time passed" band is easier to scan.
 */
export const groupSlotsIntoBlocks = (
  slots = [],
  now = Date.now(),
  maxSlotsPerBlock = 6
) => {
  const runs = slots.reduce((acc, slot) => {
    const status = slotStatus(slot, now);
    const last = acc[acc.length - 1];
    const touches =
      last && new Date(last.endTime).getTime() === new Date(slot.startTime).getTime();

    if (last && last.status === status && touches) {
      last.slots.push(slot);
      last.endTime = slot.endTime;
      return acc;
    }

    acc.push({
      status,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slots: [slot],
    });
    return acc;
  }, []);

  return runs.reduce((blocks, run) => {
    const parts =
      run.status === SLOT_STATUS.PAST
        ? 1
        : Math.max(1, Math.ceil(run.slots.length / maxSlotsPerBlock));
    const base = Math.floor(run.slots.length / parts);
    let extra = run.slots.length - base * parts;
    let index = 0;

    for (let part = 0; part < parts; part += 1) {
      const size = base + (extra > 0 ? 1 : 0);
      if (extra > 0) extra -= 1;
      const chunk = run.slots.slice(index, index + size);
      index += size;
      blocks.push({
        status: run.status,
        startTime: chunk[0].startTime,
        endTime: chunk[chunk.length - 1].endTime,
        count: chunk.length,
      });
    }

    return blocks;
  }, []);
};

/** `{ available, booked, past }` counts for one day. */
export const countSlotsByStatus = (slots = [], now = Date.now()) =>
  slots.reduce(
    (counts, slot) => {
      counts[slotStatus(slot, now)] += 1;
      return counts;
    },
    { available: 0, booked: 0, past: 0 }
  );
