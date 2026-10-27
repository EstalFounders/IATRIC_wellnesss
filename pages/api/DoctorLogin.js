// pages/api/login.js

import bcrypt from "bcryptjs";
import { dbConnect } from "../../src/lib/db";
import Doctor from "../../src/models/doctorModel";
import { logErrorToGoogleSheet } from "./helper";

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
  const parsedJsonRequest = JSON.parse(req.body); 
  const { email, password } = parsedJsonRequest;
  try {
    const { db } = await dbConnect();

    // Check if user with provided email exists in the database
    const doctorRes = await Doctor.findOne({ email }).select("+password");
    if (!doctorRes || !doctorRes.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const match = await bcrypt.compare(password || "", doctorRes.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Never return the password hash to the client
    const doctor = doctorRes.toObject();
    delete doctor.password;

    // If email and password match, authentication successful
    return res.status(200).json({ message: doctor });
  } catch (error) {
    console.error(error);
    await logErrorToGoogleSheet({
      apiName: "DoctorLogin - POST",
      errorMessage: error.message || "Doctor login failed",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { email },
    });
    res.status(500).json({ message: "Internal server error" });
  }
}
