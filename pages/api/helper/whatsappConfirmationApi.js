import { randomInt, timingSafeEqual } from "crypto";
import { formatPhoneNumber } from "../utils/commonmethod";
import { sendWhatsAppConfirmation } from "../lib/communication";
import { WHATSAPP_NUMBER_CONFIRMATION } from "../utils/constants";
import { getWhatsAppNumberConfirmationMessageBody } from "../utils/whatsappMessageBodies";
import { rateLimit } from "../../../src/lib/rateLimiter";
import {
  redisDel,
  redisGet,
  redisSet,
  redisSetNX,
} from "../../../src/lib/redis";
import { logAppointmentContactToGoogleSheet } from "../helper";

const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_RATE_LIMIT_PER_MOBILE = 5; // 5 OTP sends per 10 min per mobile
const OTP_RATE_LIMIT_PER_IP = 20; // 20 OTP sends per 10 min per IP
const OTP_RATE_WINDOW = 600; // 10 minutes
const OTP_VERIFY_LIMIT_PER_MOBILE = 10;
const OTP_VERIFY_LIMIT_PER_IP = 30;

const normalizeMobile = (value) => String(value ?? "").replace(/\D/g, "");

const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  "unknown";

async function handleSendOtp(req, res, mobile) {
  const mobileLimit = await rateLimit({
    key: `rl:otp:mobile:${mobile}`,
    limit: OTP_RATE_LIMIT_PER_MOBILE,
    windowSeconds: OTP_RATE_WINDOW,
  });
  if (!mobileLimit.allowed) {
    return res.status(429).json({
      error: "Too many OTP requests. Please try again later.",
      retryAfter: mobileLimit.retryAfter,
    });
  }

  const ipLimit = await rateLimit({
    key: `rl:otp:ip:${getClientIp(req)}`,
    limit: OTP_RATE_LIMIT_PER_IP,
    windowSeconds: OTP_RATE_WINDOW,
  });
  if (!ipLimit.allowed) {
    return res.status(429).json({
      error: "Too many OTP requests from this device. Please try again later.",
      retryAfter: ipLimit.retryAfter,
    });
  }

  const otp = String(randomInt(100000, 1000000));
  const stored = await redisSet(`otp:${mobile}`, otp, OTP_TTL_SECONDS);
  if (!stored) {
    return res.status(503).json({ error: "OTP service is temporarily unavailable" });
  }

  try {
    await sendWhatsAppConfirmation(
      formatPhoneNumber(mobile),
      getWhatsAppNumberConfirmationMessageBody(otp),
      WHATSAPP_NUMBER_CONFIRMATION,
    );
  } catch (error) {
    await redisDel(`otp:${mobile}`);
    throw error;
  }

  return res.status(200).json({ message: "OTP sent successfully" });
}

async function handleVerifyOtp(req, res, mobile) {
  const name = String(req.body?.name ?? "").trim();
  const otp = String(req.body?.otp ?? "").trim();
  if (!name || name.length > 120 || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: "A valid name and 6-digit OTP are required" });
  }

  const mobileLimit = await rateLimit({
    key: `rl:otp:verify:mobile:${mobile}`,
    limit: OTP_VERIFY_LIMIT_PER_MOBILE,
    windowSeconds: OTP_RATE_WINDOW,
  });
  if (!mobileLimit.allowed) {
    return res.status(429).json({
      error: "Too many verification attempts. Please request a new code.",
      retryAfter: mobileLimit.retryAfter,
    });
  }

  const ipLimit = await rateLimit({
    key: `rl:otp:verify:ip:${getClientIp(req)}`,
    limit: OTP_VERIFY_LIMIT_PER_IP,
    windowSeconds: OTP_RATE_WINDOW,
  });
  if (!ipLimit.allowed) {
    return res.status(429).json({
      error: "Too many verification attempts from this device.",
      retryAfter: ipLimit.retryAfter,
    });
  }

  const storedOtp = await redisGet(`otp:${mobile}`);
  if (
    !storedOtp ||
    storedOtp.length !== otp.length ||
    !timingSafeEqual(Buffer.from(storedOtp), Buffer.from(otp))
  ) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // Only one verification request for this code may append a spreadsheet row.
  const claimed = await redisSetNX(
    `otp:appointment:verified:${mobile}:${otp}`,
    "1",
    OTP_TTL_SECONDS,
  );
  if (!claimed) {
    return res.status(409).json({ error: "This OTP is already being processed" });
  }

  await redisDel(`otp:${mobile}`);

  // Start the optional sheet write without delaying the successful OTP response.
  void logAppointmentContactToGoogleSheet({ name, mobileNumber: mobile }).catch(
    (error) => {
      console.error(
        "Failed to log verified appointment contact to Google Sheets:",
        error,
      );
    },
  );

  // Spreadsheet logging is best-effort: a Sheets outage must not block booking.
  return res.status(200).json({ success: true, message: "OTP verified" });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const action = req.body?.action;
  const mobile = normalizeMobile(req.body?.mobile);
  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ error: "A valid 10-digit mobile number is required" });
  }

  try {
    if (action === "send") {
      return await handleSendOtp(req, res, mobile);
    }
    if (action === "verify") {
      return await handleVerifyOtp(req, res, mobile);
    }
    return res.status(400).json({ error: "Invalid OTP action" });
  } catch (error) {
    console.error("Error handling appointment OTP:", error);
    return res.status(500).json({ error: "Unable to process OTP request" });
  }
}
