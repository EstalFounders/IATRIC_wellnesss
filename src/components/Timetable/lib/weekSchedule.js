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
 * One entry per 20-minute slot ("4:20–4:40 PM"), i.e. the real bookable unit.
 *
 * This used to merge consecutive free slots into bands of up to 6 (2 hours), so
 * a day printed "4:20–6:20 PM": patients read that as a two-hour appointment
 * while tapping it only booked its first 20 minutes, and the uneven split of a
 * 33-slot day produced bands ending at :40 ("8:20–10:00 PM"). The grid now
 * labels exactly what it books - same text as the booking form.
 *
 * Elapsed time is the one exception: it is never split, one grey "time passed"
 * entry reads better than a column of dead chips. `maxSlotsPerBlock` is kept as
 * the only knob back to a banded view.
 */
export const groupSlotsIntoBlocks = (
  slots = [],
  now = Date.now(),
  maxSlotsPerBlock = 1
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
