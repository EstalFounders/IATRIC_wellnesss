// pages/api/superAdmin/importDoctorsFromSheet.js
//
// Reads the "Doctor Details" Google Sheet and onboards every row whose Status is
// "Ready to onboard", using the same field mapping as the Add Doctor form. The
// template carries no date column: each imported doctor joins now, and the only
// value written back to the sheet is the created "Doctor ID".

import { dbConnect } from "../../../src/lib/db";
import Doctor from "../../../src/models/doctorModel";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { parseEducationTraining } from "../../../src/customUtils/educationTraining";
import { parseLanguages } from "../../../src/customUtils/languages";
import { parseWorkExperience } from "../../../src/customUtils/workExperience";
import { requireAuth } from "../../../src/lib/requireLogAuth";
import { DoctorType } from "../../../src/constant";
import bcrypt from "bcryptjs";
import { generateTempPassword } from "../../../src/utils/generateTempPassword";
import { sendWhatsAppConfirmation } from "../lib/communication";
import { WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE } from "../utils/constants";
import { getDoctorCredentialsMessageBody } from "../utils/whatsappMessageBodies";
import { formatPhoneNumber } from "../utils/commonmethod";
import { getConfiguredAppUrl } from "../../../src/lib/appOrigin";

const SHEET_ID =
  process.env.DOCTOR_SHEET_ID ||
  "10stn51J9AnTj0BK3sbRIcAwZaEX4lJhmUKBVsV_55xM";
const SHEET_NAME = process.env.DOCTOR_SHEET_NAME || "Doctor Details";
const READY_STATUS = "Ready to onboard";

const cell = (row, header) => String(row.get(header) ?? "").trim();

const splitList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// Same normalisation as pages/api/addDoctor.js (accepts JSON or comma-joined
// names).
function parseConsultationTypes(raw) {
  let value = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        value = JSON.parse(trimmed);
      } catch {
        value = trimmed.split(",");
      }
    } else {
      value = trimmed.split(",");
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        const name = entry.trim();
        return name ? { name, price: null } : null;
      }
      const name = String(entry?.name || "").trim();
      if (!name) return null;
      const numeric = Number(entry?.price);
      const price = Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
      return { name, price };
    })
    .filter(Boolean);
}

function toMobileNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? Number(digits.slice(-10)) : null;
}

