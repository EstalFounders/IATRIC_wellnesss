import { formatPhoneNumber } from "../utils/commonmethod";
import { sendWhatsAppConfirmation } from "../lib/communication";
import { WHATSAPP_NUMBER_CONFIRMATION } from "../utils/constants";
import { getWhatsAppNumberConfirmationMessageBody } from "../utils/whatsappMessageBodies";
import { rateLimit } from "../../../src/lib/rateLimiter";
import { redisSet } from "../../../src/lib/redis";

const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_RATE_LIMIT_PER_MOBILE = 5; // 5 OTP sends per 10 min per mobile
const OTP_RATE_LIMIT_PER_IP = 20; // 20 OTP sends per 10 min per IP
const OTP_RATE_WINDOW = 600; // 10 minutes

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ error: "mobile and otp are required" });
    }

    // Rate limit per mobile number
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

    // Rate limit per IP
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    const ipLimit = await rateLimit({
      key: `rl:otp:ip:${ip}`,
      limit: OTP_RATE_LIMIT_PER_IP,
      windowSeconds: OTP_RATE_WINDOW,
    });
    if (!ipLimit.allowed) {
      return res.status(429).json({
        error: "Too many OTP requests from this device. Please try again later.",
        retryAfter: ipLimit.retryAfter,
      });
    }

    // Store OTP in Redis with 5-minute TTL for verification
    await redisSet(`otp:${mobile}`, String(otp), OTP_TTL_SECONDS);

    await sendWhatsAppConfirmation(
      formatPhoneNumber(mobile.toString()),
      getWhatsAppNumberConfirmationMessageBody(otp),
      WHATSAPP_NUMBER_CONFIRMATION
    );

    res.status(200).json({ message: "SMS confirmation sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Check your mobile number and try again",
    });
  }
}
