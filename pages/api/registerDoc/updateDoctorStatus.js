import { dbConnect } from "../../../src/lib/db";
import Doctor from "../../../src/models/doctorModel";

export default async function handler(req, res) {
  await dbConnect(); // Ensure the database connection

  if (req.method === "POST") {
    const { doctorId, isActive } = req.body;

    try {
      // Update the doctor's `isActive` status in the database
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { isActive },
        { new: true } // Return the updated document
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
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
