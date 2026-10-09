// customerQueryUtils.js - shared helpers for the super-admin "Customer query"
// page (pages/superAdmin/customerQuery.js).
//
// Everything here is presentation-only: the page reads GET /api/userQuery, whose
// documents look like { _id, name, email, mobile_number, visited_before, message,
// createdAt, updatedAt } (src/models/query.js). A submission carries *either*
// an email *or* a mobile number (never both), so `contactOf()` decides which one
// a row shows.
export const CONTACT_EMAIL = "email";
export const CONTACT_PHONE = "phone";

const DAY_MS = 24 * 60 * 60 * 1000;

export const toText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

// First two initials of a name ("Ravi Kumar" -> "RK", "Priya" -> "PR", "" -> "U").
export const getInitials = (name) => {
  const parts = toText(name).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const initials =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
};

const toDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// "12 Jun 2025, 3:40 pm" - date AND time, because two queries can share a day.
export const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Local calendar day as YYYY-MM-DD. Used both by the date-range filter (whose
// <input type="date"> values are exactly this shape) and by the "Today" button,
// so the comparison is a plain string compare with no timezone maths.
export const dayKey = (value) => {
  const date = toDate(value);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

// "2025-06-12" -> "12 Jun 2025" (built from parts so it never shifts a day in a
// negative-offset timezone the way new Date("2025-06-12") would).
export const formatDayKey = (key) => {
  const [year, month, day] = String(key).split("-").map(Number);
  if (!year || !month || !day) return key;
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Received within the last 7 days (inclusive) - the "Last 7 days" tile.
export const isRecent = (value) => {
  const date = toDate(value);
  if (!date) return false;
  const diff = Date.now() - date.getTime();
  return diff >= 0 && diff <= 7 * DAY_MS;
};

// The one contact method a query carries. Returns { type, value, href }; type is
// "none" when the record has neither (which the normaliser makes unlikely but
// not impossible).
export const contactOf = (query) => {
  const email = toText(query && query.email);
  if (email) {
    return { type: CONTACT_EMAIL, value: email, href: `mailto:${email}` };
  }
  const mobile = toText(query && query.mobile_number);
  if (mobile) {
    return { type: CONTACT_PHONE, value: mobile, href: `tel:${mobile}` };
  }
  return { type: "none", value: "", href: "" };
};

// `visited_before` defaults to the boolean false, which Mongoose casts into the
// string "false" - a truthy value. Only treat a real true / "true" as visited so
// the chip stops claiming every customer has been here before.
export const isVisited = (value) => value === true || value === "true";

// Everything a row prints, flattened for the search box.
export const searchText = (query) =>
  [
    query.name,
    query.email,
    query.mobile_number,
    query.message,
    query.visited_before,
    formatDateTime(query.createdAt),
  ]
    .map(toText)
    .join(" ")
    .toLowerCase();
