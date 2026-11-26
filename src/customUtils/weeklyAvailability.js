import { WORK_DAYS, parseWorkDays } from "./workDays";

export const DEFAULT_RANGE = { startTime: "09:00", endTime: "22:00" };
export const MINUTES = { min: 7 * 60, max: 22 * 60 };

const DAY_INDEX = Object.fromEntries(WORK_DAYS.map((day, index) => [day, index]));
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const timeToMinutes = (value) => {
  if (!TIME_PATTERN.test(String(value || ""))) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const canonicalDay = (value) => {
  const normalized = String(value || "").toLowerCase();
  return WORK_DAYS.find((day) => day.toLowerCase() === normalized) || null;
};

export const normalizeWeeklyAvailability = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const day = canonicalDay(entry?.day);
      if (!day) return null;
      const ranges = Array.isArray(entry.ranges)
        ? entry.ranges.map((range) => ({
            startTime: String(range?.startTime || ""),
            endTime: String(range?.endTime || ""),
          }))
        : [];
      return { day, ranges };
    })
    .filter(Boolean)
    .sort((a, b) => DAY_INDEX[a.day] - DAY_INDEX[b.day]);
};

export const validateWeeklyAvailability = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return "Select at least one workday with a time range.";
  }
  const seenDays = new Set();
  for (const entry of value) {
    const day = canonicalDay(entry?.day);
    if (!day || seenDays.has(day)) return "Availability contains an invalid or duplicate day.";
    seenDays.add(day);
    if (!Array.isArray(entry.ranges) || entry.ranges.length === 0) {
      return `${day} must have at least one time range.`;
    }
    const ranges = entry.ranges
      .map((range) => ({ ...range, start: timeToMinutes(range?.startTime), end: timeToMinutes(range?.endTime) }))
      .sort((a, b) => (a.start ?? -1) - (b.start ?? -1));
    for (const range of ranges) {
      if (range.start === null || range.end === null) return `${day} has an invalid time.`;
      if (range.start < MINUTES.min || range.end > MINUTES.max || range.start >= range.end) {
        return `${day} must use times between 07:00 and 22:00 with start before end.`;
      }
    }
    for (let index = 1; index < ranges.length; index += 1) {
      if (ranges[index].start < ranges[index - 1].end) return `${day} has overlapping time ranges.`;
    }
  }
  return "";
};

export const legacyWeeklyAvailability = (workDays, startTime, endTime) => {
  const days = parseWorkDays(workDays);
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;
  const startValue = start && !Number.isNaN(start.getTime()) ? `${String(start.getUTCHours()).padStart(2, "0")}:${String(start.getUTCMinutes()).padStart(2, "0")}` : "";
  const endValue = end && !Number.isNaN(end.getTime()) ? `${String(end.getUTCHours()).padStart(2, "0")}:${String(end.getUTCMinutes()).padStart(2, "0")}` : "";
  if (!startValue || !endValue) return [];
  return days.map((day) => ({ day, ranges: [{ startTime: startValue, endTime: endValue }] }));
};

export const getWeeklyAvailability = (doctor) => {
  const explicit = normalizeWeeklyAvailability(doctor?.weeklyAvailability);
  return explicit.length ? explicit : legacyWeeklyAvailability(doctor?.workDays, doctor?.slotStartTime, doctor?.slotEndTime);
};

export const firstWeeklyRange = (value) => normalizeWeeklyAvailability(value)[0]?.ranges?.[0] || null;

export const formatWeeklyAvailability = (value) =>
  normalizeWeeklyAvailability(value)
    .map(({ day, ranges }) => `${day.slice(0, 3)} ${ranges.map((range) => `${range.startTime}-${range.endTime}`).join(", ")}`)
    .join("; ");
