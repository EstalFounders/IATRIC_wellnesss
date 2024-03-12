import { v4 as uuidv4 } from "uuid";
import multiparty from "multiparty";
import {
  certificate_img_path,
  profilePicture_img_path,
} from "../../src/constant";
import { storage } from "../../src/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { dbConnect } from "../../src/lib/db";
import Doctor from "../../src/models/doctorModel";
import fs from "fs"; // Import the fs module
import { resizeImage } from "../../src/components/Common/ResizeImage";

// Global variable to store the database connection
let isConnected = false;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log("handler calling for get");
  await dbConnect(); // Ensure database connection is established before handling requests
  console.log(req, "req");
  if (req.method === "POST") {
    try {
      const form = new multiparty.Form();
      form.parse(req, async function (err, fields, files) {
        console.log(files, "files in api");
        if (err) {
          console.error("Error parsing form data:", err);
          res
            .status(500)
            .json({ error: "An error occurred while parsing form data." });
          return;
        }
        try {
          // Ensure files.profilePicture and files.diplomasCertificates are defined
          const profilePictureFile =
            files.profilePicture && files.profilePicture[0];
          const diplomasCertificatesFiles = Object.keys(files)
            .filter((key) => key.startsWith("diplomasCertificates"))
            .map((key) => files[key][0]); // Assuming each field has only one file

          // Ensure files.profilePicture and files.diplomasCertificates are defined
          let profilePictureUrl;

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

          const stringFields = Object.fromEntries(
            Object.entries(fields).map(([key, value]) => [
              key,
              value.toString(),
            ])
          );

          const addedDoctor = await Doctor.create({
            ...stringFields, // Assuming fields contain other doctor details like name, email, etc.
            profilePictureUrl, // Now profilePictureUrl is accessible here
            diplomasCertificatesUrls,
          });

          console.log("Doctor Added");

          res.status(200).json({
            success: true,
          });

          // Assuming the rest of your code to handle the response and database operations
        } catch (error) {
          console.error("Error uploading files:", error);
          res
            .status(500)
            .json({ error: "An error occurred while uploading files." });
        }
      });
    } catch (error) {
      console.error("Error parsing form data:", error);
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
      res
        .status(500)
        .json({ error: "An error occurred while fetching doctor data." });
    }
  }
}
