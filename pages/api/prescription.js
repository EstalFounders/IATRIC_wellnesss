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
  twilioPhoneNumber,
} from "../../src/constant";
import { sendWhatsAppMessage } from "./lib/communication";
import Appointment from "../../src/models/appointmentSchema";
import mongoose from "mongoose";

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser as we'll handle the request body manually
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // console.log(files, 'files', fields, 'fields'); // Keep this for debugging

    let session; // Declare session variable
    try {
      // Start a Mongoose session for the transaction
      session = await mongoose.startSession();
      session.startTransaction();

      // Read the file into a Buffer
      const fileBuffer = fs.readFileSync(files.prescriptionpdfFile[0].path);
      const appointmentId = fields.appointmentId[0];
      const patientName = fields.patientName[0];
      const doctorName = fields.doctorName[0];

      // Upload PDF to Google Cloud Storage
      const storageRef = ref(
        storage,
        `${prescription_img_path}/patient=${patientName},doctor=${doctorName}_${uuidv4()}`
      );
      const metadata = {
        contentType: "application/pdf",
      };
      await uploadBytes(storageRef, fileBuffer, metadata);

      // Return the URL of the uploaded PDF file
      const prescriptionUrl = await getDownloadURL(storageRef);

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

      // send pdf url to patient whatsapp
      // const number = 7455992234;
      // const sendPdfUrl = await sendWhatsAppMessage(number, prescriptionUrl); // Await here

      // if (!sendPdfUrl) {
      //   throw new Error("Failed to send whastapp");
      // }

      // If all operations were successful, commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ status: "send successfully", prescriptionUrl });
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
  });
}
