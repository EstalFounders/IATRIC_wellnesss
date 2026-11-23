// pages/api/feedback/index.js
//
// Patient-facing post-consultation feedback endpoint.
//
//   GET  /api/feedback?bookingId=<appointment _id | meetingId>
//        -> the consultation summary, whether feedback is allowed yet, and the
//           feedback already on file (so a revisit shows the edit/thank-you
//           state instead of an empty form).
//   POST /api/feedback  { bookingId, overallRating, ratings?, tags?, comment? }
//        -> creates the single feedback document for that consultation.
//   PUT  /api/feedback  { bookingId | feedbackId, ...same fields }
//        -> updates that document instead of creating a second one.
//
// Nothing here writes to the appointment or payment: feedback is a separate
// collection that only reads the consultation for context/eligibility.
import mongoose from "mongoose";
import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";
import Doctor from "../../../src/models/doctorModel";
import ConsultationFeedback from "../../../src/models/consultationFeedbackSchema";
import { rateLimit } from "../../../src/lib/rateLimiter";
import { logErrorToGoogleSheet } from "../helper";
import {
  evaluateFeedbackEligibility,
  validateFeedbackPayload,
} from "../utils/feedbackValidation";

const asText = (value) =>
  value === undefined || value === null ? "" : String(value);

/** Only the last four digits of the phone number leave the server. */
const maskMobile = (value) => {
  const digits = asText(value).replace(/\D/g, "");
  if (!digits) return "";
  return `••••••${digits.slice(-4)}`;
};

const clientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  "unknown";

/**
 * Resolves a booking reference to the appointment.
 * Accepts the full appointment `_id` (what the panel/API returns) or the
 * appointment's public `meetingId` (what the consultation room URLs use).
 */
const resolveAppointment = async (bookingId) => {
  const key = asText(bookingId).trim();
  if (!key) return null;

  const matches = [];
  if (mongoose.Types.ObjectId.isValid(key)) matches.push({ _id: key });
  matches.push({ meetingId: key });

  return Appointment.findOne({ $or: matches }).lean();
};

