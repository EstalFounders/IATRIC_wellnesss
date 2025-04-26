import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import { countryCode, twilioPhoneNumber } from "../../../src/constant";
import twilioClient from "../../../src/lib/twilioClient";

// Create a Twilio client using your credentials
const client = twilioClient;

/**
 * Make a Twilio call to the patient.
//  * @param {string} doctorId - Doctor's ID (could be used to fetch additional info if needed)
//  * @param {string} name - Patient's name (could be used in the greeting or SMS)
 * @param {string} pateintNo - Patient's mobile number to call
 * @returns {Promise}
 */
export const makeTwilioCall = async (doctorNo, pateintNo) => {
  const doctorFormattedNo = `${countryCode}${doctorNo}`;
  try {
    const call = await client.calls.create({
      to: `${countryCode}${pateintNo}`, // The number to call
      from: twilioPhoneNumber, // Your Twilio number
      timeLimit: 1200,
      twiml: "<Response><Say>Please wait while we connect you with the doctor!</Say></Response>",
      // Alternatively, you can use a custom URL that points to your server-controlled TwiML instructions
    });
    console.log("Call initiated successfully:", call.sid);
    return call.sid; // Returning the Call SID can be useful for tracking the call status
  } catch (error) {
    console.error("Failed to make a call:", error);
    throw error;
  }
};


export async function sendWhatsAppMessage(number, body) {
  console.log(number, "number", body, "body");
  try {
    // Call the sendWhatsAppMessage function
    try {
      const message = await twilioClient.messages.create({
        body: `${body}`,
        from: `whatsapp:${twilioPhoneNumber}`,
        to: `whatsapp:${number}`
      });
      console.log("Message sent successfully:", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    // Assuming sendWhatsAppMessage returns a success response
  } catch (error) {
    console.error("Error:", error);
  }
}


