import { dbConnect } from "../../src/lib/db";
import Appointment from "../../src/models/appointmentSchema";
import {
  logErrorToGoogleSheet,
  handlePostConsultation,
} from "./helper";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { doctorId } = req.query; // Get the doctorId from the query parameters

    try {
      await dbConnect();
      let appointments;
      if (doctorId) {
        appointments = await Appointment.find({ doctorId: doctorId });
      } else {
        appointments = await Appointment.find({});
      }

      res.status(200).json({ appointments });
    } catch (error) {
      console.error(error.status);
      // Log error to Google Sheets
      await logErrorToGoogleSheet({
        apiName: "bookConsultation - GET",
        errorMessage: error.message || "Unable to fetch appointments",
        errorCode: error.status,
        stackTrace: error.stack,
        requestPayload: { doctorId: req.query?.doctorId },
      });
      res.status(500).json({ error: "Unable to fetch appointments" });
    }
  }

  if (req.method === "PUT") {
    const { appointmentId, selectedStatus } = req.body; // Extract the id and status from the request body

    if (!appointmentId || !selectedStatus) {
      return res.status(400).json({ message: "Missing id or status" });
    }
    console.log(
      appointmentId,
      "appointment id",
      selectedStatus,
      "selected status",
    );
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        { _id: appointmentId },
        { status: selectedStatus },
        { new: true }, // Return the updated document
      );

      res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
      // Log error to Google Sheets
      await logErrorToGoogleSheet({
        apiName: "bookConsultation - PUT",
        errorMessage: error.message || "An error occurred",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { appointmentId, selectedStatus },
      });
      res.status(500).json({ message: "An error occurred", error });
    }
  }

  if (req.method === "POST") {
    await handlePostConsultation(req.body, res);
  }
}