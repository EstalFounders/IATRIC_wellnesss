// pages/api/send-whatsapp-message.js

import { sendWhatsAppMessage } from "../../src/helper";

export async function handleWhatsapp(number, message) {
  try {
    // Call the sendWhatsAppMessage function
    const resp = await sendWhatsAppMessage(number, message);
    console.log(resp,' respone to send whatapp')
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
