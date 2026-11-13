// pages/api/slots/[doctorId].js
import Slot from "../../../src/models/slots";
import { dbConnect } from "../../../src/lib/db";
import { logErrorToGoogleSheet } from "../helper";

// Same check `fetchWeekSlots` uses: a non-ObjectId would reach Mongoose and come
// back as a CastError, which is a 500 for what is really a bad request.
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { doctor, date } = req.query;

    // Crawlers and stale bundles hit this route with no query at all. Without
    // this guard `new Date(undefined)` is an Invalid Date and Mongoose throws
    // "Cast to date failed ... at path startTime" - a 500 plus one error-sheet
    // row per hit. Validation runs before `dbConnect` so a bot costs nothing.
    if (!doctor) {
      return res
        .status(400)
        .json({ success: false, message: "doctor is required" });
    }
    if (!OBJECT_ID_RE.test(String(doctor))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctorId" });
    }

    const utcDate = date ? new Date(date) : null;
    if (!utcDate || Number.isNaN(utcDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "date must be a valid date" });
    }

    try {
      await dbConnect();

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