/** The feedback shape the public page and the panel both consume. */
const serializeFeedback = (doc) => {
  if (!doc) return null;
  return {
    id: String(doc._id),
    appointmentId: doc.appointmentId ? String(doc.appointmentId) : "",
    bookingId: doc.bookingId || "",
    overallRating: doc.overallRating,
    ratings: {
      doctorCommunication: doc.ratings?.doctorCommunication ?? null,
      consultationHelpfulness:
        doc.ratings?.consultationHelpfulness ?? null,
      callQuality: doc.ratings?.callQuality ?? null,
      bookingProcess: doc.ratings?.bookingProcess ?? null,
    },
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    comment: doc.comment || "",
    revision: doc.revision || 1,
    submittedAt: doc.submittedAt || doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
};

/** Consultation context for the feedback screen (no symptoms, no full phone). */
const serializeConsultation = (appointment, doctor) => ({
  bookingId: String(appointment._id),
  shortId: String(appointment._id).slice(0, 8),
  meetingId: appointment.meetingId || "",
  patientName: appointment.name || "",
  patientMobile: maskMobile(appointment.patientMobNo),
  consultationType: appointment.consultationType || "",
  appointmentTime: appointment.appointmentTime || null,
  status: appointment.status || "",
  prescriptionShared: Boolean(appointment.prescriptionUrl),
  doctor: doctor
    ? {
        id: String(doctor._id),
        name: doctor.name || "",
        expertise: doctor.expertise || "",
        profilePictureUrl: doctor.profilePictureUrl || "",
      }
    : null,
});

const findDoctor = async (appointment) => {
  if (!appointment?.doctorId) return null;
  return Doctor.findById(appointment.doctorId)
    .select("name expertise profilePictureUrl")
    .lean();
};

/** Answers GET: consultation + eligibility + already-submitted feedback. */
const handleGet = async (req, res) => {
  const bookingId = req.query.bookingId ?? req.query.appointmentId;
  if (!asText(bookingId).trim()) {
    return res.status(400).json({
      message: "A bookingId is required to load consultation feedback.",
    });
  }

  const appointment = await resolveAppointment(bookingId);
  const eligibility = evaluateFeedbackEligibility(appointment);

  if (!appointment) {
    return res.status(404).json({
      message: eligibility.message,
      code: "CONSULTATION_NOT_FOUND",
    });
  }

  const [doctor, feedback] = await Promise.all([
    findDoctor(appointment),
    ConsultationFeedback.findOne({ appointmentId: appointment._id }).lean(),
  ]);

  return res.status(200).json({
    consultation: serializeConsultation(appointment, doctor),
    eligibility: {
      canSubmit: eligibility.eligible,
      message: eligibility.message,
    },
    feedback: serializeFeedback(feedback),
  });
};

/** Answers POST: create the one feedback document for the consultation. */
const handlePost = async (req, res) => {
  const body = req.body || {};
  const bookingId = body.bookingId ?? body.appointmentId;

  if (!asText(bookingId).trim()) {
    return res.status(400).json({
      message: "A bookingId is required to submit feedback.",
    });
  }

  // Spam guard: the form is public (the booking id is the only key), so cap both
  // per IP and per booking. Redis is fail-open (see rateLimiter).
  const ipLimit = await rateLimit({
    key: `rl:feedback:ip:${clientIp(req)}`,
    limit: 12,
    windowSeconds: 600,
  });
  if (!ipLimit.allowed) {
    return res.status(429).json({
      message: "Too many feedback attempts. Please try again later.",
      retryAfter: ipLimit.retryAfter,
    });
  }

  const bookingLimit = await rateLimit({
    key: `rl:feedback:booking:${asText(bookingId).trim()}`,
    limit: 6,
    windowSeconds: 600,
  });
  if (!bookingLimit.allowed) {
    return res.status(429).json({
      message: "Too many feedback attempts for this consultation.",
      retryAfter: bookingLimit.retryAfter,
    });
  }

  const validation = validateFeedbackPayload(body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const appointment = await resolveAppointment(bookingId);
  if (!appointment) {
    return res.status(404).json({
      message:
        "We could not find this consultation. Please check your booking link.",
      code: "CONSULTATION_NOT_FOUND",
    });
  }

  const eligibility = evaluateFeedbackEligibility(appointment);
  if (!eligibility.eligible) {
    return res
      .status(eligibility.status)
      .json({ message: eligibility.message, code: "NOT_ELIGIBLE" });
  }

  // `appointmentId` is unique, so this is the friendly path for a second tab or
  // a repeat visit; the E11000 branch below catches the race.
  const existing = await ConsultationFeedback.findOne({
    appointmentId: appointment._id,
  });
  if (existing) {
    return res.status(409).json({
      message:
        "You have already shared feedback for this consultation. You can update it instead.",
      code: "FEEDBACK_EXISTS",
      canUpdate: true,
      feedback: serializeFeedback(existing),
    });
  }

  const created = await ConsultationFeedback.create({
    appointmentId: appointment._id,
    bookingId: appointment.meetingId || "",
    doctorId: appointment.doctorId || null,
    patientName: appointment.name || "",
    patientMobile: asText(appointment.patientMobNo),
    overallRating: validation.payload.overallRating,
    ratings: validation.payload.ratings,
    tags: validation.payload.tags,
    comment: validation.payload.comment,
    source: validation.payload.source,
    revision: 1,
    submittedAt: new Date(),
  });

  return res.status(201).json({
    message: "Thank you for your feedback.",
    feedback: serializeFeedback(created),
  });
};

/** Answers PUT: edit an existing submission (never creates a duplicate). */
const handlePut = async (req, res) => {
  const body = req.body || {};
  const feedbackId = asText(body.feedbackId).trim();
  const bookingId = body.bookingId ?? body.appointmentId;

  const validation = validateFeedbackPayload(body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  let filter = null;
  if (feedbackId && mongoose.Types.ObjectId.isValid(feedbackId)) {
    filter = { _id: feedbackId };
  } else if (asText(bookingId).trim()) {
    const appointment = await resolveAppointment(bookingId);
    if (appointment) filter = { appointmentId: appointment._id };
  }

  if (!filter) {
    return res.status(400).json({
      message: "A feedbackId or bookingId is required to update feedback.",
    });
  }

  const feedback = await ConsultationFeedback.findOne(filter);
  if (!feedback) {
    return res.status(404).json({
      message: "No feedback has been submitted for this consultation yet.",
      code: "FEEDBACK_NOT_FOUND",
    });
  }

  feedback.overallRating = validation.payload.overallRating;
  feedback.ratings = validation.payload.ratings;
  feedback.tags = validation.payload.tags;
  feedback.comment = validation.payload.comment;
  feedback.revision = (feedback.revision || 1) + 1;
  await feedback.save();

  return res.status(200).json({
    message: "Your feedback has been updated.",
    feedback: serializeFeedback(feedback),
  });
};

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === "GET") return await handleGet(req, res);
    if (req.method === "POST") return await handlePost(req, res);
    if (req.method === "PUT") return await handlePut(req, res);

    res.setHeader("Allow", "GET, POST, PUT");
    return res.status(405).json({ message: "Method not allowed." });
  } catch (error) {
    // A concurrent double-submit still hits the unique index.
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "You have already shared feedback for this consultation. You can update it instead.",
        code: "FEEDBACK_EXISTS",
        canUpdate: true,
      });
    }

    console.error("Consultation feedback error:", error);
    await logErrorToGoogleSheet({
      apiName: `feedback - ${req.method}`,
      errorMessage: error.message || "Feedback request failed",
      errorCode: error.code || error.status || "500",
      stackTrace: error.stack,
      requestPayload: {
        bookingId: req.body?.bookingId ?? req.query?.bookingId,
        method: req.method,
      },
    }).catch(() => {});

    return res.status(500).json({
      message: "We could not save your feedback right now. Please try again.",
    });
  }
}
