// pages/api/helperApi.js

import { dbConnect } from "../../src/lib/db";
import ArticlePostCategory from "../../src/models/postArticleCategorySchema";
import Prescription from "../../src/models/prescriptionSchema";
import Appointment from "../../src/models/appointmentSchema";
import mongoose from "mongoose"; 


// --- sub-handlers ---

async function fetchArticleCateogries(req, res) {
  try {
    await dbConnect();
    const allPost = await ArticlePostCategory.find();
    res.status(200).json({ allPost });
  } catch (error) {
    console.error("Error listing medicine data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

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

    // Update appointment with prescription URL FIRST so it is always persisted,
    // even when the full prescription document cannot be created.
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId) && prescriptionPdfUrl) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        prescriptionUrl: prescriptionPdfUrl,
      });
    }

    // Only create the full Prescription document when the required fields are present.
    let prescription = null;
    if (doctorId && patientName) {
      prescription = new Prescription(prescriptionData);
      await prescription.save();
    }

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    console.error("Error saving prescription:", error);
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
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

// --- main handler (single default export) ---

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method === "GET" && action === "fetchCateogories") {
    return fetchArticleCateogries(req, res);
  }

  if (req.method === "POST" && action === "savePrescription") {
    return savePrescription(req, res);
  }

  if (req.method === "GET" && action === "getPrescription") {
    return getPrescription(req, res);
  }

  res.status(400).json({ error: "Invalid action or method" });
}
