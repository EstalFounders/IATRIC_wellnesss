// pages/api/slots/[doctorId].js
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "GET") {
    const { doctor, date } = req.query;
    try {
      const utcDate = new Date(date);
      utcDate.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(utcDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

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
      await logErrorToGoogleSheet({
        apiName: "fetchSlot - GET",
        errorMessage: error.message || "Failed to fetch slots",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { doctor: req.query?.doctor, date: req.query?.date },
      });
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}