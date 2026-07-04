import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";
import Doctor from "../../../src/models/doctorModel";

export default async function handler(req, res) {
  const  meetingId  = req.query.meetingId;

  if (!meetingId) {
    return res.status(400).json({ error: "meetingId is required" });
  }

  try {
    await dbConnect();

    const appointment = await Appointment.findOne({ meetingId: meetingId }).lean();

    if (!appointment) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Fetch doctor details if doctorId is present
    let doctor = null;
    if (appointment.doctorId) {
      doctor = await Doctor.findById(appointment.doctorId)
        .select("name email mobileNumber profilePictureUrl consultationType speciality hospital")
        .lean();
    }

    return res.status(200).json({
      ...appointment,
      doctorDetails: doctor,
    });
  } catch (error) {
    console.error("Error fetching consultation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}