import { v4 as uuidv4 } from "uuid";
import multiparty from "multiparty";
import {
  certificate_img_path,
  doctorSignature_img_path,
  doctorStamp_img_path,
  profilePicture_img_path,
} from "../../src/constant";
import { storage } from "../../lib/firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { dbConnect } from "../../src/lib/db";
import Doctor from "../../src/models/doctorModel";
import { parseEducationTraining } from "../../src/customUtils/educationTraining";
import { parseLanguages } from "../../src/customUtils/languages";
import { parseLocation } from "../../src/customUtils/indiaLocations";
import { parseWorkExperience } from "../../src/customUtils/workExperience";
import { sendWhatsAppConfirmation } from "./lib/communication";
import { WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE } from "./utils/constants";
import { getDoctorCredentialsMessageBody } from "./utils/whatsappMessageBodies";
import { formatPhoneNumber } from "./utils/commonmethod";
import { getConfiguredAppUrl } from "../../src/lib/appOrigin";
import fs from "fs"; // Import the fs module
import { resizeImage } from "../../src/components/Common/ResizeImage";
import bcrypt from "bcryptjs";
import { generateTempPassword } from "../../src/utils/generateTempPassword";
import Slot from "../../src/models/slots";
import { logErrorToGoogleSheet } from "./helper";
import {
  isResizableImage,
} from "../../src/customUtils/imageUpload";

// Global variable to store the database connection
let isConnected = false;

/**
 * Columns that no longer exist on the Doctor schema. They are stripped from both
 * the create (POST) and the update (PUT) payloads, so an older/cached client -
 * or a pending doctor-panel change request saved before the removal - cannot
 * write the dropped column back into MongoDB. The one-off cleanup of the
 * documents that already carry them lives in `scripts/removeDoctorDegree.js`.
 */
const REMOVED_DOCTOR_FIELDS = ["degree", "price", "servicePrices"];

function stripRemovedDoctorFields(fields) {
  const cleaned = { ...fields };
  for (const field of REMOVED_DOCTOR_FIELDS) delete cleaned[field];
  return cleaned;
}

/**
 * Email and mobile number must be unique across doctors. The Doctor schema backs
 * them with unique indexes; the helpers below turn a clash into the friendly 409
 * the admin panel shows, and the `checkUnique` GET branch powers the on-blur check
 * of the Add Doctor form. The registration number is intentionally not checked -
 * it is an optional field a doctor can fill in later.
 */
const DUPLICATE_DOCTOR_MESSAGE =
  "A doctor with this email or mobile number already exists.";
const DUPLICATE_FIELD_MESSAGES = {
  email: "This email is already registered to another doctor",
  mobileNumber: "This mobile number is already registered to another doctor",
};

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normaliseEmail(value) {
  return String(value ?? "").trim();
}

function normaliseRegistrationNo(value) {
  return String(value ?? "").trim();
}

/**
 * `mobileNumber` is stored as a Number, so it has to be compared numerically.
 * Accepts "+91 98765 43210" / "9876543210" and returns the numeric candidates
 * (every digit, plus the trailing 10 for numbers sent with a country code).
 */
function mobileNumberCandidates(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return [];
  const candidates = new Set([Number(digits)]);
  if (digits.length > 10) candidates.add(Number(digits.slice(-10)));
  return [...candidates].filter((candidate) => Number.isFinite(candidate));
}

/**
 * One `{ field, query }` entry per identity value that was sent, so a clash can
 * be reported for the exact field the admin has to fix. Email is matched
 * case-insensitively (MongoDB indexes are case-sensitive); the mobile number is
 * compared numerically.
 */
function buildUniqueFilters({ email, mobileNumber } = {}) {
  const filters = [];
  const emailValue = normaliseEmail(email);
  if (emailValue) {
    filters.push({
      field: "email",
      query: { email: new RegExp(`^${escapeRegExp(emailValue)}$`, "i") },
    });
  }

  const mobileCandidates = mobileNumberCandidates(mobileNumber);
  if (mobileCandidates.length > 0) {
    filters.push({
      field: "mobileNumber",
      query: { mobileNumber: { $in: mobileCandidates } },
    });
  }

  return filters;
}

