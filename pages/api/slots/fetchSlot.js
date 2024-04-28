// pages/api/slots/[doctorId].js
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method == "GET") {
    const { doctor, date } = req.query;
    try {
      const currentTime = new Date(); // Current date and time
      const selectedDate = new Date(date);

      // Check if the given date is today, if not, start from the beginning of the given date
      const startDateTime =
        selectedDate.setHours(0, 0, 0, 0) === currentTime.setHours(0, 0, 0, 0)
          ? currentTime
          : new Date(date);

      // Resetting currentTime hours to ensure accurate comparison
      currentTime.setHours(0, 0, 0, 0);

      // Define end of the day for the selected date
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(doctor, "doctordi in server");
      const slots = await Slot.find({
        doctorId: doctor,
        // startTime: {
        //     $gte: startDateTime,
        //     $lt: endOfDay
        // }
        date: JSON.stringify(startDateTime.setHours(0,0,0,0))
    }).sort("startTime");

      res.status(200).json({ success: true, data: slots });
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
