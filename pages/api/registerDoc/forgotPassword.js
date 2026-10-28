// pages/api/registerDoc/forgotPassword.js
//
// Doctor-panel "Forgot password" flow. One route, three actions (sent in the
// JSON body's `action` field), so the OTP lifecycle stays in a single place:
//   1. request-otp   - validate the mobile number, generate + send an OTP.
//   2. verify-otp    - validate the OTP and open the password-reset window.
//   3. reset-password - hash + save the new password.
//
// OTPs are stored in Redis (5 min TTL) and delivered over WhatsApp through the
// existing Fast2SMS helpers (`sendWhatsAppConfirmation`), the same channel the
// rest of the app uses for OTP confirmations.

import bcrypt from "bcryptjs";
import { dbConnect } from "../../../src/lib/db";
import Doctor from "../../../src/models/doctorModel";
import { logErrorToGoogleSheet } from "../helper";
import { rateLimit } from "../../../src/lib/rateLimiter";
import { redisGet, redisSet, redisDel } from "../../../src/lib/redis";
import { sendWhatsAppConfirmation } from "../lib/communication";
import { WHATSAPP_NUMBER_CONFIRMATION } from "../utils/constants";
import { getWhatsAppNumberConfirmationMessageBody } from "../utils/whatsappMessageBodies";
import { formatPhoneNumber } from "../utils/commonmethod";

const OTP_TTL_SECONDS = 300; // 5 minutes
const RESET_TTL_SECONDS = 600; // 10 minutes after verification
const OTP_RATE_LIMIT_PER_MOBILE = 5; // per 10 min per mobile
const OTP_RATE_LIMIT_PER_IP = 20; // per 10 min per IP
const OTP_RATE_WINDOW = 600; // 10 minutes

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost",
  "capacitor://localhost",
  "https://localhost",
  "http://localhost:8100",
];

const otpKey = (mobile) => `otp:doctor:${mobile}`;
const resetKey = (mobile) => `pwd-reset:doctor:${mobile}`;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// Keeps only the last 10 digits so "+91 98765 43210", "919876543210" and
// "9876543210" all match the stored `mobileNumber`.
const normalizeMobile = (value) =>
  String(value ?? "").replace(/\D/g, "").slice(-10);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
  }
}

const badRequest = (res, error) => res.status(400).json({ success: false, error });
const notFound = (res, error) => res.status(404).json({ success: false, error });
const tooMany = (res, error, retryAfter) =>
  res.status(429).json({ success: false, error, retryAfter });
const serverError = (res, error) => res.status(500).json({ success: false, error });

async function handleRequestOtp(req, res) {
  const mobile = normalizeMobile(req.body?.mobile);
  if (!mobile || mobile.length !== 10) {
    return badRequest(res, "A valid 10-digit mobile number is required");
  }

  const mobileLimit = await rateLimit({
    key: `rl:otp:doctor:mobile:${mobile}`,
    limit: OTP_RATE_LIMIT_PER_MOBILE,
    windowSeconds: OTP_RATE_WINDOW,
  });
  if (!mobileLimit.allowed) {
    return tooMany(res, "Too many OTP requests. Please try again later.", mobileLimit.retryAfter);
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  const ipLimit = await rateLimit({
    key: `rl:otp:doctor:ip:${ip}`,
    limit: OTP_RATE_LIMIT_PER_IP,
    windowSeconds: OTP_RATE_WINDOW,
  });
  if (!ipLimit.allowed) {
    return tooMany(res, "Too many OTP requests from this device. Please try again later.", ipLimit.retryAfter);
  }

  await dbConnect();

  // `mobileNumber` is stored as a Number and is unique.
  const doctor = await Doctor.findOne({ mobileNumber: Number(mobile) });
  if (!doctor) {
    return notFound(res, "No doctor found");
  }

  const otp = generateOtp();
  await redisSet(otpKey(mobile), otp, OTP_TTL_SECONDS);

  try {
    await sendWhatsAppConfirmation(
      formatPhoneNumber(mobile),
      getWhatsAppNumberConfirmationMessageBody(otp),
      WHATSAPP_NUMBER_CONFIRMATION
    );
  } catch (sendError) {
    // The doctor never got the code, so drop it instead of leaving a live OTP.
    await redisDel(otpKey(mobile));
    throw sendError;
  }

  return res.status(200).json({ success: true, message: "OTP sent successfully" });
}

async function handleVerifyOtp(req, res) {
  const mobile = normalizeMobile(req.body?.mobile);
  const otp = String(req.body?.otp ?? "").trim();

  if (!mobile || mobile.length !== 10) {
    return badRequest(res, "A valid 10-digit mobile number is required");
  }
  if (!otp) {
    return badRequest(res, "OTP is required");
  }

  const storedOtp = await redisGet(otpKey(mobile));
  if (!storedOtp || storedOtp !== otp) {
    return badRequest(res, "Invalid or expired OTP");
  }

  // Verified: drop the OTP and open a short window to set the new password.
  await redisDel(otpKey(mobile));
  await redisSet(resetKey(mobile), "verified", RESET_TTL_SECONDS);

  return res.status(200).json({ success: true, message: "OTP verified" });
}

async function handleResetPassword(req, res) {
  const mobile = normalizeMobile(req.body?.mobile);
  const newPassword = String(req.body?.newPassword ?? "");

  if (!mobile || mobile.length !== 10) {
    return badRequest(res, "A valid 10-digit mobile number is required");
  }
  if (!newPassword || newPassword.length < 6) {
    return badRequest(res, "Password must be at least 6 characters long");
  }

  // The reset window is only opened by a successful OTP verification.
  const verified = await redisGet(resetKey(mobile));
  if (!verified) {
    return badRequest(res, "OTP not verified. Please verify the OTP first.");
  }

  await dbConnect();

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const doctor = await Doctor.findOneAndUpdate(
    { mobileNumber: Number(mobile) },
    { password: hashedPassword },
    { new: true }
  );

  if (!doctor) {
    return notFound(res, "No doctor found");
  }

  await redisDel(resetKey(mobile));

  return res.status(200).json({ success: true, message: "Password updated successfully" });
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { action } = req.body ?? {};

    if (action === "request-otp") return handleRequestOtp(req, res);
    if (action === "verify-otp") return handleVerifyOtp(req, res);
    if (action === "reset-password") return handleResetPassword(req, res);

    return badRequest(res, "Invalid action");
  } catch (error) {
    console.error("Forgot password error:", error);
    await logErrorToGoogleSheet({
      apiName: "forgotPassword",
      errorMessage: error.message || "Forgot password failed",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { action: req.body?.action, mobile: req.body?.mobile },
    });
    return serverError(res, "Internal server error");
  }
}
