// pages/api/upload-pdf.js
import multiparty from "multiparty";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../lib/firebase";
import {
  api,
  prescription_img_path,
  contact_no,
} from "../../src/constant";
import {
  sendWhatsAppConfirmation,
  sendWhatsAppMessage,
} from "./lib/communication";
import Appointment from "../../src/models/appointmentSchema";
import Prescription from "../../src/models/prescriptionSchema";
import mongoose from "mongoose";
import { dbConnect } from "../../src/lib/db";
import { markAppointmentCompleted } from "../../src/lib/appointmentStatus";
import { WHATSAPP_PRESCRIPTION_TEMPLATE } from "./utils/constants";
import { formatPhoneNumber } from "./utils/commonmethod";
import { logErrorToGoogleSheet } from "./helper";

const text = (value) => (value === undefined || value === null ? "" : String(value).trim());
const asList = (value) => (Array.isArray(value) ? value : [value]).map(text).filter(Boolean);
const validId = (value) => value && mongoose.Types.ObjectId.isValid(value);

// Maps the prescription form payload to the Prescription schema.
function buildPrescriptionDoc(details, appointmentId, prescriptionUrl) {
  const age = Number(details.patientAge);
  const doc = {
    doctorName: text(details.doctorName),
    doctorPhone: text(details.doctorPhone),
    doctorRegistrationNo: text(details.doctorRegistrationNo),
    doctorSpeciality: text(details.doctorSpeciality),
    doctorStampUrl: text(details.doctorStampUrl),
    doctorSignatureUrl: text(details.doctorSignatureUrl),
    patientName: text(details.patientName),
    patientGender: text(details.patientGender),
    patientPhone: text(details.patientPhone),
    chiefComplaints: asList(details.chiefComplaints),
    diagnosis: text(details.diagnosis),
    medicalHistory: asList(details.medicalHistory),
    allergies: asList(details.allergies),
    advice: text(details.advice),
    notes: text(details.notes),
    prescriptionPdfUrl: prescriptionUrl,
    medicines: (Array.isArray(details.medicines) ? details.medicines : [])
      .filter((med) => text(med?.medicineName))
      .map((med) => {
        const quantity = Number(med.quantity);
        return {
          medicineName: text(med.medicineName),
          dosage: [text(med.dosage), text(med.unit)].filter(Boolean).join(" ") || "NA",
          frequency:
            [text(med.noOfTimes) && `${text(med.noOfTimes)} times daily`, text(med.medicationSchedule), text(med.time)]
              .filter(Boolean)
              .join(" ") || text(med.frequency) || "NA",
          duration: text(med.days) ? `${text(med.days)} days` : "NA",
          notes: text(med.medicineGeneric),
          ...(Number.isFinite(quantity) && text(med.quantity) ? { quantity } : {}),
        };
      }),
    tests: asList(details.tests).length ? [{ testName: asList(details.tests) }] : [],
    updatedAt: new Date(),
  };
  if (Number.isFinite(age) && text(details.patientAge)) doc.patientAge = age;
  if (validId(details.doctorId)) doc.doctorId = details.doctorId;
  if (validId(details.patientId)) doc.patientId = details.patientId;
  if (validId(appointmentId)) doc.appointmentId = appointmentId;
  return doc;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    await dbConnect();

    // Destructure explicit fields from req.body to safely use as lookups or fallbacks
    // patientNo is sent from the frontend (dynamic mobile input); patientMobNo from DB lookup
    const { prescriptionUrl, appointmentId, name, patientNo, patientMobNo, prescriptionDetails } = req.body;

    console.log("prescriptionUrl", prescriptionUrl, "appointmentId", appointmentId);

    // Recipient fallbacks for the WhatsApp message. The booking is only *read*
    // here: its status must stay untouched until the prescription actually
    // reaches the patient (see the completion step after the send).
    const appointmentInfo = validId(appointmentId)
      ? await Appointment.findById(appointmentId).select("name patientMobNo").lean()
      : null;

    // Store the prescription details. Kept separate so a failure here never blocks sending.
    if (prescriptionDetails && typeof prescriptionDetails === "object") {
      try {
        const doc = buildPrescriptionDoc(prescriptionDetails, appointmentId, prescriptionUrl);
        if (doc.appointmentId) {
          // Upsert so re-sending the same appointment's prescription doesn't create duplicates.
          await Prescription.findOneAndUpdate(
            { appointmentId: doc.appointmentId },
            { $set: doc, $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
          );
        } else {
          await Prescription.create([doc], { validateBeforeSave: false });
        }
      } catch (saveError) {
        console.error("Failed to store prescription details:", saveError);
        await logErrorToGoogleSheet({
          apiName: "prescription - store details",
          errorMessage: saveError.message || "Failed to store prescription",
          errorCode: "500",
          stackTrace: saveError.stack,
          requestPayload: { appointmentId, name },
        });
      }
    }

    // Store the prescription details. Kept separate so a failure here never blocks sending.
    if (prescriptionDetails && typeof prescriptionDetails === "object") {
      try {
        const doc = buildPrescriptionDoc(prescriptionDetails, appointmentId, prescriptionUrl);
        if (doc.appointmentId) {
          // Upsert so re-sending the same appointment's prescription doesn't create duplicates.
          await Prescription.findOneAndUpdate(
            { appointmentId: doc.appointmentId },
            { $set: doc, $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
          );
        } else {
          await Prescription.create([doc], { validateBeforeSave: false });
        }
      } catch (saveError) {
        console.error("Failed to store prescription details:", saveError);
        await logErrorToGoogleSheet({
          apiName: "prescription - store details",
          errorMessage: saveError.message || "Failed to store prescription",
          errorCode: "500",
          stackTrace: saveError.stack,
          requestPayload: { appointmentId, name },
        });
      }
    }

    // 2. WhatsApp Notification Flow
    let whatsapp = { sent: false };
    try {
      // Determine recipient details (use updated DB values, or fall back to payload fields)
      const recipientNumber = patientNo || appointmentInfo?.patientMobNo || patientMobNo;
      const recipientName = name || appointmentInfo?.name || "Patient";

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

    // 3. Finish the consultation.
    // Only a prescription that was generated *and* delivered marks the booking
    // COMPLETED - that status is what makes the consultation billable, so an
    // undelivered message must leave it as it was. The PDF URL is still stored
    // on a failed send so the panel can show/share the prescription.
    let appointmentStatus = "";
    if (validId(appointmentId)) {
      if (whatsapp.sent) {
        const completion = await markAppointmentCompleted(appointmentId, {
          prescriptionUrl,
          source: "prescription-send",
        });
        appointmentStatus = completion.appointment?.status || "";
      } else {
        try {
          await Appointment.updateOne(
            { _id: appointmentId },
            { $set: { prescriptionUrl } },
          );
        } catch (linkError) {
          // Not fatal: the prescription document itself is already stored.
          console.error("Failed to store prescription URL:", linkError);
        }
      }
    }

    res.status(200).json({
      status: whatsapp.sent ? "send successfully" : "prescription saved, whatsapp not sent",
      whatsapp,
      sent: Boolean(whatsapp.sent),
      appointmentStatus,
    });
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
