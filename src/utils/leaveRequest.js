// leaveRequest.js
// Pure helpers behind the super-admin "leave requests" screen
// (src/components/superAdminComponent/ViewAllDocLeaveReqComp.js).
//
// A leave request is a LeaveRequest document
// (src/models/leaveRequest.js):
//   { _id, doctorId, name, startTime, endTime, reason, status,
//     requestedAt, approvedAt, rejectedAt }
//
// There is no React and no fetch in here: everything is a pure function, so the
// screen stays a thin renderer (same split as utils/doctorUpdateRequest.js and
// utils/doctorName.js).

export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

// Rows created before the status field existed carry no status; they are still
// waiting for a decision, so they are read as pending rather than "unknown".
export const requestStatus = (request) => {
  const value = String(request?.status || "").toLowerCase();
  return STATUS_LABELS[value] ? value : REQUEST_STATUS.PENDING;
};

export const statusLabel = (request) => STATUS_LABELS[requestStatus(request)];

export const isPending = (request) =>
  requestStatus(request) === REQUEST_STATUS.PENDING;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Whole calendar days, inclusive of both ends: 12th -> 12th is 1 day,
// 12th -> 14th is 3 days. Returns null when a boundary is missing or invalid
// (nothing to count); never a negative - a reversed range reads as 1.
export const leaveDurationDays = (request) => {
  const start = toDate(request?.startTime);
  const end = toDate(request?.endTime);
  if (!start || !end) return null;

  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diff = Math.round((endDay - startDay) / MS_PER_DAY) + 1;

  return diff > 0 ? diff : 1;
};

// "12 Mar 2026" or "12 Mar 2026 → 14 Mar 2026" when start and end differ.
export const formatLeaveRange = (request) => {
  const start = formatDate(request?.startTime);
  const end = formatDate(request?.endTime);

  if (start && end) return start === end ? start : `${start} → ${end}`;
  return start || end || "";
};

// Pending first, newest request first - the rows that actually need a decision
// can never sink below the reviewed ones.
export const sortRequests = (requests) =>
  [...(Array.isArray(requests) ? requests : [])].sort((a, b) => {
    const aWait = isPending(a) ? 0 : 1;
    const bWait = isPending(b) ? 0 : 1;
    if (aWait !== bWait) return aWait - bWait;

    const aTime = toDate(a?.requestedAt)?.getTime() ?? 0;
    const bTime = toDate(b?.requestedAt)?.getTime() ?? 0;
    return bTime - aTime;
  });

export const countByStatus = (requests) => {
  const list = Array.isArray(requests) ? requests : [];
  const counts = { all: list.length, pending: 0, approved: 0, rejected: 0 };
  list.forEach((request) => {
    counts[requestStatus(request)] += 1;
  });
  return counts;
};

/** "AN" for "Ashima narula" - the avatar fallback when there is no picture. */
export const nameInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

/** `GET /api/addDoctor` -> Map("_id", doctor) for photo + name lookups. */
export const indexDoctorsById = (doctors) =>
  new Map(
    (Array.isArray(doctors) ? doctors : [])
      .filter((doctor) => doctor && doctor._id)
      .map((doctor) => [String(doctor._id), doctor])
  );

export const findDoctorForRequest = (request, doctorsById) =>
  (request && doctorsById?.get(String(request.doctorId))) || null;
