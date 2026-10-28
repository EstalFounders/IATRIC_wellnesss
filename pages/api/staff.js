// pages/api/staff.js
//
// Staff-member resource. POST creates a new staff profile from the admin panel;
// GET returns the list (used later wherever the profiles are rendered).

import { v4 as uuidv4 } from "uuid";
import multiparty from "multiparty";
import fs from "fs";
import { dbConnect } from "../../src/lib/db";
import Staff from "../../src/models/staffModel";
import { logErrorToGoogleSheet } from "./helper";
import { storage } from "../../lib/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { resizeImage } from "../../src/components/Common/ResizeImage";
import { staffProfilePicture_img_path } from "../../src/constant";

// The form uploads a profile picture, so this route reads multipart FormData.
export const config = {
  api: {
    bodyParser: false,
  },
};

const cleanString = (value) => String(value ?? "").trim();

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { id } = req.query;
      if (id) {
        const member = await Staff.findById(id);
        if (!member) {
          return res
            .status(404)
            .json({ success: false, error: "Staff member not found" });
        }
        return res.status(200).json({ success: true, staff: member });
      }
      const staff = await Staff.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, staff });
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      await logErrorToGoogleSheet({
        apiName: "staff - GET",
        errorMessage: error.message || "Failed to fetch staff",
        errorCode: "500",
        stackTrace: error.stack,
      });
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch staff" });
    }
  }

  if (req.method === "POST") {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);
        return res
          .status(500)
          .json({ success: false, error: "Failed to parse form data" });
      }
      try {
        const name = cleanString(fields.name?.[0]);
        const jobTitle = cleanString(fields.jobTitle?.[0]);

        if (!name) {
          return res.status(400).json({ success: false, error: "Name is required" });
        }
        if (!jobTitle) {
          return res
            .status(400)
            .json({ success: false, error: "Job title is required" });
        }

        // Upload the profile picture to Firebase under images/staff/profilePicture.
        const profilePictureFile =
          files.profilePicture && files.profilePicture[0];
        let profilePictureUrl = "";

        if (profilePictureFile) {
          const profilePictureRef = ref(
            storage,
            `${staffProfilePicture_img_path}/${uuidv4()}`
          );
          const contentType =
            profilePictureFile.headers["content-type"] || "image/jpeg";
          const fileBuffer = fs.readFileSync(profilePictureFile.path);
          const resizedImageBuffer = await resizeImage(fileBuffer, 700, 700);
          await uploadBytes(profilePictureRef, resizedImageBuffer, {
            contentType,
          });
          profilePictureUrl = await getDownloadURL(profilePictureRef);
        }

        const staff = await Staff.create({
          name,
          jobTitle,
          bio: cleanString(fields.bio?.[0]),
          experience: cleanString(fields.experience?.[0]),
          education: cleanString(fields.education?.[0]),
          profilePictureUrl,
          isActive: true,
        });

        return res.status(201).json({
          success: true,
          message: "Staff member added successfully",
          staff,
        });
      } catch (error) {
        console.error("Failed to add staff member:", error);
        await logErrorToGoogleSheet({
          apiName: "staff - POST",
          errorMessage: error.message || "Failed to add staff member",
          errorCode: "500",
          stackTrace: error.stack,
        });
        return res
          .status(500)
          .json({ success: false, error: "Failed to add staff member" });
      }
    });
    return;
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: "Staff id is required" });
    }
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);
        return res
          .status(500)
          .json({ success: false, error: "Failed to parse form data" });
      }
      try {
        const name = cleanString(fields.name?.[0]);
        const jobTitle = cleanString(fields.jobTitle?.[0]);

        if (!name) {
          return res.status(400).json({ success: false, error: "Name is required" });
        }
        if (!jobTitle) {
          return res
            .status(400)
            .json({ success: false, error: "Job title is required" });
        }

        const existing = await Staff.findById(id);
        if (!existing) {
          return res
            .status(404)
            .json({ success: false, error: "Staff member not found" });
        }

        // Photo handling:
        //   removeProfilePicture -> delete stored object and clear the URL;
        //   new file -> upload new and delete the previous object.
        const removeProfilePicture =
          fields.removeProfilePicture?.[0] === "true" ||
          fields.removeProfilePicture?.[0] === "1";
        const profilePictureFile =
          files.profilePicture && files.profilePicture[0];

        let profilePictureUrl = existing.profilePictureUrl || "";

        if (removeProfilePicture) {
          // Remove: delete the stored Firebase object and clear the URL.
          if (existing.profilePictureUrl) {
            try {
              await deleteObject(ref(storage, existing.profilePictureUrl));
            } catch (cleanupError) {
              console.warn(
                "Failed to delete staff profile picture:",
                cleanupError.message
              );
            }
          }
          profilePictureUrl = "";
        } else if (profilePictureFile) {
          const profilePictureRef = ref(
            storage,
            `${staffProfilePicture_img_path}/${uuidv4()}`
          );
          const contentType =
            profilePictureFile.headers["content-type"] || "image/jpeg";
          const fileBuffer = fs.readFileSync(profilePictureFile.path);
          const resizedImageBuffer = await resizeImage(fileBuffer, 700, 700);
          await uploadBytes(profilePictureRef, resizedImageBuffer, {
            contentType,
          });
          profilePictureUrl = await getDownloadURL(profilePictureRef);

          // Best-effort cleanup of the previous image.
          if (existing.profilePictureUrl) {
            try {
              await deleteObject(ref(storage, existing.profilePictureUrl));
            } catch (cleanupError) {
              console.warn(
                "Failed to delete old staff profile picture:",
                cleanupError.message
              );
            }
          }
        }

        const staff = await Staff.findByIdAndUpdate(
          id,
          {
            name,
            jobTitle,
            bio: cleanString(fields.bio?.[0]),
            experience: cleanString(fields.experience?.[0]),
            education: cleanString(fields.education?.[0]),
            profilePictureUrl,
          },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: "Staff member updated successfully",
          staff,
        });
      } catch (error) {
        console.error("Failed to update staff member:", error);
        await logErrorToGoogleSheet({
          apiName: "staff - PUT",
          errorMessage: error.message || "Failed to update staff member",
          errorCode: "500",
          stackTrace: error.stack,
        });
        return res
          .status(500)
          .json({ success: false, error: "Failed to update staff member" });
      }
    });
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: "Staff id is required" });
    }
    try {
      const staff = await Staff.findById(id);
      if (!staff) {
        return res
          .status(404)
          .json({ success: false, error: "Staff member not found" });
      }

      // Best-effort cleanup of the stored profile picture.
      if (staff.profilePictureUrl) {
        try {
          await deleteObject(ref(storage, staff.profilePictureUrl));
        } catch (cleanupError) {
          console.warn(
            "Failed to delete staff profile picture:",
            cleanupError.message
          );
        }
      }

      await Staff.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ success: true, message: "Staff member deleted successfully" });
    } catch (error) {
      console.error("Failed to delete staff member:", error);
      await logErrorToGoogleSheet({
        apiName: "staff - DELETE",
        errorMessage: error.message || "Failed to delete staff member",
        errorCode: "500",
        stackTrace: error.stack,
      });
      return res
        .status(500)
        .json({ success: false, error: "Failed to delete staff member" });
    }
  }

  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
