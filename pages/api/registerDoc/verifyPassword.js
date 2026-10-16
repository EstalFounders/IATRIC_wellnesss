// pages/api/registerDoc/verifyPassword.js
//
// Checks a doctor's password against the stored bcrypt hash. Used by the
// prescription preview gate so the browser never needs the password itself.
import { compare } from "bcryptjs";
import mongoose from "mongoose";
import { dbConnect } from "../../../src/lib/db";
import Doctor from "../../../src/models/doctorModel";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { doctorId, password } = req.body || {};
  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId) || !password) {
    return res.status(400).json({ valid: false, error: "doctorId and password are required" });
  }

  try {
    await dbConnect();
    const doctor = await Doctor.findById(doctorId).select("+password").lean();
    const valid = Boolean(doctor?.password && (await compare(password, doctor.password)));
    return res.status(200).json({ valid });
  } catch (error) {
    console.error("Error verifying doctor password:", error);
    return res.status(500).json({ valid: false, error: "Internal Server Error" });
  }
}
