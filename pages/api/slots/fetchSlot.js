// pages/api/slots/[doctorId].js
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "GET") {
    const { doctor, date } = req.query;
    try {
      const utcDate = new Date(date); // Assuming 'date' is in ISO format (e.g., 2021-01-01T00:00:00Z)
      utcDate.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

      const endOfDay = new Date(utcDate);
      endOfDay.setUTCHours(23, 59, 59, 999); // End of the day in UTC

      const slots = await Slot.find({
        doctorId: doctor,
        startTime: {
          $gte: utcDate,
          $lte: endOfDay,
        },
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
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
