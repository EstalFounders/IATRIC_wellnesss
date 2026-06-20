import Slot from "../../../src/models/slots";
import Doctor from "../../../src/models/doctorModel";
import { dbConnect } from "../../../src/lib/db";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  await dbConnect();

  // GET: Check if a specific date is marked as unavailable for a doctor
  if (req.method === "GET") {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: "doctorId and date are required" });
    }
    try {
      const doctor = await Doctor.findById(doctorId).select("unavailableDates");
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      const isDateUnavailable = (doctor.unavailableDates || []).includes(date);
      return res.status(200).json({ success: true, isDateUnavailable });
    } catch (error) {
      console.error("Error fetching date status:", error);
      await logErrorToGoogleSheet({
        apiName: "manageSlots - GET",
        errorMessage: error.message || "Failed to check date status",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { doctorId: req.query?.doctorId, date: req.query?.date },
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // POST: Update slot availability and date unavailable status for a specific date
  if (req.method === "POST") {
    const { doctorId, date, unavailableSlots, isDateUnavailable } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: "doctorId is required" });
    }

    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      // 1. Update slot availability for the given date
      if (Array.isArray(unavailableSlots) && unavailableSlots.length > 0) {
        await Slot.updateMany(
          { _id: { $in: unavailableSlots }, doctorId, isBooked: false },
          { isBooked: true }
        );
      }

      // 2. Update the date's unavailable status in the doctor's record
      if (date && typeof isDateUnavailable === "boolean") {
        let unavailableDates = doctor.unavailableDates || [];
        if (isDateUnavailable) {
          if (!unavailableDates.includes(date)) {
            unavailableDates.push(date);
          }
        } else {
          unavailableDates = unavailableDates.filter((d) => d !== date);
        }
        await Doctor.findByIdAndUpdate(doctorId, {
          $set: { unavailableDates },
        });
      }

      return res.status(200).json({ success: true, message: "Slots updated successfully." });
    } catch (error) {
      console.error("Error managing slots:", error);
      await logErrorToGoogleSheet({
        apiName: "manageSlots - POST",
        errorMessage: error.message || "Failed to manage slots",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { doctorId, date },
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ success: false, message: "Method not allowed" });
}