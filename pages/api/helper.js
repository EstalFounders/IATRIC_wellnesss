// pages/api/sendWhatsAppMessage.js
import client from "../../src/lib/twilioClient";
import Slot from "../../src/models/slots";
import cron from "node-cron";

// export default async function handler(req, res) {
//  const { number, pdfUrl } = req.body;
export async function sendWhatsAppMessage(number, pdfUrl) {
  console.log(number, "number", pdfUrl, "pdfUrl");
  try {
    // Call the sendWhatsAppMessage function
    try {
      const message = await client.messages.create({
        body: `${pdfUrl}`,
        from: "whatsapp:+14155238886",
        to: `whatsapp:+91${number}`,
      });
      console.log("Message sent successfully:", message.sid);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    // Assuming sendWhatsAppMessage returns a success response
  } catch (error) {
    console.error("Error:", error);
  }
}
// }

export async function generateSlotsForMonth(doctorId, year, month) {
  let slots = [];
  for (let day = 0; day < days; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);
    for (let hour = 9; hour < 21; hour++) {
      slots.push({
        doctorId: doctorId,
        startTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour
        ),
        endTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour + 0.5
        ),
        isBooked: false,
      });
    }
  }
  await Slot.insertMany(slots);
}



