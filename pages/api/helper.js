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

export default function generateSlots() {
   const slots = [];
   const startTime = new Date(); // Temporary start date
   startTime.setHours(9, 0, 0, 0); // Start at 9 AM
 
   for (let i = 0; i < 24; i++) { // 12 hours * 2 slots per hour
     const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later
     slots.push({
       startTime: new Date(startTime),
       endTime: new Date(endTime),
       isBooked: false
     });
     startTime.setMinutes(startTime.getMinutes() + 30); // Move to next slot
   }
 
   return slots;
 }
 
