// pages/api/sendWhatsAppMessage.js
import client from '../../src/lib/twilioClient';
import Slot from '../../src/models/slots'

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

export async function generateSlotsForMonth(doctorId, year, month) {
const daysInMonth = new Date(year, month + 1, 0).getDate();
  let slots = [];

  for (let day = 1; day <= daysInMonth; day++) {
    for (let hour = 9; hour < 17; hour++) {
      slots.push({
        doctorId: doctorId,
        startTime: new Date(year, month, day, hour, 0, 0),
        endTime: new Date(year, month, day, hour, 30, 0),
        date: new Date(year, month, day),
        isBooked: false
      });
      slots.push({
        doctorId: doctorId,
        startTime: new Date(year, month, day, hour, 30, 0),
        endTime: new Date(year, month, day, hour + 1, 0, 0),
        date: new Date(year, month, day),
        isBooked: false
      });
    }
  }

  // Save all slots and return their IDs
  const createdSlots = await Slot.insertMany(slots);
  return createdSlots.map(slot => slot._id);
 }
 