function toSlotDate(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

function toBoolean(value) {
  return !/^(no|false|0)$/i.test(String(value || "").trim());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!clientEmail || !privateKey) {
      return res.status(500).json({
        success: false,
        error: "Google service-account credentials are not configured",
      });
    }

    const auth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[SHEET_NAME];
    if (!sheet) {
      return res.status(500).json({
        success: false,
        error: `Sheet "${SHEET_NAME}" not found`,
      });
    }

    await sheet.loadHeaderRow();
    if (!sheet.headerValues.includes("Status")) {
      return res.status(500).json({
        success: false,
        error: "The sheet is missing the Status column",
      });
    }

    const rows = await sheet.getRows();
    const readyRows = rows.filter((row) => cell(row, "Status") === READY_STATUS);
    if (!readyRows.length) {
      return res.status(200).json({
        success: true,
        imported: 0,
        skipped: 0,
        errors: [],
        message: "No doctors with status 'Ready to onboard' found",
      });
    }

    // Dedupe against the three unique fields on the Doctor schema.
    const existing = await Doctor.find({})
      .select("email mobileNumber doctorRegistrationNo")
      .lean();
    const emails = new Set(
      existing
        .map((doctor) => String(doctor.email || "").trim().toLowerCase())
        .filter(Boolean)
    );
    const mobiles = new Set(
      existing
        .map((doctor) => String(doctor.mobileNumber || "").trim())
        .filter(Boolean)
    );

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of readyRows) {
      const name = cell(row, "Name");
      const email = cell(row, "Email");
      const mobileNumber = toMobileNumber(cell(row, "Mobile Number"));
      const label = name || email || "(unnamed row)";

      try {
        const missing = [];
        if (!name) missing.push("Name");
        if (!email) missing.push("Email");
        if (!mobileNumber) missing.push("Mobile Number");
        if (!cell(row, "Area of Expertise")) missing.push("Area of Expertise");
        if (!cell(row, "Work Days")) missing.push("Work Days");
        if (!cell(row, "Overview")) missing.push("Overview");

        const language = parseLanguages(cell(row, "Languages"));
        const workExperience = parseWorkExperience(cell(row, "Work Experience"));
        const consultationType = parseConsultationTypes(cell(row, "Consultation Types"));
        const serviceOffered = splitList(cell(row, "Services Offered"));
        if (!language.length) missing.push("Languages");
        if (!workExperience.length) missing.push("Work Experience");
        if (!consultationType.length) missing.push("Consultation Types");
        if (!serviceOffered.length) missing.push("Services Offered");

        if (missing.length) {
          skipped += 1;
          errors.push({
            name: label,
            error:
              missing.length === 1
                ? `${missing[0]} is empty`
                : `${missing.join(", ")} are empty`,
          });
          continue;
        }

        if (emails.has(email.toLowerCase())) {
          skipped += 1;
          errors.push({ name: label, error: "Email already exists" });
          continue;
        }
        if (mobiles.has(String(mobileNumber))) {
          skipped += 1;
          errors.push({ name: label, error: "Mobile number already exists" });
          continue;
        }
        // The registration number is optional and not unique any more - it is
        // imported as it appears in the sheet.
        const registrationNo = cell(row, "Registration No").trim();

        const slotStartTime = toSlotDate(cell(row, "Slot Start Time"));
        const slotEndTime = toSlotDate(cell(row, "Slot End Time"));

        // Auto-generated temporary password (hashed), sent over WhatsApp after
        // the doctor is created — same as the Add Doctor form.
        const rawPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const doctor = {
          name,
          email,
          mobileNumber,
          gender: cell(row, "Gender") || undefined,
          expertise: cell(row, "Area of Expertise"),
          doctorRegistrationNo: registrationNo,
          language,
          workDays: cell(row, "Work Days"),
          overview: cell(row, "Overview"),
          educationTraining: parseEducationTraining(cell(row, "Education & Training")),
          workExperience,
          consultationType,
          serviceOffered,
          doctorType: cell(row, "Doctor Type") || DoctorType.individual,
          doctorShare: Number(cell(row, "Doctor Share")) || 0,
          location: {
            state: cell(row, "Location (State)"),
            city: cell(row, "Location (City)"),
          },
          profilePictureUrl: cell(row, "Profile Picture URL") || undefined,
          diplomasCertificatesUrls: splitList(cell(row, "Certificates URLs")),
          doctorStampUrl: cell(row, "Stamp URL") || undefined,
          doctorSignatureUrl: cell(row, "Signature URL") || undefined,
          password: hashedPassword,
          isActive: toBoolean(cell(row, "Is Active")),
        };

        if (slotStartTime) doctor.slotStartTime = slotStartTime;
        if (slotEndTime) doctor.slotEndTime = slotEndTime;

        // The template has no date column: a doctor imported from the sheet
        // joins now (the Add Doctor form gets the same value from the schema
        // default).
        doctor.joiningDate = new Date();

        const created = await Doctor.create(doctor);
        row.set("Doctor ID", String(created._id));
        try {
          await row.save();
        } catch (saveError) {
          console.error("Could not write back to sheet:", saveError.message);
        }

        // Best-effort WhatsApp credentials (same flow as Add Doctor).
        try {
          const doctorUrl = `${getConfiguredAppUrl()}/registerDoc/login`;
          await sendWhatsAppConfirmation(
            formatPhoneNumber(String(created.mobileNumber ?? "")),
            getDoctorCredentialsMessageBody({
              doctorName: created.name,
              doctorUrl,
              mobileNumber: String(created.mobileNumber ?? ""),
              tempPassword: rawPassword,
            }),
            WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE
          );
        } catch (notifyError) {
          console.error("Failed to send doctor credentials WhatsApp:", notifyError);
        }

        emails.add(email.toLowerCase());
        mobiles.add(String(mobileNumber));
        imported += 1;
      } catch (error) {
        console.error(`Import failed for "${label}":`, error.message);
        skipped += 1;
        errors.push({
          name: label,
          // A duplicate that slipped past the sets (a repeated value inside the
          // sheet itself) still gets a readable row error.
          error:
            error?.code === 11000
              ? "Email or mobile number already exists"
              : error.message || "Unknown error",
        });
      }
    }

    return res.status(200).json({ success: true, imported, skipped, errors });
  } catch (error) {
    console.error("importDoctorsFromSheet failed:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Import failed" });
  }
}
