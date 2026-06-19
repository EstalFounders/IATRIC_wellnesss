// pages/api/login.js

import bcrypt from "bcryptjs";
import { dbConnect } from "../../src/lib/db";
import Doctor from "../../src/models/doctorModel";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  const parsedJsonRequest = JSON.parse(req.body); 
  const { email, password } = parsedJsonRequest;
  // Validate email and password (you can add more validation logic here)
  console.log(email, "credentails email and password", password);
  try {
    const { db } = await dbConnect();

    // Check if user with provided email exists in the database
    const doctorRes = await Doctor.findOne({ email });
    if (!doctorRes) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const match = await bcrypt.compare(password, doctorRes.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If email and password match, authentication successful
    return res.status(200).json({ message: doctorRes });
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
