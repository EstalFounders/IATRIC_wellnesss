import { dbConnect } from "../../../src/lib/db";
import Doctor from "../../../src/models/doctorModel";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { doctorId, isActive } = req.body;

    try {
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { isActive },
        { new: true }
      );

      if (!updatedDoctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      res.status(200).json({
        success: true,
        message: "Doctor status updated successfully",
        doctor: updatedDoctor,
      });
    } catch (error) {
      console.error("Error updating doctor status:", error.message);
      await logErrorToGoogleSheet({
        apiName: "updateDoctorStatus - POST",
        errorMessage: error.message || "Failed to update doctor status",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { doctorId, isActive },
      });
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}