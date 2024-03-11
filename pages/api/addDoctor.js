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
  console.log(req, 'req')
  if (req.method === "POST") {
    try {
      const form = new multiparty.Form();
      form.parse(req, async function (err, fields, files) {
        console.log(files, 'files in api')
        if (err) {
          console.error("Error parsing form data:", err);
          res
            .status(500)
            .json({ error: "An error occurred while parsing form data." });
          return;
        }
        try {
          // Upload profile picture
          const profilePictureRef = ref(
            storage,
            `${profilePicture_img_path}/${fields.name}${uuidv4()}`
          );
          const profilePictureFile = files.profilePicture[0]; // Get the first file from the array
          const metadata = {
            contentType: profilePictureFile.mimetype,
          };
          await uploadBytes(profilePictureRef, profilePictureFile , metadata);

          // Get profile picture download URL
          const profilePictureUrl = await getDownloadURL(profilePictureRef);

          const diplomasCertificatesFiles = Object.keys(files)
            .filter((key) => key.startsWith("diplomasCertificates"))
            .map((key) => files[key][0]); // Assuming each field has only one file

          // Upload diplomas/certificates
          const diplomasCertificatesUrls = await Promise.all(
            diplomasCertificatesFiles.map(async (certificate, index) => {
              const certificateRef = ref(
                storage,
                `${certificate_img_path}/${fields.name}${uuidv4()}`
              );
              const certificateFile = certificate[0]; // Get the first file from the array
              await uploadBytes(certificateRef, certificateFile);
              return getDownloadURL(certificateRef);
            })
          );
          res.status(200).json("completed");
          // const stringFields = Object.fromEntries(
          //   Object.entries(fields).map(([key, value]) => [
          //     key,
          //     value.toString(),
          //   ])
          // );
          // console.log(stringFields, 'all fields')
          // const addedDoctor = await Doctor.create({
          //   ...stringFields, // Assuming fields contain other doctor details like name, email, etc.
          //   profilePictureUrl,
          //   diplomasCertificatesUrls,
          // });

          // console.log("Doctor Added");

          // res.status(200).json({
          //   success: true,
          //   profilePictureUrl,
          //   diplomasCertificatesUrls,
          // });
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
