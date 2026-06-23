// pages/api/upload-pdf.js
import multiparty from "multiparty";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../lib/firebase";
import {
  api,
  appointment_status,
  prescription_img_path,
  contact_no,
} from "../../src/constant";
import {
  sendWhatsAppConfirmation,
  sendWhatsAppMessage,
} from "./lib/communication";
import Appointment from "../../src/models/appointmentSchema";
import mongoose from "mongoose";
import { dbConnect } from "../../src/lib/db";
import { WHATSAPP_PRESCRIPTION_TEMPLATE } from "./utils/constants";
import { formatPhoneNumber } from "./utils/commonmethod";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  let session;
  try {
    await dbConnect();

    session = await mongoose.startSession();
    session.startTransaction();

    // Destructure explicit fields from req.body to safely use as lookups or fallbacks
    // patientNo is sent from the frontend (dynamic mobile input); patientMobNo from DB lookup
    const { prescriptionUrl, appointmentId, name, patientNo, patientMobNo } = req.body;

    console.log("prescriptionUrl", prescriptionUrl, "appointmentId", appointmentId);

    let updateStatus = null;

    // 1. Only query DB if appointmentId exists and is structurally a valid Mongoose ObjectId
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      updateStatus = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          prescriptionUrl: prescriptionUrl,
          status: appointment_status.completed,
        },
        { new: true, session }
      );
    }

    // Commit the database transaction safely
    await session.commitTransaction();
    session.endSession();
    session = null;

    // 2. WhatsApp Notification Flow
    try {
      // Determine recipient details (use updated DB values, or fall back to payload fields)
      const recipientNumber = updateStatus?.patientMobNo || patientNo || patientMobNo;
      const recipientName = updateStatus?.name || name || "Patient";

      if (recipientNumber) {
        await sendWhatsAppConfirmation(
          formatPhoneNumber(recipientNumber.toString()),
          { patient_name: recipientName, prescription_url: prescriptionUrl },
          WHATSAPP_PRESCRIPTION_TEMPLATE
        );
      } else {
        console.warn("Skipping WhatsApp: No phone number provided in request or database.");
      }
    } catch (whatsappError) {
      console.error("WhatsApp prescription notification failed:", whatsappError);
    }

    res.status(200).json({ status: "send successfully" });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Error:", error);
    await logErrorToGoogleSheet({
      apiName: "prescription - POST",
      errorMessage: error.message || "Prescription upload failed",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId: req.body?.appointmentId, name: req.body?.name },
    });
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