/**
 * Returns `[{ field, message }]` for every unique field another doctor already
 * holds. `excludeId` lets the PUT ignore the doctor that is being edited.
 */
async function findDuplicateDoctors(values, excludeId) {
  const duplicates = [];
  const excludeSelf =
    typeof excludeId === "string" && /^[0-9a-fA-F]{24}$/.test(excludeId)
      ? excludeId
      : null;

  for (const { field, query } of buildUniqueFilters(values)) {
    const search = { ...query };
    if (excludeSelf) search._id = { $ne: excludeSelf };

    const existing = await Doctor.findOne(search).select("_id").lean();
    if (existing) {
      duplicates.push({ field, message: DUPLICATE_FIELD_MESSAGES[field] });
    }
  }

  return duplicates;
}

/** 409 with the friendly message + the exact clashing field(s). */
function sendDuplicateResponse(res, duplicates) {
  const fields = duplicates.map((duplicate) => duplicate.field);
  return res.status(409).json({
    error: DUPLICATE_DOCTOR_MESSAGE,
    message: DUPLICATE_DOCTOR_MESSAGE,
    field: fields[0] || null,
    fields,
    duplicates,
  });
}

/**
 * Maps a mongoose write error onto a friendly client response and returns true
 * when it did. `E11000` is what a unique index throws when two requests race
 * past the pre-check; `ValidationError` is a required/format problem.
 */
function sendDoctorWriteError(res, error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || null;
    sendDuplicateResponse(
      res,
      field
        ? [{ field, message: DUPLICATE_FIELD_MESSAGES[field] || DUPLICATE_DOCTOR_MESSAGE }]
        : []
    );
    return true;
  }

  if (error?.name === "ValidationError") {
    const message =
      Object.values(error.errors || {})
        .map((entry) => entry.message)
        .filter(Boolean)
        .join(" ") || "Please check the doctor details and try again.";
    res.status(400).json({ error: message, message });
    return true;
  }

  return false;
}

/**
 * Trims the identity fields before they reach mongoose, so " a@b.com " cannot
 * become a second account next to "a@b.com".
 */
function withNormalisedIdentityFields(doctorFields) {
  const cleaned = { ...doctorFields };

  if (cleaned.email !== undefined) cleaned.email = normaliseEmail(cleaned.email);
  if (cleaned.doctorRegistrationNo !== undefined) {
    cleaned.doctorRegistrationNo = normaliseRegistrationNo(
      cleaned.doctorRegistrationNo
    );
  }

  const mobileCandidates = mobileNumberCandidates(cleaned.mobileNumber);
  if (mobileCandidates.length > 0) cleaned.mobileNumber = mobileCandidates[0];

  return cleaned;
}

/**
 * Reads a multiparty upload and returns `{ buffer, contentType }` ready for
 * Firebase storage. Images are resized (sharp), anything else - a PDF
 * certificate, a scanned document - is uploaded exactly as it was received; the
 * forms allow any file type, so the upload path must never assume an image.
 */
async function prepareUpload(upload, size = 700) {
  const buffer = fs.readFileSync(upload.path);
  const declaredType = String(upload.headers?.["content-type"] || "").trim();
  const contentType = declaredType || "application/octet-stream";

  if (!isResizableImage(upload)) return { buffer, contentType };

  try {
    return { buffer: await resizeImage(buffer, size, size), contentType };
  } catch (error) {
    // A corrupt/unsupported picture must not fail the whole save - fall back to
    // storing the original file.
    console.error("Could not resize the uploaded image:", error.message);
    return { buffer, contentType };
  }
}

