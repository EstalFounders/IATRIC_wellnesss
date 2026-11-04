// pages/api/DoctorLogin.js

import bcrypt from "bcryptjs";
import { dbConnect } from "../../src/lib/db";
import Doctor from "../../src/models/doctorModel";
import { logErrorToGoogleSheet } from "./helper";
import {
  INVALID_LOGIN_MESSAGE,
  doctorLoginFilter,
} from "../../src/lib/loginIdentifier";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost",
  "capacitor://localhost",
  "https://localhost",
  "http://localhost:8100",
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  const parsedJsonRequest =
    typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  // `identifier` is the current field name; the aliases keep older clients
  // (which sent `email`, or only a mobile number) working.
  const identifier =
    parsedJsonRequest.identifier ??
    parsedJsonRequest.login_id ??
    parsedJsonRequest.loginId ??
    parsedJsonRequest.email ??
    parsedJsonRequest.mobileNumber ??
    parsedJsonRequest.mobile;
  const { password } = parsedJsonRequest;
  try {
    const { db } = await dbConnect();

    // Resolves to `{ email: /^...$/i }` or `{ mobileNumber: { $in: [...] } }`.
    // Null means the input is neither a valid email nor a 10-digit mobile.
    const filter = doctorLoginFilter(identifier);
    if (!filter) {
      return res.status(401).json({ message: INVALID_LOGIN_MESSAGE });
    }

    const doctorRes = await Doctor.findOne(filter).select("+password");
    if (!doctorRes || !doctorRes.password) {
      return res.status(401).json({ message: INVALID_LOGIN_MESSAGE });
    }

    // Compare password
    const match = await bcrypt.compare(password || "", doctorRes.password);
    if (!match) {
      return res.status(401).json({ message: INVALID_LOGIN_MESSAGE });
    }

    // Never return the password hash to the client
    const doctor = doctorRes.toObject();
    delete doctor.password;

    // If the identifier and password match, authentication successful
    return res.status(200).json({ message: doctor });
  } catch (error) {
    console.error(error);
    await logErrorToGoogleSheet({
      apiName: "DoctorLogin - POST",
      errorMessage: error.message || "Doctor login failed",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { identifier },
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

