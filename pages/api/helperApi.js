// pages/api/helperApi.js

import { dbConnect } from "../../src/lib/db";
import Prescription from "../../src/models/prescriptionSchema";
import Appointment from "../../src/models/appointmentSchema";
import mongoose from "mongoose"; 
import { logErrorToGoogleSheet } from "./helper";
import { syncDoctorDetailsSheet } from "../../src/lib/doctorSheetSync";


// --- sub-handlers ---

async function savePrescription(req, res) {
  try {
    await dbConnect();
    const {
      appointmentId,
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone,
      doctorRegistrationNo,
      doctorSpeciality,
      doctorStampUrl,
      doctorSignatureUrl,
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      patientAddress,
      chiefComplaints,
      diagnosis,
      medicalHistory,
      allergies,
      medicines,
      tests,
      advice,
      followUpDate,
      notes,
      prescriptionPdfUrl,
    } = req.body;

    const prescriptionData = {
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone,
      doctorRegistrationNo,
      doctorSpeciality,
      doctorStampUrl,
      doctorSignatureUrl,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      patientAddress,
      chiefComplaints: chiefComplaints || [],
      diagnosis,
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      advice,
      followUpDate,
      notes,
      prescriptionPdfUrl,
    };

    // Transform medicines array to match schema
    if (medicines && medicines.length > 0) {
      prescriptionData.medicines = medicines.map((med) => ({
        medicineName: med.medicineName || med.medicine || "",
        dosage: med.dosage || "",
        frequency: med.frequency || med.noOfTimes || "",
        duration: med.duration || med.days || "",
        notes: med.notes || "",
        quantity: med.quantity || med.qty || null,
      }));
    } else {
      prescriptionData.medicines = [];
    }

    // Transform tests array to match schema
    if (tests && tests.length > 0) {
      prescriptionData.tests = tests.map((test) => ({
        testName: Array.isArray(test.testName) ? test.testName : [test.testName || test.test || ""].filter(Boolean),
        instructions: test.instructions || "",
      }));
    } else {
      prescriptionData.tests = [];
    }

    // Only set doctorId if it's a valid ObjectId
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      prescriptionData.doctorId = doctorId;
    }

    // Only set appointmentId if it's a valid ObjectId
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      prescriptionData.appointmentId = appointmentId;
    }

    // Only set patientId if it's a valid ObjectId
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      prescriptionData.patientId = patientId;
    }

    const prescription = new Prescription(prescriptionData);

    await prescription.save();

    // Update appointment with prescription URL
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        prescriptionUrl: prescriptionPdfUrl,
      });
    }

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    console.error("Error saving prescription:", error);
    await logErrorToGoogleSheet({
      apiName: "helperApi - savePrescription",
      errorMessage: error.message || "Failed to save prescription",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId: req.body?.appointmentId, patientName: req.body?.patientName },
    });
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

async function getPrescription(req, res) {
  try {
    await dbConnect();
    const { appointmentId } = req.query;

    if (!appointmentId) {
      return res.status(400).json({ error: "appointmentId is required" });
    }

    const prescription = await Prescription.findOne({ appointmentId });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.status(200).json({ prescription });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    await logErrorToGoogleSheet({
      apiName: "helperApi - getPrescription",
      errorMessage: error.message || "Failed to get prescription",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId: req.query?.appointmentId },
    });
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

/**
 * POST /api/helperApi?action=syncDoctorSheet
 *
 * Append-only sync of the doctors + nursing-staff collections into the "Doctor
 * Details" sheet: reads the sheet headers + existing names, then appends every
 * doctor / staff member that is not there yet. Existing rows are never touched.
 * Called by the nightly cron `doctorSheetSync` (src/cron/jobs.js); `?dryRun=1`
 * reports without writing.
 */
async function syncDoctorSheet(req, res) {
  // Optional guard: enforced only when CRON_SECRET is set, so a deployment that
  // never sets it keeps working. The cron sends it (src/cron/scheduler.js).
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (secret && String(req.headers["x-cron-secret"] || "").trim() !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dryRun = ["1", "true"].includes(
    String(req.query?.dryRun || "").toLowerCase()
  );

  try {
    const report = await syncDoctorDetailsSheet({ apply: !dryRun });
    console.log(
      "[SHEET] helperApi - syncDoctorSheet:",
      JSON.stringify({
        dryRun,
        sheetRows: report.sheetRows,
        dbDoctors: report.dbDoctors,
        dbStaff: report.dbStaff,
        matched: report.matched,
        appended: report.appended.length,
        appendedDoctors: report.appendedDoctors,
        appendedStaff: report.appendedStaff,
        failed: report.errors.length,
      })
    );
    res.status(200).json({ success: true, dryRun, ...report });
  } catch (error) {
    console.error("Error syncing doctor sheet:", error);
    await logErrorToGoogleSheet({
      apiName: "helperApi - syncDoctorSheet",
      errorMessage: error.message || "Failed to sync doctor sheet",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { dryRun },
    });
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

// --- main handler (single default export) ---

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method === "POST" && action === "savePrescription") {
    return savePrescription(req, res);
  }

  if (req.method === "GET" && action === "getPrescription") {
    return getPrescription(req, res);
  }

  if (req.method === "POST" && action === "syncDoctorSheet") {
    return syncDoctorSheet(req, res);
  }

  res.status(400).json({ error: "Invalid action or method" });
}