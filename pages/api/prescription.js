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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  let session;
  try {
    await dbConnect();

    session = await mongoose.startSession();
    session.startTransaction();

    const { prescriptionUrl, appointmentId } = req.body;

    console.log("prescriptionUrl", prescriptionUrl, "appointmentId", appointmentId);

    const updateStatus = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        prescriptionUrl: prescriptionUrl,
        status: appointment_status.completed,
      },
      { new: true, session }
    );

    if (!updateStatus) {
      throw new Error("Failed to update appointment status");
    }

    // Commit BEFORE the WhatsApp call so a network failure there
    // cannot roll back the prescriptionUrl write.
    await session.commitTransaction();
    session.endSession();
    session = null;

    // WhatsApp notification — failure is logged but does not undo the DB write.
    try {
      await sendWhatsAppConfirmation(
        formatPhoneNumber(updateStatus.patientMobNo.toString()),
        { patient_name: updateStatus.name, prescription_url: prescriptionUrl },
        WHATSAPP_PRESCRIPTION_TEMPLATE
      );
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
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
