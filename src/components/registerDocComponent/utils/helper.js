import { appointment_status } from "../../../constant";


export const formatData = (timestamp) => {
  const date = new Date(timestamp);

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // Specify IST time zone
  };

  return date.toLocaleString("en-IN", options);
};

export const extractTime = (timestamp) => {
  const date = new Date(timestamp);

  // Using toLocaleTimeString() with specific options for hour and minute
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // For AM/PM format
    timeZone: "Asia/Kolkata", // Ensure IST time zone
  };

  return date.toLocaleTimeString("en-IN", options);
};

export const extractDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function capitalize(name) {
  if (!name) return name;
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ── IST day bucketing ────────────────────────────────────────────────────────
   The panel prints every appointment in IST (formatData / extractTime above)
   while the API returns UTC ISO strings. `new Date().toISOString()` is the *UTC*
   calendar day, so it files a 21:30 IST booking under tomorrow - which is why
   the home page used to count the wrong "today". These helpers keep day
   bucketing in the same timezone as the printed values. */

// en-CA prints ISO-like YYYY-MM-DD and the timezone is pinned, so the result is
// the same on the server and in the browser (no hydration mismatch).
const istDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** IST calendar day of a timestamp as "YYYY-MM-DD" ("" when unparseable). */
export const istDayKey = (timestamp) => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "" : istDayFormatter.format(date);
};

/** True when both timestamps land on the same IST calendar day. */
export const isSameIstDay = (a, b) => {
  const key = istDayKey(a);
  return Boolean(key) && key === istDayKey(b);
};

/** "10 May 2026" in IST - the date half of a "next consultation" line. */
export const formatIstDate = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

/* ── Appointment bucketing ────────────────────────────────────────────────────
   The home page's stat cards, its "next consultation" card and its table all
   read these four buckets, so their numbers can never disagree. Cancelled
   appointments stay out of `today`/`upcoming` (they are not work) but are still
   listed in `all`; `all` and `completed` read newest first, the others soonest
   first so the next patient is always the first row / first card. */

const timeOf = (appointment) => new Date(appointment?.appointmentTime).getTime();
const bySoonest = (a, b) => timeOf(a) - timeOf(b);
const byLatest = (a, b) => timeOf(b) - timeOf(a);

export const groupAppointments = (appointments) => {
  const list = (Array.isArray(appointments) ? appointments : []).filter(Boolean);
  const nowMs = Date.now();

  const isCancelled = (appointment) =>
    appointment.status === appointment_status.cancelled;
  const isCompleted = (appointment) =>
    appointment.status === appointment_status.completed;

  return {
    all: [...list].sort(byLatest),
    today: list
      .filter(
        (appointment) =>
          !isCancelled(appointment) &&
          isSameIstDay(appointment.appointmentTime, nowMs)
      )
      .sort(bySoonest),
    upcoming: list
      .filter(
        (appointment) =>
          !isCancelled(appointment) &&
          !isCompleted(appointment) &&
          timeOf(appointment) >= nowMs
      )
      .sort(bySoonest),
    completed: list.filter(isCompleted).sort(byLatest),
  };
};

