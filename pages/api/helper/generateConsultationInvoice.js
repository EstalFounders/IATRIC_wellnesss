import { Appointment} from "../../../src/models/appointmentSchema";
import { generateInvoiceImage } from "../utils/genrateInvoiceImage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const appointments = await Appointment.find({});

    const uploadResults = [];

    for (const appointment of appointments) {
      // 1. Generate invoice image from the appointment
      const imageBlob = await generateInvoiceImage(appointment);

      // 2. Upload to Firebase Storage
      const fileName = `consultation invoice/${appointment._id}.png`;
      const downloadURL = await uploadToFirebase(imageBlob, fileName);

      uploadResults.push({ id: appointment._id, downloadURL });
    }

    res.status(200).json({ success: true, files: uploadResults });
  } catch (error) {
    console.error("Error generating invoices:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}