import { gallaboxReqHeaders } from "../utils/commonmethod";
import { GALLABOX_API, WHATSAPP_CONFIRMATION_TEMPLATE } from "../utils/constants";
import { createWhatsAppTemplatePayload } from "./model/whatsappConfirmationTemp";

export async function sendWhatsAppConfirmation(number, body, template) {
  console.log(number, "number", body, "body");
  const {appointment_date, appointment_time,  doctor_name, patient_name,consultation_type, contact_us} = body;
  console.log(appointment_date, appointment_time,  doctor_name, patient_name,consultation_type, contact_us);
  const data = createWhatsAppTemplatePayload({
    channelId: process.env.GALLABOX_CHANNEL_ID,
    recipientName: patient_name,
    recipientPhone: number,
    templateName: template,
    bodyValues: body,
  });
  console.log("payload", data, "header", gallaboxReqHeaders);
  // Call the sendWhatsAppMessage function
  try {
    const response = await fetch(GALLABOX_API.send_whatsapp_with_template, {
      method: "POST",
      headers: gallaboxReqHeaders,
      body: JSON.stringify(data),
    });
    console.log("response", response);  
  } catch (error) {
    console.error("Error sending message:", error);
  }
  // Assuming sendWhatsAppMessage returns a success response
}
