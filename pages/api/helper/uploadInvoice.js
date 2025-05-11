import { invoice_img_path } from "../../../src/constant";
import { dbConnect } from "../../../src/lib/db";
import multiparty from "multiparty";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../src/lib/firebase";

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser as we'll handle the request body manually
  },
};

export default async function handler(req, res) {
  await dbConnect();
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    console.log(files, "files", fields, "fields");
    if (err) {
      console.error("Error parsing form data:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    try {
      // Read the file into a Buffer
      // const fileBuffer = fs.readFileSync(files.invoice[0].path);
      // const { invoiceNo } = req.query;
      // // Upload PDF to Google Cloud Storage
      // const storageRef = ref(
      //   storage,
      //   `${invoice_img_path}/${invoiceNo}`
      // );
      // const metadata = {
      //   contentType: "application/pdf",
      // };
      // await uploadBytes(storageRef, fileBuffer, metadata);

      // // Return the URL of the uploaded PDF file
      // const prescriptionUrl = await getDownloadURL(storageRef);

      // send pdf url to patient whatsapp

      // const number = 7455992234;
      // const sendPdfUrl = sendWhatsAppMessage(number, prescriptionUrl);

      // if (!sendPdfUrl) {
      //   throw new Error("Failed to send whastapp");
      // }

      res.status(200).json({ status: "send successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
