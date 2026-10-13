"use client";

// src/components/MeetingRoom/useConsultationRecorder.js
//
// Records a consultation as a single mixed file: both participants' video is
// composited onto a canvas and both audio tracks are summed with the Web Audio
// API, then a MediaRecorder writes the combined stream (WebM/Opus by default).
// When recording stops the blob is uploaded to Firebase Storage and the download
// URL is saved onto the appointment (recordingURL) - see
// src/services/consultationRecording.js and pages/api/recording.js.
//
// Recording is driven entirely by the `enabled` flag so the meeting room can
// auto-start it when the call becomes active and auto-stop it when the call
// ends. Everything is ref-guarded so a double render never opens two recorders.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  saveRecordingUrl,
  uploadConsultationRecording,
} from "../../services/consultationRecording";

export const RECORDING_STATUS = {
  idle: "idle",
  recording: "recording",
  uploading: "uploading",
  saved: "saved",
  error: "error",
};

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const FRAME_RATE = 25;
const TIMESLICE_MS = 1000;
// Explicit bitrates. Without them MediaRecorder falls back to a low default,
// which is why the file looked soft and blocky.
const VIDEO_BITS_PER_SECOND = 3_000_000;
const AUDIO_BITS_PER_SECOND = 128_000;

/** Best codecs this browser can actually encode, most preferred first. */
const pickMimeType = (hasVideo) => {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return "";
  }
  const candidates = hasVideo
    ? [
        // VP8 first: real-time VP9 encoding often gets starved of bitrate on
        // ordinary laptops, which shows up as a soft, blocky recording.
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9,opus",
        "video/webm",
        "video/mp4",
      ]
    : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];

  return (
    candidates.find((type) => {
      try {
        return window.MediaRecorder.isTypeSupported(type);
      } catch (error) {
        return false;
      }
    }) || ""
  );
};

const drawPlaceholder = (ctx, x, y, width, height, label) => {
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 30px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + width / 2, y + height / 2);
};

