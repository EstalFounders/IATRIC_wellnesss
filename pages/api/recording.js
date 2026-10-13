// pages/api/recording.js
//
// Stores the consultation recording URL on the appointment. The meeting room
// uploads the MediaRecorder blob straight to Firebase Storage (client-side, like
// the prescription flow in src/utils.js) and then POSTs the resulting download
// URL here, so this route never touches the file bytes - it only records the
// link the doctor and super-admin panels read back.
import mongoose from "mongoose";
import { dbConnect } from "../../src/lib/db";
import Appointment from "../../src/models/appointmentSchema";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { recordingURL, appointmentId, meetingId } = req.body || {};

  if (typeof recordingURL !== "string" || !/^https?:\/\//.test(recordingURL)) {
    return res.status(400).json({ error: "A valid recordingURL is required" });
  }

  if (!appointmentId && !meetingId) {
    return res
      .status(400)
      .json({ error: "appointmentId or meetingId is required" });
  }

  try {
    await dbConnect();

    // Prefer the appointment id (exact), but fall back to meetingId so an upload
    // that only knows the room can still be recorded. `mongoose.Types.ObjectId.isValid`
    // guards the id form: a malformed id would otherwise throw a CastError 500.
    let query = null;
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      query = { _id: appointmentId };
    } else if (meetingId) {
      query = { meetingId };
    }

    if (!query) {
      return res.status(400).json({ error: "Invalid appointment reference" });
    }

    const appointment = await Appointment.findOneAndUpdate(
      query,
      { recordingURL },
      { new: true }
    ).lean();

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json({
      status: "saved",
      appointmentId: appointment._id,
      recordingURL: appointment.recordingURL,
    });
  } catch (error) {
    console.error("Error saving recording URL:", error);
    await logErrorToGoogleSheet({
      apiName: "recording - POST",
      errorMessage: error.message || "Recording URL save failed",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId, meetingId },
    });
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
}
