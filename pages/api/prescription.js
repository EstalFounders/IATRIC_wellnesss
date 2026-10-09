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
  try {
    await dbConnect();

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
        { new: true }
      );
    }

    // 2. WhatsApp Notification Flow
    let whatsapp = { sent: false };
    try {
      // Determine recipient details (use updated DB values, or fall back to payload fields)
      const recipientNumber = patientNo || updateStatus?.patientMobNo || patientMobNo;
      const recipientName = name || updateStatus?.name || "Patient";

      if (recipientNumber) {
        const result = await sendWhatsAppConfirmation(
          formatPhoneNumber(recipientNumber.toString()),
          { patient_name: recipientName, prescription_url: prescriptionUrl },
          WHATSAPP_PRESCRIPTION_TEMPLATE
        );
        // Fast2SMS returns HTTP 200 with `return: false` on rejection (it does not throw),
        // so treat that as a failure too, otherwise real errors hide behind "send successfully".
        if (result && result.return === false) {
          const reason = Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "fast2sms_rejected";
          whatsapp = { sent: false, reason, number: recipientNumber.toString() };
        } else {
          whatsapp = { sent: true, number: recipientNumber.toString() };
        }
      } else {
        console.warn("Skipping WhatsApp: No phone number provided in request or database.");
        whatsapp = { sent: false, reason: "no_phone_number" };
      }
    } catch (whatsappError) {
      console.error("WhatsApp prescription notification failed:", whatsappError);
      whatsapp = { sent: false, reason: whatsappError.message || "whatsapp_error" };
    }

    res.status(200).json({ status: "send successfully", whatsapp });
  } catch (error) {
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