const drawVideo = (ctx, video, x, y, width, height, label) => {
  if (video && video.readyState >= 2 && video.videoWidth > 0) {
    const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * scale;
    const drawHeight = video.videoHeight * scale;
    ctx.drawImage(
      video,
      x + (width - drawWidth) / 2,
      y + (height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );
    return;
  }
  drawPlaceholder(ctx, x, y, width, height, label);
};

export default function useConsultationRecorder({
  enabled = false,
  consultation,
  meetingId,
  localStreamRef,
  localVideoRef,
  remoteStream,
  remoteVideoRef,
  isAudioOnly = false,
  localLabel = "You",
  remoteLabel = "Other",
}) {
  const [status, setStatus] = useState(RECORDING_STATUS.idle);
  const [recordingURL, setRecordingURL] = useState("");
  const [error, setError] = useState("");
  const [durationMs, setDurationMs] = useState(0);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const canvasRef = useRef(null);
  const drawTimerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioDestinationRef = useRef(null);
  const connectedAudioRef = useRef(null);
  const startedAtRef = useRef(0);
  const mountedRef = useRef(true);
  const statusRef = useRef(status);
  const remoteStreamRef = useRef(remoteStream);

  useEffect(() => {
    remoteStreamRef.current = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** Add a stream's audio to the shared recorder mix (safe to call repeatedly). */
  const connectAudio = useCallback((stream) => {
    const audioCtx = audioCtxRef.current;
    const destination = audioDestinationRef.current;
    if (!audioCtx || !destination || !stream) return;
    if (!stream.getAudioTracks || stream.getAudioTracks().length === 0) return;
    if (!connectedAudioRef.current) connectedAudioRef.current = new WeakSet();
    if (connectedAudioRef.current.has(stream)) return;
    try {
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(destination);
      connectedAudioRef.current.add(stream);
    } catch (err) {
      // A stream with no usable audio node - simply leave it out of the mix.
      console.warn("Could not add stream audio to the recording:", err);
    }
  }, []);

  /** Finalise the blob, upload it and store the URL on the appointment. */
  const handleStop = useCallback(async () => {
    clearInterval(drawTimerRef.current);
    drawTimerRef.current = null;

    const chunks = chunksRef.current;
    const recordedMimeType = recorderRef.current?.mimeType || "";
    chunksRef.current = [];
    recorderRef.current = null;

    // Tear the mix graph down; the source streams themselves are owned by the
    // meeting room and are left untouched.
    try {
      audioCtxRef.current?.close();
    } catch (err) {
      /* already closed */
    }
    audioCtxRef.current = null;
    audioDestinationRef.current = null;
    canvasRef.current = null;

    if (startedAtRef.current) {
      setDurationMs(Date.now() - startedAtRef.current);
    }

    const blob = new Blob(chunks, {
      type: recordedMimeType || (isAudioOnly ? "audio/webm" : "video/webm"),
    });

    if (!blob.size) {
      if (mountedRef.current) setStatus(RECORDING_STATUS.idle);
      return;
    }

    if (mountedRef.current) setStatus(RECORDING_STATUS.uploading);

    try {
      const url = await uploadConsultationRecording(blob, { meetingId });
      await saveRecordingUrl({
        appointmentId: consultation?._id,
        meetingId,
        recordingURL: url,
      });
      if (mountedRef.current) {
        setRecordingURL(url);
        setStatus(RECORDING_STATUS.saved);
      }
    } catch (err) {
      console.error("Failed to upload the consultation recording:", err);
      if (mountedRef.current) {
        setError(err.message || "Failed to upload the recording.");
        setStatus(RECORDING_STATUS.error);
      }
    }
  }, [consultation, meetingId, isAudioOnly]);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (recorderRef.current) return; // already recording
    if (typeof window.MediaRecorder === "undefined") {
      setError("Recording is not supported in this browser.");
      setStatus(RECORDING_STATUS.error);
      return;
    }

    const localStream = localStreamRef?.current;
    if (!localStream) return; // media not acquired yet

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = AudioCtx ? new AudioCtx() : null;
      audioCtxRef.current = audioCtx;
      audioDestinationRef.current = audioCtx
        ? audioCtx.createMediaStreamDestination()
        : null;
      connectedAudioRef.current = new WeakSet();

      if (audioCtx) {
        // A context created without a fresh user gesture can start suspended,
        // which would record silence.
        audioCtx.resume?.().catch(() => {});
        connectAudio(localStream);
        connectAudio(remoteStreamRef.current);
      }

      const tracks = [];

      if (!isAudioOnly) {
        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvasRef.current = canvas;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        const half = CANVAS_WIDTH / 2;

        // Paint on a timer, NOT requestAnimationFrame: rAF is paused the moment
        // the tab is hidden (switching to the patient tab, minimising, screen
        // lock), so the canvas stopped producing frames while the audio graph
        // kept recording - the file played 30s with the video frozen at the
        // point the tab lost visibility. A timer keeps firing in a background
        // tab (throttled to ~1fps), so the video track never stalls completely.
        const paintFrame = () => {
          try {
            ctx.fillStyle = "#0f1720";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawVideo(ctx, remoteVideoRef?.current, 0, 0, half, CANVAS_HEIGHT, remoteLabel);
            drawVideo(ctx, localVideoRef?.current, half, 0, half, CANVAS_HEIGHT, localLabel);
          } catch (err) {
            console.warn("Could not paint a recording frame:", err);
          }
        };
        paintFrame();
        drawTimerRef.current = setInterval(paintFrame, 1000 / FRAME_RATE);

        tracks.push(...canvas.captureStream(FRAME_RATE).getVideoTracks());
      }

      if (audioDestinationRef.current) {
        tracks.push(...audioDestinationRef.current.stream.getAudioTracks());
      }

      if (tracks.length === 0) {
        setError("No audio or video tracks are available to record.");
        setStatus(RECORDING_STATUS.error);
        return;
      }

      const mimeType = pickMimeType(!isAudioOnly);
      const combinedStream = new MediaStream(tracks);
      const recorder = new window.MediaRecorder(combinedStream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
        ...(isAudioOnly ? {} : { videoBitsPerSecond: VIDEO_BITS_PER_SECOND }),
      });

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = handleStop;
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start(TIMESLICE_MS);

      setError("");
      setStatus(RECORDING_STATUS.recording);
    } catch (err) {
      console.error("Failed to start the consultation recording:", err);
      clearInterval(drawTimerRef.current);
      drawTimerRef.current = null;
      try {
        audioCtxRef.current?.close();
      } catch (closeError) {
        /* ignore */
      }
      audioCtxRef.current = null;
      audioDestinationRef.current = null;
      recorderRef.current = null;
      setError(err.message || "Failed to start recording.");
      setStatus(RECORDING_STATUS.error);
    }
  }, [
    connectAudio,
    handleStop,
    isAudioOnly,
    localLabel,
    localStreamRef,
    localVideoRef,
    remoteLabel,
    remoteVideoRef,
  ]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch (err) {
      console.warn("Could not stop the recorder cleanly:", err);
    }
  }, []);

  // Auto-start when the call becomes recordable, auto-stop when it no longer is.
  useEffect(() => {
    if (enabled) {
      start();
    } else if (recorderRef.current) {
      stop();
    }
  }, [enabled, start, stop]);

  // The peer may connect after recording has already begun; fold their audio into
  // the live mix (the canvas reads the remote <video> every frame already).
  useEffect(() => {
    if (statusRef.current === RECORDING_STATUS.recording) {
      connectAudio(remoteStream);
    }
  }, [remoteStream, connectAudio]);

  // Safety net: finalise + upload if the room unmounts mid-recording.
  useEffect(
    () => () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch (err) {
          /* ignore */
        }
      }
      clearInterval(drawTimerRef.current);
      try {
        audioCtxRef.current?.close();
      } catch (err) {
        /* ignore */
      }
    },
    []
  );

  return {
    status,
    isRecording: status === RECORDING_STATUS.recording,
    isUploading: status === RECORDING_STATUS.uploading,
    isSaved: status === RECORDING_STATUS.saved,
    hasError: status === RECORDING_STATUS.error,
    recordingURL,
    error,
    durationMs,
    start,
    stop,
  };
}
