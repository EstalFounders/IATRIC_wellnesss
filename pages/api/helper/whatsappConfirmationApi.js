import { invoice_img_path } from "../../../src/constant";
import { dbConnect } from "../../../src/lib/db";
import multiparty from "multiparty";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../src/lib/firebase";
import mongoose from "mongoose";
import {
  formatPhoneNumber,
  updateInvoiceNumberInDatabase,
} from "../utils/commonmethod";
import Invoice from "../../../src/models/invoice";
import { sendWhatsAppConfirmation } from "../lib/communication";
import {
  WHATSAPP_INVOICE_TEMPLATE,
  WHATSAPP_NUMBER_CONFIRMATION,
} from "../utils/constants";
import { getWhatsAppNumberConfirmationMessageBody } from "../utils/whatsappMessageBodies";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  // console.log(files, 'files', fields, 'fields'); // Keep this for debugging
  let session; // Declare session variable
  try {
    // Start a Mongoose session for the transaction
    session = await mongoose.startSession();
    session.startTransaction();

    const { mobile, otp } = req.body;
    console.log(mobile, otp, "mobile and otp");

    const whatsappNumbereConfirmation =
      getWhatsAppNumberConfirmationMessageBody(otp);

    await sendWhatsAppConfirmation(
      formatPhoneNumber(mobile.toString()),
      whatsappNumbereConfirmation,
      WHATSAPP_NUMBER_CONFIRMATION
    );

    // send pdf url to patient whatsapp
    // const number = 7455992234;
    // const sendPdfUrl = await sendWhatsAppMessage(number, prescriptionUrl); // Await here

    // if (!sendPdfUrl) {
    //   throw new Error("Failed to send whastapp");
    // }

    // If all operations were successful, commit the transaction
    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "WhatsApp confirmation sent successfully" });
  } catch (error) {
    // If any error occurred, roll back the transaction
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "check your mobile number and try again",
    }); // Include the error message
  }
}
