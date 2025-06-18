import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { appointment_status } from "../../../src/constant";
import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/dbmodels/appointmentSchema";
import Deductions from "../../../src/dbmodels/deductionSchema";
import ServiceOffered from "../../../src/dbmodels/serviceOffered";
import BookLabTest from "../../../src/dbmodels/bookLabTestSchema";
import { createServicesToBill } from "../utils/commonmethod";
import puppeteer from "puppeteer";
import ReactDOMServer from "react-dom/server";
import { storage } from "../../../src/lib/firebase";
import { triggerInvoiceCapture } from "../pupeeterScript/generateInvoiceScript";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method == "POST") {
    try {
      // const uploadResults = [];

      // for (const billingServices of servicesToBill) {
      // const dataString = JSON.stringify(billingServices);
      // // //  URL-encode the JSON string
      // const encodedData = encodeURIComponent(dataString);
      // const captures = triggerInvoiceCapture(encodedData);
      // console.log("captures", captures);
      // 1. Generate invoice image from the appointment
      // const htmlContent = ReactDOMServer.renderToString(
      //   <GenerateInvoiceImage billingServices={billingServices} />
      // );

      // const htmlPage = `<!DOCTYPE html><html><body>${htmlContent}</body></html>`;

      // const htmlPage = generateInvoiceImage(billingServices);

      // const browser = await puppeteer.launch({
      //   headless: "new",
      //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // });

      // const page = await browser.newPage();

      // await page.setContent(htmlPage, {
      //   waitUntil: "networkidle0",
      // });

      // const invoicePdf = await page.screenshot({
      //   type: "png",
      //   fullPage: true, // captures full height of the page
      // });

      // // 2. Upload to Firebase Storage
      // const storageRef = ref(
      //   storage,
      //   `${invoice_img_path}/${billingServices.invoiceNumber}`
      // );
      // const metadata = {
      //   contentType: "image/png",
      // };
      // await uploadBytes(storageRef, invoicePdf, metadata);
      // console.log("imageBlob", invoicePdf);
      // uploadResults.push({ id: appointment._id, downloadURL });
      // }

      res.status(200).json({ success: true, files: servicesToBill });
      // res.status(200).json({
      //   success: true,
      //   message: "Invoices generated successfully",
      //   serviceOffer,
      // });
    } catch (error) {
      console.error("Error generating invoices:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  } else if (req.method == "GET") {
    const appointments = await Appointment.find({
      status: appointment_status.completed,
      invoiceId: "",
    }).lean();

    const labTests = await BookLabTest.find({
      status: appointment_status.completed,
      invoiceId: "",
    }).lean();

    // const deductions = await Deductions.find({});
    const serviceOffer = await ServiceOffered.find({});
    const servicesToBill = createServicesToBill(
      appointments,
      labTests,
      serviceOffer
    );
    console.log("servicesToBill", servicesToBill);
    res.status(200).json({ success: true, message: servicesToBill });
  }
}