/**
 * Builds the doctor's `location` value from the multiparty fields. The Add
 * Doctor form now sends `locationState` + `locationCity`; the doctor-panel edit
 * form still sends a single `location` string. Returns null when the client
 * sent none of them, so the PUT can leave the stored value untouched.
 */
function parseLocationFields(fields) {
  if (fields.locationState !== undefined || fields.locationCity !== undefined) {
    return {
      state: String(fields.locationState?.[0] ?? "").trim(),
      city: String(fields.locationCity?.[0] ?? "").trim(),
    };
  }
  if (fields.location !== undefined) {
    return parseLocation(fields.location?.[0]);
  }
  return null;
}

/**
 * `consultationType` is now an array of `{ name, price }` entries, sent as one
 * JSON string form field. Accept both that and the legacy comma-joined string
 * ("Audio,Video"), normalising every entry to `{ name, price }` (price null when
 * absent). Always returns an array (possibly empty).
 */
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log("handler calling for get");
  const db = await dbConnect(); // Ensure database connection is established before handling requests
  if (req.method === "POST") {
    try {
      const form = new multiparty.Form();
      form.parse(req, async function (err, fields, files) {
        console.log(fields, "files in api");
        if (err) {
          console.error("Error parsing form data:", err);
          res
            .status(500)
            .json({ error: "An error occurred while parsing form data." });
          return;
        }
        try {
          // Email and mobile number must be unique. Checked here for the friendly
          // 409; the unique indexes catch the race.
          const duplicateDoctors = await findDuplicateDoctors({
            email: fields.email?.[0],
            mobileNumber: fields.mobileNumber?.[0],
          });
          if (duplicateDoctors.length > 0) {
            sendDuplicateResponse(res, duplicateDoctors);
            return;
          }

          // Ensure files.profilePicture and files.diplomasCertificates, doctor stamp, doctor signature are defined
          const doctorSignatureFile =
            files.digitalSignature && files.digitalSignature[0];

          const profilePictureFile =
            files.profilePicture && files.profilePicture[0];

          const doctorStampFile = files.doctorStamp && files.doctorStamp[0];

          const diplomasCertificatesFiles = Object.keys(files)
            .filter((key) => key.startsWith("diplomasCertificates"))
            .map((key) => files[key][0]); // Assuming each field has only one file

          // Ensure files.profilePicture, doctor stamp, doctor signature are defined
          let profilePictureUrl, doctorStampUrl, doctorSignatureUrl;

          if (doctorSignatureFile) {
            const doctorSignatureRef = ref(
              storage,
              `${doctorSignature_img_path}/${fields.name[0]}${uuidv4()}`
            );
            const { buffer, contentType } = await prepareUpload(
              doctorSignatureFile
            );
            const metadata = {
              contentType,
            };
            await uploadBytes(doctorSignatureRef, buffer, metadata); // Upload the Buffer

            // Get profile picture download URL
            doctorSignatureUrl = await getDownloadURL(doctorSignatureRef);
          }

          // upload doctor stamp
          if (doctorStampFile) {
            const doctorStampRef = ref(
              storage,
              `${doctorStamp_img_path}/${fields.name[0]}${uuidv4()}`
            );
            const { buffer, contentType } = await prepareUpload(doctorStampFile);
            const metadata = {
              contentType,
            };
            await uploadBytes(doctorStampRef, buffer, metadata); // Upload the Buffer

            // Get profile picture download URL
            doctorStampUrl = await getDownloadURL(doctorStampRef);
          }

          // Upload profile picture
          if (profilePictureFile) {
            const profilePictureRef = ref(
              storage,
              `${profilePicture_img_path}/${fields.name[0]}${uuidv4()}`
            );
            const { buffer, contentType } = await prepareUpload(profilePictureFile);
            const metadata = {
              contentType,
            };
            await uploadBytes(profilePictureRef, buffer, metadata); // Upload the Buffer

            // Get profile picture download URL
            profilePictureUrl = await getDownloadURL(profilePictureRef);
          }

          // Upload diplomas/certificates - images are resized, documents (PDF
          // scans, for instance) are stored exactly as uploaded.
          const diplomasCertificatesUrls = await Promise.all(
            diplomasCertificatesFiles.map(async (certificate, index) => {
              const certificateRef = ref(
                storage,
                `${certificate_img_path}/${fields.name[0]}${uuidv4()}`
              );
              const { buffer, contentType } = await prepareUpload(certificate);
              const metadata = {
                contentType,
              };
              await uploadBytes(certificateRef, buffer, metadata); // Upload the Buffer
              return getDownloadURL(certificateRef);
            })
          );

          // No password is collected on the form any more: every new doctor gets
          // an auto-generated temporary password, hashed, and it is sent to them
          // over WhatsApp below.
          const rawPassword = generateTempPassword();
          const hashedPassword = await bcrypt.hash(rawPassword, 10);

          const stringFields = Object.fromEntries(
            Object.entries(fields).map(([key, value]) => [
              key,
              value.toString(),
            ])
          );
          console.log(stringFields, "string fiels");
          const location = parseLocationFields(fields);
          delete stringFields.location;
          delete stringFields.locationState;
          delete stringFields.locationCity;
          delete stringFields.workExperience;
          const addedDoctor = await Doctor.create({
            ...withNormalisedIdentityFields(
              stripRemovedDoctorFields(stringFields)
            ),
            location: location ?? { state: "", city: "" },
            // Repeatable field: `fields.educationTraining` is one entry per
            // appended form field, so it must not be taken from the
            // comma-joined `stringFields` spread.
            educationTraining: parseEducationTraining(fields.educationTraining),
            workExperience: parseWorkExperience(fields.workExperience),
            // Repeatable field as well: one entry per appended `formData.append`
            // ("English", "Hindi"), never the comma-joined `stringFields` value.
            language: parseLanguages(fields.language),
            password: hashedPassword,
            profilePictureUrl,
            diplomasCertificatesUrls,
            doctorStampUrl,
            doctorSignatureUrl,
            consultationType: parseConsultationTypes(
              fields.consultationType?.[0]
            ),
            serviceOffered: stringFields.serviceOffered
              ? stringFields.serviceOffered
                  .split(",")
                  .map((type) => type.trim())
              : [], // Convert to array & trim spaces
          });

          console.log(addedDoctor._id, "Doctor Added");

          // Send the doctor their login credentials over WhatsApp. Best-effort:
          // a delivery failure must never fail the doctor creation.
          try {
            const doctorUrl = `${getConfiguredAppUrl()}/registerDoc/login`;
            await sendWhatsAppConfirmation(
              formatPhoneNumber(String(addedDoctor.mobileNumber ?? "")),
              getDoctorCredentialsMessageBody({
                doctorName: addedDoctor.name,
                doctorUrl,
                mobileNumber: String(addedDoctor.mobileNumber ?? ""),
                tempPassword: rawPassword,
              }),
              WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE
            );
          } catch (notifyError) {
            console.error("Failed to send doctor credentials WhatsApp:", notifyError);
          }

          res.status(200).json({
            message: "Doctor Added successfully",
          });

          // Assuming the rest of your code to handle the response and database operations
        } catch (error) {
          console.error("Error uploading files:", error);
          // Duplicate that raced past the pre-check, or a rejected document:
          // answer with the friendly message instead of a generic 500.
          if (sendDoctorWriteError(res, error)) return;
          await logErrorToGoogleSheet({
            apiName: "addDoctor - POST/formUpload",
            errorMessage: error.message || "File upload failed",
            errorCode: "500",
            stackTrace: error.stack,
          });
          res
            .status(500)
            .json({ error: "An error occurred while uploading files." });
        }
      });
    } catch (error) {
      console.error("Error parsing form data:", error);
      await logErrorToGoogleSheet({
        apiName: "addDoctor - POST/formParse",
        errorMessage: error.message || "Form parsing failed",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res
        .status(500)
        .json({ error: "An error occurred while parsing form data." });
    }
  } else if (req.method === "GET") {
    console.log("get method calling");
    
    // Real-time uniqueness check for the Add Doctor form:
    //   GET /api/addDoctor?checkUnique=1&email=...&mobileNumber=...
    // Any combination of the three values may be sent; `excludeId` lets an edit
    // form ignore the doctor being edited.
    if (req.query?.checkUnique === "1" || req.query?.checkUnique === "true") {
      try {
        const duplicates = await findDuplicateDoctors(
          {
            email: req.query.email,
            mobileNumber: req.query.mobileNumber,
          },
          req.query.excludeId
        );

        return res.status(200).json({
          available: duplicates.length === 0,
          duplicates,
          fields: duplicates.map((duplicate) => duplicate.field),
          message: duplicates.length > 0 ? DUPLICATE_DOCTOR_MESSAGE : "",
        });
      } catch (err) {
        console.error("Error checking doctor uniqueness:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while checking the doctor details." });
      }
    }

    try {
      const doctors = await Doctor.find();
      res.status(200).json(doctors);
    } catch (err) {
      console.error("Error fetching doctor data in server:", err);
      await logErrorToGoogleSheet({
        apiName: "addDoctor - GET",
        errorMessage: err.message || "Failed to fetch doctors",
        errorCode: "500",
        stackTrace: err.stack,
      });
      res
        .status(500)
        .json({ error: "An error occurred while fetching doctor data." });
    }
  } else if (req.method === "PUT") {
    try {
      const { id } = req.query;

      // Fetch the doctor by ID
      const existingDoctor = await Doctor.findById(id);
      console.log(existingDoctor, "existing doctor");

      if (!existingDoctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      const form = new multiparty.Form();
      form.parse(req, async function (err, fields, files) {
        if (err) {
          console.error("Error parsing form data:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while parsing form data." });
        }
        console.log(files, "files");
        // Ensure files.profilePicture and files.diplomasCertificates are defined and arrays
        const profilePictureFile =
          files.profilePicture && files.profilePicture[0];
        const diplomasCertificatesFiles = Object.keys(files)
          .filter((key) => key.startsWith("diplomasCertificates"))
          .map((key) => files[key][0]); // Assuming each field has only one file

        console.log(profilePictureFile, "profile file");
        // Upload profile picture if a new one is provided
        let profilePictureUrl = existingDoctor.profilePictureUrl;
        if (profilePictureFile) {
          // Upload profile picture
          const profilePictureRef = ref(
            storage,
            `${profilePicture_img_path}/${fields.name[0]}${uuidv4()}`
          );
          const { buffer, contentType } = await prepareUpload(profilePictureFile);
          const metadata = {
            contentType,
          };
          await uploadBytes(profilePictureRef, buffer, metadata); // Upload the Buffer

          // Get profile picture download URL
          profilePictureUrl = await getDownloadURL(profilePictureRef);
          console.log(profilePictureUrl, "profilePictureUrl");
        }

        // Certificates: the edit forms send the certificates that are kept as
        // `diplomasCertificatesUrls[i]` text fields and every newly picked file as
        // a file part. New files are ADDED to the stored list (never replacing it)
        // - a doctor registered without certificates must be able to add them
        // later, and an admin adding one must not lose the ones already there.
        const keptCertificateUrls = Object.keys(fields)
          .filter((key) => key.startsWith("diplomasCertificatesUrls"))
          .sort()
          .flatMap((key) => fields[key] || [])
          .map((entry) => String(entry).trim())
          .filter(Boolean);
        const clientSentCertificateList = Object.keys(fields).some((key) =>
          key.startsWith("diplomasCertificatesUrls")
        );

        const uploadedCertificateUrls = [];
        for (const certificateFile of diplomasCertificatesFiles) {
          const certificateRef = ref(
            storage,
            `${certificate_img_path}/${fields.name[0]}${uuidv4()}`
          );
          const { buffer, contentType } = await prepareUpload(certificateFile);
          await uploadBytes(certificateRef, buffer, { contentType }); // Upload the Buffer
          uploadedCertificateUrls.push(await getDownloadURL(certificateRef));
        }

        const diplomasCertificatesUrls =
          diplomasCertificatesFiles.length === 0 && !clientSentCertificateList
            ? // Nothing about the certificates was submitted (the doctor-panel
              // approval PUT, for instance): keep the stored list untouched.
              existingDoctor.diplomasCertificatesUrls
            : [
                ...(clientSentCertificateList
                  ? keptCertificateUrls
                  : existingDoctor.diplomasCertificatesUrls || []),
                ...uploadedCertificateUrls,
              ];
        console.log(diplomasCertificatesUrls, "diplomas");

        // Delete old profile picture from Firebase if a new one is uploaded and it's different from the existing one
        if (
          profilePictureFile &&
          existingDoctor.profilePictureUrl &&
          profilePictureUrl !== existingDoctor.profilePictureUrl
        ) {
          try {
            const oldProfilePictureRef = ref(
              storage,
              existingDoctor.profilePictureUrl
            );
            await deleteObject(oldProfilePictureRef);
            console.log("deleted old profile picture");
          } catch (error) {
            // The stored URL may be a legacy/external link - the new picture is
            // already saved, so a failed cleanup must not fail the request.
            console.error("Could not delete the old profile picture:", error.message);
          }
        }

        // Delete the certificates the admin/doctor removed. Only URLs that were
        // stored before and are no longer part of the list are touched, so adding
        // a certificate never deletes the existing ones.
        for (const oldUrl of existingDoctor.diplomasCertificatesUrls || []) {
          if (diplomasCertificatesUrls.includes(oldUrl)) continue;
          try {
            await deleteObject(ref(storage, oldUrl));
          } catch (error) {
            console.error("Could not delete a removed certificate:", error.message);
          }
        }
        console.log("deleted removed diplomas");

        // Update doctor data in MongoDB
        const stringFields = Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [key, value.toString()])
        );
        const location = parseLocationFields(fields);
        delete stringFields.location;
        delete stringFields.locationState;
        delete stringFields.locationCity;
        delete stringFields.workExperience;
        // Certificate URLs are handled above (kept list + freshly uploaded files);
        // the raw `diplomasCertificatesUrls[i]` keys must not reach the document.
        Object.keys(stringFields)
          .filter((key) => key.startsWith("diplomasCertificatesUrls"))
          .forEach((key) => delete stringFields[key]);

        // Refuse only a blank email: it is required and unique (it is also the
        // doctor's login). Every other field - registration number, certificates,
        // overview... - may be blank on an older document and filled in here.
        if (fields.email !== undefined && !normaliseEmail(fields.email?.[0])) {
          return res
            .status(400)
            .json({ error: "Email is required", message: "Email is required" });
        }

        // Email and mobile number must stay unique - the doctor being edited is
        // excluded from the comparison.
        const duplicateDoctors = await findDuplicateDoctors(
          {
            email: fields.email?.[0],
            mobileNumber: fields.mobileNumber?.[0],
          },
          id
        );
        if (duplicateDoctors.length > 0) {
          return sendDuplicateResponse(res, duplicateDoctors);
        }

        // Update doctor data in MongoDB
        const updateData = {
          ...withNormalisedIdentityFields(stripRemovedDoctorFields(stringFields)),
          profilePictureUrl,
          diplomasCertificatesUrls,
          consultationType: parseConsultationTypes(
            fields.consultationType?.[0]
          ),
        };

        // Location - only touch it when the client sends it (the doctor-panel
        // approval PUT never sends it, so it must keep the stored value).
        if (location !== null) {
          updateData.location = location;
        }

        // Services offered - only touch it when the client sends the field
        if (stringFields.serviceOffered !== undefined) {
          updateData.serviceOffered = stringFields.serviceOffered
            .split(",")
            .map((service) => service.trim())
            .filter(Boolean); // Convert to array & trim spaces
        }

        // Education + training - repeatable field, so it also comes straight
        // from the raw multiparty values. Only touched when the client sends it:
        // a present-but-blank field clears the list, an absent one keeps the
        // stored value (the doctor-panel approval PUT never sends this field).
        if (fields.educationTraining !== undefined) {
          updateData.educationTraining = parseEducationTraining(
            fields.educationTraining
          );
        }

        // Languages - repeatable field like educationTraining, so it also comes
        // straight from the raw multiparty values. Only touched when the client
        // sends it: a present-but-blank field clears the list, an absent one
        // keeps the stored value (the doctor-panel approval PUT never sends it).
        if (fields.language !== undefined) {
          updateData.language = parseLanguages(fields.language);
        }

        // Work experience - repeatable field, so it also comes straight from the
        // raw multiparty values. Only touched when the client sends it (the
        // doctor-panel approval PUT never sends this field).
        if (fields.workExperience !== undefined) {
          updateData.workExperience = parseWorkExperience(fields.workExperience);
        }
        // The generic field spread above would copy a submitted password into
        // the document as plain text. Hash a new password, or drop the field so
        // an edit without a password keeps the stored hash.
        const newPassword = fields.password?.[0];
        if (newPassword) {
          updateData.password = await bcrypt.hash(newPassword, 10);
        } else {
          delete updateData.password;
        }

        let updatedDoctor;
        try {
          updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, {
            new: true,
          });
        } catch (error) {
          // Unique index race / validation problem -> friendly message.
          if (sendDoctorWriteError(res, error)) return;
          throw error;
        }
        console.log(updatedDoctor, "updated doctor");

        res.status(200).json({ success: true });
      });
    } catch (error) {
      console.error("Error updating doctor:", error);
      if (sendDoctorWriteError(res, error)) return;
      await logErrorToGoogleSheet({
        apiName: "addDoctor - PUT",
        errorMessage: error.message || "Update doctor failed",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id: req.query?.id },
      });
      res
        .status(500)
        .json({ error: "An error occurred while updating doctor." });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    console.log(id, "id in server");
    try {
      const doctor = await Doctor.findById(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Delete all slots associated with this doctor
      const slotsDeletionResult = await Slot.deleteMany({ doctorId: id });
      console.log(`Deleted ${slotsDeletionResult.deletedCount} slots.`);

      // Delete the doctor's entry from the database
      const result = await Doctor.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Code to delete profile picture from Google Storage, if any
      if (doctor.profilePictureUrl) {
        const oldProfilePictureRef = ref(storage, doctor.profilePictureUrl);
        await deleteObject(oldProfilePictureRef);
      }
      console.log("deleted old profile picture");

      // Iterate over the URLs of the diplomas and certificates and delete each image from Google Storage
      doctor.diplomasCertificatesUrls.forEach(async (url) => {
        const oldCertificateRef = ref(storage, url);
        console.log(doctor.diplomasCertificatesUrls, "doctor diplomaster url");
        console.log(doctor.diplomasCertificatesUrls, "doctor diplomaster url");
        console.log(oldCertificateRef, "oldcertificate", url, "url");
        await deleteObject(oldCertificateRef);
      });

      console.log("deleted diplomasCertificatesUrls diploamas");

      // Delete other associated files like doctor stamp and signature
      if (doctor.doctorStampUrl) {
        const oldProfilePictureRef = ref(storage, doctor.doctorStampUrl);
        await deleteObject(oldProfilePictureRef);
      }

      if (doctor.doctorSignatureUrl) {
        const oldProfilePictureRef = ref(storage, doctor.doctorSignatureUrl);
        await deleteObject(oldProfilePictureRef);
      }

      console.log("deleted old doctor signature");

      return res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error(error);
      await logErrorToGoogleSheet({
        apiName: "addDoctor - DELETE",
        errorMessage: error.message || "Delete doctor failed",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id: req.query?.id },
      });
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }
}
