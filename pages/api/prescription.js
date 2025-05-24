// pages/api/upload-pdf.js
import multiparty from "multiparty";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../src/lib/firebase";
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
import { WHATSAPP_PRESCRIPTION_TEMPLATE } from "./utils/constants";
import { formatPhoneNumber } from "./utils/commonmethod";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  // console.log(files, 'files', fields, 'fields'); // Keep this for debugging
  let session; // Declare session variable
  try {
    // Start a Mongoose session for the transaction
    session = await mongoose.startSession();
    session.startTransaction();
    const { prescriptionUrl, appointmentId } = req.body;

    console.log(
      "prescriptionUrl",
      prescriptionUrl,
      "appointmentId",
      appointmentId
    );

    // Update the Appointment document *within the transaction*
    const updateStatus = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        prescriptionUrl: prescriptionUrl,
        status: appointment_status.completed, //  Use the string directly, or define it elsewhere.
      },
      { new: true, session } // Pass the session here!
    );

    if (!updateStatus) {
      throw new Error("Failed to update appointment status"); //  Throw an error to rollback
    }
    const prescriptionTemplateMessage = {
      patient_name: updateStatus.name,
      prescription_url: prescriptionUrl,
    };
    console.log(
      formatPhoneNumber(updateStatus.patientMobNo),
      "formatted phone number",
      updateStatus.patientMobNo,
      "patient mobile number",
      updateStatus,
      "update status"
    );
    await sendWhatsAppConfirmation(
      formatPhoneNumber(updateStatus.patientMobNo.toString()),
      prescriptionTemplateMessage,
      WHATSAPP_PRESCRIPTION_TEMPLATE
    );
    // send pdf url to patient whatsapp
    // const number = 7455992234;
    // const sendPdfUrl = await sendWhatsAppMessage(number, prescriptionUrl); // Await here

    // if (!sendPdfUrl) {
    //   throw new Error("Failed to send whastapp");
    // }

    // If all operations were successful, commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: "send successfully" });
  } catch (error) {
    // If any error occurred, roll back the transaction
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message }); // Include the error message
  }
}
