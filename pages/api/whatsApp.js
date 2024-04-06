// pages/api/sendWhatsAppMessage.js
import client from '../../src/lib/twilioClient';

// export default async function handler(req, res) {
//  const { number, pdfUrl } = req.body;
export async function sendWhatsAppMessage(number, pdfUrl)  {
    console.log(number, 'number', pdfUrl,'pdfUrl')
 try {
    // Call the sendWhatsAppMessage function
     try {
        const message = await client.messages.create({
            body: `${pdfUrl}`,
            from: 'whatsapp:+14155238886',
            to: `whatsapp:+91${number}`
        });
        console.log('Message sent successfully:', message.sid);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    // Assuming sendWhatsAppMessage returns a success response
 } catch (error) {
    console.error("Error:", error);
 }
}
// }
