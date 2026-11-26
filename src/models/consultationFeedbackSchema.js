// src/models/consultationFeedbackSchema.js
//
// Post-consultation feedback: one document per appointment.
//
// Patients book as guests (the appointment carries `name`/`patientMobNo`, there
// is no patient account), so the patient's identity is snapshotted here instead
// of being read back through a `patientId` ref. `appointmentId` is unique, which
// is what makes a duplicate submission impossible even if two tabs post at once
// (the API turns the resulting E11000 into a clean 409). Editing is explicit:
// the same document is updated (PUT) and `revision` counts the edits, so the
// first submission date (`submittedAt`) is never overwritten.
import mongoose from "mongoose";

// One optional 1-5 sub-rating. `null` means "not answered" - the form lets the
// patient skip any of these.
const subRating = {
  type: Number,
  default: null,
  min: [1, "Rating must be between 1 and 5"],
  max: [5, "Rating must be between 1 and 5"],
};

const consultationFeedbackSchema = new mongoose.Schema(
  {
    // The consultation this feedback belongs to (one feedback per booking).
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "appointmentId is required"],
    },
    // The appointment's public `meetingId`, kept for support/debugging so a
    // feedback row can be matched to a shared booking link without a join.
    bookingId: {
      type: String,
      trim: true,
      default: "",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    // Reserved for a future logged-in patient flow; the current booking form
    // creates guest appointments, so this stays null.
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Snapshot of the appointment at submission time, so the panel can show who
    // wrote the feedback even if the appointment is later edited.
    patientName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 80,
    },
    patientMobile: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    // Optional: a patient may send only a comment or only tags, so the overall
    // rating is not required. `null` means "not rated" (the dashboard averages
    // only the rows that do carry a rating).
    overallRating: {
      type: Number,
      default: null,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    // Optional sub-ratings (doctor communication, consultation helpfulness,
    // call quality, booking process). Shape matches FEEDBACK_SUB_RATINGS in
    // src/utils/feedbackOptions.js.
    ratings: {
      doctorCommunication: subRating,
      consultationHelpfulness: subRating,
      callQuality: subRating,
      bookingProcess: subRating,
    },
    // Quick-feedback chips the patient selected (whitelist enforced by the API).
    tags: {
      type: [String],
      default: [],
    },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    // "web" for the public feedback page; kept so other channels (WhatsApp,
    // panel) can be distinguished later without a migration.
    source: {
      type: String,
      trim: true,
      default: "web",
    },
    // 1 on the first submission, +1 on every edit.
    revision: {
      type: Number,
      default: 1,
      min: 1,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // Explicit collection name: mongoose would pluralise the model name to
    // "consultationfeedbacks".
    collection: "consultationFeedbacks",
  }
);

// One feedback per consultation - the database-level duplicate guard.
consultationFeedbackSchema.index({ appointmentId: 1 }, { unique: true });
// Panel/doctor reads: newest feedback first, optionally scoped to a doctor.
consultationFeedbackSchema.index({ doctorId: 1, submittedAt: -1 });
consultationFeedbackSchema.index({ overallRating: 1 });

const modelName = "ConsultationFeedback";

// Reuse the compiled model across hot reloads / API bundles instead of
// re-registering it (OverwriteModelError).
const ConsultationFeedback =
  mongoose.models[modelName] ||
  mongoose.model(modelName, consultationFeedbackSchema);

export default ConsultationFeedback;
