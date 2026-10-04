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
import fs from "fs"; // Import the fs module
import { resizeImage } from "../../src/components/Common/ResizeImage";
import bcrypt from "bcryptjs";
import Slot from "../../src/models/slots";
import { logErrorToGoogleSheet } from "./helper";

// Global variable to store the database connection
let isConnected = false;

/**
 * Columns that no longer exist on the Doctor schema. They are stripped from both
 * the create (POST) and the update (PUT) payloads, so an older/cached client -
 * or a pending doctor-panel change request saved before the removal - cannot
 * write the dropped column back into MongoDB. The one-off cleanup of the
 * documents that already carry them lives in `scripts/removeDoctorDegree.js`.
 */
const REMOVED_DOCTOR_FIELDS = ["degree"];

function stripRemovedDoctorFields(fields) {
  const cleaned = { ...fields };
  for (const field of REMOVED_DOCTOR_FIELDS) delete cleaned[field];
  return cleaned;
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
            const contentType = doctorSignatureFile.headers["content-type"]; // Extract the content-type from the headers
            const fileBuffer = fs.readFileSync(doctorSignatureFile.path); // Read the file into a Buffer
            const resizedImageBuffer = await resizeImage(fileBuffer, 700, 700); // Resize to 700x700
            const metadata = {
              contentType: contentType,
            };
            await uploadBytes(doctorSignatureRef, resizedImageBuffer, metadata); // Upload the Buffer

            // Get profile picture download URL
            doctorSignatureUrl = await getDownloadURL(doctorSignatureRef);
          }

          // upload doctor stamp
          if (doctorStampFile) {
            const doctorStampRef = ref(
              storage,
              `${doctorStamp_img_path}/${fields.name[0]}${uuidv4()}`
            );
            const contentType = doctorStampFile.headers["content-type"]; // Extract the content-type from the headers
            const fileBuffer = fs.readFileSync(doctorStampFile.path); // Read the file into a Buffer
            const resizedImageBuffer = await resizeImage(fileBuffer, 700, 700); // Resize to 700x700
            const metadata = {
              contentType: contentType,
            };
            await uploadBytes(doctorStampRef, resizedImageBuffer, metadata); // Upload the Buffer

            // Get profile picture download URL
            doctorStampUrl = await getDownloadURL(doctorStampRef);
          }

          // Upload profile picture
          if (profilePictureFile) {
            const profilePictureRef = ref(
              storage,
              `${profilePicture_img_path}/${fields.name[0]}${uuidv4()}`
            );
            const contentType = profilePictureFile.headers["content-type"]; // Extract the content-type from the headers
            const fileBuffer = fs.readFileSync(profilePictureFile.path); // Read the file into a Buffer
            const resizedImageBuffer = await resizeImage(fileBuffer, 700, 700); // Resize to 700x700
            const metadata = {
              contentType: contentType,
            };
            await uploadBytes(profilePictureRef, resizedImageBuffer, metadata); // Upload the Buffer

            // Get profile picture download URL
            profilePictureUrl = await getDownloadURL(profilePictureRef);
          }

          // Upload diplomas/certificates
          const diplomasCertificatesUrls = await Promise.all(
            diplomasCertificatesFiles.map(async (certificate, index) => {
              const certificateRef = ref(
                storage,
                `${certificate_img_path}/${fields.name[0]}${uuidv4()}`
              );
              const contentType = certificate.headers["content-type"]; // Extract the content-type from the headers
              const fileBuffer = fs.readFileSync(certificate.path); // Read the file into a Buffer
              const resizedImageBuffer = await resizeImage(
                fileBuffer,
                700,
                700
              ); // Resize to 700x700
              const metadata = {
                contentType: contentType,
              };
              await uploadBytes(certificateRef, resizedImageBuffer, metadata); // Upload the Buffer
              return getDownloadURL(certificateRef);
            })
          );

          // const hashedPassword = await bcrypt.hash(fields.password[0], 10); // 10 is the number of salt rounds

          const stringFields = Object.fromEntries(
            Object.entries(fields).map(([key, value]) => [
              key,
              value.toString(),
            ])
          );
          console.log(stringFields, "string fiels");
          const addedDoctor = await Doctor.create({
            ...stripRemovedDoctorFields(stringFields),
            // Repeatable field: `fields.educationTraining` is one entry per
            // appended form field, so it must not be taken from the
            // comma-joined `stringFields` spread.
            educationTraining: parseEducationTraining(fields.educationTraining),
            // Repeatable field as well: one entry per appended `formData.append`
            // ("English", "Hindi"), never the comma-joined `stringFields` value.
            language: parseLanguages(fields.language),
            password: fields.password?.[0] || "",
            profilePictureUrl,
            diplomasCertificatesUrls,
            doctorStampUrl,
            doctorSignatureUrl,
            consultationType: stringFields.consultationType
              ? stringFields.consultationType
                  .split(",")
                  .map((type) => type.trim())
              : [], // Convert to array & trim spaces
            serviceOffered: stringFields.serviceOffered
              ? stringFields.serviceOffered
                  .split(",")
                  .map((type) => type.trim())
              : [], // Convert to array & trim spaces
          });

          console.log(addedDoctor._id, "Doctor Added");

          res.status(200).json({
            message: "Doctor Added successfully",
          });

          // Assuming the rest of your code to handle the response and database operations
        } catch (error) {
          console.error("Error uploading files:", error);
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
          const contentType = profilePictureFile.headers["content-type"]; // Extract the content-type from the headers
          const fileBuffer = fs.readFileSync(profilePictureFile.path); // Read the file into a Buffer
          const resizedImageBuffer = await resizeImage(fileBuffer, 700, 700); // Resize to 700x700
          const metadata = {
            contentType: contentType,
          };
          await uploadBytes(profilePictureRef, resizedImageBuffer, metadata); // Upload the Buffer

          // Get profile picture download URL
          profilePictureUrl = await getDownloadURL(profilePictureRef);
          console.log(profilePictureUrl, "profilePictureUrl");
        }

        // Upload diplomas/certificates if new ones are provided
        let diplomasCertificatesUrls = [];
        if (diplomasCertificatesFiles.length > 0) {
          // Upload new diplomas/certificates
          const diplomasCertificatesUrls =
            existingDoctor.diplomasCertificatesUrls;
          if (diplomasCertificatesFiles.length > 0) {
            // Upload new diplomas/certificates
            for (const certificateFile of diplomasCertificatesFiles) {
              const certificateRef = ref(
                storage,
                `${certificate_img_path}/${fields.name[0]}${uuidv4()}`
              );
              const contentType = certificateFile.headers["content-type"]; // Extract the content-type from the headers
              const fileBuffer = fs.readFileSync(certificateFile.path); // Read the file into a Buffer
              const resizedImageBuffer = await resizeImage(
                fileBuffer,
                700,
                700
              ); // Resize to 700x700
              const metadata = {
                contentType: contentType,
              };
              await uploadBytes(certificateRef, resizedImageBuffer, metadata); // Upload the Buffer
              diplomasCertificatesUrls.push(
                await getDownloadURL(certificateRef)
              );
            }
          }
          console.log(diplomasCertificatesUrls, "diplomas");
        } else {
          // Use existing diplomasCertificatesUrls if no new files are provided
          diplomasCertificatesUrls = existingDoctor.diplomasCertificatesUrls;
        }

        // Delete old profile picture from Firebase if a new one is uploaded and it's different from the existing one
        if (
          profilePictureFile &&
          profilePictureUrl !== existingDoctor.profilePictureUrl
        ) {
          const oldProfilePictureRef = ref(
            storage,
            existingDoctor.profilePictureUrl
          );
          await deleteObject(oldProfilePictureRef);
        }
        console.log("deleted old profile picture");

        // Delete old diplomas certificates from Firebase if new ones are uploaded
        existingDoctor.diplomasCertificatesUrls.forEach(async (url) => {
          if (!diplomasCertificatesUrls.includes(url)) {
            const oldCertificateRef = ref(storage, url);
            await deleteObject(oldCertificateRef);
          }
        });
        console.log("deleted old diploamas");

        // Update doctor data in MongoDB
        const stringFields = Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [key, value.toString()])
        );

        // Update doctor data in MongoDB
        const updateData = {
          ...stripRemovedDoctorFields(stringFields),
          profilePictureUrl,
          diplomasCertificatesUrls,
          consultationType: stringFields.consultationType
            ? stringFields.consultationType
                .split(",")
                .map((type) => type.trim())
            : [], // Convert to array & trim spaces
        };

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
        const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, {
          new: true,
        });
        console.log(updatedDoctor, "updated doctor");

        res.status(200).json({ success: true });
      });
    } catch (error) {
      console.error("Error updating doctor:", error);
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
