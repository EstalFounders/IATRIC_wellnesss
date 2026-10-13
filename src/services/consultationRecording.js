// src/services/consultationRecording.js
//
// Client-side helpers for the consultation recording feature.
//
// The meeting room records the mixed audio+video locally and hands the finished
// Blob here. Firebase is imported dynamically so the meeting-room bundle does
// not carry the Firebase SDK (the room is intentionally lightweight - see the
// note in src/utils/doctorName.js) until a recording is actually uploaded.
import { api, consultation_recording_folder } from "../constant";

const EXTENSION_BY_TYPE = {
  "video/webm": "webm",
  "video/mp4": "mp4",
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
};

const extensionFor = (mimeType) =>
  EXTENSION_BY_TYPE[String(mimeType || "").split(";")[0].trim()] || "webm";

/**
 * Upload a finished recording blob to Firebase Storage and return its public
 * download URL. The object name is unique per meeting, so a re-recorded meeting
 * never silently overwrites the previous file.
 *
 * @param {Blob} blob the MediaRecorder output
 * @param {{ meetingId?: string }} context
 * @returns {Promise<string>} the download URL
 */
export const uploadConsultationRecording = async (blob, { meetingId } = {}) => {
  if (!blob || !blob.size) throw new Error("No recording data to upload");

  const [{ ref, uploadBytes, getDownloadURL }, { storage }] = await Promise.all([
    import("firebase/storage"),
    import("../../lib/firebase"),
  ]);

  const safeMeetingId =
    String(meetingId || "meeting")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 60) || "meeting";
  const extension = extensionFor(blob.type);
  const storageRef = ref(
    storage,
    `${consultation_recording_folder}/meeting=${safeMeetingId}_${Date.now()}.${extension}`
  );

  const snapshot = await uploadBytes(storageRef, blob, {
    contentType: blob.type || "video/webm",
  });

  return getDownloadURL(snapshot.ref);
};

/**
 * Persist the recording URL onto the appointment so the doctor and super-admin
 * panels can play it back.
 *
 * @param {{ appointmentId?: string, meetingId?: string, recordingURL: string }} payload
 * @returns {Promise<object>} the API response body
 */
export const saveRecordingUrl = async ({
  appointmentId,
  meetingId,
  recordingURL,
}) => {
  const response = await fetch(api.recordingCall, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId, meetingId, recordingURL }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Failed to save recording URL (${response.status}): ${detail}`
    );
  }

  return response.json();
};
