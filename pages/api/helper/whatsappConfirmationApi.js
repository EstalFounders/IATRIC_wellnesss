import { formatPhoneNumber } from "../utils/commonmethod";
import { sendWhatsAppConfirmation } from "../lib/communication";
import { WHATSAPP_NUMBER_CONFIRMATION } from "../utils/constants";
import { getWhatsAppNumberConfirmationMessageBody } from "../utils/whatsappMessageBodies";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { mobile, otp } = req.body;

    await sendWhatsAppConfirmation(
      formatPhoneNumber(mobile.toString()),
      getWhatsAppNumberConfirmationMessageBody(otp),
      WHATSAPP_NUMBER_CONFIRMATION
    );

    res.status(200).json({ message: "SMS confirmation sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Check your mobile number and try again",
    });
  }
}
