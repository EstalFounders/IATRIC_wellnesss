import { dbConnect } from "../../src/lib/db";
import Appointment from "../../src/models/appointmentSchema";
import {
  bookConsultation,
  checkNbookSelectedDoctorForNow,
  findAvailableDoctor,
  findAvailableDoctorForNow,
  findAvailableDoctorForSpecificTimeSlot,
  logErrorToGoogleSheet,
} from "./helper";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { doctorId } = req.query; // Get the doctorId from the query parameters

    try {
      await dbConnect();
      let appointments;
      if (doctorId) {
        appointments = await Appointment.find({ doctorId: doctorId }).populate(
          "paymentId"
        );
      } else {
        appointments = await Appointment.find({}).populate("paymentId");
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
    let session;
    const {
      selectedDoctorId,
      appointmentTime,
      selectedDate,
      selectedSlot,
      symptoms,
      name,
      doctorName,
      doctorMobileNumber,
      email,
      patientMobNo,
      consultationType,
      consultationprice,
    } = req.body;

    const clientSideAppointmentTime = appointmentTime;

    try {
      console.log(req.body);
      session = await mongoose.startSession();
      session.startTransaction();
      let docName = doctorName == "" ? null : doctorName;
      let doctorMobileNo = doctorMobileNumber == "" ? null : doctorMobileNumber;
      let doctorId = selectedDoctorId === "" ? null : selectedDoctorId;
      console.log("111");
      let slot = selectedSlot === "" ? null : selectedSlot;

      // Determine current or specific time
      const now = new Date();
      const genericConsultationType = consultationType;
      const meetingId = uuidv4();

      // Find available doctor if needed right now

      if (doctorId && clientSideAppointmentTime == IS_NOW) {
        const result = await checkNbookSelectedDoctorForNow(
          selectedDate,
          doctorId,
          res,
        );
        slot = result ? result.slot : "";
      }
      if (
        doctorId == null &&
        (clientSideAppointmentTime == IS_NOW ||
          clientSideAppointmentTime == IN_TWENTY_MINUTES_NOW)
      ) {
        const result = await findAvailableDoctorForNow(
          selectedDate,
          genericConsultationType,
          res,
        );
        console.log(result, "result 97");

        // Check if findAvailableDoctorForNow already sent a response
        // (e.g. "next 3 available slots" or "no slots found")
        if (
          !result ||
          result.doctor === undefined ||
          result.slot === undefined
        ) {
          // Response was already sent by findAvailableDoctorForNow (e.g. nextSlots response)
          // The function returned early with res.status().json(), so just exit the handler
          return;
        }

        console.log(
          result.doctor._id.toString(),
          "result doctor id",
          result.slot,
          "result slots",
        );
        doctorId = result ? result.doctor._id.toString() : "";
        docName = result ? result.doctor.name : "";
        doctorMobileNo = result ? result.doctor.mobileNumber : "";
        slot = result ? result.slot : "";
        if (!doctorId) {
          throw new Error("No available doctors at the selected time");
        }
      }

      // Find available doctor if needed at specific time
      if (doctorId == null && appointmentTime == CHOOSE_TIME) {
        const result = await findAvailableDoctorForSpecificTimeSlot(
          selectedDate,
          genericConsultationType,
          selectedSlot,
        );
        console.log(result, "result 111");
        docName = result.doctor.name;
        doctorMobileNo = result.doctor.mobileNumber;
        doctorId = result.doctor;
        slot = result.slotId;
        console.log(doctorId, "doctorid for specific time", slot, "slot");
        if (!doctorId && !slot) {
          throw new Error("No available doctors at the selected time");
        }
      }

      let patientMeetingUrl, doctorMeetingUrl;
      patientMeetingUrl = `${development_production_url}/meeting/patient/${meetingId}`;
      doctorMeetingUrl = `${development_production_url}/meeting/doctor/${meetingId}`;

      const bookConsultationParams = {
        meetingId,
        doctorId,
        slot,
        symptoms,
        name,
        email,
        patientMobNo,
        consultationType,
        consultationprice,
        appointmentTime: slot.startTime,
        status: appointment_status.open,
        patientMeetingUrl: patientMeetingUrl,
        doctorMeetingUrl: doctorMeetingUrl,
        prescriptionUrl: "",
        docName: docName,
        doctorMobileNo: doctorMobileNo,
        doctorId: doctorId,
        clientSideAppointmentTime: clientSideAppointmentTime,
      };

      console.log(meetingId, "meeting id");

      let result;
      // Handle consultation types
      switch (consultationType) {
        case "Audio":
        case "Video":
          // Store appointment details
          result = await bookConsultation({ bookConsultationParams });
          break;
        case "Home visit":
        case "Clinic":
          // Simply book the consultation
          // Store appointment details
          result = await bookConsultation({ bookConsultationParams });
          break;

        default:
          return res.status(400).json({
            message: "Invalid consultation type.",
          });
      }
      // await Notification.create({
      //   title: "New Consultation",
      //   body: `Patient ${name} (ID: ${result._id}) booked a consultation.`,
      //   read: false,
      // });
      try {
        await sendAdminNotification({
          title: "Consultation Booked",
          body: `Patient ${name} has booked consultation`,
        });
      } catch (adminNotifErr) {
        // Never let an admin notification failure break the booking response.
        console.error("Admin FCM notification failed (non-fatal):", adminNotifErr.message);
      }
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({
        message: "Consultation booked successfully",
        appointmentId: result?._id ? String(result._id) : undefined,
        amount: result?.consultationprice,
      });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error("Booking error:", error);
      // Log error to Google Sheets with full context
      await logErrorToGoogleSheet({
        apiName: "bookConsultation - POST",
        errorMessage: error.message || "Booking failed",
        errorCode: error.code || "500",
        stackTrace: error.stack,
        patientName: name || "",
        mobileNumber: patientMobNo || "",
        doctorName: doctorName || "",
        consultationType: consultationType || "",
        appointmentDate: selectedDate || "",
        requestPayload: {
          selectedDoctorId,
          appointmentTime,
          selectedDate,
          selectedSlot,
          symptoms,
          name,
          doctorName,
          patientMobNo,
          consultationType,
          consultationprice,
        },
        responsePayload: {
          message: "All doctor are busy right now, No slot is available",
        },
      });
      res.status(200).json({
        message: "All doctor are busy right now, No slot is available",
      });
    }
  }
}