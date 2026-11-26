// pages/api/feedback/list.js
//
// Read-only feedback feed for the panels (super-admin + doctor).
//
// GET /api/feedback/list?doctorId=&rating=&q=&page=1&limit=10
//
// Guarded by the existing NextAuth JWT cookie (src/lib/requireLogAuth), the same
// way the log APIs are: feedback holds patient comments, so it is not public.
// A doctor session can only ever read its own feedback - its own id overrides
// the `doctorId` query.
//
// The response carries both the page of rows and an aggregate summary (count,
// average, 1-5 distribution) for the same filter, so the panel never adds up
// numbers client-side.
import mongoose from "mongoose";
import { dbConnect } from "../../../src/lib/db";
import ConsultationFeedback from "../../../src/models/consultationFeedbackSchema";
import { requireAuth } from "../../../src/lib/requireLogAuth";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clampInt = (value, fallback, min, max) => {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
};

/**
 * A doctor JWT carries the whole doctor document (name + expertise); a
 * super-admin one carries the User document (fname/lname, no name field).
 */
const doctorIdOfSession = (user) => {
  if (!user) return "";
  const isDoctor = Boolean(user.expertise || (!user.fname && user.name));
  if (!isDoctor) return "";
  const id = user._id || user.id;
  return id && mongoose.Types.ObjectId.isValid(id) ? String(id) : "";
};

const serializeRow = (row) => {
  const doctor =
    row.doctorId && typeof row.doctorId === "object" && row.doctorId._id
      ? {
          id: String(row.doctorId._id),
          name: row.doctorId.name || "",
          expertise: row.doctorId.expertise || "",
        }
      : null;

  return {
    id: String(row._id),
    appointmentId: row.appointmentId ? String(row.appointmentId) : "",
    bookingId: row.bookingId || "",
    shortBookingId: String(row.bookingId || row.appointmentId || "").slice(0, 8),
    patientName: row.patientName || "Patient",
    patientMobile: row.patientMobile || "",
    doctor,
    overallRating: row.overallRating,
    ratings: row.ratings || {},
    tags: row.tags || [],
    comment: row.comment || "",
    revision: row.revision || 1,
    submittedAt: row.submittedAt || row.createdAt || null,
    updatedAt: row.updatedAt || null,
  };
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed." });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();

    const page = clampInt(req.query.page, 1, 1, 100000);
    const limit = clampInt(req.query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);

    // A doctor always sees only their own feedback.
    const sessionDoctorId = doctorIdOfSession(user);
    const requestedDoctorId = String(req.query.doctorId || "").trim();
    const doctorId = sessionDoctorId || requestedDoctorId;

    const filter = {};
    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid doctorId." });
      }
      filter.doctorId = new mongoose.Types.ObjectId(doctorId);
    }

    const rating = Number.parseInt(req.query.rating, 10);
    if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
      filter.overallRating = rating;
    }

    const query = String(req.query.q || "").trim().slice(0, 80);
    if (query) {
      const rx = new RegExp(escapeRegex(query), "i");
      filter.$or = [{ patientName: rx }, { comment: rx }, { bookingId: rx }];
    }

    const [rows, total, summaryRows] = await Promise.all([
      ConsultationFeedback.find(filter)
        .sort({ submittedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("doctorId", "name expertise")
        .lean(),
      ConsultationFeedback.countDocuments(filter),
      ConsultationFeedback.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            averageRating: { $avg: "$overallRating" },
            oneStar: { $sum: { $cond: [{ $eq: ["$overallRating", 1] }, 1, 0] } },
            twoStar: { $sum: { $cond: [{ $eq: ["$overallRating", 2] }, 1, 0] } },
            threeStar: {
              $sum: { $cond: [{ $eq: ["$overallRating", 3] }, 1, 0] },
            },
            fourStar: {
              $sum: { $cond: [{ $eq: ["$overallRating", 4] }, 1, 0] },
            },
            fiveStar: {
              $sum: { $cond: [{ $eq: ["$overallRating", 5] }, 1, 0] },
            },
            promoters: {
              $sum: { $cond: [{ $gte: ["$overallRating", 4] }, 1, 0] },
            },
            detractors: {
              $sum: { $cond: [{ $lte: ["$overallRating", 2] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summaryRow = summaryRows[0] || {};
    const count = summaryRow.count || 0;
    const averageRating =
      count > 0 && Number.isFinite(summaryRow.averageRating)
        ? Math.round(summaryRow.averageRating * 10) / 10
        : 0;
    const promoters = summaryRow.promoters || 0;
    const detractors = summaryRow.detractors || 0;

    return res.status(200).json({
      success: true,
      feedback: rows.map(serializeRow),
      summary: {
        count,
        averageRating,
        distribution: {
          1: summaryRow.oneStar || 0,
          2: summaryRow.twoStar || 0,
          3: summaryRow.threeStar || 0,
          4: summaryRow.fourStar || 0,
          5: summaryRow.fiveStar || 0,
        },
        // Net promoter score, the usual -100..100 scale.
        nps:
          count > 0 ? Math.round(((promoters - detractors) / count) * 100) : 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      scope: {
        doctorId: doctorId || null,
        isDoctorSession: Boolean(sessionDoctorId),
      },
    });
  } catch (error) {
    console.error("Feedback list error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load consultation feedback.",
    });
  }
}
