import { invoice_img_path } from "../../../src/constant";
import { dbConnect } from "../../../src/lib/db";
import multiparty from "multiparty";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../lib/firebase";
import mongoose from "mongoose";
import {
  formatPhoneNumber,
  updateInvoiceNumberInDatabase,
} from "../utils/commonmethod";
import Invoice from "../../../src/models/invoice";
import { sendWhatsAppConfirmation } from "../lib/communication";
import { WHATSAPP_INVOICE_TEMPLATE } from "../utils/constants";

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
    const body = req.body;
    const invoiceNumber = body.data.invoiceNumber;
    const items = body.data.item;
    const payload = body.data;

    console.log(payload, "body");
    console.log(items, "items");

    const invoice = await Invoice.create(payload);
    const invoiceId = invoice._id; // Get the ID of the newly created invoice

    for (const item of items) {
      await updateInvoiceNumberInDatabase(item, invoiceId);
    }
    console.log("payload", payload);
    const invoiceMessage = {
      patient_name: payload.name,
      doctor_name: payload.doctorName || payload.doctor_name,
      invoice_number: invoiceNumber,
      total_amount: payload.totalPrice,
      invoice_url: payload.invoiceUrl,
    };
    await sendWhatsAppConfirmation(
      formatPhoneNumber(payload.mobNo.toString()),
      invoiceMessage,
      WHATSAPP_INVOICE_TEMPLATE
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

    res.status(200).json({ status: "send successfully", invoice });
  } catch (error) {
    // If any error occurred, roll back the transaction
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message }); // Include the error message
  }
}
